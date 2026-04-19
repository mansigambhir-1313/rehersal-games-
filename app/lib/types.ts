// ── Scenario (authoring) ──────────────────────────────────────
export type CulturalContext = "IN" | "GLOBAL" | "US";

export type CanonicalCause = {
  id: string;
  rankHint: number; // expert priority (1=highest)
  title: string;
  debriefLineVariants: string[];
  synonyms: string[];
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
