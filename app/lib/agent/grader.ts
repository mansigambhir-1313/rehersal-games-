import Anthropic from "@anthropic-ai/sdk";
import { getScenario, pickDebriefVariant } from "@/lib/scenarios";
import type {
  CanonicalCause,
  GradeRequest,
  GradeResult,
  Verdict,
} from "@/lib/types";
import {
  SYSTEM_PROMPT,
  SUBMIT_GRADE_TOOL,
  GRADER_PROMPT_VERSION,
  buildUserPrompt,
} from "./prompts";
import { getPartner } from "@/lib/partners";

/**
 * Live grader — calls Claude with prompt caching on the system prompt + scenario block.
 * Falls back to stub at the API route layer if we throw here.
 */

const DEFAULT_MODEL: "claude-haiku-4-5" | "claude-sonnet-4-6" = "claude-haiku-4-5";

function getModel(): "claude-haiku-4-5" | "claude-sonnet-4-6" {
  const raw = process.env.CLAUDE_GRADER_MODEL;
  if (raw === "claude-sonnet-4-6" || raw === "claude-haiku-4-5") return raw;
  return DEFAULT_MODEL;
}

export async function liveGrade(req: GradeRequest): Promise<GradeResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const scenario = getScenario(req.scenarioId);
  if (!scenario) throw new Error(`Unknown scenario ${req.scenarioId}`);

  const shown: CanonicalCause[] = scenario.canonicalCauses.filter((c) =>
    req.shownCanonicalIds.includes(c.id)
  );

  const client = new Anthropic({ apiKey: key });
  const model = getModel();

  // Scenario static block — cached (1-hour TTL extended via cache_control on each block).
  const scenarioBlock = buildScenarioCacheBlock(scenario, shown);

  // Partner persona travels in the dynamic tail (per-round).
  // Tone (sharp/warm) is picked post-hoc by the model from its own grade,
  // not by a pre-grade heuristic — see SYSTEM_PROMPT § OVERALL MESSAGE.
  const partner = getPartner(scenario.seniorPartnerId);

  // Dynamic tail — user-specific, not cached.
  const dynamicBlock = buildUserPrompt(
    scenario,
    shown,
    req.userCauses,
    partner
  );

  const response = await client.messages.create({
    model: mapModelName(model),
    max_tokens: 2048,
    temperature: 0,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [SUBMIT_GRADE_TOOL] as unknown as Anthropic.Tool[],
    tool_choice: { type: "tool", name: "submit_grade" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: scenarioBlock,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: dynamicBlock,
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Grader did not call submit_grade tool");
  }
  const output = toolUse.input as {
    verdicts: Array<{
      canonicalCauseId: string;
      userRankIfMatched: number | null;
      matchConfidence: number;
      matchedUserCauseText: string | null;
      partnerNote?: string;
    }>;
    overallMessage: string;
  };

  // Attach debrief lines from scenario (grader shouldn't invent them; we own the copy).
  // partnerNote is the live LLM output; debriefLine is the v1 fallback the UI
  // uses when partnerNote is missing (e.g. stub responses or cached old sessions).
  const verdicts: Verdict[] = output.verdicts.map((v) => {
    const canonical = shown.find((c) => c.id === v.canonicalCauseId);
    const debriefLine = canonical
      ? pickDebriefVariant(canonical.debriefLineVariants, req.sessionId, canonical.id)
      : "";
    return {
      canonicalCauseId: v.canonicalCauseId,
      userRankIfMatched: v.userRankIfMatched,
      matchConfidence: clamp01(v.matchConfidence),
      matchedUserCauseText: v.matchedUserCauseText,
      debriefLine,
      partnerNote: typeof v.partnerNote === "string" ? v.partnerNote.slice(0, 220) : undefined,
    };
  });

  // Log cache stats (useful for debugging prompt caching hits).
  if (process.env.NODE_ENV !== "production") {
    const u = response.usage as Anthropic.Usage & {
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
    console.info("[grader]", {
      model,
      input: u.input_tokens,
      output: u.output_tokens,
      cache_read: u.cache_read_input_tokens ?? 0,
      cache_create: u.cache_creation_input_tokens ?? 0,
    });
  }

  return {
    sessionId: req.sessionId,
    verdicts,
    scores: {
      precision5: 0,
      ndcg10: 0,
      timeBonus: 0,
      pauseUsed: req.pauseUsedMs > 0,
      decisionQuality: 0,
    },
    overallMessage: output.overallMessage,
    partial: false,
    mode: "live",
    graderPromptVersion: GRADER_PROMPT_VERSION,
    model: model === "claude-sonnet-4-6" ? "sonnet-4-6" : "haiku-4-5",
  };
}

function buildScenarioCacheBlock(
  scenario: ReturnType<typeof getScenario> & object,
  shown: CanonicalCause[]
): string {
  return [
    `SCENARIO: ${scenario.title} (v${scenario.version})`,
    `Context: ${scenario.culturalContext}`,
    ``,
    `CANONICAL CAUSES FOR THIS ROUND:`,
    ...shown.map(
      (c, i) =>
        `${i + 1}. [id: ${c.id}] [kind: ${c.causeKind}] ${c.title}\n   synonyms: ${c.synonyms.join("; ")}\n   teaching note: ${c.teachingNote}`
    ),
    ``,
    `The block above is stable for this scenario. The user's ranked list and partner persona appear in the next message block.`,
  ].join("\n");
}

function mapModelName(m: "claude-haiku-4-5" | "claude-sonnet-4-6"): string {
  // Exact model IDs as published by Anthropic.
  if (m === "claude-sonnet-4-6") return "claude-sonnet-4-6";
  return "claude-haiku-4-5-20251001";
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
