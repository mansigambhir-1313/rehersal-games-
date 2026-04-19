"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { funnelRecovery } from "@/lib/scenarios/funnel-recovery";
import { LastAttempts } from "@/components/LastAttempts";

export function LandingHero() {
  const scenario = funnelRecovery;

  return (
    <section className="mx-auto max-w-[var(--page-max)] px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-10"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] px-3 py-1 text-xs font-medium">
            Reasoning · Game
          </span>
        </div>

        <h1 className="font-display text-[56px] md:text-[72px] leading-[1.02] text-[color:var(--color-ink)]">
          Inversion Gym
        </h1>

        <p className="text-lg md:text-xl text-[color:var(--color-muted)] leading-relaxed max-w-[520px]">
          The product died. Work backwards. <br />
          What killed it — and in what order would you look?
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <Link href={`/play?scenario=${scenario.id}`} className="pill-ink">
            Start round
            <ArrowRight size={16} />
          </Link>
          <div className="text-sm text-[color:var(--color-muted)] ml-2">
            ~3 minutes · 90-second clock · <span className="font-mono-num">1</span> scenario
          </div>
        </div>

        <div className="pt-8 border-t border-[color:var(--color-divider)]">
          <div className="text-[11px] tracking-widest font-medium text-[color:var(--color-muted)] mb-3">
            YOUR LAST ATTEMPTS
          </div>
          <LastAttempts />
        </div>
      </motion.div>
    </section>
  );
}
