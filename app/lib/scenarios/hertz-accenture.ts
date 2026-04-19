import type { Scenario } from "@/lib/types";

export const hertzAccenture: Scenario = {
  id: "hertz-accenture",
  version: "2.0.0",
  briefSlug: "capturing-user-intent",
  culturalContext: "GLOBAL",
  title: "The $32M Website That Never Went Live",
  seniorPartnerId: "karen",
  failurePoster: {
    headline: "The lawsuit is public. Karen wants your one-pager by 5.",
    subtitle:
      "Two years, $32 million, no website. Karen — your CTO — has read all the filings.",
    storyParagraph:
      "Two years of work. A 200-page statement of work. A vendor with a global brand. Weekly status reports that were always green. The website finally arrived for review and the buyer's CEO wouldn't approve a launch — too broken on mobile, too off-brand, too far from what customers had asked for. The vendor blamed shifting requirements. The buyer blamed delivery. The lawsuit, now public, blames everyone. Karen — the CTO who has inherited three post-mortems like this one — does not want vendor-blame as a diagnosis. She wants to know what the *buyer* did, or failed to do, that made this possible. Ninety seconds. The board call is at 5.",
    coverImageUrl: "/covers/hertz-accenture.svg",
    categoryPill: "Reasoning",
  },
  canonicalCauses: [
    {
      id: "no-customer-prototyping",
      rankHint: 1,
      title: "No customer-facing prototyping in the first six months",
      causeKind: "root",
      teachingNote:
        "Root. Without a real customer click in the first six months, every downstream decision (scope, design, architecture) is a hypothesis with no test. This is the cause that, if reversed, would have surfaced everything else (mobile-broken, auth-assumed, off-brand) early enough to fix cheaply.",
      debriefLineVariants: [
        "If you don't put something in front of a real user before month six of a two-year project, you're building a contract, not a product.",
        "Six months without a real customer click is six months of a hypothesis that's gaining weight without gaining truth.",
      ],
      synonyms: [
        "no prototype",
        "no user testing early",
        "no customer feedback",
        "no early prototype",
        "no real users early",
        "skipped prototyping",
      ],
    },
    {
      id: "no-buyer-product-owner",
      rankHint: 2,
      title: "No clear product owner on the buyer side with veto authority",
      causeKind: "root",
      teachingNote:
        "Root. With no single buyer-side owner who can say no, the vendor optimises for the easiest spec to deliver, not the hardest spec to land. Every other failure on this list (scope creep, vendor-priced features, brand-as-design-system) is downstream of nobody having authority to stop it.",
      debriefLineVariants: [
        "When nobody on the buyer side can say no, the vendor builds the easiest spec to deliver, not the hardest spec to land.",
        "A project without a buyer-side product owner is a project where every stakeholder gets 5%. The CEO gets the 100% on launch day.",
      ],
      synonyms: [
        "no product owner",
        "no decision maker",
        "no veto authority",
        "buyer side ownership unclear",
        "no single throat to choke",
        "weak product ownership",
      ],
    },
    {
      id: "vendor-priced-features",
      rankHint: 3,
      title: "Vendor-priced features the buyer never validated",
      causeKind: "root",
      teachingNote:
        "Root. Pricing the SOW before validating the features tilts the entire two-year build toward what the contract pays for, not what the customer needs. This is the Hertz-side decision that made the rest of the failure rational from the vendor's perspective.",
      debriefLineVariants: [
        "If the vendor priced the SOW, the vendor will optimize for what the SOW pays for — not what the customer needs.",
        "The most expensive line items in the contract were the ones nobody had ever wireframed.",
      ],
      synonyms: [
        "vendor scoped features",
        "buyer didn't validate scope",
        "scope vendor-driven",
        "features priced not validated",
        "scope based on contract",
      ],
    },
    {
      id: "uat-after-launch",
      rankHint: 4,
      title: "UAT scheduled after the launch milestone, not before",
      causeKind: "proximate",
      teachingNote:
        "Proximate. UAT-after-launch is a specific scheduling failure that turns deal-breakers into deployed bugs. The root one level up is 'no test-before-decide discipline' — usually because nobody on the buyer side had product-build instincts.",
      debriefLineVariants: [
        "If you find the deal-breakers in UAT and UAT happens after launch, the deal-breakers are now deployed.",
        "UAT after launch is a polite name for crisis management.",
      ],
      synonyms: [
        "uat too late",
        "user acceptance testing late",
        "no testing before launch",
        "qa at the end",
        "testing after",
      ],
    },
    {
      id: "mobile-not-mobile-first",
      rankHint: 5,
      title: "\"Mobile-first\" was a slide, not an architecture",
      causeKind: "symptom",
      teachingNote:
        "Symptom of the no-customer-prototyping root. If real users had touched a mobile prototype in month four, mobile-broken would have been a fixable design call by month six instead of a launch-blocker at month 22.",
      debriefLineVariants: [
        "Calling something mobile-first in the kickoff deck doesn't mean the build sprint started with a 375px viewport.",
        "Most \"mobile-first\" projects are desktop-first projects with a stylesheet. Hertz's was the stylesheet, late, with bugs.",
      ],
      synonyms: [
        "not actually mobile first",
        "mobile broken",
        "desktop first build",
        "responsive afterthought",
        "mobile experience bad",
      ],
    },
    {
      id: "feature-creep",
      rankHint: 6,
      title: "Feature creep mid-build with no scope discipline",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Scope creep is a real failure but downstream of 'no buyer-side product owner.' The owner is the function that says no — without one, every 'can we just add' becomes a six-week slip.",
      debriefLineVariants: [
        "Every \"can we just add X\" without a deletion of Y becomes a 6-week slip and a 6-month resentment.",
        "Scope creep isn't free even when the vendor agrees. It's billed in delivery dates and trust.",
      ],
      synonyms: [
        "scope creep",
        "feature creep",
        "added features mid build",
        "no scope control",
        "kept adding requirements",
      ],
    },
    {
      id: "stakeholder-demos-not-customers",
      rankHint: 7,
      title: "Internal stakeholder demos replaced customer feedback",
      causeKind: "proximate",
      teachingNote:
        "Proximate. The wrong feedback loop produces the wrong product. The root is the same one prototyping fixes — there was no customer-facing testing to compete with the SVP's nodding.",
      debriefLineVariants: [
        "Stakeholder demos optimize for next quarter's review. Customer demos optimize for next year's revenue. They're not interchangeable.",
        "If your only feedback loop is the SVP nodding in a meeting, you'll launch a website that looks great in a pitch deck and bad on a phone.",
      ],
      synonyms: [
        "demos to stakeholders",
        "no real customer feedback",
        "internal reviews only",
        "executive demos",
        "stakeholder approval not customer",
      ],
    },
    {
      id: "auth-payment-assumed",
      rankHint: 8,
      title: "Authentication and payments assumed, not specified",
      causeKind: "symptom",
      teachingNote:
        "Symptom. Auth and payments break the launch in every project where prototyping was skipped — the SOW assumed they were 'standard,' nobody implemented them in month four, and they exploded in month 22.",
      debriefLineVariants: [
        "The two systems most likely to break a launch are also the two systems most likely to be \"figured out later.\" Hertz figured it out at month 22.",
        "Login + checkout never make the launch deck. They always make the rollback decision.",
      ],
      synonyms: [
        "auth not specified",
        "payment integration unclear",
        "login broken",
        "checkout broken",
        "auth payment assumed",
      ],
    },
    {
      id: "brand-as-design-system",
      rankHint: 9,
      title: "Brand guidelines treated as a design system",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Confusing a brand PDF with a design system costs months of inconsistency. The root is 'design ownership unstaffed on buyer side' — the brand team had a logo, not a system.",
      debriefLineVariants: [
        "A brand guideline tells you what hex code to use. A design system tells you when to use it. Confusing the two costs months.",
        "If your design system is a PDF, the website you ship is a coin flip on consistency.",
      ],
      synonyms: [
        "brand guidelines as design system",
        "no design system",
        "branding not enough",
        "design inconsistent",
        "brand guide pdf",
      ],
    },
    {
      id: "security-late",
      rankHint: 10,
      title: "Security and compliance review pushed to the end",
      causeKind: "proximate",
      teachingNote:
        "Proximate. Security-at-the-end is a re-architecture in a review's clothing. The root is 'security has no gating power in the SOW.' Without gating power, it can't be reviewed earlier — only later, more expensively.",
      debriefLineVariants: [
        "Security review at month 22 isn't a review — it's a re-architecture project disguised as a review.",
        "Every weekend of \"green status\" looks great until the InfoSec ticket arrives in month 23.",
      ],
      synonyms: [
        "security late",
        "compliance review at end",
        "infosec late",
        "security pushed to end",
        "compliance afterthought",
      ],
    },
    {
      id: "buyer-pms-not-engineering",
      rankHint: 11,
      title: "Buyer team had project managers, not product engineers",
      causeKind: "root",
      teachingNote:
        "Root. When the buyer side has only PMs, they manage a project; the vendor builds a project. With engineers on the buyer side, the conversation is about what the system should *do*, not when it should *ship*. Outsourcing build is fine; outsourcing product judgment is what got sued.",
      debriefLineVariants: [
        "When the buyer side has only PMs, the vendor builds a project. When the buyer side has engineers, the vendor builds a product.",
        "Outsourcing build is fine. Outsourcing product judgment is what got sued.",
      ],
      synonyms: [
        "no engineers on buyer side",
        "only project managers",
        "no product engineers buyer",
        "buyer team weak",
        "buyer no technical capability",
      ],
    },
    {
      id: "sow-instead-of-discovery",
      rankHint: 12,
      title: "200-page SOW replaced 6 weeks of customer discovery",
      causeKind: "root",
      teachingNote:
        "Root. The SOW is a long document that exists because the conversations were too short. Customer discovery would have produced a 12-page brief and a working prototype. The 200-page SOW is the artifact of replacing one with the other.",
      debriefLineVariants: [
        "Specifications are a poor substitute for the conversations you didn't have with the people who'd use the thing.",
        "A 200-page SOW is what you write when you're afraid you'll have to negotiate later. Which means you'll have to negotiate later.",
      ],
      synonyms: [
        "no discovery",
        "skipped discovery",
        "wrote sow instead of discovery",
        "documentation instead of research",
        "no customer research",
      ],
    },
  ],
  shownPerRound: 8,
  candidateChips: [
    "no early prototyping",
    "no buyer product owner",
    "vendor-priced features",
    "UAT scheduled after launch",
    "mobile not actually mobile-first",
    "scope creep no discipline",
    "stakeholder demos replaced users",
    "auth/payment assumed",
    "brand treated as design system",
    "security review pushed late",
    "buyer team only PMs",
    "skipped customer discovery",
  ],
  targetTimeSeconds: 90,
};
