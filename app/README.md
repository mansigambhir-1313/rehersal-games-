# Inversion Gym

> *The product died. Work backwards. What killed it?*

The first game in Rehearsal's Games module. 90 seconds to list the causes you'd investigate behind a business failure, ranked by priority. Claude grades your list against an expert-graded canonical set. You get a Decision Quality score, per-cause debrief, and a shot at doing it better next time.

**Pairs with docs at:**
- `docs/system_design.md` — architecture, data flow, contracts
- `docs/build_plan_v2.md` — ultrathink pass on edges + design system
- `../inversion_gym_build_plan.md` — the original v1 plan

---

## Run it locally

```bash
cd inversion-gym/app
pnpm install
cp .env.example .env.local   # optional — only needed for live Claude grading
pnpm dev
```

Open http://localhost:3000.

**Without a Claude key:** the app runs fine against the stub grader (string similarity only). A banner on the debrief makes it clear you're in stub mode.

**With a Claude key:** set `ANTHROPIC_API_KEY` in `.env.local` and grading routes through Claude Haiku 4.5 with prompt caching. Per-session cost ≈ $0.001–0.003 after cache warmup.

---

## What's shipped (v1)

- Landing page with last-attempts strip
- Brief intro with editorial cover art + 90s cold open
- Live game loop with drag-to-reorder cause list, candidate chip pool, timer
- Stub grader (string similarity, no LLM) — deterministic
- Live grader via Anthropic SDK:
  - Prompt caching on system prompt + scenario block
  - Structured output via `submit_grade` tool schema (no JSON parse retries)
  - Forced tool use (`tool_choice: { type: "tool", name: "submit_grade" }`)
  - Temperature 0, defense-in-depth against prompt injection inside user causes
  - Auto-fallback to stub on any failure
- Debrief with ScoreDial, sub-scores (Precision@5, NDCG@10, Time bonus), per-cause verdict cards
- Scoring: NDCG@10-aware Decision Quality %
- localStorage persistence of last 25 sessions
- Integration seams for Rehearsal (stub implementations in `lib/integration/rehearsal.ts`)
- Rehearsal-styled sidebar nav and editorial design tokens
- Keyboard + mouse drag-to-reorder via dnd-kit
- `prefers-reduced-motion` respected via globals.css

## What's next

- Phase D: sound design, OG share card, demo mode, pause-for-breath, a11y pass
- Phase E: 2 more scenarios (Resignation Letter, Hertz Accenture), 8-of-12 rotation, 15-case grader regression suite
- Phase F: integration doc for Rehearsal, grader-tuning doc

---

## Project layout

```
inversion-gym/app/
├── app/
│   ├── layout.tsx            # root — fonts, Nav
│   ├── page.tsx              # landing
│   ├── play/page.tsx         # game loop (RSC → PlayScreen)
│   ├── debrief/page.tsx      # result (RSC → DebriefScreen)
│   ├── api/grade/route.ts    # POST /api/grade — zod validated, stub|live routing
│   └── globals.css           # design tokens
├── components/
│   ├── Nav.tsx
│   ├── LandingHero.tsx
│   ├── LastAttempts.tsx
│   ├── BriefIntro.tsx
│   ├── PlayScreen.tsx
│   ├── TimerBar.tsx
│   ├── CauseListEditor.tsx
│   ├── CauseChipPool.tsx
│   ├── GradingOverlay.tsx
│   ├── DebriefScreen.tsx
│   ├── DebriefReel.tsx
│   └── ScoreDial.tsx
├── lib/
│   ├── types.ts
│   ├── scoring.ts            # pure, NDCG-aware
│   ├── stubGrader.ts         # no-LLM fallback, deterministic
│   ├── storage.ts            # localStorage wrapper
│   ├── cn.ts                 # className merge
│   ├── scenarios/
│   │   ├── index.ts          # registry + seeded cause rotation
│   │   └── funnel-recovery.ts
│   ├── integration/
│   │   └── rehearsal.ts      # Rehearsal seams (stubs in v1)
│   └── agent/
│       ├── prompts.ts        # system prompt + tool schema + sanitizer
│       └── grader.ts         # Claude client with prompt caching
└── .env.example
```

---

## Adding a scenario

1. Create `lib/scenarios/my-scenario.ts` exporting a `Scenario` object.
2. Register it in `lib/scenarios/index.ts`.
3. Hit `/play?scenario=my-scenario` to test.

Scenario authoring checklist:
- 12 canonical causes, ordered by expert priority (rank 1 = highest)
- At least 4 synonyms per cause (helps the stub grader and gives Claude a cue)
- 2+ debrief-line variants per cause
- 12 candidate chips shown as hints (derived from canonical cause titles, paraphrased)
- Cover art via inline SVG in the scenario component, or `public/covers/*.svg`

## Security notes

- `ANTHROPIC_API_KEY` is read only on the server in `/api/grade`. Never exposed to the browser.
- User inputs are wrapped in `<user_input>` tags inside the grader prompt and the system prompt explicitly instructs Claude to treat that text as data, not instruction.
- zod validates every `/api/grade` request; cause text length capped at 200 chars, max 10 causes per submission.

## Useful commands

```bash
pnpm dev           # Turbopack dev server
pnpm build         # production build
pnpm start         # run built app
pnpm lint          # eslint
npx tsc --noEmit   # type-check only
```

---

Built as part of the Rehearsal Games module. Editorial design cues from the parent product at `testing.gradeless.ai`.
