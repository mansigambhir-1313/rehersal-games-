"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { Check, X, CircleAlert } from "lucide-react";
import { useSound } from "@/components/SoundProvider";
import type { Scenario, Verdict } from "@/lib/types";

export function DebriefReel({
  verdicts,
  scenario,
}: {
  verdicts: Verdict[];
  scenario: Scenario;
}) {
  const titleById = new Map(
    scenario.canonicalCauses.map((c) => [c.id, c.title])
  );
  const sound = useSound();

  useEffect(() => {
    if (!sound.enabled) return;
    verdicts.forEach((_, i) => {
      setTimeout(() => sound.playReveal(), i * 80 + 200);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Debrief reel">
      {verdicts.map((v, i) => (
        <VerdictCard
          key={v.canonicalCauseId}
          verdict={v}
          title={titleById.get(v.canonicalCauseId) ?? v.canonicalCauseId}
          delay={i * 0.08}
        />
      ))}
    </div>
  );
}

function VerdictCard({
  verdict,
  title,
  delay,
}: {
  verdict: Verdict;
  title: string;
  delay: number;
}) {
  const caught = verdict.userRankIfMatched !== null;
  const partial =
    !caught && verdict.matchConfidence >= 0.5 && verdict.matchConfidence < 0.7;

  return (
    <motion.div
      role="listitem"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4 rounded-[var(--radius-card)] border border-[color:var(--color-divider)] bg-[color:var(--color-paper)] px-5 py-4"
    >
      <div className="pt-0.5">
        {caught ? (
          <span
            className="inline-flex size-8 items-center justify-center rounded-full bg-[color:var(--color-caught)]/10 text-[color:var(--color-caught)]"
            aria-label="Caught"
          >
            <Check size={18} strokeWidth={2.5} />
          </span>
        ) : partial ? (
          <span
            className="inline-flex size-8 items-center justify-center rounded-full bg-[color:var(--color-partial)]/10 text-[color:var(--color-partial)]"
            aria-label="Partial"
          >
            <CircleAlert size={18} />
          </span>
        ) : (
          <span
            className="inline-flex size-8 items-center justify-center rounded-full bg-[color:var(--color-missed)]/10 text-[color:var(--color-missed)]"
            aria-label="Missed"
          >
            <X size={18} strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span
            className={
              caught
                ? "text-xs font-medium tracking-wide text-[color:var(--color-caught)] uppercase"
                : partial
                ? "text-xs font-medium tracking-wide text-[color:var(--color-partial)] uppercase"
                : "text-xs font-medium tracking-wide text-[color:var(--color-missed)] uppercase"
            }
          >
            {caught
              ? `Caught · rank #${verdict.userRankIfMatched}`
              : partial
              ? "Partial"
              : "Missed"}
          </span>
        </div>
        <div className="font-display text-xl text-[color:var(--color-ink)] leading-tight mb-1.5">
          {title}
        </div>
        <div className="text-[15px] text-[color:var(--color-muted)] leading-relaxed">
          {verdict.partnerNote || verdict.debriefLine}
        </div>
        {verdict.matchedUserCauseText && (
          <div className="mt-2 text-xs text-[color:var(--color-muted)] italic">
            You said: &ldquo;{verdict.matchedUserCauseText}&rdquo;
          </div>
        )}
      </div>
    </motion.div>
  );
}

