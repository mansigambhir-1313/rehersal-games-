"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefIntro } from "@/components/BriefIntro";
import { CauseListEditor, type EditorItem } from "@/components/CauseListEditor";
import { CauseChipPool } from "@/components/CauseChipPool";
import { TimerBar } from "@/components/TimerBar";
import { GradingOverlay } from "@/components/GradingOverlay";
import { saveSession } from "@/lib/storage";
import { selectCanonicalForRound } from "@/lib/scenarios";
import { computeScores } from "@/lib/scoring";
import { reportDecisionEvent } from "@/lib/integration/rehearsal";
import { useSound } from "@/components/SoundProvider";
import { getPartner } from "@/lib/partners";
import type { GradeRequest, GradeResult, Scenario, Session } from "@/lib/types";
import { ArrowRight, Pause, Play } from "lucide-react";

type Phase = "intro" | "editing" | "paused" | "grading" | "error";

export function PlayScreen({
  scenario,
  demoMode,
}: {
  scenario: Scenario;
  demoMode: boolean;
}) {
  const router = useRouter();
  const sound = useSound();
  const [phase, setPhase] = useState<Phase>("intro");
  const [items, setItems] = useState<EditorItem[]>([blankItem()]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [pauseUsedMs, setPauseUsedMs] = useState(0);
  const [pauseUsed, setPauseUsed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [sessionId] = useState(() => generateSessionId());
  const shownCanonicalIds = useMemo(
    () => selectCanonicalForRound(scenario, sessionId),
    [scenario, sessionId]
  );

  const startClock = useCallback(() => {
    setStartedAt(Date.now());
    setPhase("editing");
    reportDecisionEvent({ kind: "game_started", scenarioId: scenario.id });
  }, [scenario.id]);

  const addChip = useCallback((text: string) => {
    setItems((cur) => {
      if (cur.length >= 10) return cur;
      const firstBlank = cur.findIndex((i) => !i.text.trim());
      if (firstBlank >= 0) {
        const copy = [...cur];
        copy[firstBlank] = { ...copy[firstBlank], text };
        return copy;
      }
      return [...cur, { id: crypto.randomUUID(), text }];
    });
  }, []);

  const togglePause = useCallback(() => {
    if (phase === "editing") {
      if (pauseUsed) return;
      setPauseStartedAt(Date.now());
      setPauseUsed(true);
      setPhase("paused");
    } else if (phase === "paused" && pauseStartedAt !== null) {
      setPauseUsedMs((cur) => cur + (Date.now() - pauseStartedAt));
      setPauseStartedAt(null);
      setPhase("editing");
    }
  }, [phase, pauseStartedAt, pauseUsed]);

  const handleSubmit = useCallback(async () => {
    if ((phase !== "editing" && phase !== "paused") || startedAt === null) return;
    // If we're still paused when submit fires, finalize the pause credit.
    let totalPauseMs = pauseUsedMs;
    if (phase === "paused" && pauseStartedAt !== null) {
      totalPauseMs += Date.now() - pauseStartedAt;
    }
    const rawElapsed = Date.now() - startedAt;
    const timeUsedMs = Math.min(
      scenario.targetTimeSeconds * 1000,
      Math.max(0, rawElapsed - totalPauseMs)
    );
    const userCauses = items
      .map((it, idx) => ({ rank: idx + 1, text: it.text.trim() }))
      .filter((c) => c.text.length > 0)
      .slice(0, 10);

    setPhase("grading");
    sound.playSubmit();

    const body: GradeRequest = {
      scenarioId: scenario.id,
      scenarioVersion: scenario.version,
      shownCanonicalIds,
      userCauses,
      timeUsedMs,
      pauseUsedMs: totalPauseMs,
      sessionId,
    };

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`Grader returned ${res.status}`);
      }
      const result = (await res.json()) as GradeResult;

      const scores = computeScores(
        userCauses,
        result.verdicts,
        timeUsedMs,
        pauseUsed,
        scenario.targetTimeSeconds * 1000
      );
      const finalResult: GradeResult = { ...result, scores };

      const session: Session = {
        id: sessionId,
        scenarioId: scenario.id,
        scenarioVersion: scenario.version,
        graderPromptVersion: result.graderPromptVersion,
        model: result.model,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        userCauses,
        timeUsedMs,
        pauseUsedMs: totalPauseMs,
        gradeResult: finalResult,
        mode: demoMode ? "demo" : result.mode,
        culturalContext: scenario.culturalContext,
      };
      saveSession(session);
      reportDecisionEvent({
        kind: "game_completed",
        decisionQuality: scores.decisionQuality,
      });

      router.push(`/debrief?session=${sessionId}${demoMode ? "&demo=1" : ""}`);
    } catch (e) {
      setErrorMsg(
        e instanceof Error ? e.message : "Unexpected error while grading"
      );
      setPhase("error");
    }
  }, [
    demoMode,
    items,
    pauseStartedAt,
    pauseUsed,
    pauseUsedMs,
    phase,
    router,
    scenario,
    sessionId,
    shownCanonicalIds,
    sound,
    startedAt,
  ]);

  if (phase === "intro") {
    return <BriefIntro scenario={scenario} onStart={startClock} demoMode={demoMode} />;
  }

  if (phase === "error") {
    return (
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-20">
        <h1 className="font-display text-3xl mb-3">
          The grader couldn&apos;t score that round.
        </h1>
        <p className="text-[color:var(--color-muted)] mb-6">{errorMsg}</p>
        <button className="pill-ink" onClick={() => setPhase("editing")}>
          Try submitting again
        </button>
      </section>
    );
  }

  const bigText = demoMode ? "text-[17px] md:text-[19px]" : "text-[15px]";
  const paused = phase === "paused";
  const partner = getPartner(scenario.seniorPartnerId);

  return (
    <section className="mx-auto max-w-[var(--page-max)] px-6 py-8 md:py-12 relative">
      {demoMode && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-reasoning-ink)]/25 bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] px-3 py-1 text-xs tracking-wide">
          DEMO MODE · bigger type · scores revealed on click
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <StepDotsStep2 />
      </div>

      <div className="mb-4">
        <div className="text-xs tracking-widest text-[color:var(--color-muted)] mb-1.5">
          THE FAILURE
        </div>
        <div className={`${bigText} text-[color:var(--color-ink)] leading-snug`}>
          {scenario.failurePoster.subtitle}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-[color:var(--color-muted)]">
        <span>
          {partner.name.split(" ")[0]} is waiting on your call.
        </span>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex-1">
          <TimerBar
            running={phase === "editing"}
            durationMs={scenario.targetTimeSeconds * 1000}
            onExpire={handleSubmit}
            paused={paused}
          />
        </div>
        {!pauseUsed && (
          <button
            type="button"
            onClick={togglePause}
            className="pill-ghost !py-1.5 !px-3 text-xs"
            aria-label="Pause the clock. Costs part of your time bonus."
          >
            <Pause size={12} />
            Pause (−time bonus)
          </button>
        )}
        {paused && (
          <button
            type="button"
            onClick={togglePause}
            className="pill-ink !py-1.5 !px-3 text-xs"
            aria-label="Resume the clock"
          >
            <Play size={12} />
            Resume
          </button>
        )}
      </div>

      {paused && (
        <div className="mb-6 rounded-[var(--radius-card)] border border-[color:var(--color-partial)]/30 bg-[color:var(--color-partial)]/5 px-4 py-3 text-sm text-[color:var(--color-partial)]">
          Paused. Clock is stopped. Resume when you&apos;re ready — your time
          bonus is halved for using this.
        </div>
      )}

      <div className="mb-4">
        <div className="text-xs tracking-widest text-[color:var(--color-muted)] mb-3">
          YOUR RANKED LIST OF CAUSES TO INVESTIGATE
        </div>
        <CauseListEditor
          items={items}
          onChange={setItems}
          disabled={phase !== "editing"}
        />
      </div>

      <div className="mb-10">
        <div className="text-xs tracking-widest text-[color:var(--color-muted)] mb-3">
          HINT: CANDIDATE CAUSES (TAP TO INSERT)
        </div>
        <CauseChipPool
          chips={scenario.candidateChips}
          onInsert={addChip}
          disabled={phase !== "editing"}
        />
      </div>

      <div className="flex gap-3 items-center sticky bottom-4 z-20 bg-gradient-to-t from-[color:var(--color-paper)] via-[color:var(--color-paper)] to-[color:var(--color-paper)]/0 pt-6 pb-2">
        <button
          className="pill-ink"
          onClick={handleSubmit}
          disabled={items.every((i) => !i.text.trim())}
        >
          Submit ranking
          <ArrowRight size={16} />
        </button>
        <div className="text-xs text-[color:var(--color-muted)]">
          Or let the clock run out.
        </div>
      </div>

      {phase === "grading" && <GradingOverlay />}
    </section>
  );
}

function blankItem(): EditorItem {
  return { id: generateSessionId(), text: "" };
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function StepDotsStep2() {
  return (
    <div className="flex items-center gap-2" aria-label="Step 2 of 3 — diagnose">
      <span className="size-1.5 rounded-full bg-[color:var(--color-divider)]" />
      <span className="size-1.5 rounded-full bg-[color:var(--color-ink)]" />
      <span className="size-1.5 rounded-full bg-[color:var(--color-divider)]" />
      <span className="ml-2 text-xs tracking-wider text-[color:var(--color-muted)]">
        STEP 2 OF 3 — DIAGNOSE
      </span>
    </div>
  );
}
