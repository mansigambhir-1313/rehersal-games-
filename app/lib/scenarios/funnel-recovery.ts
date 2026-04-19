import type { Scenario } from "@/lib/types";

export const funnelRecovery: Scenario = {
  id: "funnel-recovery",
  version: "2.0.0",
  briefSlug: "funnel-recovery",
  culturalContext: "GLOBAL",
  title: "The Leak You're Not Measuring",
  seniorPartnerId: "anika",
  failurePoster: {
    headline: "95 leads of 100 vanish. You have ninety seconds.",
    subtitle:
      "It's 9am Monday. Board call at 2. Anika wants the diagnosis before lunch.",
    storyParagraph:
      "Here's the situation. EdTech company, Series B, ₹4 crore on paid last quarter. 40,000 leads hit the CRM. 2,100 got on a call. 260 paid. The CMO is pleased with the paid number. The CFO is not — that's an 0.65% conversion rate on ₹4 crore. The ops lead keeps saying it's a sales problem. Sales keeps saying it's a lead quality problem. Nobody has called the 37,900 leads who never heard back. Anika has asked you — the fractional consultant she just flew in — to name the upstream cause before the 2pm board call. Ninety seconds. Pick the investigations that would actually move the number, not the ones that would look good in a deck.",
    coverImageUrl: "/covers/funnel-recovery.svg",
    categoryPill: "Reasoning",
  },
  canonicalCauses: [
    {
      id: "lead-latency",
      rankHint: 1,
      title: "Lead-to-first-contact latency > 5 minutes",
      causeKind: "root",
      teachingNote:
        "Root. Conversion drops ~90% after the five-minute mark — this is in Harvard Business Review's ur-paper on inbound response time. Every downstream cause (nurture gaps, handoff friction, CRM hygiene) only matters if a human or bot gets to the lead inside that window. Fix this and everything downstream improves; leave it broken and nothing downstream helps enough.",
      debriefLineVariants: [
        "Conversion drops ~90% after the five-minute window. Most funnels die on the first call, not the close.",
        "By minute six the lead has opened three competitor tabs. You're not losing at the close, you're losing at the clock.",
      ],
      synonyms: [
        "slow response",
        "sales responds too slow",
        "delayed callback",
        "late contact",
        "sla missed",
        "no first touch within 5 minutes",
        "speed to lead",
      ],
    },
    {
      id: "attribution-broken",
      rankHint: 2,
      title: "No working lead-source attribution",
      causeKind: "root",
      teachingNote:
        "Root. Without attribution you can't name which channel is healthy, which is bleeding, or which converted the 260 paid. You're optimising a black box. Every per-channel action downstream (pausing, doubling, retargeting) is blind until this is fixed.",
      debriefLineVariants: [
        "If you can't name the channel that brought a lead, you can't name the channel that's broken.",
        "Attribution isn't a marketing toy — it's how you find which 20% of spend is ghosting you.",
      ],
      synonyms: [
        "no utm tracking",
        "no attribution",
        "cannot tell source",
        "lead source unknown",
        "broken tracking",
        "missing channel data",
      ],
    },
    {
      id: "handoff-gap",
      rankHint: 3,
      title: "Handoff gap between marketing and sales ownership",
      causeKind: "root",
      teachingNote:
        "Root. A handoff gap is not a meeting that wasn't held — it's an ownership condition. If nobody is accountable for what happens to a lead between 'submitted form' and 'called back,' leads leak at that seam regardless of any other fix.",
      debriefLineVariants: [
        "Marketing closes Friday. Sales opens Monday. The lead opened a competitor Saturday.",
        "The handoff isn't a meeting — it's a silent dropout rate nobody owns.",
      ],
      synonyms: [
        "marketing sales handoff",
        "no ownership",
        "ownership gap",
        "nobody follows up",
        "dropped between teams",
        "marketing doesn't hand off to sales",
      ],
    },
    {
      id: "crm-duplicates",
      rankHint: 4,
      title: "CRM duplicates masking leads as 'cold'",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Dedupe hygiene is the last thing that goes wrong before a hot lead is ignored — it's what breaks on the day, not the condition that made breaking possible. The root here is usually 'nobody owns CRM data quality.'",
      debriefLineVariants: [
        "A hot lead can look cold because their twin entry from last quarter is still marked 'no response'.",
        "Duplicate hygiene is unglamorous and expensive. Skip it and you'll hunt ghosts that are, in fact, customers.",
      ],
      synonyms: [
        "crm duplicate",
        "duplicate entries",
        "dedupe",
        "duplicate leads",
        "crm hygiene",
        "stale lead records",
      ],
    },
    {
      id: "form-length",
      rankHint: 5,
      title: "Qualifying form too long — drop-off before submit",
      causeKind: "symptom",
      teachingNote:
        "Symptom, not cause. Long forms affect who *enters* the funnel, not who *drops* on the way through. If every field after field three costs 7% of submissions, that's a top-of-funnel volume problem — it doesn't explain why 37,900 leads who *did* submit never heard back. The leak you're investigating is downstream of this.",
      debriefLineVariants: [
        "Every field after field three costs you 7% of submissions. The form you're proud of is the form that's killing you.",
        "A 12-field form says more about your insecurity than about your ICP.",
      ],
      synonyms: [
        "long form",
        "form drop off",
        "too many questions",
        "form fatigue",
        "signup too long",
        "form abandonment",
      ],
    },
    {
      id: "timezone-blind",
      rankHint: 6,
      title: "Follow-ups ignore time-of-day / timezone",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Timing drives whether a specific follow-up lands — but a cadence that doesn't know the hour is a cadence nobody built properly. The root is 'cadence ownership,' not the 3AM WhatsApp itself.",
      debriefLineVariants: [
        "A 3AM-local-time WhatsApp doesn't look urgent. It looks desperate.",
        "If your follow-up cadence doesn't know what hour it is where the lead lives, it's a cadence pretending to be one.",
      ],
      synonyms: [
        "timezone",
        "wrong time",
        "3am messages",
        "time of day",
        "cadence timing",
        "off hours outreach",
      ],
    },
    {
      id: "no-nurture",
      rankHint: 7,
      title: "No nurture track for 'not-ready-now' leads",
      causeKind: "root",
      teachingNote:
        "Root. 'Not now' is not 'no' — but without an automated re-engagement track, the CRM treats both as dead. That's structural. It's why 60% of the funnel is dead on arrival even when the first contact went well.",
      debriefLineVariants: [
        "'Not now' is not 'no'. If your CRM treats them the same, you're throwing away 60% of the funnel.",
        "Every lead that says 'maybe later' dies unless a system catches them. Most systems don't.",
      ],
      synonyms: [
        "no nurture",
        "no drip campaign",
        "not ready leads ignored",
        "no follow up later",
        "no re-engagement",
        "no lifecycle marketing",
      ],
    },
    {
      id: "inbound-trained",
      rankHint: 8,
      title: "Sales team trained only for inbound hot leads",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Training is the specific capability gap; the root is usually a hiring or ops decision that never budgeted outbound skill. Treat training as the cause you'd fix, not the cause that made the situation possible.",
      debriefLineVariants: [
        "Inbound reps sound terrible on outbound. You'd need to train them, and you haven't.",
        "A sales team that can only close the easy 5% is a sales team that loses the other 95 by default.",
      ],
      synonyms: [
        "sales training",
        "only inbound",
        "not trained for outbound",
        "cant do cold calls",
        "sales team unprepared",
        "inbound only",
      ],
    },
    {
      id: "price-surprise",
      rankHint: 9,
      title: "Price revealed first in email — sticker shock",
      causeKind: "proximate",
      teachingNote:
        "Proximate. The price-first email is a specific tactical error. The root is usually 'no sales enablement' or 'no sequence ownership' — someone is sending that email because nobody wrote the right one.",
      debriefLineVariants: [
        "A number without context looks expensive. Context is what the sales call was for.",
        "Lead the email with the price and you've just done the competitor's job for them.",
      ],
      synonyms: [
        "price in email",
        "sticker shock",
        "price too high",
        "price first",
        "no context for price",
        "expensive surprise",
      ],
    },
    {
      id: "trial-delay",
      rankHint: 10,
      title: "Trial / sandbox access not granted fast enough",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Intent decays in hours. The provisioning delay is the day-of failure; the root is 'no product-led motion designed for this funnel' or 'ops SLA never set.'",
      debriefLineVariants: [
        "Intent is the most perishable asset you own. A 48-hour trial approval wastes it.",
        "If the product is good, give it to them. If it isn't, the speed of access won't save you.",
      ],
      synonyms: [
        "slow trial access",
        "no sandbox",
        "trial delay",
        "onboarding slow",
        "provisioning slow",
        "demo access",
      ],
    },
    {
      id: "lead-quality",
      rankHint: 11,
      title: "Lead-quality assumption without a quality definition",
      causeKind: "root",
      teachingNote:
        "Root, but a subtle one. 'Bad leads' is the story marketing and sales tell each other to avoid running the diagnostic. Without a written ICP you cannot distinguish a broken channel from a well-targeted one — so every downstream investigation misfires.",
      debriefLineVariants: [
        "'Bad leads' is a story marketing and sales tell each other to avoid running the diagnostic.",
        "Without a written ICP, 'lead quality' is a slur, not a metric.",
      ],
      synonyms: [
        "no icp",
        "no ideal customer profile",
        "lead quality undefined",
        "bad leads excuse",
        "quality not measured",
      ],
    },
    {
      id: "channel-mix",
      rankHint: 12,
      title: "Channel mix concentrated in one paid source",
      causeKind: "symptom",
      teachingNote:
        "Symptom of the growth-strategy conversation, not the cause of *this* leak. Concentrated spend affects blast radius if Meta raises CPM — it doesn't explain why the 37,900 leads you already paid for never got called.",
      debriefLineVariants: [
        "Putting 90% of spend in one ad platform is renting your funnel from a company that can raise rent any Tuesday.",
        "The scariest line in any growth deck is 'our CAC is fine — as long as Meta keeps performing.'",
      ],
      synonyms: [
        "single channel",
        "over reliance on one channel",
        "all spend on meta",
        "channel concentration",
        "no channel diversification",
      ],
    },
  ],
  shownPerRound: 8,
  candidateChips: [
    "slow response time",
    "no lead source tracking",
    "handoff gap",
    "crm duplicates",
    "long signup form",
    "wrong timezone outreach",
    "no nurture for not-ready",
    "sales only does inbound",
    "price shock in first email",
    "trial access too slow",
    "undefined ICP",
    "all spend on one channel",
  ],
  targetTimeSeconds: 90,
};
