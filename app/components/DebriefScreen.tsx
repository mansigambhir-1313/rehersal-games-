"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { loadSession, loadLastSession } from "@/lib/storage";
import { getScenario } from "@/lib/scenarios";
import { DebriefReel } from "@/components/DebriefReel";
import { ScoreDial } from "@/components/ScoreDial";
import { ShareButton } from "@/components/ShareButton";
import { PartnerByline } from "@/components/PartnerByline";
import { linkToBrief } from "@/lib/integration/rehearsal";
import { getPartner } from "@/lib/partners";
import { ArrowRight, Eye, RefreshCcw } from "lucide-react";
import type { Session } from "@/lib/types";

const KEY = "ig_sessions_v1";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (!e.key || e.key === KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function makeGetSnapshot(sessionId: string | null) {
  return () => (sessionId ? loadSession(sessionId) : loadLastSession());
}

function getServerSnapshot(): Session | null {
  return null;
}

export function DebriefScreen({
  sessionId,
  demoMode,
}: {
  sessionId: string | null;
  demoMode: boolean;
}) {
  const session = useSyncExternalStore(
    subscribe,
    makeGetSnapshot(sessionId),
    getServerSnapshot
  );
  const [revealed, setRevealed] = useState(!demoMode);

  if (session === null || !session.gradeResult) {
    return (
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-20">
        <h1 className="font-display text-3xl mb-3">No recent session found.</h1>
        <p className="text-[color:var(--color-muted)] mb-6">
          Start a round, then this page shows your debrief.
        </p>
        <Link className="pill-ink" href="/">
          Back to Inversion Gym
        </Link>
      </section>
    );
  }

  const scenario = getScenario(session.scenarioId);
  if (!scenario) {
    return (
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-20">
        <div className="text-[color:var(--color-muted)]">Scenario missing.</div>
      </section>
    );
  }

  const { scores, verdicts, overallMessage, mode, partial } = session.gradeResult;
  const partner = getPartner(scenario.seniorPartnerId);

  return (
    <section className="mx-auto max-w-[var(--page-max)] px-6 py-10 md:py-14">
      {/* Step */}
      <div
        className="flex items-center gap-2 mb-6"
        aria-label="Step 3 of 3 — debrief"
      >
        <span className="size-1.5 rounded-full bg-[color:var(--color-divider)]" />
        <span className="size-1.5 rounded-full bg-[color:var(--color-divider)]" />
        <span className="size-1.5 rounded-full bg-[color:var(--color-ink)]" />
        <span className="ml-2 text-xs tracking-wider text-[color:var(--color-muted)]">
          STEP 3 OF 3 — DEBRIEF
        </span>
      </div>

      {/* Banners */}
      {demoMode && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-reasoning-ink)]/25 bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] px-3 py-1 text-xs tracking-wide">
          DEMO MODE · scores hidden until reveal
        </div>
      )}
      {mode === "stub" && (
        <div className="mb-8 rounded-[var(--radius-card)] border border-[color:var(--color-partial)]/40 bg-[color:var(--color-partial)]/8 px-4 py-3 text-sm text-[color:var(--color-partial)]">
          Stub grader — for design-time only. Real grading needs an{" "}
          <code className="font-mono-num">ANTHROPIC_API_KEY</code>.
        </div>
      )}
      {partial && mode === "live" && (
        <div className="mb-8 rounded-[var(--radius-card)] border border-[color:var(--color-partial)]/40 bg-[color:var(--color-partial)]/8 px-4 py-3 text-sm text-[color:var(--color-partial)]">
          Partial grade — some matches fell back to stub due to a transient issue.
        </div>
      )}

      {/* Score + message — hidden in demo until reveal */}
      {revealed ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-10"
          aria-live="polite"
        >
          <ScoreDial value={scores.decisionQuality} size={200} />
          <div className="flex-1">
            <div className="mb-3">
              <PartnerByline partner={partner} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)] mb-3">
              {overallMessage}
            </h1>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <SubScore label="Precision @5" value={pct(scores.precision5)} />
              <SubScore label="NDCG @10" value={pct(scores.ndcg10)} />
              <SubScore label="Time bonus" value={pct(scores.timeBonus)} />
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-[var(--radius-card)] border-2 border-dashed border-[color:var(--color-divider)] p-12 text-center mb-10">
          <div className="font-display text-3xl mb-2">Score hidden.</div>
          <p className="text-[color:var(--color-muted)] mb-6">
            Discuss the student&apos;s list with the room first. Reveal when
            ready.
          </p>
          <button className="pill-ink" onClick={() => setRevealed(true)}>
            <Eye size={14} />
            Reveal score
          </button>
        </div>
      )}

      {/* Reel */}
      <div className="mb-6">
        <div className="text-xs tracking-widest text-[color:var(--color-muted)] mb-3">
          THE EXPERT RECORD — WHAT YOU CAUGHT, WHAT YOU MISSED
        </div>
        <DebriefReel verdicts={verdicts} scenario={scenario} />
      </div>

      {/* CTAs */}
      <div className="mt-12 flex flex-wrap gap-3 pt-6 border-t border-[color:var(--color-divider)]">
        <Link className="pill-ink" href={`/play?scenario=${scenario.id}${demoMode ? "&demo=1" : ""}`}>
          <RefreshCcw size={14} />
          Play again
        </Link>
        <Link className="pill-ghost" href="/">
          Pick a different scenario
        </Link>
        {revealed && (
          <ShareButton
            scenarioId={scenario.id}
            decisionQuality={scores.decisionQuality}
            scenarioTitle={scenario.title}
            partnerName={partner.name}
          />
        )}
        <a
          className="pill-ghost"
          href={linkToBrief(scenario.briefSlug)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the related brief
          <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}

function SubScore({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-divider)] px-4 py-3">
      <div className="text-[10px] tracking-widest text-[color:var(--color-muted)] mb-1">
        {label.toUpperCase()}
      </div>
      <div className="font-mono-num text-xl tabular-nums">{value}</div>
    </div>
  );
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
