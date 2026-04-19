import type { Scenario } from "@/lib/types";
import { funnelRecovery } from "./funnel-recovery";

export const scenarios: Record<string, Scenario> = {
  [funnelRecovery.id]: funnelRecovery,
};

export function getScenario(id: string): Scenario | null {
  return scenarios[id] ?? null;
}

export function listScenarios(): Scenario[] {
  return Object.values(scenarios);
}

/**
 * Select which canonical causes are shown for a given session.
 * Uses a seeded shuffle based on sessionId so the same session sees the same set,
 * but different sessions see different subsets → replayability.
 */
export function selectCanonicalForRound(scenario: Scenario, sessionId: string): string[] {
  const count = Math.min(scenario.shownPerRound, scenario.canonicalCauses.length);
  if (count === scenario.canonicalCauses.length) {
    return scenario.canonicalCauses.map((c) => c.id);
  }

  // deterministic shuffle keyed on sessionId
  const ids = scenario.canonicalCauses.map((c) => c.id);
  let seed = 0;
  for (let i = 0; i < sessionId.length; i++) seed = (seed * 31 + sessionId.charCodeAt(i)) >>> 0;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const shuffled = [...ids].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}
