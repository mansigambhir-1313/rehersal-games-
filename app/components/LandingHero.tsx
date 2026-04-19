"use client";

import { motion } from "motion/react";
import { listScenarios } from "@/lib/scenarios";
import { LastAttempts } from "@/components/LastAttempts";
import { ScenarioCard } from "@/components/ScenarioCard";

export function LandingHero() {
  const scenarios = listScenarios();

  return (
    <section className="mx-auto max-w-[960px] px-6 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-12"
      >
        <div className="max-w-[var(--page-max)]">
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] px-3 py-1 text-xs font-medium mb-6">
            Reasoning · Game
          </span>

          <h1 className="font-display text-[56px] md:text-[72px] leading-[1.02] text-[color:var(--color-ink)] mb-6">
            Inversion Gym
          </h1>

          <p className="text-lg md:text-xl text-[color:var(--color-muted)] leading-relaxed max-w-[520px]">
            The product died. Work backwards. <br />
            What killed it — and in what order would you look?
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-[color:var(--color-ink)]">
              Pick your failure
            </h2>
            <span className="text-xs text-[color:var(--color-muted)]">
              {scenarios.length} scenarios · 90s each
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-[color:var(--color-divider)]">
          <div className="text-[11px] tracking-widest font-medium text-[color:var(--color-muted)] mb-3">
            YOUR LAST ATTEMPTS
          </div>
          <LastAttempts />
        </div>
      </motion.div>
    </section>
  );
}
