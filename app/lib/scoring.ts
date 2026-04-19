import type { Scores, UserCause, Verdict } from "@/lib/types";

function dcg(gains: number[]): number {
  return gains.reduce((sum, g, i) => sum + g / Math.log2(i + 2), 0);
}

/**
 * Compute per-session scores from verdicts + timing.
 * Pure function — deterministic given the same inputs.
 */
export function computeScores(
  userCauses: UserCause[],
  verdicts: Verdict[],
  timeUsedMs: number,
  pauseUsed: boolean,
  targetTimeMs = 90_000
): Scores {
  // NDCG@10: reward matches more when placed at higher ranks.
  const gains = userCauses.map((uc) => {
    const v = verdicts.find((v) => v.userRankIfMatched === uc.rank);
    return v?.matchConfidence ?? 0;
  });

  const idealGains = [...verdicts]
    .map((v) => v.matchConfidence)
    .sort((a, b) => b - a)
    .slice(0, Math.max(1, userCauses.length));

  const idealDcg = dcg(idealGains);
  const ndcg10 = idealDcg > 0 ? dcg(gains) / idealDcg : 0;

  // Precision@5: did the top 5 picks include matched causes?
  const top5Matched = verdicts.filter(
    (v) => v.userRankIfMatched !== null && v.userRankIfMatched <= 5
  ).length;
  const precision5 = top5Matched / 5;

  // Time bonus: reward speed, halved if pause was used.
  const timeBonusRaw = Math.max(0, 1 - timeUsedMs / targetTimeMs);
  const timeBonus = pauseUsed ? timeBonusRaw * 0.75 : timeBonusRaw;

  const decisionQuality = Math.max(
    0,
    Math.min(100, Math.round(precision5 * 40 + ndcg10 * 40 + timeBonus * 20))
  );

  return {
    precision5,
    ndcg10,
    timeBonus,
    pauseUsed,
    decisionQuality,
  };
}
