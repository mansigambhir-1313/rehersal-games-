/**
 * Integration seams with Rehearsal.
 * v1 implementations are stubs so the game runs standalone.
 * When Rehearsal integrates, swap these implementations in one PR.
 */
import type { Session } from "@/lib/types";

export async function onSessionComplete(session: Session): Promise<void> {
  // v1: storage only (handled by saveSession in client). v2: POST to Rehearsal.
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.info("[IG] session complete", session.id);
  }
}

export async function getUserMemory(): Promise<string[]> {
  // v1: empty. v2: GET Rehearsal /memories filtered for game-relevant.
  return [];
}

export function linkToBrief(briefSlug: string): string {
  // v1: placeholder. v2: deep link to app.tryrehearsal.ai.
  return `#brief-${briefSlug}`;
}

export type DecisionEvent =
  | { kind: "game_started"; scenarioId: string }
  | { kind: "decision_made"; rank: number }
  | { kind: "game_completed"; decisionQuality: number }
  | { kind: "game_abandoned" }
  | { kind: "share_clicked"; destination: "copy" | "whatsapp" | "linkedin" };

export function reportDecisionEvent(event: DecisionEvent): void {
  // v1: log. v2: POST to Rehearsal analytics.
  if (process.env.NODE_ENV !== "production") {
    console.info("[IG event]", event);
  }
}
