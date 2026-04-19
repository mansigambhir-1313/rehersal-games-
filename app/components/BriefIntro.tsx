"use client";

import { motion } from "motion/react";
import type { Scenario } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export function BriefIntro({
  scenario,
  onStart,
  demoMode,
}: {
  scenario: Scenario;
  onStart: () => void;
  demoMode?: boolean;
}) {
  const headlineSize = demoMode
    ? "text-[52px] md:text-[64px]"
    : "text-[44px] md:text-[56px]";
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-[var(--page-max)] px-6 py-10 md:py-16"
    >
      {/* cover */}
      <div className="relative rounded-[var(--radius-card)] bg-[color:var(--color-ghost)] overflow-hidden aspect-[16/9] mb-8">
        <CoverArt />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] px-3 py-1 text-xs font-medium">
            {scenario.failurePoster.categoryPill}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <StepDot active />
        <StepDot />
        <StepDot />
        <span className="ml-2 text-xs tracking-wider text-[color:var(--color-muted)]">
          STEP 1 OF 3 — BRIEF
        </span>
      </div>

      <h1 className={`font-display ${headlineSize} leading-[1.05] text-[color:var(--color-ink)] mb-4`}>
        {scenario.failurePoster.headline}
      </h1>

      <p className="text-lg text-[color:var(--color-muted)] italic mb-8 max-w-[520px]">
        {scenario.failurePoster.subtitle}
      </p>

      <p className="text-[17px] leading-[1.7] text-[color:var(--color-ink)] mb-10 max-w-[600px]">
        {scenario.failurePoster.storyParagraph}
      </p>

      <div className="flex flex-wrap gap-3 items-center">
        <button className="pill-ink" onClick={onStart}>
          I&apos;ve read it. Start the clock.
          <ArrowRight size={16} />
        </button>
        <div className="text-sm text-[color:var(--color-muted)]">
          90-second round · up to 10 causes · drag to rank
        </div>
      </div>
    </motion.section>
  );
}

function StepDot({ active }: { active?: boolean }) {
  return (
    <span
      className={
        active
          ? "size-1.5 rounded-full bg-[color:var(--color-ink)]"
          : "size-1.5 rounded-full bg-[color:var(--color-divider)]"
      }
    />
  );
}

/**
 * Editorial cover art — pure SVG, abstract leaky funnel.
 * Inline so the component has no external asset dependency at build time.
 */
function CoverArt() {
  return (
    <svg
      viewBox="0 0 1200 675"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F1EA" />
          <stop offset="100%" stopColor="#E8E6E1" />
        </linearGradient>
        <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#8A8680" opacity="0.22" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#paper)" />
      <rect width="1200" height="675" fill="url(#dots)" />

      {/* abstract funnel */}
      <g stroke="#0F0F0F" strokeWidth="2" fill="none" opacity="0.9">
        <path d="M 260 170 L 940 170 L 760 430 L 440 430 Z" />
        <path d="M 440 430 L 520 570 L 680 570 L 760 430" />
        <line x1="330" y1="240" x2="870" y2="240" opacity="0.4" />
        <line x1="390" y1="310" x2="810" y2="310" opacity="0.35" />
        <line x1="450" y1="380" x2="750" y2="380" opacity="0.3" />
      </g>
      {/* leaks — ocher drops */}
      <g fill="#CA8A04">
        <circle cx="380" cy="360" r="6" opacity="0.75" />
        <circle cx="820" cy="330" r="5" opacity="0.75" />
        <circle cx="600" cy="455" r="7" opacity="0.85" />
        <circle cx="690" cy="500" r="5" opacity="0.7" />
        <circle cx="470" cy="460" r="4" opacity="0.6" />
      </g>
      {/* numbers — 100 → 5 editorial */}
      <g fontFamily="ui-serif, Georgia, serif" fill="#0F0F0F">
        <text x="260" y="140" fontSize="20" opacity="0.6">100</text>
        <text x="920" y="140" fontSize="20" opacity="0.6" textAnchor="end">95 lost</text>
        <text x="600" y="620" fontSize="28" fontStyle="italic" textAnchor="middle" opacity="0.85">
          5 survive.
        </text>
      </g>
    </svg>
  );
}
