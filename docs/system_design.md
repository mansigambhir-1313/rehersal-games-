# Inversion Gym — System Design (v1)

> Companion to `inversion_gym_build_plan.md`. That doc says *what* we build and *why*.
> This doc says *how* it fits together: components, data flow, contracts, state, failure modes.
> Reference it before writing any non-trivial code.

---

## 1. Goals & non-goals

### Goals
- A single-page web game, runnable on `localhost` with one command.
- Grades a user's free-text cause list using Claude, with a deterministic stub fallback.
- Produces a reproducible **Decision Quality %** per session.
- Ships an extension path to Rehearsal (History, Memories, Ask Coach, faculty Create) without rewrites.
- Debug-friendly: every LLM call + grading decision is inspectable locally.

### Non-goals (v1)
- Multi-user auth, sync, or cloud storage.
- Multiple scenarios at runtime (we ship 1).
- Faculty authoring UI.
- Mobile-native builds (mobile web only).
- Production deployment, CDN, rate-limiting.
- Full i18n or WCAG AA audit.

---

## 2. Context diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      User's laptop / phone                      │
│                                                                 │
│  ┌──────────────┐       ┌──────────────────────────────────┐   │
│  │   Browser    │──────▶│  Next.js dev server (localhost)  │   │
│  │ React client │◀──────│  - RSC pages                     │   │
│  └──────────────┘       │  - /api/grade (route handler)    │   │
│                         │  - Strands agent runtime          │   │
│                         └──────────────┬───────────────────┘   │
│                                        │                        │
└────────────────────────────────────────┼────────────────────────┘
                                         │ HTTPS
                                         ▼
                              ┌────────────────────┐
                              │  Anthropic API     │
                              │  (Claude Haiku     │
                              │   4.5 default)     │
                              └────────────────────┘

If ANTHROPIC_API_KEY is absent → grader short-circuits to local stub.
No other external services in v1.
```

---

## 3. High-level architecture

Three layers, all in one Next.js process:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — Presentation (client components)                 │
│  React 19 + Tailwind 4 + Framer Motion                      │
│  Owns: UI, timer, input, animations, localStorage           │
└────────────────────┬────────────────────────────────────────┘
                     │ fetch() / server action
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2 — Application (Next.js API routes + server actions)│
│  Owns: scoring math, session assembly, guard rails          │
└────────────────────┬────────────────────────────────────────┘
                     │ function call
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — Grader (Strands agent + tools)                   │
│  Owns: prompt assembly, LLM calls, cause matching,          │
│        structured output, stub fallback                     │
└─────────────────────────────────────────────────────────────┘
```

**Why this split:** Layer 1 never knows about Claude (secure, swappable). Layer 2 owns scoring so the test suite can run end-to-end without the LLM. Layer 3 is the only place that talks to external APIs.

---

## 4. Component architecture

### 4.1 Frontend components

| Component | Responsibility | Owns state? |
|---|---|---|
| `Nav` | Sidebar shell matching Rehearsal | No |
| `LandingHero` | Tagline + "Start Round" CTA + last-attempts strip | No (reads localStorage) |
| `BriefIntro` | Failure poster + "Start the clock" button | No |
| `TimerBar` | 90s countdown, pulsing bar, onExpire callback | Yes (ticks) |
| `CauseListEditor` | 10-slot draggable list, text inputs, chip inserts | Yes (list state) |
| `CauseChipPool` | 12 hinted chips beneath editor | No |
| `GradingOverlay` | Transient "reading your list..." overlay | No |
| `DebriefReel` | Staggered reveal of 10 canonical causes | Yes (reveal index) |
| `ScoreDial` | Circular Decision Quality % animation | No |
| `SecondaryStats` | Precision@5, Recall@10, time used | No |
| `PlayAgainCTA` | Reset to brief intro | No |

### 4.2 Server components / API surface

- `/` (server component) — landing page
- `/play` (client component) — game loop, reads scenario via server action
- `/debrief` (client component) — reads last result from a signed cookie or query param payload
- `/api/grade` (route handler, POST) — the single grading endpoint

### 4.3 Agent layer

```
src/lib/agent/
├── grader.ts          # InversionGrader agent definition (Strands)
├── prompts.ts         # system + user prompt templates
├── tools/
│   ├── loadScenario.ts   # reads local JSON scenario pack
│   ├── matchCause.ts     # calls LLM to judge a pair
│   └── summarize.ts      # produces one-line debriefs
├── stubGrader.ts      # no-API-key deterministic grader
└── contract.ts        # shared types: GradeRequest, GradeResult
```

---

## 5. Sequence diagrams

### 5.1 Happy path — full grading round

```
User        Browser         /api/grade        Strands Agent    Anthropic
 │             │                │                   │              │
 │ click Start │                │                   │              │
 │────────────▶│                │                   │              │
 │             │ render /play   │                   │              │
 │             │ load scenario  │                   │              │
 │             │ (server action)│                   │              │
 │             │                │                   │              │
 │ type + rank │                │                   │              │
 │────────────▶│                │                   │              │
 │             │ timer hits 0   │                   │              │
 │             │ OR user submits│                   │              │
 │             │                │                   │              │
 │             │ POST grade     │                   │              │
 │             │ {scenarioId,   │                   │              │
 │             │  userCauses[], │                   │              │
 │             │  timeUsedMs}   │                   │              │
 │             │───────────────▶│                   │              │
 │             │                │  invoke agent     │              │
 │             │                │──────────────────▶│              │
 │             │                │                   │ loadScenario │
 │             │                │                   │ (local)      │
 │             │                │                   │              │
 │             │                │                   │ 10× matchCause
 │             │                │                   │──────────────▶
 │             │                │                   │◀─────────────
 │             │                │                   │ (batched or  │
 │             │                │                   │  parallel)   │
 │             │                │                   │              │
 │             │                │                   │ summarize    │
 │             │                │                   │──────────────▶
 │             │                │                   │◀─────────────
 │             │                │◀──────────────────│              │
 │             │                │ GradeResult JSON  │              │
 │             │                │                   │              │
 │             │ compute score  │                   │              │
 │             │ (scoring.ts)   │                   │              │
 │             │◀───────────────│                   │              │
 │             │ nav /debrief   │                   │              │
 │             │ render reel    │                   │              │
 │             │                │                   │              │
 │  watch      │                │                   │              │
 │  debrief    │                │                   │              │
 │◀────────────│                │                   │              │
```

### 5.2 Stub path — no API key present

```
User      Browser       /api/grade      stubGrader
 │           │              │               │
 │ submit    │              │               │
 │──────────▶│              │               │
 │           │ POST grade   │               │
 │           │─────────────▶│               │
 │           │              │ detect no key │
 │           │              │──────────────▶│
 │           │              │◀──────────────│
 │           │              │ deterministic │
 │           │              │ GradeResult   │
 │           │◀─────────────│               │
 │           │ banner:      │               │
 │           │ "Stub mode"  │               │
 │◀──────────│              │               │
```

Stub grader produces consistent results from the same inputs using string similarity (e.g., Jaro-Winkler + lowercased bag-of-words overlap). Good enough to exercise the UI; explicit about being a stub in the debrief banner.

### 5.3 Error path — LLM call fails

```
Agent        Anthropic
  │             │
  │ matchCause  │
  │────────────▶│
  │     5xx     │
  │◀────────────│
  │ retry w/    │
  │ backoff (2x)│
  │────────────▶│
  │     5xx     │
  │◀────────────│
  │ fall back   │
  │ to stub for │
  │ this call,  │
  │ mark partial│
```

Partial-failure mode: if any single `matchCause` fails, fall back to stub for that pair and mark `partial: true` in the response so UI can show a subtle indicator.

---

## 6. Data model (TypeScript)

All types live in `src/lib/types.ts`. No DB in v1; these types also describe the localStorage records.

```ts
// ── Scenario (authoring) ──────────────────────────────────────
export type Scenario = {
  id: string
  briefSlug: string                  // links to Rehearsal brief
  title: string                      // "The Leak You're Not Measuring"
  failurePoster: {
    headline: string                 // display H1
    storyParagraph: string           // 1 paragraph
    coverImageUrl: string            // /covers/funnel-recovery.svg
    categoryPill: string             // "Reasoning" | etc
  }
  canonicalCauses: CanonicalCause[]  // exactly 10, ordered by expert priority
  candidateChips: string[]           // 12 inserts for the UI
  targetTimeSeconds: number          // 90
}

export type CanonicalCause = {
  id: string                         // stable slug
  title: string                      // displayed in debrief
  debriefLine: string                // 1-sentence explanation
  synonyms: string[]                 // speeds up stub matcher
}

// ── Session (runtime) ─────────────────────────────────────────
export type Session = {
  id: string                         // uuid4
  scenarioId: string
  startedAt: string                  // ISO
  completedAt?: string
  userCauses: UserCause[]            // ordered, ≤10
  timeUsedMs: number
  gradeResult?: GradeResult
  mode: 'live' | 'stub'
}

export type UserCause = {
  rank: number                       // 1-indexed
  text: string
}

// ── Grading (contract between layers 2 and 3) ────────────────
export type GradeRequest = {
  scenarioId: string
  userCauses: UserCause[]
  timeUsedMs: number
  sessionId: string
}

export type GradeResult = {
  sessionId: string
  verdicts: Verdict[]
  scores: Scores
  overallMessage: string
  partial: boolean                   // true if any LLM call fell back
  mode: 'live' | 'stub'
}

export type Verdict = {
  canonicalCauseId: string
  userRankIfMatched: number | null   // null = missed
  matchConfidence: number            // 0.0–1.0
  matchedUserCauseText: string | null
  debriefLine: string                // pulled from Scenario, possibly reshaded
}

export type Scores = {
  precision5: number                 // 0–1
  recall10: number                   // 0–1
  timeBonus: number                  // 0–1 (fraction of possible bonus)
  decisionQuality: number            // 0–100 integer
}
```

---

## 7. Game state machine

```
                  ┌───────────┐
                  │  landing  │
                  └─────┬─────┘
                        │ Start Round
                        ▼
                  ┌───────────┐
                  │   intro   │
                  └─────┬─────┘
                        │ Start the clock
                        ▼
                  ┌───────────┐
                  │  editing  │◀─────┐
                  └─────┬─────┘      │ add/remove/reorder
                        │            │
        ┌───────────────┼────────────┘
        │               │
  timer hits 0      user submits
        │               │
        └───────┬───────┘
                ▼
          ┌───────────┐
          │  grading  │ (transient, ≤6s soft-cap)
          └─────┬─────┘
                │ result returned
                ▼
          ┌───────────┐
          │  debrief  │
          └─────┬─────┘
                │ Play again
                ▼
          (back to intro)
```

No backward transitions other than Play Again. Refresh during `editing` = forfeit (timer state is not persisted mid-round). Refresh during `debrief` = last result read from localStorage.

---

## 8. API contracts

### 8.1 `POST /api/grade`

**Request:**
```json
{
  "scenarioId": "funnel-recovery-v1",
  "userCauses": [
    { "rank": 1, "text": "No lead source tracking" },
    { "rank": 2, "text": "Sales responds too slow" }
  ],
  "timeUsedMs": 78400,
  "sessionId": "9a7e..."
}
```

**Response 200:**
```json
{
  "sessionId": "9a7e...",
  "mode": "live",
  "partial": false,
  "verdicts": [
    {
      "canonicalCauseId": "lead-latency",
      "userRankIfMatched": 2,
      "matchConfidence": 0.88,
      "matchedUserCauseText": "Sales responds too slow",
      "debriefLine": "Conversion drops ~90% after the 5-minute window."
    }
  ],
  "scores": {
    "precision5": 0.6,
    "recall10": 0.5,
    "timeBonus": 0.13,
    "decisionQuality": 64
  },
  "overallMessage": "You caught the speed-and-source causes. You missed the CRM hygiene layer."
}
```

**Errors:**
- `400` — invalid body (zod-validated)
- `404` — unknown `scenarioId`
- `502` — upstream LLM outage AND stub fallback also failed (should not happen in v1)

### 8.2 Server action — `loadScenario(scenarioId)`

Pure read from `src/lib/scenarios/*`. No external call. Returns `Scenario | null`.

---

## 9. Agent design — concrete

### 9.1 System prompt (grader)

```
You are a strict but fair grader for a business reasoning game called Inversion Gym.

Input: a business failure scenario, an expert-ranked canonical list of 10 causes,
and a user's ranked list of causes.

Output (strict JSON, no prose): for each canonical cause, whether it was matched
by a user cause, the match confidence (0.0–1.0), and the user rank if matched.
Then a one-sentence overall takeaway in the voice of the Rehearsal platform:
direct, slightly provocative, editorial — never sycophantic.

Rules:
- Semantic match, not literal. "Pricing mistake" matches "charged too much."
- Do not match broad umbrella phrases to narrow canonical causes. "Bad UX"
  does not match "form field drop-off."
- Two user causes can match two different canonical causes. Do not let one
  user cause double-count.
- Confidence ≥ 0.7 counts as a match.

Return JSON only, shape: { verdicts: [...], overallMessage: "..." }
```

### 9.2 Tools exposed to the agent

| Tool | Params | Returns | Purpose |
|---|---|---|---|
| `loadScenario` | `scenarioId` | `Scenario` | Pulls the canonical list + debrief copy |
| `matchCause` | `userText, canonical, userRank` | `{ match: bool, confidence: float, why: string }` | LLM judges one pair |
| `summarize` | `verdicts, scores` | `{ message: string }` | Produces the final one-line takeaway |

`matchCause` is the hot path — called 10× per submission in the simple version. We batch them to reduce round-trips (single Claude call with all 10 pairs rendered in the user prompt).

### 9.3 Why an agent, not just one prompt

For the v1 grader, the whole thing fits in one Claude call. Strands still earns its keep:

1. **Observability** — every tool invocation is logged, separately inspectable during development.
2. **Swap readiness** — later we can replace `matchCause` with `embedCauses` + `verifyMatch` without touching the caller.
3. **Case Crack reuse** — that game needs a *real* multi-step agent; building the muscle now means less friction later.
4. **MCP alignment** — Rehearsal's roadmap includes an MCP Connector; Strands speaks MCP natively.

### 9.4 Token budget

Per submission (Haiku 4.5):
- System prompt: ~300 tokens
- Scenario (10 causes + debrief copy): ~600 tokens
- User causes: ~100 tokens
- Structured output: ~500 tokens
- **Total ~1,500 tokens/session**, well under any rate limit, cost ≈ $0.001–0.003/session.

---

## 10. Scoring algorithm — concrete

```ts
// src/lib/scoring.ts
export function computeScores(
  userCauses: UserCause[],
  verdicts: Verdict[]
): Scores {
  // verdicts[i].userRankIfMatched tells us which user cause mapped to which canonical.
  const matchedCanonicalIds = new Set(
    verdicts.filter(v => v.userRankIfMatched !== null).map(v => v.canonicalCauseId)
  )

  // Precision@5: of the user's top 5 picks, how many matched a canonical cause?
  const top5MatchedRanks = verdicts
    .map(v => v.userRankIfMatched)
    .filter((r): r is number => r !== null && r <= 5)
  const precision5 = top5MatchedRanks.length / Math.min(5, userCauses.length || 5)

  // Recall@10: of 10 canonical causes, how many did the user catch anywhere?
  const recall10 = matchedCanonicalIds.size / 10

  // Time bonus: reward speed, but never penalize full use of the 90s
  // (freezing at the end is bad; thinking is fine).
  const timeBonusRaw = 0 // placeholder — computed in the caller, needs timeUsedMs
  // Formula in the caller:
  //   const timeBonus = clamp(1 - timeUsedMs / 90000, 0, 1)  // 0–1

  // DQ% weights: 50 precision, 35 recall, 15 time
  const decisionQuality = Math.round(
    precision5 * 50 + recall10 * 35 + timeBonusRaw * 15
  )

  return { precision5, recall10, timeBonus: timeBonusRaw, decisionQuality }
}
```

Deterministic property: given the same `userCauses` ordering and same `verdicts`, output is identical. Testable without the LLM.

---

## 11. Error handling & edge cases

| Case | Behavior |
|---|---|
| User submits empty list | `decisionQuality = 0`, debrief still runs, all 10 marked "missed" |
| User submits 15 causes (paste bomb) | Truncate to top 10 on server, return warning flag |
| User causes are all gibberish | Grader returns 0 matches, debrief gracefully shows misses |
| Duplicate user causes | Allowed — stub/LLM matches both to the same canonical, but only credit once via `matchedCanonicalIds` set |
| LLM returns invalid JSON | Catch zod parse error, retry once with `temperature: 0`, then fall back to stub for this submission |
| LLM returns >10 verdicts | Truncate, log warning |
| Network outage | After 2 retries with backoff, stub takes over; response flagged `mode: 'stub'` and `partial: true` |
| `ANTHROPIC_API_KEY` unset | Skip LLM entirely, use stub; debrief banner says "Stub grader active" |
| User refreshes mid-round | Timer state lost, scenario resets. We accept this in v1 (no Redis/DB). |
| User disables JS | Landing page renders as static; `/play` shows a "JavaScript required" message |

---

## 12. Observability

In dev, every layer logs structured JSON to stdout:

```
{"layer":"app","event":"grade.request","sessionId":"...","causeCount":7}
{"layer":"agent","event":"tool.invoke","tool":"matchCause","pair":0,"ms":840}
{"layer":"agent","event":"tool.result","tool":"matchCause","pair":0,"confidence":0.88}
{"layer":"app","event":"grade.complete","sessionId":"...","dq":64,"mode":"live"}
```

No third-party observability in v1. A simple `src/lib/log.ts` wraps `console.log` with a namespace prefix.

---

## 13. Security

- **API key never touches the browser.** Only read server-side in the `/api/grade` route handler via `process.env.ANTHROPIC_API_KEY`.
- **No user auth** in v1 → no secrets beyond the API key.
- **Input validation** via zod on every `/api/grade` request — reject oversize payloads.
- **Rate limit (dev-only):** soft limit of 20 grades / IP / hour via in-memory counter. Prevents accidental loops while developing.
- **No PII** stored. Session records in localStorage are keyed to a random client ID, not to an email.
- **CSP headers:** default Next.js + add `connect-src 'self' https://api.anthropic.com` so the browser can't directly call Anthropic even if a bug leaks the key.

---

## 14. Performance

- Landing → play: < 500ms server round-trip in dev, < 100ms after.
- Editor interactions (typing, drag): 60 fps — the list is ≤10 items, no virtualization needed.
- Grading round-trip: target ≤ 6 seconds. Haiku batched call typically 2–4s.
- Debrief reel total duration: ~5s (0.5s stagger × 10 cards).
- Cold-start LLM call: first call adds ~800ms (TLS handshake); mitigated by prewarming on `/play` navigation if we decide it's worth it.

Scalability is not a v1 concern — we're running on one laptop.

---

## 15. Deployment architecture (future)

When we're ready to share with others:

```
┌──────────────┐     ┌────────────────┐    ┌──────────────┐
│  Browser     │────▶│  Vercel edge   │───▶│  Anthropic   │
│              │     │  (Next.js)     │    │  API         │
└──────────────┘     └────────────────┘    └──────────────┘
                              │
                              ▼
                    (optional) Postgres /
                    Supabase for session
                    persistence when we
                    integrate with Rehearsal
```

- Vercel for hosting — zero-config Next.js deploy.
- Environment variable for `ANTHROPIC_API_KEY` set in Vercel project settings.
- Preview deploys per PR.
- No session DB in v1; add when we wire Rehearsal History.

---

## 16. Testing strategy

### 16.1 Layers under test

| Layer | Tool | What we test |
|---|---|---|
| Scoring | Vitest | Pure function — given verdicts + timeUsedMs, correct Scores |
| Stub grader | Vitest | Deterministic — same input → same output |
| `/api/grade` | Vitest + supertest-like | zod validation, error paths, stub-vs-live routing |
| Agent | Vitest + mock fetch | Prompt assembly, JSON parse, retry behavior |
| UI | Playwright | Happy path landing → debrief with stub grader (no API key) |

### 16.2 Regression suite for grader quality

5 hand-crafted grading inputs, each with an expected verdict summary:

1. **Perfect list** — all 10 canonical causes named exactly → DQ ≥ 95
2. **Empty list** → DQ = 0, all canonical marked missed
3. **Off-topic list** — 5 random business phrases unrelated → DQ < 20
4. **Out-of-order list** — right causes, worst ones first → recall=1.0, precision@5 < 0.6
5. **Synonym list** — canonical causes paraphrased → DQ ≥ 80 (tests semantic match)

These run against the live LLM nightly in later phases. v1 just runs against the stub in CI.

---

## 17. Integration seams for Rehearsal (not wired in v1)

Four explicit hooks, one-line each in v1, production impl later:

```ts
// src/lib/integration/rehearsal.ts

export async function onSessionComplete(session: Session): Promise<void> {
  // v1: writes session to localStorage
  // v2: POST to Rehearsal /interview/history/games with session payload
}

export async function getUserMemory(): Promise<string[]> {
  // v1: returns []
  // v2: GET Rehearsal /memories, filter to game-relevant memories
}

export function linkToBrief(briefSlug: string): string {
  // v1: returns '#'
  // v2: returns `https://app.tryrehearsal.ai/explore?tab=courses&brief=${briefSlug}`
}

export function reportDecisionEvent(event: DecisionEvent): void {
  // v1: console.log
  // v2: POST to Rehearsal analytics endpoint
}
```

Keeping these as named functions from day one means later wiring is a one-file PR.

---

## 18. Open design questions (decide before Phase D)

1. **Claude model default** — Haiku 4.5 (fast, cheap, may hallucinate synonyms) or Sonnet 4.6 (slower, better judgment)? Proposal: Haiku for dev, Sonnet override via `CLAUDE_MODEL=claude-sonnet-4-6` env var.
2. **Batching matchCause** — single call with all 10 pairs (cheaper, one structured output) or 10 parallel calls (cleaner observability)? Proposal: single batched call in v1 for cost/speed.
3. **Cover art v1** — pure SVG placeholder or AI-generated asset (e.g., via Claude + an image model) to look editorial from day one? Proposal: hand-crafted SVG placeholder, commission art later.
4. **Auth layer shape** — v1 has no auth. When we add it (post-v1), is Rehearsal's auth cookie the source of truth, or do games get their own identity layer? Decide at integration time.

---

## 19. File / module ownership summary

| Concern | Owner | Location |
|---|---|---|
| Rendering UI | React components | `src/components/` |
| Game state during round | CauseListEditor + parent | `src/app/play/` |
| Session persistence | Custom hook | `src/lib/storage.ts` |
| Grading request/response | API route | `src/app/api/grade/route.ts` |
| LLM calls | Strands agent + tools | `src/lib/agent/` |
| Pure scoring | Function | `src/lib/scoring.ts` |
| Scenario data | Static TS files | `src/lib/scenarios/` |
| Rehearsal hooks | Module | `src/lib/integration/rehearsal.ts` |
| Types | Shared | `src/lib/types.ts` |

---

## 20. What this design explicitly defers

These are decisions the system *architecturally supports* but the v1 code does not implement:

- Multi-scenario catalog (the engine loads by `scenarioId` already; we just ship 1)
- Faculty-authored scenario overrides (Scenario type already supports arbitrary content)
- Session sync to a server DB (type already separates Session from localStorage)
- Cohort percentile overlays (type already accommodates future score breakdown)
- Multi-language UI (none of the copy is translated; i18n seams not added)

---

*End of system design. Pending sign-off: §18 items (model, batching, art, auth seam).*
