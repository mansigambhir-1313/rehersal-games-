# Realism Plan v2 — The Deeper Cut

**Date:** 2026-04-19
**Supersedes:** `realism_plan.md` (v1). v1 was about *making it look real*. v2 is about *making it think real, learn real, stick real.*

---

## What v1 got wrong (or thin)

V1 split realism into "situational" + "sensory" and built a polish plan around them. That covered the surface but missed three deeper layers where the *learning* actually lives. The five layers are:

| Layer | Question | Where v1 stood |
|---|---|---|
| **1. Cognitive realism** | Does the *thinking process* mirror real diagnosis? | **Missed entirely.** The flat ranked list is a lie about how causation works. |
| **2. Pedagogical realism** | Does the player *learn what they got wrong*, not just see a number? | **Mostly missed.** Debrief is a score with a few lines. No retention loop. |
| **3. Situational realism** | Does the scene feel like the real job? | Covered (investigator desk, HR folder, boardroom). |
| **4. Sensory realism** | Do the inputs feel physical? | Covered (sound palette, tactile drag, analog clock). |
| **5. Emotional realism** | Do the stakes linger past one round? | **Missed.** The score has no consequence. There's no character. There's no reputation. |

V2 reorders priorities: **Layer 1 first, Layer 2 second, then everything v1 had.** Polish without cognition is just a prettier quiz.

---

## Layer 1 — Cognitive realism: stop ranking lists, start mapping causes

### 1.1 The structural lie

A real postmortem doesn't produce a flat ranked list. It produces a **causal chain**:

```
no lead-routing → 8-min response delay → leads cool off → 90% loss
   (root)            (proximate)           (mechanism)    (symptom)
```

The "root cause" isn't the highest-impact item on a list — it's the **upstream node whose removal would have prevented everything downstream.** A flat list cannot express that. It treats roots, mechanisms, and symptoms as commensurable, which they are not.

The current game *teaches the wrong mental model*. If a student plays it for ten rounds, they get better at "guessing what the LLM thinks the top 3 are" — which is a very different skill from "diagnosing root causes." That's a pedagogy problem, not a UI problem.

### 1.2 The fix that's still shippable: **bucket-then-rank**

Before the player can rank, they must drop each chip into one of three buckets:

- **🩺 Symptom** — a visible effect (e.g., "low conversion rate")
- **⚙️ Proximate cause** — the last thing that broke (e.g., "lead-routing was off")
- **🌱 Root cause** — the upstream condition (e.g., "no SLA on response time was ever defined")

Only **root causes** can then be ranked 1–5. Symptoms and proximate causes are graded for *correct categorization* but not ranked.

This costs the player 20 of their 90 seconds but produces a vastly more honest output. The grader becomes more powerful too:
- Bucketing accuracy → did the player know what *kind* of thing each item was?
- Root-rank accuracy → among the things they correctly identified as roots, did they prioritize?
- Two scores instead of one. Two lessons per round.

### 1.3 The stretch version: **causal-graph builder**

Instead of buckets, the player drags causes onto a canvas and draws arrows between them. The grader scores:
- Are the right *nodes* present?
- Are the arrows pointing the right way?
- Is the *root* (no in-edges) the canonical root?

This is the "5 Whys" diagram made interactive. It's also a much harder UI build (≈ 4 days) and a harder grader (need to compare DAGs, not lists). Defer to v3 unless there's clear demand after v2 ships.

### 1.4 The single-verb test

Whacka games each have one physical verb: HueQuest = sort, MysticDraw = draw, PocketBoy = tap. Inversion Gym today has "rank" — abstract, not physical. After v2 it should have **"sort + stack"**: sort into buckets (kinaesthetic), stack the roots in order (commitment).

---

## Layer 2 — Pedagogical realism: build a learning loop, not a leaderboard

### 2.1 The streaming senior-partner thinking

Use Anthropic's extended-thinking parameter and **stream the partner's deliberation visibly** before the verdict appears:

```
[The senior partner is reading your submission…]
"Hm. They got lead-latency in roots — good."
"But they put form-length in roots too. That's a 
funnel-entry concern, not a funnel-loss concern. 
Classic confusion."
"And they missed attribution. That's the one I'd 
have pushed back on in the meeting."
[Drafting feedback…]
```

This is two things at once:
- **Pedagogically real** — the player sees expert cognition unfold, not just receives the conclusion. That's how apprenticeship works.
- **Game-feel real** — they watch the verdict *form*, the way you watch a referee review a replay.

Implementation: same Anthropic call, just enable `thinking: { type: "enabled" }` and stream the thinking blocks to a "Senior Partner is reviewing…" panel. The actual structured grade arrives at the end via tool use.

### 2.2 Per-cause teaching note (not "wrong, see right")

Today the debrief tells you the canonical answer. v2 debrief explains *why each item is the kind of thing it is*:

> **"form-length"** — you ranked this in roots. It's a proximate cause at best, and arguably a symptom. Form length affects who *enters* the funnel, not who *drops*. If your form had been one field, you'd have more entries — but the same percentage would still cool off after the lead-latency delay. Test for yourself: would removing this fix the leak? No. → not a root.

This is the actual teaching. Generate it from a per-cause `teachingNote` field on each canonical cause. Author once, reuse forever.

### 2.3 The "things you keep missing" tracker

Every round, log which causes the player misranked or miscategorized. Store in localStorage. Surface on landing:

> Last 5 rounds, you keep missing **lead-latency** (4/5) and **manager-relationship breakdown** (3/5). These show up early in real cases and get masked by louder symptoms. Practice mode →

This is the **retention loop**. Without it, the game is a quiz. With it, it's a tutor.

### 2.4 Spaced repetition on canonical causes

The 8-of-12 chip rotation today is uniform random. Replace with weighted-by-miss-frequency: causes the player has miscategorized recently appear *more often* in subsequent rounds. They can't escape their weak spots until they fix them. Anki for diagnosis.

### 2.5 The learning dashboard

A new screen at `/progress`:

- **Causes mastered:** 18 of 36 canonical
- **Recurring blind spots:** 4 (with names + last 3 attempts)
- **Average DQ trend:** sparkline over last 20 rounds
- **Strongest scenario:** Resignation Letter (DQ 87 average)
- **Weakest:** Hertz/Accenture (DQ 64 — try Practice mode)

Lives in nav. Optional but high signal for the MBA-student audience whose meta-game is "am I getting better."

---

## Layer 3 — Situational realism (revised from v1)

V1 covered this well. Two upgrades:

### 3.1 Brief as **multi-document triage**, not a poster

Real briefs are messy. The brief screen should show 4–5 micro-documents the player must read fast:

- Funnel scenario: founder's panicked Slack DM + a CMO email + a metrics screenshot + a Loom transcript snippet + a Jira ticket
- Resignation scenario: the actual letter + manager's recent 1:1 notes + comp band sheet + Slack #team channel snippet
- Hertz scenario: a Reuters article + the SOW excerpt + a leaked board memo + a vendor sales-deck slide

Information triage is itself a consulting skill. Today's poster trains nothing. Plus: documents can hide *red herrings* (info that looks relevant but isn't), which is real.

### 3.2 Indian context (this is non-optional for the audience)

The user is faculty at Jaipuria. Generic US examples feel imported. v2 ships parallel Indian variants of all three scenarios:

- **Funnel-recovery (India)** — A Bangalore-based test-prep edtech (BYJU's-era), CAC in INR, lead mix = FB ads + WhatsApp + offline center events, AVP titles, 90-day post-launch.
- **Resignation-letter (India)** — IC-3 engineer at a Bangalore SaaS unicorn. INR comp bands. Notice-period clauses. "Cultural fit" loaded language. Manager is an "AVP, Engineering."
- **Hertz/Accenture parallel** — Use the **BSNL or Air India IT modernization** failure (publicly documented), or invent a fictional Indian conglomerate × Big-4 case to avoid defamation risk.

Random selection on session start, OR let the user pick locale on landing. Same canonical causes underneath, fresh fiction on top.

---

## Layer 4 — Sensory realism (revised from v1)

V1's 11-sound palette + tactile drag stays. Two refinements:

### 4.1 Reframe sound as **film sound design**, not game SFX

- **Framing screens** (brief, debrief): silence or 1 sound max. Reading time is sacred.
- **Active play screen**: three layers running simultaneously:
  - *Ambient bed* (looping low-volume): office hum, distant phones, faint keyboard chatter. Sets the scene.
  - *Interactive layer* (per action): the wood-block, paper-rustle palette from v1.
  - *Time-pressure layer* (escalating): clock tick at <30s, heartbeat at <10s, AND the ambient bed slowly *sharpens/distorts* — emotional escalation, not just volume.
- **Submit moment**: 1.5s of dead silence before the debrief sound starts. Tension.

This is closer to a Coen-brothers cut than a Mario coin. Matches the editorial framing.

### 4.2 Visual time pressure that *escalates*, not just decrements

V1 mentioned the analog clock. Add:
- 30s left: the room subtly desaturates (CSS filter on the page)
- 10s left: clock face glows warm red, second-hand shadow sharpens
- 5s left: the clock shakes 1px per tick, brief auto-scrolls if not already at the input
- Submit: a half-second white flash, then everything goes still for the verdict

The body responds to escalation, not to a static threat.

---

## Layer 5 — Emotional realism: stakes that follow you

This is the layer most missing from v1.

### 5.1 Named senior partners with distinct voice

Each scenario gets a fictional senior who graded you, with backstory:

| Scenario | Partner | Voice |
|---|---|---|
| Funnel-recovery | **Anika Mehra** — ex-McKinsey, ran Growth at a Series-C edtech. Numbers-first. Skeptical of "story" answers. | "Show me the math. If lead-latency is the root, what's the lift if we fix it?" |
| Resignation-letter | **Ravi Krishnan** — 15 years in People Ops at Infosys, then Razorpay. Empathetic. Always asks about the manager first. | "I notice you ranked comp ahead of manager-fit. In my experience that's the wrong order. Tell me why." |
| Hertz/Accenture | **Karen Wu** — current CTO at a US Series-C. Sharp, accountability-focused. Doesn't suffer vendor-blame. | "Half your roots are 'Accenture's fault'. That's not a diagnosis, that's a complaint. What did *Hertz* do?" |

Voice = different system prompt per scenario. Players learn *what kind of expert they're trying to become*, not "an expert." This is huge for an MBA audience choosing a career direction.

### 5.2 Reputation arc across rounds

Persistent player rank, advancing on cumulative DQ:

- **Junior Analyst** (default) → **Mid Analyst** (5 rounds avg ≥ 70) → **Senior Analyst** (10 rounds avg ≥ 80) → **Partner** (20 rounds avg ≥ 85)

Rank shows next to your name in nav. Demoting after a streak of bad rounds is *off the table* (too punishing). Only promotion. Whacka has community leaderboards; we have *personal* progression because the audience plays solo.

### 5.3 Chained scenarios (v3 stretch — flag for later)

If you ace Funnel-recovery, the founder asks you to "stay on for implementation" → unlocks a related scenario where the same business has a *new* problem and the brief references your prior diagnosis. Continuity = stakes that extend past one round.

This is great game design but a real authoring lift. Park for v3.

---

## The single biggest decision you need to make

Two roads:

**Road A — Cognitive-first (recommended).** Ship Layer 1 (bucket-then-rank) + Layer 2 (streaming partner thinking + teaching notes + miss tracker) before any visual/sound polish. The game becomes a *better tutor* before it becomes a prettier toy. Risk: takes ≈ 5 days before there's anything visually new to show.

**Road B — Polish-first (v1 plan).** Ship Layer 4 (sound, tactile drag) + Layer 3 (immersive scenes) first. Gets to "feels different" faster. Risk: pretty quiz. Layer-1 work happens later or never.

I think A is right because the user is an educator. The whole point of this is *learning*. A pretty quiz is still a quiz. But if you'd rather see visible motion fast (for a demo, a stakeholder review, anything externally facing), B is defensible.

---

## Phased rollout v2

Each phase independently shippable. Each gates on a quick test.

### R0 — Cognitive copy + teaching notes (1 day, blast radius: prompt + scenario data only)
- Rewrite all scenario openers in the partner's voice (§5.1) and situational language ("It's 9am Monday. Board call at 2.").
- Add a `teachingNote` field per canonical cause (§2.2) — author 36 short notes (3 scenarios × 12 causes).
- Update grader system prompt to use the teaching notes in feedback.
- **Ship gate:** play one round. Does the verdict explain *why* you were wrong, not just *that* you were? Yes → proceed.

### R1 — Bucket-then-rank mechanic (3 days, biggest single change)
- Add `causeKind` field per canonical cause: `"symptom" | "proximate" | "root"`.
- New UI step before ranking: drop chips into 3 labelled bins.
- Grader scores bucketing + root-ranking (two scores combined into DQ).
- New debrief layout: one column per bucket showing canonical answer + your answer + teaching note.
- **Ship gate:** A/B with current build, 5 testers (3 MBA students + 2 colleagues). Does bucket-then-rank feel like *more thinking* or *more friction*? If friction, simplify; don't ship yet.

### R2 — Streaming senior-partner thinking (1 day)
- Enable `thinking` parameter on the Anthropic call.
- Stream thinking blocks to a "Senior Partner is reviewing…" panel.
- Final structured grade still arrives via tool use.
- **Ship gate:** is the thinking output coherent and useful, or rambling? Tune the system prompt; don't ship verbose noise.

### R3 — Sound palette + tactile drag (1 day, was v1's R1)
- Replace 3 tones with the 11-sound palette (§4.1).
- Add ambient bed + escalation layer.
- Tactile drag: scale/tilt on grab, settle on drop, peer-stagger on reorder.
- **Ship gate:** play with sound off, then on. Off should still feel grown-up. On should feel like a film, not a slot machine.

### R4 — Per-scenario immersive scenes (3 days, was v1's R2)
- One `<ImmersiveDesk>` primitive with slot props.
- Per-scenario configs: investigator-desk / HR-folder / boardroom-slides.
- Analog clock + escalation visuals.
- **Ship gate:** does the scene *help* play (clearer mental model) or *interrupt* it (where do I click)? Test before shipping.

### R5 — Multi-document brief + Indian variants (3 days, was v1's R3 + new India work)
- Brief = 4–5 micro-documents the player triages.
- Author 1 Indian variant per scenario (3 new fictional contexts using same canonical causes).
- Locale picker on landing or random selection.
- **Ship gate:** Indian-context tester says "this feels real," not "this feels like a translation."

### R6 — Senior-partner red-pen debrief (2 days, was v1's R4)
- Scanned-paper background, red-pen SVG markup over your submission.
- Score as TA grade in corner.
- Partner's portrait + signature at bottom.
- **Ship gate:** does score still feel earned, or does the markup overshadow?

### R7 — Reputation arc + learning dashboard + spaced repetition (3 days)
- Rank progression in nav.
- `/progress` route with mastered / blind-spot / sparkline / per-scenario stats.
- Weight chip rotation by recent miss frequency (§2.4).
- **Ship gate:** does the dashboard make a returning player want to play *more* or feel *behind*? Tune copy if it's the latter.

### R8 — Causal-graph mechanic (4 days, stretch / v3 candidate)
- Replace bucket-then-rank with full graph builder.
- Grader compares DAGs.
- Defer unless R1 testing shows clear demand for more structural expression.

**Total v2 path (R0–R7): ≈ 17 working days.** Phases compose; you can stop after any of them and have a shipped product.

---

## What we deliberately are NOT changing in v2

To keep scope honest:

- **The scoring formula** stays (NDCG@10 + P@5 + TimeBonus, with a new bucketing-accuracy component).
- **The Anthropic model** stays (Haiku 4.5).
- **The 3-scenario count** stays. Each gets one Indian variant — that's 6 variants, not 6 scenarios.
- **The localStorage-only backend** stays. No auth, no server DB, no multi-device sync. Real progress requires real backend; that's v3.
- **The editorial brand** for landing + debrief framing stays. Only active play and the new immersive scenes (R4) shift visual register.

---

## Risks v1 didn't surface

| Risk | Why it matters | How to manage |
|---|---|---|
| **Bucket-then-rank may make the game *too instructive*** — players might lean on the bucket labels as hints instead of thinking. | The labels themselves leak some of the answer ("root cause" is half the diagnosis). | Test with bucket labels removed (just 🩺/⚙️/🌱 icons). Or, show buckets only after the player has placed all chips somewhere. |
| **Streaming partner thinking could leak the answer mid-stream**, ruining the "watch the verdict form" effect. | If the partner thinks "lead-latency is clearly root" out loud before the score appears, the player has nothing to discover in the debrief. | Prompt the model to *narrate observation, defer judgment*. The thinking should sound like analysis, not conclusion. Tune carefully. |
| **Indian variants risk caricature** if written by an LLM cold. | Cultural specificity done badly is worse than generic. | User (faculty at an Indian B-school) co-authors the Indian variants. We provide structure; she provides voice. |
| **Reputation rank could feel grindy** for a casual replay session. | "MBA student opens Inversion Gym for 5 mins between classes" shouldn't be punished by a long progression bar. | Ranks are private (no public leaderboard) and only promote. Removing the rank in nav is opt-out (settings). |
| **Senior-partner voice could come across as scolding**, especially Karen Wu ("That's not a diagnosis, that's a complaint"). | Indian-cultural feedback norms can find sharp Western voices alienating. | Write each partner with both a sharp and a warm version of their feedback line. The model picks based on the player's score band — sharper for high scorers, warmer for first-timers. |
| **Multi-doc brief slows time-to-action** — players may spend 60s reading and have 30s to play. | Information triage is the skill but not at the cost of the actual diagnosis. | The 90-second clock starts AFTER the brief. Reading is untimed. The clock starts on "Begin diagnosis." |
| **Layer-1 cognitive change invalidates existing sessions** stored in localStorage. | Players' history breaks. | Session schema versioning (already in place). Old sessions render as "v1 — flat ranking" with a small note. New sessions use the new schema. |

---

## Decisions I need from you before R0

The four from v1 still stand. Six new ones for v2:

1. **Cognitive-first (Road A) or polish-first (Road B)?**
2. **Bucket-then-rank in R1, or jump straight to causal-graph in R8?**
3. **Streaming partner thinking** — willing to spend the latency (extended thinking adds 5–15s)? It buys the "watching cognition" effect.
4. **Named partners** — happy with three named characters, or prefer scenario-anonymous "Senior Partner"?
5. **Indian variants** — do you want to co-author them with me (you write voice, I structure), or have me draft and you edit? Authoring quality matters more than speed here.
6. **Reputation rank** — show in nav by default, or opt-in?

---

## Success criteria, revised

After R0–R3 ship, an MBA tester should:

- Finish one round and say **"I learned what I got wrong, not just that I got it wrong"** → Layer 2 win.
- Bucket a chip and pause to *think about what kind of thing it is* → Layer 1 win.
- Notice the partner's voice and recognize it on a second round → Layer 5 win.
- Want to play a second round to fix a specific blind spot → retention loop is working.

If they say "it's prettier and the sound is nice" — we shipped Layer 4 and skipped the rest. Don't accept that as success.

---

## What's still unresolved (worth a follow-up conversation)

- **Faculty authoring path** — at some point, Mansi or her colleagues should be able to author scenarios without us. v2 ships with hand-coded data; v3 needs a CMS. Open question what shape that takes (Notion sync? Markdown frontmatter? Airtable?).
- **Multiplayer / cohort mode** — does it matter that 30 students in a class can play the same scenario and discuss results in seminar? If yes, we need a session-aggregation view for the instructor. Could be huge for adoption inside the MBA program.
- **Assessment integration** — do we ever want this to *count* for a course grade? That changes the threat model (cheating, anti-LLM defense, audit logs) and the architecture (server backend mandatory). Worth scoping early even if we don't build now.
- **Content rights** — the Hertz/Accenture scenario uses real public-record details. The Indian-variant inspiration (BSNL / Air India) is also publicly documented. We should still get a quick legal sanity-check before the Indian scenario goes live with real company names.
