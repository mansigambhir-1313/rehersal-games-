// ── Scenario (authoring) ──────────────────────────────────────
export type CulturalContext = "IN" | "GLOBAL" | "US";

// Where this item sits in the causal chain. Root = the upstream condition
// whose removal would have prevented everything downstream. Proximate = the
// last thing that broke. Symptom = a visible effect, not a cause.
export type CauseKind = "symptom" | "proximate" | "root";

export type CanonicalCause = {
  id: string;
  rankHint: number; // expert priority (1=highest)
  title: string;
  debriefLineVariants: string[];
  synonyms: string[];
  // R0: cognitive-realism fields
  causeKind: CauseKind;
  teachingNote: string; // why it's that kind — one short paragraph
};

// Named senior partner who grades a scenario. Voice travels into the system
// prompt; sharp/warm bands swap based on the player's DQ.
export type SeniorPartnerId = "anika" | "ravi" | "karen";

export type SeniorPartner = {
  id: SeniorPartnerId;
  name: string;
  role: string;
  voice: string;
  sharpFeedback: string;
  warmFeedback: string;
};

export type Scenario = {
  id: string;
  version: string; // semver, bumps on any edit
  briefSlug: string;
  culturalContext: CulturalContext;
  title: string;
  failurePoster: {
    headline: string;
    storyParagraph: string;
    coverImageUrl: string;
    categoryPill: string; // "Reasoning"
    subtitle: string;
  };
  canonicalCauses: CanonicalCause[]; // up to 12
  shownPerRound: number; // default 8
  candidateChips: string[]; // 12
  targetTimeSeconds: number; // 90
  seniorPartnerId: SeniorPartnerId; // R0
};

// ── Session (runtime) ─────────────────────────────────────────
export type UserCause = {
  rank: number; // 1-indexed
  text: string;
};

export type Session = {
  id: string;
  scenarioId: string;
  scenarioVersion: string;
  graderPromptVersion: string;
  model: "haiku-4-5" | "sonnet-4-6" | "stub";
  startedAt: string; // ISO
  completedAt?: string;
  userCauses: UserCause[];
  timeUsedMs: number;
  pauseUsedMs: number;
  gradeResult?: GradeResult;
  mode: "live" | "stub" | "demo";
  culturalContext: CulturalContext;
};

// ── Grading ──────────────────────────────────────────────────
export type GradeRequest = {
  scenarioId: string;
  scenarioVersion: string;
  shownCanonicalIds: string[]; // which 8 of 12 were displayed this round
  userCauses: UserCause[];
  timeUsedMs: number;
  pauseUsedMs: number;
  sessionId: string;
};

export type Verdict = {
  canonicalCauseId: string;
  userRankIfMatched: number | null; // null = missed
  matchConfidence: number; // 0.0–1.0
  matchedUserCauseText: string | null;
  debriefLine: string;
  // R0.5: one-sentence partner-voiced note per cause. Present on live-graded
  // verdicts; absent on stub responses and pre-R0.5 sessions — UI falls back
  // to debriefLine when this is missing.
  partnerNote?: string;
};

export type Scores = {
  precision5: number; // 0–1
  ndcg10: number; // 0–1
  timeBonus: number; // 0–1
  pauseUsed: boolean;
  decisionQuality: number; // 0–100 integer
};

export type GradeResult = {
  sessionId: string;
  verdicts: Verdict[];
  scores: Scores;
  overallMessage: string;
  partial: boolean;
  mode: "live" | "stub" | "demo";
  graderPromptVersion: string;
  model: Session["model"];
};
