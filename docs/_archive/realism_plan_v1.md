# Realism Plan — Making Inversion Gym feel real, not generic

**Date:** 2026-04-19
**Inspiration reference:** https://whacka.app — what makes Whacka games feel alive isn't arcade juice, it's *immersion*: PocketBoy is a real Gameboy, MysticDraw deals you real tarot, HueQuest has you arranging real color gradients. The interface *is* the thing.
**Diagnosis:** Inversion Gym today is a generic ranked-list editor sitting on top of a brief and a debrief. The mechanics are abstract ("rank these causes 1–10"). It feels like a quiz, not a forensic investigation.
**Thesis:** Make every screen *behave like the situation it depicts*. The player isn't ranking causes — they're conducting a postmortem. Every interaction should reinforce that fiction.

---

## 1 — What "realistic" means here

Two distinct lenses, both needed:

| Lens | Question | Win condition |
|---|---|---|
| **Situational realism** | Does this feel like the actual job of diagnosing a dead product? | Player thinks "this is what a real postmortem feels like" |
| **Sensory realism** | Do the inputs and outputs feel physical and consequential? | Player thinks "I am holding evidence, not clicking buttons" |

The current build is weak on both. It's a serif-typography quiz with a pass/fail score.

---

## 2 — The fiction we should commit to

Pick ONE metaphor per scenario and commit to it across the entire flow. No more generic "rank these causes." Each scenario gets its own props, room, sound, and verbs.

### 2.1 — Funnel Recovery → "The Investigator's Desk"

The player is a fractional consultant called in 30 days after a failed funnel launch. Their job: write the postmortem memo before the founder's 2pm meeting.

- **Brief screen** = an actual brief delivered as an email + Slack thread + a Loom transcript. Not a marketing poster.
- **Edit screen** = a desk with:
  - A stack of evidence cards (the canonical-cause chips, but rendered as index cards with sticky-note shadows)
  - A **whiteboard** (the ranked list — drag cards onto numbered positions)
  - A **clock on the wall** (90-second countdown — analog, not digital, ticks audibly)
  - A **coffee cup** that empties as time runs out (visual time pressure)
- **Submit** = "Send to founder" button (pneumatic-tube whoosh sound)
- **Debrief** = the founder's reply email — written in voice, not corporate copy. Then the "consultant's expert" markup overlay reveals what the senior partner would have ranked.

### 2.2 — Resignation Letter → "The Exit Interview"

The player is the People Operations lead. The resignation letter just hit their inbox. They have until end-of-day to draft the diagnosis for the VP.

- **Brief screen** = the actual resignation letter on screen — handwritten font, signed, with telltale clues underlined the player can hover for tooltips.
- **Edit screen** = a manila HR folder open on a desk:
  - Performance reviews (some causes hide here as "you'd notice this in the 1:1 notes")
  - Slack DMs (peer departures, recognition gaps live here)
  - Comp band sheet (visible as evidence)
- **Submit** = "File diagnosis" — staple sound.
- **Debrief** = the **employee's exit interview transcript** plays back, line by line, revealing which causes she actually named.

### 2.3 — Hertz/Accenture → "The Boardroom Postmortem"

The player is the new CTO inheriting the disaster. They have 90 seconds before the board call to identify what went wrong.

- **Brief screen** = a Reuters-style news story with the $32M number above the fold.
- **Edit screen** = a boardroom slide deck builder — slides are the ranked causes, you drag-drop them into presentation order.
- **Submit** = "Present to board" — projector-click sound, lights dim.
- **Debrief** = a literal courtroom-deposition style markup of the actual lawsuit filings (these are public — quote them) showing where each cause maps to a real legal claim.

---

## 3 — Mechanic upgrades that make play feel real

### 3.1 — Replace abstract drag-rank with **evidence-pinning**

Today: drag chips into a ranked list 1–10.
Realistic: each cause has a strength rating (●●●○○) you set by **dragging it harder/longer onto a corkboard** (longer hold = more pins = higher rank). This mimics the act of weighing evidence, not sorting a list.

Alternative simpler version: each cause card has a "confidence slider" — 0–100% — and the rank is derived from confidence. Forces the player to *commit* a strength, not just an order.

### 3.2 — Hidden information, not all-at-once revelation

Today: all 8 candidate chips are visible at start.
Realistic: only 3 are visible at start. The player has to **interview** to surface more — clicking on the brief's text reveals 1 chip per click; clicking on the org-chart sidebar reveals 1; clicking on metrics dashboard reveals 1. This mimics real investigation where evidence is not handed to you.

This also adds the **time-vs-information tradeoff** that's missing today — every click costs seconds.

### 3.3 — "Senior partner red-pen" debrief

Today: debrief is an LLM-graded score with a few coaching lines.
Realistic: the debrief is a **scanned-paper memo with red-pen markup** layered on top of the player's submitted ranking. Crossed-out ranks. Margin notes ("this isn't a cause, it's a symptom"). A circled root cause with "THIS." next to it. Score is in the bottom corner like a TA grade.

The LLM prompt stays the same — only the rendering changes. Score becomes secondary to the **annotated artifact**.

### 3.4 — Replay value through fresh evidence, not just shuffled chips

Today: 8-of-12 canonical-cause rotation per session.
Realistic: replay shifts the **fictional context** too. Resignation Letter v1 = "she's a senior IC." Replay v2 = "he's a junior PM, 8 months in" — same canonical causes apply but the brief, the signed letter, the comp band, all change. Replay feels like a new case, not the same quiz.

(This is faculty-authoring territory but we can hand-write 2–3 variants per scenario in v2.)

---

## 4 — Sensory realism (the "Whacka juice" layer)

The user explicitly cited Whacka as the reference for energy. Whacka games feel alive because the *interaction is the toy*, not because of confetti. Apply selectively, in service of the fiction:

### 4.1 — Sound design (replace 3 sine tones with a real palette)

| Action | Sound | Why |
|---|---|---|
| Pick up evidence card | Wood block / paper rustle | Tactile commitment |
| Drop on rank | Soft thud + paper settle | Confirmation |
| Reorder | Whisper-shuffle | Movement without weight |
| Reveal new chip (interview action) | Page-turn | Discovery |
| Clock tick (last 30s) | Analog tick, quiet | Background dread |
| Clock tick (last 10s) | Louder, slightly sharper | Foreground dread |
| Last 5s heartbeat | Low pulse | Body response |
| Submit | Pneumatic-tube whoosh | Sending evidence away |
| Debrief reveal (per row) | Marimba note ascending pitch | Cascading judgment |
| Final score | Typewriter ding | The verdict |
| Wrong direction (subtle) | Damped note off-key | Vibe nudge, not punishment |

All still WebAudio, no asset files. Stay accessible — sound toggle in nav already works.

### 4.2 — Tactile drag

Cards on grab: scale 1.05, tilt 2deg, drop-shadow lifts.
Cards on drop: spring-back overshoot, settle to 1.0.
Cards being reordered: peers slide out of the way with stagger (50ms each), not snap.
Hover on rank slot: faint glow ring.

### 4.3 — Time-pressure visuals

Today: a countdown number.
Realistic: an analog clock face whose **second hand jerks audibly**. At 30s remaining, the wall behind the clock subtly desaturates. At 10s, the clock face glows red. At 5s, the clock face shakes 1px every tick. Body-level dread, not a number.

### 4.4 — Score reveal as a printed report

Today: a static SVG dial with the number.
Realistic: a **dot-matrix printer** types out:

```
═══════════════════════════════════
  CASE: The Leak You're Not Measuring
  ANALYST: [your name or anon-id]
  TIME ON CASE: 78s of 90s
═══════════════════════════════════

  ROOT CAUSES IDENTIFIED ........  4 of 5
  RANKING ACCURACY  .............  82%
  TIME BONUS  ...................  +14
  ═══════════════════════════════════
  DECISION QUALITY  ............. 83/100

  Senior Partner: "You missed lead
  latency. That's the one that kills."
═══════════════════════════════════
```

Mono font, line-by-line print with stagger + tick sound. Only at the end does the share button slide in.

---

## 5 — Copy realism (the biggest single lever)

The current copy is consultant-generic. Real consultants don't write "diagnose root causes." They write:

- **Brief openers** (instead of "diagnose"):
  - "It's 9am Monday. The board call is at 2."
  - "She quit on a Tuesday. HR asks why by Friday."
  - "The lawsuit is now public. The CEO wants your one-pager by 5."

- **Submit verbs** (instead of "Submit ranking"):
  - "Send to founder"
  - "File diagnosis"
  - "Present to board"

- **Debrief opener** (instead of "Your decision quality is 83"):
  - "The founder's reply just landed."
  - "The exit interview transcript is in."
  - "The board asked three questions. Here's what they cared about."

- **Per-cause feedback** (instead of "you ranked this 4, expert ranked it 1"):
  - "Lead latency wasn't on your list. It killed 60% of the funnel."
  - "Manager-relationship breakdown is the one that ends the conversation. You had it at 7."

This is **prompt engineering** plus **scenario data** — no UI rewrite needed for copy alone. Biggest leverage.

---

## 6 — What we are deliberately NOT changing

To keep scope honest, here's what stays:

- The **scoring formula** (NDCG@10 + P@5 + TimeBonus) — it works.
- The **Anthropic grader** — we change the prompt, not the model or tool-use shape.
- The **session storage** in localStorage — no backend yet.
- The **3-scenario count** — depth over breadth in this round.
- The **editorial brand** for landing + framing — only the *active play surface* gets the immersive treatment.

---

## 7 — Phased rollout (don't ship it all at once)

### Phase R1 — Copy + sound (≈ 1 day)
- Rewrite all scenario copy in the voices above.
- Replace 3 tones with the 11-sound palette in §4.1.
- Rewrite debrief printout per §4.4 (mono font, stagger reveal).
- **Ship gate:** play one round and feel the difference. If yes, continue.

### Phase R2 — Edit-screen immersion (≈ 2 days)
- Build the "investigator desk" / "HR folder" / "boardroom slides" treatment for each scenario.
- Add the analog clock + coffee-cup time-pressure visual.
- Tactile drag (squish + settle).
- **Ship gate:** A/B with the current build with 3 MBA testers. Pick winner.

### Phase R3 — Hidden information (≈ 2 days)
- Refactor brief/sidebar to surface chips on click.
- Add the time-vs-information tradeoff (clicks cost seconds).
- **Ship gate:** does it make the game *harder* in a good way, or just tedious? Test before shipping.

### Phase R4 — Senior-partner red-pen debrief (≈ 2 days)
- New debrief view: scanned-paper background, red-pen SVG annotation overlay.
- Score as TA grade in corner.
- **Ship gate:** does the score still feel earned? Or does the markup overshadow it?

### Phase R5 — Replay variants (≈ 3 days)
- Hand-author 2 alternate fictional contexts per scenario (same canonical causes, different surface).
- Random selection on session start.
- **Ship gate:** does replay feel fresh, or do players notice the same answer key?

Total: ≈ 10 working days. Each phase is independently shippable.

---

## 8 — Risks and how to manage them

| Risk | Mitigation |
|---|---|
| Sensory overload competes with serious framing | Keep landing + brief restrained. Only the play+debrief screens get juice. |
| Scenario-specific UI (3 different desks) bloats the codebase | Build one `<ImmersiveDesk>` primitive with slot props. Each scenario passes its own evidence layout config. |
| Hidden information makes the game frustrating, not engaging | Phase R3 ships behind a `?practice=easy` flag first. Only promote to default after live testing. |
| Sound annoys users who play in public | Sound toggle already in nav. Default OFF for first session, prompt to enable after round 1. |
| Faculty-authored variants don't scale | Limit to 2 hand-written variants per scenario in v2. Real CMS comes later. |

---

## 9 — Open questions for you to decide before R1

1. **Brand direction** — are you OK pivoting the *play* screen away from "editorial paper" toward "investigator's desk" (different metaphor per scenario), or do you want one consistent visual language across all three?
2. **Difficulty floor** — should first-time players get a 2-min "practice mode" with no clock, OR jump straight into the 90s timed round? Whacka's HueQuest is "easy first, brutal later" — that's a defensible default.
3. **Scope of R5 (replay variants)** — do you want to invest in faculty-authored variants now, or keep the 8-of-12 chip rotation as the only replay vector for v2?
4. **Sound aesthetic** — analog/paper/typewriter (matches editorial framing) or arcade/playful (matches Whacka)? My recommendation: analog. It's more grown-up and reinforces "this is a real investigation."

---

## 10 — Success criteria

After R1+R2 ship, an MBA tester should be able to play one round blind and, when asked "what kind of game is this?", answer with words like:

- "It's like being thrown into a real consulting case."
- "I felt the clock."
- "The founder's reply hit different."

If the answer is still "it's a ranking quiz with timer," we haven't shipped enough.
