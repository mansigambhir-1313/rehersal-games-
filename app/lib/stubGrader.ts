import { getScenario } from "@/lib/scenarios";
import type {
  GradeRequest,
  GradeResult,
  Verdict,
} from "@/lib/types";

/**
 * Stub grader — string-similarity only, no LLM.
 * Deterministic: same inputs always produce the same output.
 * Used when ANTHROPIC_API_KEY is absent or live grader fails.
 */

const STUB_PROMPT_VERSION = "stub@1.0.0";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): Set<string> {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "not",
    "no",
    "this",
    "that",
    "it",
    "its",
    "as",
    "too",
    "too",
    "very",
  ]);
  return new Set(
    normalize(s)
      .split(" ")
      .filter((t) => t.length > 2 && !stop.has(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Score a user cause against a canonical cause using:
 *   max( jaccard(user, canonical.title), max(jaccard(user, synonym) for synonym in synonyms) )
 */
function pairScore(userText: string, canonicalTitle: string, synonyms: string[]): number {
  const u = tokenize(userText);
  const canonicalTokens = [canonicalTitle, ...synonyms].map(tokenize);
  let best = 0;
  for (const ct of canonicalTokens) {
    const s = jaccard(u, ct);
    if (s > best) best = s;
  }
  // boost slightly so reasonable phrase overlaps reach the 0.7 threshold
  return Math.min(1, best * 1.6);
}

export function stubGrade(req: GradeRequest): GradeResult {
  const scenario = getScenario(req.scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario ${req.scenarioId}`);
  }

  const shown = new Set(req.shownCanonicalIds);
  const shownCauses = scenario.canonicalCauses.filter((c) => shown.has(c.id));

  // Greedy highest-confidence-first assignment so one user cause only matches one canonical.
  type Candidate = {
    canonicalId: string;
    userRank: number;
    userText: string;
    confidence: number;
  };
  const candidates: Candidate[] = [];
  for (const canonical of shownCauses) {
    for (const uc of req.userCauses) {
      const confidence = pairScore(uc.text, canonical.title, canonical.synonyms);
      if (confidence > 0.35) {
        candidates.push({
          canonicalId: canonical.id,
          userRank: uc.rank,
          userText: uc.text,
          confidence,
        });
      }
    }
  }
  candidates.sort((a, b) => b.confidence - a.confidence);

  const usedCanonical = new Set<string>();
  const usedUserRank = new Set<number>();
  const chosen = new Map<string, Candidate>();
  for (const c of candidates) {
    if (usedCanonical.has(c.canonicalId)) continue;
    if (usedUserRank.has(c.userRank)) continue;
    usedCanonical.add(c.canonicalId);
    usedUserRank.add(c.userRank);
    chosen.set(c.canonicalId, c);
  }

  const verdicts: Verdict[] = shownCauses.map((canonical) => {
    const match = chosen.get(canonical.id);
    const debriefLine =
      canonical.debriefLineVariants[0] ?? canonical.title;
    if (!match) {
      return {
        canonicalCauseId: canonical.id,
        userRankIfMatched: null,
        matchConfidence: 0,
        matchedUserCauseText: null,
        debriefLine,
      };
    }
    // threshold: confidence >= 0.7 counts as a full match
    const confirmed = match.confidence >= 0.7;
    return {
      canonicalCauseId: canonical.id,
      userRankIfMatched: confirmed ? match.userRank : null,
      matchConfidence: match.confidence,
      matchedUserCauseText: confirmed ? match.userText : null,
      debriefLine,
    };
  });

  const matchedCount = verdicts.filter((v) => v.userRankIfMatched !== null).length;
  const overallMessage = buildStubMessage(matchedCount, shownCauses.length);

  return {
    sessionId: req.sessionId,
    verdicts,
    scores: {
      // Actual scores computed in computeScores() on top of these verdicts.
      precision5: 0,
      ndcg10: 0,
      timeBonus: 0,
      pauseUsed: req.pauseUsedMs > 0,
      decisionQuality: 0,
    },
    overallMessage,
    partial: false,
    mode: "stub",
    graderPromptVersion: STUB_PROMPT_VERSION,
    model: "stub",
  };
}

function buildStubMessage(matched: number, total: number): string {
  const pct = Math.round((matched / total) * 100);
  if (pct >= 80)
    return "You caught most of the story. The misses are where the real money hides.";
  if (pct >= 50)
    return "Half the diagnosis is done. The other half is the half everyone misses.";
  if (pct >= 20)
    return "You saw the surface. The causes you missed are the ones that actually bleed.";
  return "An empty diagnosis is a brave answer. The briefs are faster than this gym.";
}
