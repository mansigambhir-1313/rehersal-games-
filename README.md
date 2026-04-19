# Rehearsal Games — Inversion Gym

> *The product died. Work backwards. What killed it?*

The first game in **Rehearsal**'s Games module. A 3–5 minute solo round where you read a business failure and list — in priority order — the causes you'd investigate. Claude grades your ranked list against an expert-graded canonical set. You get a **Decision Quality score** (NDCG-aware), per-cause debrief, and a shot at doing it better.

Built as v1 of a larger catalog of decision-under-pressure games for MBA / campus-placement prep. See `docs/build_plan_v2.md` for the full catalog and phased roadmap.

---

## Repository layout

```
inversion-gym/
├── app/                    # Next.js 16 web app (the game itself)
│   ├── app/                # routes
│   │   ├── page.tsx                    # landing
│   │   ├── play/page.tsx               # 90s game loop
│   │   ├── debrief/page.tsx            # result
│   │   ├── api/grade/route.ts          # POST /api/grade
│   │   ├── layout.tsx                  # fonts + sidebar shell
│   │   └── globals.css                 # design tokens
│   ├── components/         # UI (TimerBar, CauseListEditor, DebriefReel, ScoreDial, …)
│   ├── lib/                # pure logic (types, scoring, stub grader, storage)
│   │   ├── agent/          # Claude grader — prompts + structured tool schema
│   │   ├── scenarios/      # scenario registry + content
│   │   └── integration/    # Rehearsal integration seams (stubs for v1)
│   ├── .env.example
│   ├── package.json
│   └── README.md           # detailed app-level README
└── docs/
    ├── system_design.md    # architecture, data flow, contracts
    └── build_plan_v2.md    # ultrathink edge-case pass + design system tokens
```

---

## Run locally

```bash
cd app
pnpm install
cp .env.example .env.local   # optional — needed only for live Claude grading
pnpm dev
```

Open http://localhost:3000. Sidebar shows **Games** highlighted.

**Without a Claude API key:** the app runs against a deterministic stub grader (string similarity + synonym matching). A banner on the debrief makes this explicit.

**With a Claude API key:** drop `ANTHROPIC_API_KEY=sk-ant-...` into `.env.local` and grading routes through Claude Haiku 4.5 with prompt caching. Per-session cost ≈ $0.001–0.003 after cache warmup.

---

## What's built in v1

**Core game loop**
- Landing page with "Your last attempts" strip from localStorage
- Brief intro with editorial SVG cover and 90-second cold open
- Timed round: drag-to-reorder cause list (up to 10 slots), candidate chip pool, pulsing timer bar (subtle — gets a color shift in last 10s, no panic pulse)
- Submit or let the clock expire

**Grading**
- **Stub grader** — Jaccard similarity over tokenized cause titles + synonyms, greedy 1-to-1 assignment, deterministic
- **Live grader** — Anthropic TS SDK with:
  - **Prompt caching** on system prompt + scenario block (82% input-cost reduction after warmup)
  - **Structured output** via forced `submit_grade` tool schema (no JSON parse retries)
  - **Prompt-injection defense** — user input wrapped in `<user_input>` tags + explicit system-prompt instruction to treat that text as data
  - **Auto-fallback** to stub on any failure
- **Scoring** — Decision Quality % = 40·Precision@5 + 40·NDCG@10 + 20·TimeBonus

**Debrief**
- Animated ScoreDial (arc draws 0 → final)
- Sub-scores (Precision@5, NDCG@10, Time bonus)
- Staggered reveal of each canonical cause with ✓/× status, editorial debrief line, and "You said: …" for matches
- Stub-mode banner when no API key present

**Design system**
- **Instrument Serif** (display) + **Geist Sans** (body) + **Geist Mono** (numerals)
- Token-driven — `--color-*`, `--dur-*`, `--ease-auth` in `globals.css`
- Rehearsal-matching sidebar nav, black-pill CTAs, *Reasoning · Game* purple category pill
- `prefers-reduced-motion` honored
- WCAG-baseline focus rings and semantic roles (`role="timer"`, `aria-live`)

**Quality gates (all green)**
- `pnpm lint` — 0 errors, 0 warnings
- `npx tsc --noEmit` — 0 errors
- `pnpm build` — production build succeeds, 5 routes
- 17/17 E2E smoke tests pass (page renders, zod validation 400/404, adversarial inputs including prompt injection, determinism, no-API-key-leak)

---

## Adding a new scenario

1. Copy `app/lib/scenarios/funnel-recovery.ts` to `app/lib/scenarios/my-scenario.ts`.
2. Populate: 12 canonical causes (expert-ranked), 4+ synonyms per cause, 2+ debrief-line variants per cause, 12 candidate chips, cover art (inline SVG or `public/covers/*.svg`).
3. Register in `app/lib/scenarios/index.ts`.
4. Play: `/play?scenario=my-scenario`.

Scenario content is versioned (`version: "1.0.0"` in the scenario object) — bump on any edit so old sessions remain reproducible.

---

## Roadmap — what's next

Remaining phases from `docs/build_plan_v2.md`:

**Phase D — polish (UX):**
- Sound design (Howler, toggleable, default off)
- OG share card via `@vercel/og` (post your score to WhatsApp / LinkedIn)
- Demo mode for classroom projectors
- Pause-for-breath (costs 5 DQ points)
- Full WCAG AA audit

**Phase E — content + hardening:**
- Resignation Letter + Hertz Accenture scenarios (from the 22-brief catalog)
- 8-of-12 canonical-cause rotation per round (so replay shows new causes)
- 15-case grader regression suite against live Claude
- Session versioning fully plumbed end-to-end

---

## Integration with Rehearsal

Four integration seams in `app/lib/integration/rehearsal.ts` — stubs in v1, swap-in-a-PR for v2:

- `onSessionComplete(session)` — persist session to Rehearsal's History
- `getUserMemory()` — pull game-relevant memories for prompt personalization
- `linkToBrief(briefSlug)` — deep-link from debrief to the matching brief
- `reportDecisionEvent(event)` — analytics pipeline

---

## Tech stack

- **Next.js 16** (App Router + Turbopack) on React 19
- **TypeScript 5** strict
- **Tailwind v4**
- **motion** (Framer Motion v12) for choreographed animations
- **@dnd-kit** for keyboard-accessible drag-to-reorder
- **@radix-ui** primitives for dialog / tooltip / switch
- **@anthropic-ai/sdk** for Claude grading with prompt caching and tool_use
- **zod** for request validation
- **lucide-react** for icons

---

## Part of the Rehearsal platform

[Rehearsal](https://testing.gradeless.ai) (by Gradeless.ai) is an AI interview-preparation and career-readiness platform for MBA / campus-placement prep. The Games module is a new top-level pillar alongside Briefs, Role Plays, CV Enhancer, Aptitude, and Ask Coach. Inversion Gym is game #1 of a planned catalog of 10. See `docs/build_plan_v2.md` for the full catalog.
