# Design & Architecture — Inversion Gym v2 (Realism Pivot)

**Date:** 2026-04-19
**Partner doc:** `realism_plan_v2.md`
**Scope:** maps the 9 realism phases (R0–R8) to data model, API, component, prompt, and file-layout changes. Written so each phase is independently shippable, each commit is reviewable, each change has a clear anti-regression invariant.

---

## 0. Defaults chosen for open questions from realism_plan_v2 §"Decisions needed"

Where the v2 plan asked for user sign-off, these are the defaults I'm building to. Call any of them out and I'll pivot.

| Question | Default | Why |
|---|---|---|
| Cognitive-first vs polish-first | **Cognitive-first (Road A)** | Audience is MBA educators. Pretty quiz is still a quiz. |
| Bucket-then-rank vs causal-graph | **Bucket-then-rank (R1)**, graph deferred | Grader stays list-shaped, 3 days vs 4, lower risk. |
| Streaming partner thinking | **Yes, in R2** | Extended thinking costs 5–15s. Worth it for the "watching cognition" effect. Fallback to non-stream if latency > 20s. |
| Named partners | **Yes** (Anika / Ravi / Karen) | Voice is 80% of perceived expertise. |
| Indian variants authoring | **Co-author** — I draft, you edit | Cultural specificity needs native voice. |
| Reputation rank default | **Opt-in, off by default** | Never punish the 5-min casual session. |
| Bucket labels visible | **Icons + labels at first**; hide-labels A/B in R1 | Testable hypothesis rather than pre-commit. |
| Sound aesthetic | **Analog/film** (wood-block, paper, typewriter, analog clock) | Matches editorial framing. |
| Session schema | **Versioned** (v1 and v2 coexist) | Old sessions must remain viewable. |

---

## 1. Data model evolution (3 stages)

### Stage A — R0: enrich authoring data (backwards compatible)

```ts
// lib/types.ts
export type CauseKind = "symptom" | "proximate" | "root";

export type CanonicalCause = {
  id: string;
  rankHint: number;
  title: string;
  debriefLineVariants: string[];
  synonyms: string[];
  // NEW in R0:
  causeKind: CauseKind;          // what kind of thing this is in the causal chain
  teachingNote: string;          // WHY it's that kind — one short paragraph
};

export type SeniorPartner = {
  id: "anika" | "ravi" | "karen";
  name: string;
  role: string;                  // e.g. "Growth consultant, ex-McKinsey"
  voice: string;                 // system-prompt fragment describing their tone
  sharpFeedback: string;         // one-liner used when DQ >= 75 (sharper, peer tone)
  warmFeedback: string;          // one-liner used when DQ < 75 (coaching tone)
};

export type Scenario = {
  // … existing fields …
  seniorPartnerId: SeniorPartner["id"];   // NEW in R0
};
```

**Why additive:** a scenario or session serialized under v1 is still readable — new fields are optional or live on a side table. No migration script needed.

### Stage B — R1: bucket-then-rank + session schema v2

```ts
export type UserBucketedCause = {
  text: string;                  // the chip the player placed
  bucket: CauseKind;             // which bin they dropped it in
  rank?: number;                 // 1-indexed, only present if bucket = "root"
};

export type Session = {
  // … existing …
  schema: "v1" | "v2";           // NEW — renderer picks output based on this
  userBuckets?: UserBucketedCause[];   // v2 only; v1 uses userCauses[]
};

export type Verdict = {
  canonicalCauseId: string;
  // v1 fields still present for back-compat:
  userRankIfMatched: number | null;
  matchConfidence: number;
  matchedUserCauseText: string | null;
  debriefLine: string;
  // NEW in v2:
  userBucket: CauseKind | null;          // what the player thought it was
  correctBucket: CauseKind;              // what it actually is (= canonical causeKind)
  bucketCorrect: boolean;                // convenience
  perCauseNote: string;                  // per-item teaching note from LLM
};

export type Scores = {
  // existing: precision5, ndcg10, timeBonus, decisionQuality
  // NEW in v2:
  bucketingAccuracy: number;     // 0–1 across all placed causes
  rootRankAccuracy: number;      // NDCG-style over correctly-rooted causes only
};
```

**DQ formula v2:**
```
DQ = 35*bucketingAccuracy + 35*rootRankAccuracy + 20*timeBonus + 10*precision5
```
(Down-weights NDCG-on-everything, up-weights the two things the player actually had to do.)

### Stage C — R7: progress + spaced repetition

```ts
// lib/progress.ts — localStorage-only for v2
export type ProgressRecord = {
  scenarioId: string;
  rounds: Array<{
    at: string; dq: number; schema: "v1" | "v2";
    missedCauseIds: string[];
    wrongBuckets: Array<{ causeId: string; yourBucket: CauseKind; correct: CauseKind }>;
  }>;
};

export type Progress = {
  version: 1;
  rank: "junior" | "mid" | "senior" | "partner";
  records: Record<string, ProgressRecord>;  // keyed by scenarioId
  missCounts: Record<string, number>;        // causeId → times missed; drives spaced rotation
};
```

localStorage key: `ig:progress:v1`. Single JSON blob. <5KB for first year of use.

---

## 2. API surface

### `POST /api/grade`

**R0:** same request shape. System prompt now takes partner ID internally. Response unchanged.

**R1:** request adds optional `userBuckets` (when present, server routes to v2 grader). Response adds bucketing fields. `schema: "v2"` flag in response so clients know.

**R2:** server opts into Anthropic `thinking: { type: "enabled", budget_tokens: 4000 }`. Response stream: SSE with two event types — `thinking` (raw text chunks) and `grade` (final tool-use JSON). Client uses `EventSource` or `fetch` + `ReadableStream`.

Non-streaming fallback preserved at `/api/grade?stream=false` for clients/browsers that don't support SSE.

### `GET /api/progress` *(new, R7)*

v2: returns `{ persisted: false }` — client reads from localStorage.
v3: returns persisted progress from server DB. Placeholder endpoint ensures client code doesn't need to change at the swap.

---

## 3. Prompt architecture evolution

### `lib/agent/prompts.ts` — R0 shape

```
SYSTEM_PROMPT
├── Base rules (unchanged: semantic match, injection defense, tool-only output)
├── {{partnerVoice}} — injected per scenario
└── {{partnerTone}} — "sharp" or "warm" based on round's DQ estimate (iterative: we grade, then regrade with tone; or single-pass by letting model pick)

buildUserPrompt(scenario, shown, userCauses, partner, toneHint)
├── FAILURE block (unchanged)
├── CANONICAL CAUSES block + each cause now carries causeKind + teachingNote  ← NEW
├── PARTNER PERSONA block — partner.voice, with instruction to write debriefLine in this voice  ← NEW
├── USER'S RANKED LIST
└── Final instruction: "cite the teachingNote for any cause the user misranked"
```

**GRADER_PROMPT_VERSION** bumps to `"grader@2.0.0"` — invalidates Anthropic prompt cache. One-time cost at first R0 call.

### R1 addition — bucketing-aware prompt

- Canonical causes include their `causeKind` in the block.
- User's submission includes the bucket they placed it in.
- Tool schema changes: `submit_grade_v2` with new fields (`userBucket`, `bucketCorrect`, `perCauseNote`).
- `GRADER_PROMPT_VERSION` bumps to `"grader@3.0.0"`.

### R2 addition — thinking

- Enable extended thinking at the API level.
- Tune system prompt: "**Narrate observations, defer judgment.** Your thinking should sound like analysis, not conclusion. Do not reveal rank positions while thinking — those land in the tool call."
- A thinking-leak regression test: after R2, run 20 rounds and grep thinking output for the string "rank" or numbers — if it's naming ranks in the narration, the prompt needs tightening.

---

## 4. Component architecture

### Existing (keep, touch minimally)
- `app/page.tsx` — landing, 3 scenario cards
- `BriefIntro.tsx` — will get partner-byline in R0, multi-doc treatment in R5
- `PlayScreen.tsx` — current drag-rank UI; refactored in R1 to host `<BucketRank>`
- `DebriefScreen.tsx` — partner byline in R0, red-pen overlay in R6
- `SoundProvider.tsx` — expanded in R3
- `ScenarioCard.tsx` — unchanged

### New (per phase)

| Component | Phase | Purpose |
|---|---|---|
| `PartnerByline.tsx` | R0 | small "Graded by Anika Mehra · Growth consultant" chip |
| `BucketRank.tsx` | R1 | three-bucket drop zone; ranking only within root bucket |
| `StreamingThinkingPanel.tsx` | R2 | typewriter-rendered partner thinking; auto-scrolls |
| `ImmersiveDesk.tsx` | R4 | generic "workspace" primitive with slot props: `evidence`, `workspace`, `clock`, `ambient` |
| `AnalogClock.tsx` | R4 | SVG clock with `phase: "normal" / "warning" / "critical"` driving glow/shake |
| `MultiDocBrief.tsx` | R5 | renders 4–5 micro-documents the player triages |
| `RedPenOverlay.tsx` | R6 | SVG markup overlay for scanned-paper debrief |
| `ProgressDashboard.tsx` | R7 | `/progress` route; mastered / blind-spots / sparkline |
| `CauseGraphCanvas.tsx` | R8 (stretch) | drag-nodes-and-arrows canvas |

### New hooks

| Hook | Phase | Returns |
|---|---|---|
| `useProgress()` | R7 | `{progress, recordRound, getBlindSpots}` |
| `useAmbientSound()` | R3 | ambient bed controls; crossfades on phase change |
| `useEscalation(secondsLeft)` | R3+R4 | `"calm" \| "pressure" \| "critical"` |
| `useWeightedChipRotation()` | R7 | spaced-repetition chip selection instead of uniform shuffle |

---

## 5. File layout (proposed additions)

```
app/lib/
  partners.ts                 ★ NEW (R0) — Anika/Ravi/Karen
  progress.ts                 ★ NEW (R7) — localStorage progress + spaced rep
  scoring-v2.ts               ★ NEW (R1) — bucketing + ranking combined
  agent/
    prompts.ts                · UPDATED (R0, again R1, again R2)
    grader.ts                 · UPDATED (R1 for v2 shape, R2 for thinking)
    stream-grader.ts          ★ NEW (R2) — SSE streaming variant
  scenarios/
    funnel-recovery.ts        · UPDATED (R0)
    resignation-letter.ts     · UPDATED (R0)
    hertz-accenture.ts        · UPDATED (R0)
    india/                    ★ NEW (R5)
      funnel-recovery-in.ts
      resignation-letter-in.ts
      hertz-accenture-in.ts
    variants.ts               ★ NEW (R5) — picks US vs IN at session start
  audio/
    synth.ts                  ★ NEW (R3) — ADSR + filter chain utilities
    palette.ts                ★ NEW (R3) — the 11 named sounds

app/components/
  PartnerByline.tsx           ★ NEW (R0)
  BucketRank.tsx              ★ NEW (R1)
  StreamingThinkingPanel.tsx  ★ NEW (R2)
  ImmersiveDesk.tsx           ★ NEW (R4)
  AnalogClock.tsx             ★ NEW (R4)
  MultiDocBrief.tsx           ★ NEW (R5)
  RedPenOverlay.tsx           ★ NEW (R6)
  ProgressDashboard.tsx       ★ NEW (R7)

app/app/
  progress/
    page.tsx                  ★ NEW (R7)
  api/
    progress/
      route.ts                ★ NEW (R7) — placeholder for v3 server backend
```

**17 new files, 6 updated files across 9 phases.** Largest single phase is R4 (≈4 new files).

---

## 6. Sound architecture v2

```
SoundProvider (existing shape, expanded internals)
│
├── audio/synth.ts
│   ├── tone(freq, dur, volume, envelope?)       // ADSR wrapper
│   ├── noise(dur, volume, filterHz?)            // white noise through low-pass (paper rustle)
│   └── impulse(dur, volume, hz)                 // short percussive (wood block)
│
├── audio/palette.ts   ← 11 named action sounds
│   ├── playPickup()       // wood block 440Hz, 80ms
│   ├── playDrop()         // low thud + settle (2 impulses, 60Hz + 120Hz)
│   ├── playReorder()      // noise burst, 40ms
│   ├── playReveal()       // page turn — noise chord 200Hz low-pass
│   ├── playTick()         // analog tick — impulse 2kHz, 20ms
│   ├── playHeartbeat()    // two low pulses 50ms apart, 80Hz
│   ├── playSubmit()       // pneumatic whoosh — noise + downward sweep
│   ├── playCascadeNote(i) // marimba note i of N, ascending scale
│   ├── playScorePrint()   // typewriter ding — 880Hz short
│   ├── playWrong()        // damped off-key — detuned minor third, low volume
│   └── playStart()        // kickoff chime — rising two-note
│
├── useAmbientBed()   // looping office hum (synthesized low noise + faint keyboard ticks)
└── useEscalation(secondsLeft)
     ├── "calm"     → ambient at 0.04 gain
     ├── "pressure" → ambient at 0.06 + slight high-shelf boost + tick every second
     └── "critical" → ambient slightly distorted + heartbeat every second + shake
```

All still WebAudio. Zero asset weight. Respects existing sound toggle.

---

## 7. Session schema versioning

```ts
// lib/storage.ts
function migrateLegacySession(raw: unknown): Session {
  const s = raw as Record<string, unknown>;
  if (!s.schema) return { ...s, schema: "v1" } as Session;
  return s as Session;
}
```

**Load:** migrate-on-read sets `schema: "v1"` on any session missing the field.
**Save:** always write with the current schema version (`"v2"` after R1).
**Render:** `DebriefScreen` branches on `session.schema` — v1 renders flat list, v2 renders bucket view with a small "v1 round" badge when replaying old sessions.
**Grade API:** accepts either shape; `userBuckets` presence determines routing.

---

## 8. Anti-regression invariants (checked after every phase)

1. `tsc` clean, `next lint` clean, `next build` clean.
2. Live E2E suite (`/tmp/ig_e2e_live.sh`, 38 checks) passes.
3. Browser E2E suite (`/tmp/ig_browser_e2e.py`, 17 checks) passes.
4. Old (v1) sessions in localStorage still render without error.
5. Sound toggle still works; default is OFF; no autoplay.
6. `prefers-reduced-motion` disables all new animations.
7. Stub grader fallback still returns a valid `GradeResult` when `ANTHROPIC_API_KEY` is absent.
8. Keyboard nav: Tab reaches every interactive element; drag operations have keyboard equivalents (already in dnd-kit).
9. No new console errors (`pageerror`) across full play flow.
10. OG share card still renders at `/api/og?scenario=...&dq=...`.

Any phase that breaks an invariant does not ship until the invariant is restored.

---

## 9. Scoring formula evolution

### v1 (current)
```
DQ = 40*ndcg10 + 40*precision5 + 20*timeBonus
```

### v2 (after R1)
```
DQ = 35*bucketingAccuracy + 35*rootRankAccuracy + 20*timeBonus + 10*precision5

where:
  bucketingAccuracy = correctBuckets / placedChips  ∈ [0,1]
  rootRankAccuracy  = NDCG@5 over the user's root-bucket rankings ∈ [0,1]
  timeBonus          = unchanged; 0.75 multiplier when pause used
  precision5         = unchanged residual signal
```

### Pause-as-penalty refined
- Pause halves the *time* component only (was 0.75x, tightening to 0.5x when used).
- Doesn't affect bucketing or ranking accuracy — pausing to think is *desirable* cognition.

### Sanity cases
| User behavior | v1 DQ | v2 DQ | Why the change |
|---|---|---|---|
| Ranks all symptoms in top 5, no roots | ~40 | ~10 | v2 punishes miscategorization hard |
| Buckets everything correctly but misranks roots | ~50 | ~60 | v2 rewards right-kind-of-thinking |
| Perfect bucketing + perfect rank | 100 | 100 | Ceiling unchanged |
| Empty submission | 0 | 0 | Unchanged |

---

## 10. Migration & rollout strategy

### Phase gates (each must pass before next phase starts)

| Phase | Ships to | Gate |
|---|---|---|
| R0 | prod | Live round with every scenario produces partner-voiced feedback citing teaching notes |
| R1 | prod behind `?bucket=1` flag first | 5-tester A/B: bucket vs flat; pick winner before flag flip |
| R2 | prod | Thinking output cohesive, no leak of ranks, latency <15s p95 |
| R3 | prod | Sound off → still grown-up; on → film, not slot machine |
| R4 | prod | Scene helps more than it distracts (tester survey) |
| R5 | prod | Indian-context tester says "this feels real," not "translated" |
| R6 | prod | Score still feels earned despite markup |
| R7 | prod | Dashboard makes returning player want to play *more*, not feel *behind* |
| R8 | defer | Only if R1 tester signal demands more structural expression |

### Failure-mode recovery
- **Bucket UI gets rejected in R1 testing** → remove flag, stay on v1 UI, keep R0 voice upgrades (which are scenario-data-only and stay).
- **Thinking streaming breaks on Edge runtime** → fallback to non-stream, show partner thinking as post-hoc transcript in debrief. Same UX signal, less cinematic.
- **Indian variants draft too generic** → pause R5, ask user (faculty at Jaipuria) to rewrite voice, I only structure.

---

## 11. Cost & latency model

### Anthropic per-round costs (Haiku 4.5, $0.25 / $1.25 per MTok in/out)
- **v1 current:** ~1.5K input (cached) + 300 out ≈ $0.0005/round
- **v2 R0+R1:** ~2K input + 500 out ≈ $0.0007/round
- **v2 R2 thinking:** +4K thinking tokens ≈ $0.0055/round (10x jump — track carefully)

At 1K rounds/day: $5.50/day in R2 mode vs $0.50/day currently. Still well within reason; flag to user if sessions spike.

### Latency
- **v1 current:** ~2–4s p95
- **R0:** unchanged (~2–4s)
- **R2 thinking:** ~10–15s p95. Mitigated by streaming (user sees progress) and a "Senior Partner is reviewing…" UI that turns the wait into content.

---

## 12. Risks specific to architecture

| Risk | Surface | Mitigation |
|---|---|---|
| Prompt cache invalidation on every `GRADER_PROMPT_VERSION` bump | Cost spike at first round of each phase | Single-session re-cache cost is ~$0.002 — acceptable. |
| Streaming + Edge runtime | R2 shape | SSE works on Edge since Next 13. Prototype in R2 before committing UX. Fallback to non-stream ready. |
| localStorage quota for progress + sessions | R7 + accumulated plays | 5MB limit. Each round <1KB. At 5000 rounds we're still <5MB. Compaction strategy if we cross. |
| Schema versioning footgun: forgetting to set `schema: "v2"` on write | R1 | Single `createSession()` helper with compile-time default. No raw session writes allowed elsewhere. |
| Indian-variant scenarios fragmenting content ops | R5 | Shared `canonicalCause[]` between US and IN variants — only *fiction* differs. Halves the maintenance surface. |
| Partner voice leaks into canonical causes | R0 | Keep `canonicalCause.title` voice-neutral. Voice lives only in `debriefLineVariants` + partner-generated per-cause notes. |

---

## 13. What we're explicitly deferring

- **Server backend** — localStorage only through R8. v3 is a new doc.
- **Multi-user / cohort mode** — not this cycle.
- **Real-time leaderboards** — private progression only.
- **Assessment/grading for coursework** — brings auth, anti-cheat, audit logs. Separate track.
- **Faculty CMS** — hand-coded scenarios for v2, CMS for v3.
- **Mobile-native app** — PWA only via the existing Next.js build.

---

## 14. First commit after this doc lands

**R0 ships as one PR:**
1. `lib/types.ts` — add `CauseKind`, new fields, `SeniorPartner`, `Scenario.seniorPartnerId`
2. `lib/partners.ts` — Anika, Ravi, Karen definitions
3. 3 scenario files — add `causeKind` + `teachingNote` per cause, add `seniorPartnerId`, rewrite openers in situational voice
4. `lib/agent/prompts.ts` — inject partner voice + teaching notes, bump version to `grader@2.0.0`
5. `components/PartnerByline.tsx` — new component
6. `DebriefScreen.tsx` — wire byline above overallMessage

**Quality gates before merge:** tsc clean, lint clean, build clean, manual smoke of each scenario with live grader.

Commit message template:
```
feat(R0): partner voice + teaching notes + causeKind enrichment

- 3 named senior partners (Anika, Ravi, Karen) with sharp/warm tone bands
- Each canonical cause gains causeKind (symptom/proximate/root) and a
  teachingNote explaining WHY it's that kind
- Grader cites teaching notes in per-cause feedback
- Scenario openers rewritten in partner voice + situational language
- GRADER_PROMPT_VERSION bumped to grader@2.0.0
- DebriefScreen shows "Graded by {partner}" byline

No UI mechanics changed. Bucket-then-rank lands in R1.
```

---

## 15. R0.5 postmortem (added 2026-04-19, after R0 ship)

After R0 landed, an ultrathink pass surfaced six material gaps. Two were P0
("undermines R0's stated goal"); four were P1+ ("real, not breaking"). They
shipped together as **R0.5** before any R1 work began.

### The most consequential miss
**The teaching notes never reached the player.** The system prompt asked the
LLM to "lean on each cause's teachingNote when explaining," but the tool
schema had no per-verdict field for the LLM to write that explanation into.
Net effect: 36 teaching notes shaped only the LLM's reasoning over the
single `overallMessage`; the per-cause `debriefLine` rendered in
`DebriefReel` came from pre-authored v1 copy that knew nothing about
partners.

### What R0.5 added
1. `Verdict.partnerNote?: string` (optional in TS, required in tool schema).
   Live verdicts always carry it; stub responses and pre-R0.5 sessions stay
   valid `Verdict` objects.
2. `DebriefReel` renders `partnerNote ?? debriefLine` — partner voice surfaces
   for new sessions, v1 fallback for old ones.
3. Dropped the `estimateDQ` heuristic — the model picks tone (sharp/warm)
   post-hoc from its own grade, instructed to NOT return canned calibration
   lines verbatim.
4. Partner attribution made visible across the flow:
   - `BriefIntro` footer: "Reporting to: {partner}"
   - `ScenarioCard` (landing): "Graded by {partner}"
   - `PlayScreen` near timer: "{partner.first-name} is waiting on your call."
   - `OG` card: "Graded by {partner.name}" beside score
   - `ShareButton` text: "Anika Mehra graded my Funnel-recovery diagnosis: 83/100"
5. `getPartner` throws on unknown id (no more silent `undefined` indexing).
6. Vitest install hit an upstream npm/arborist bug, so tests were written
   against Node 24's built-in `node --test` runner with
   `--experimental-strip-types` for TS support — zero install. 167 shape
   tests across scenarios + partners.
7. Doc hygiene: `realism_plan.md` (v1) moved to `docs/_archive/`.

### Bumped versions
- `GRADER_PROMPT_VERSION` → `grader@2.1.0` (one-time prompt-cache miss on
  first request after deploy; ~$0.002).
- Scenario versions remain `2.0.0` (their data shape didn't change in R0.5).

### Quality gates
- `tsc --noEmit`: clean (after enabling `allowImportingTsExtensions`)
- `eslint .`: clean
- `next build`: clean
- `npm test`: 167 / 167 pass
- Live E2E + browser E2E: re-run after deploy

### Calibration on sound vs realism
R0.5 made zero changes to mechanics, sound, or visuals beyond the partner
attribution chips and the per-cause partnerNote text. R1 (bucket-then-rank)
is now next, unchanged from §1.2 of `realism_plan_v2.md`.
