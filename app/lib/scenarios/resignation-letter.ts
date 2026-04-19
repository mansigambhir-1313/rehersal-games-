import type { Scenario } from "@/lib/types";

export const resignationLetter: Scenario = {
  id: "resignation-letter",
  version: "2.0.0",
  briefSlug: "diagnosing-employee-exits",
  culturalContext: "GLOBAL",
  title: "The Resignation Letter is the Last Symptom",
  seniorPartnerId: "ravi",
  failurePoster: {
    headline: "She quit on a Tuesday. HR asks why by Friday.",
    subtitle:
      "Ravi's seen a thousand of these. He wants the real cause before the counter-offer goes out.",
    storyParagraph:
      "Your best engineer joined four years ago, ran two of the biggest launches in company history, and was the person interviews used as a culture reference. Her resignation email landed this morning. Three lines. No detail. The exit interview on Friday will list \"better opportunity\" because exit interviews always do. HR is preparing a counter-offer. The CTO is drafting a town-hall on salary bands. Both are likely solving for the wrong cause. Ravi — your People Ops partner, fifteen years at Infosys and Razorpay — has asked you to diagnose what actually drove her out. Ninety seconds. Rank the causes that would matter if you were the one sitting across from her on Friday.",
    coverImageUrl: "/covers/resignation-letter.svg",
    categoryPill: "Reasoning",
  },
  canonicalCauses: [
    {
      id: "manager-relationship",
      rankHint: 1,
      title: "Manager-employee relationship deteriorated over months",
      causeKind: "root",
      teachingNote:
        "Root. People don't quit companies — they quit the person they report to. In most exit data this is the strongest single-variable predictor, and it's almost always the cause HR sees last because employees rarely name it. When it's present, it silently invalidates every other retention lever (comp, promotion, perks).",
      debriefLineVariants: [
        "People don't quit companies — they quit the person they report to. Almost always the strongest signal, almost always the last one HR sees.",
        "By the time she sent the email, the 1:1s had been transactional for a quarter. The resignation was the second symptom, not the first.",
      ],
      synonyms: [
        "bad manager",
        "manager problem",
        "1:1 quality dropped",
        "lost trust in manager",
        "reporting relationship broken",
        "her manager was the problem",
      ],
    },
    {
      id: "growth-clarity",
      rankHint: 2,
      title: "No clarity on growth or promotion path for 12+ months",
      causeKind: "root",
      teachingNote:
        "Root. Ambiguity about career trajectory is a structural retention failure, not a tactical miss. Senior ICs can wait through a delayed cycle — they cannot wait through 'we'll revisit next quarter' said for four quarters. That pattern is itself the answer.",
      debriefLineVariants: [
        "High performers can wait through ambiguity, but not forever. Twelve months of \"let's revisit next cycle\" is itself an answer.",
        "She didn't need a promotion this year. She needed to know whether next year was real. Nobody told her.",
      ],
      synonyms: [
        "no growth path",
        "no promotion clarity",
        "career stagnation",
        "no career conversation",
        "promotion delayed",
        "no path forward",
      ],
    },
    {
      id: "project-mismatch",
      rankHint: 3,
      title: "Project allocation mismatched her stated career goals",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Allocation is louder than any 1:1 — but it's the visible result of a root cause one level up (usually: the manager isn't advocating, or leadership has decided her value is in her current lane). The allocation is what she saw; the positioning decision is what actually happened.",
      debriefLineVariants: [
        "She told her manager she wanted to lead platform work. She got two more launches. She got the message.",
        "Allocation is a louder career conversation than any 1:1. Hers said: stay in your lane.",
      ],
      synonyms: [
        "wrong projects",
        "project assignment",
        "stuck on same work",
        "not given the work she wanted",
        "no stretch projects",
        "allocation mismatch",
      ],
    },
    {
      id: "comp-lag",
      rankHint: 4,
      title: "Compensation lagged market — but wasn't the headline reason",
      causeKind: "symptom",
      teachingNote:
        "Symptom, almost always. Comp is the acceptable reason people give in exit interviews because it's socially cheap to name. Matching the offer retains her for three months; the reason she was looking is still in the room. Treating comp as the root cause is how organisations lose the same person twice.",
      debriefLineVariants: [
        "Comp is rarely the cause; it's almost always the trigger that converts a slow-burning frustration into a calendar invite.",
        "Match the offer and you'll keep her three months. The reason she was looking is still in the room.",
      ],
      synonyms: [
        "low salary",
        "underpaid",
        "comp gap",
        "below market pay",
        "salary lag",
        "compensation issue",
      ],
    },
    {
      id: "cultural-drift",
      rankHint: 5,
      title: "Cultural drift after the recent re-org",
      causeKind: "root",
      teachingNote:
        "Root when present. Re-orgs don't just move boxes — they change which behaviours get rewarded. People who fit the old culture quietly leave, and no single 1:1 will surface it because the change feels atmospheric, not personal. This invalidates tactical retention fixes.",
      debriefLineVariants: [
        "Re-orgs don't just move boxes — they move which behaviors get rewarded. Sometimes the people who fit the old culture quietly leave.",
        "She joined a startup. The re-org turned it into something that had a Slack channel for travel approvals. She left for a startup.",
      ],
      synonyms: [
        "culture changed",
        "post reorg culture",
        "lost the culture",
        "company felt different",
        "cultural shift",
        "culture drift",
      ],
    },
    {
      id: "burnout",
      rankHint: 6,
      title: "Sustained high workload with no real recovery period",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Burnout is the capacity breakpoint — but the root is whatever decision made recovery never land (unchecked scope, low headcount, festival-launch cadence). Fixing 'burnout' without fixing the scheduling logic upstream just resets the clock.",
      debriefLineVariants: [
        "She didn't burn out the week she resigned. She burned out three quarters ago. The week she resigned she just admitted it.",
        "You can't out-perks burnout. The pizza Friday after the launch isn't recovery — it's a thank-you note.",
      ],
      synonyms: [
        "burnout",
        "overworked",
        "no rest",
        "exhausted",
        "long hours",
        "no recovery",
      ],
    },
    {
      id: "peer-departure",
      rankHint: 7,
      title: "Trusted peers had already left",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Network effects surface once trust-anchors leave — it's the specific trigger for her looking, but the root is usually the cause that made those peers leave first (same manager, same growth gap, same re-org).",
      debriefLineVariants: [
        "Top performers have a network. When two members of it leave, the third starts taking calls.",
        "You don't lose her because someone left. You lose her because the someone who left vouches for the new place.",
      ],
      synonyms: [
        "peer left",
        "friends quit",
        "team departures",
        "network leaving",
        "follow former colleague",
        "her people left",
      ],
    },
    {
      id: "recognition-gap",
      rankHint: 8,
      title: "Outsized contributions, undersized public credit",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Recognition gaps are specific and observable (all-hands credit, Slack shout-outs, launch post bylines). The root is usually a manager habit or a cultural default — but the gap itself is the thing she would name if pushed.",
      debriefLineVariants: [
        "She shipped two of the biggest launches and the all-hands credit went to the manager presenting the slide. She noticed every time.",
        "Recognition isn't optional for senior people; it's how they prove their next negotiation.",
      ],
      synonyms: [
        "no recognition",
        "credit went elsewhere",
        "underappreciated",
        "no public credit",
        "not recognized",
        "manager took credit",
      ],
    },
    {
      id: "real-step-up",
      rankHint: 9,
      title: "The new offer was a meaningful step up — title or scope",
      causeKind: "proximate",
      teachingNote:
        "Proximate. A real step-up is the trigger that makes her act — but something inside the current company had to already have failed for the trigger to land. A happy senior doesn't take the call, no matter how good the outside offer.",
      debriefLineVariants: [
        "Sometimes the real cause is that someone outside finally offered her the job her current manager kept describing.",
        "Better-shaped jobs win against better-paid jobs. The new role had her name on the org chart.",
      ],
      synonyms: [
        "better title",
        "better scope",
        "real promotion elsewhere",
        "step up role",
        "bigger role outside",
      ],
    },
    {
      id: "personal-circumstances",
      rankHint: 10,
      title: "Personal circumstances changed — family, health, location",
      causeKind: "root",
      teachingNote:
        "Root — and non-diagnosable by you. When the cause is personal, no retention lever reaches it. Naming it correctly matters mostly because it stops you from running a witch-hunt on the manager when the manager wasn't the issue.",
      debriefLineVariants: [
        "Sometimes the company isn't the protagonist. Don't take it personally; do take it as a data point.",
        "If the cause is personal, no comp adjustment fixes it — but a flexible policy might have made it never come up.",
      ],
      synonyms: [
        "family reasons",
        "health",
        "moving",
        "personal life",
        "relocation",
        "personal circumstances",
      ],
    },
    {
      id: "psychological-safety",
      rankHint: 11,
      title: "Loss of psychological safety after a specific incident",
      causeKind: "root",
      teachingNote:
        "Root. A single incident (a public torching, a retaliation, a broken confidence) flips the binary. She stops speaking up six months before she leaves. Nothing downstream reverses this — the decision has already been made, she's just waiting for the offer.",
      debriefLineVariants: [
        "Sometimes there's a specific Tuesday where she watched a peer get publicly torched in a review meeting. She quietly updated her resume that night.",
        "Psychological safety isn't a vibe — it's the binary signal that determines whether senior people speak up. She stopped speaking up six months ago.",
      ],
      synonyms: [
        "psychological safety",
        "afraid to speak up",
        "watched someone get fired",
        "specific incident",
        "lost trust in leadership",
      ],
    },
    {
      id: "boredom",
      rankHint: 12,
      title: "Boredom — same class of problem for too long",
      causeKind: "symptom",
      teachingNote:
        "Symptom, usually of the allocation/growth problem one level up. When a senior says 'I'm bored,' they mean 'nobody is giving me the next problem.' Fix the allocation, the boredom dissolves; fix the boredom directly (with, say, a sabbatical), and she leaves anyway.",
      debriefLineVariants: [
        "She didn't outgrow the company. She outgrew the problem you kept asking her to solve.",
        "Senior people leave for the cognitive variety, not the comp curve. New challenge > new bonus.",
      ],
      synonyms: [
        "bored",
        "same problems",
        "no new challenge",
        "stagnant work",
        "outgrew the role",
        "needs new challenge",
      ],
    },
  ],
  shownPerRound: 8,
  candidateChips: [
    "manager-relationship breakdown",
    "no growth path",
    "wrong project allocation",
    "comp lagging market",
    "post-reorg culture drift",
    "burnout no recovery",
    "trusted peers left",
    "no public recognition",
    "outside offer better scope",
    "personal circumstances",
    "psychological safety lost",
    "bored of the same problem",
  ],
  targetTimeSeconds: 90,
};
