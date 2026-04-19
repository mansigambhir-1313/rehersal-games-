import { NextResponse } from "next/server";
import { z } from "zod";
import { getScenario } from "@/lib/scenarios";
import { stubGrade } from "@/lib/stubGrader";
import { liveGrade } from "@/lib/agent/grader";
import type { GradeRequest, GradeResult } from "@/lib/types";

export const runtime = "nodejs";

const gradeRequestSchema = z.object({
  scenarioId: z.string().min(1),
  scenarioVersion: z.string().min(1),
  shownCanonicalIds: z.array(z.string().min(1)).min(1).max(12),
  userCauses: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(10),
        text: z.string().min(1).max(200),
      })
    )
    .max(10),
  timeUsedMs: z.number().int().min(0).max(120_000),
  pauseUsedMs: z.number().int().min(0).max(120_000),
  sessionId: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  let parsed: GradeRequest;
  try {
    const json = await request.json();
    parsed = gradeRequestSchema.parse(json) as GradeRequest;
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request", detail: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }

  const scenario = getScenario(parsed.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario" }, { status: 404 });
  }

  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  let result: GradeResult;
  let partial = false;

  if (hasKey) {
    try {
      result = await liveGrade(parsed);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[grader] live grader failed, falling back to stub:", e);
      }
      result = stubGrade(parsed);
      partial = true;
    }
  } else {
    result = stubGrade(parsed);
  }

  result.partial = partial;

  return NextResponse.json(result, { status: 200 });
}
