"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPartner } from "@/lib/partners";
import type { Scenario } from "@/lib/types";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const partner = getPartner(scenario.seniorPartnerId);
  return (
    <Link
      href={`/play?scenario=${scenario.id}`}
      className="group flex flex-col rounded-[var(--radius-card)] border border-[color:var(--color-divider)] bg-[color:var(--color-paper)] overflow-hidden hover:border-[color:var(--color-ink)]/40 transition-colors"
    >
      <div className="aspect-[16/9] bg-[color:var(--color-ghost)] relative overflow-hidden">
        <CoverByScenario id={scenario.id} />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] px-2.5 py-0.5 text-[10px] font-medium tracking-wide">
            {scenario.failurePoster.categoryPill.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <h3 className="font-display text-xl leading-snug text-[color:var(--color-ink)]">
          {scenario.title}
        </h3>
        <p className="text-sm text-[color:var(--color-muted)] leading-relaxed line-clamp-3">
          {scenario.failurePoster.subtitle}
        </p>
        <div className="text-xs text-[color:var(--color-muted)]">
          Graded by{" "}
          <span className="text-[color:var(--color-ink)] font-medium">
            {partner.name}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-[color:var(--color-muted)]">
          <span>{scenario.targetTimeSeconds}s · {scenario.shownPerRound} causes</span>
          <span className="inline-flex items-center gap-1 text-[color:var(--color-ink)] opacity-70 group-hover:opacity-100 group-hover:gap-2 transition-all">
            Play
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Tiny SVG cover dispatched by scenario id.
 * Each is editorial: thin ink lines + one ocher accent + serif annotation.
 */
function CoverByScenario({ id }: { id: string }) {
  if (id === "funnel-recovery") return <FunnelCover />;
  if (id === "resignation-letter") return <ResignationCover />;
  if (id === "hertz-accenture") return <HertzCover />;
  return null;
}

function FunnelCover() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="800" height="450" fill="#F5F1EA" />
      <g stroke="#0F0F0F" strokeWidth="1.5" fill="none" opacity="0.85">
        <path d="M 180 100 L 620 100 L 510 290 L 290 290 Z" />
        <path d="M 290 290 L 340 380 L 460 380 L 510 290" />
      </g>
      <g fill="#CA8A04">
        <circle cx="280" cy="240" r="4.5" opacity="0.8" />
        <circle cx="540" cy="220" r="4" opacity="0.8" />
        <circle cx="400" cy="320" r="6" opacity="0.85" />
      </g>
      <text x="400" y="420" fontFamily="ui-serif, Georgia, serif" fontSize="18" fontStyle="italic" textAnchor="middle" fill="#0F0F0F" opacity="0.85">5 survive.</text>
    </svg>
  );
}

function ResignationCover() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="800" height="450" fill="#F5F1EA" />
      {/* envelope */}
      <g stroke="#0F0F0F" strokeWidth="1.5" fill="none" opacity="0.9">
        <rect x="220" y="140" width="360" height="200" rx="4" />
        <path d="M 220 140 L 400 270 L 580 140" />
      </g>
      {/* paper edge sticking out */}
      <g stroke="#0F0F0F" strokeWidth="1" fill="#FAFAF8" opacity="0.95">
        <rect x="260" y="110" width="280" height="60" />
        <line x1="280" y1="135" x2="520" y2="135" opacity="0.4" />
        <line x1="280" y1="150" x2="460" y2="150" opacity="0.3" />
      </g>
      {/* one ocher seal */}
      <circle cx="400" cy="270" r="10" fill="#CA8A04" opacity="0.85" />
      <text x="400" y="410" fontFamily="ui-serif, Georgia, serif" fontSize="18" fontStyle="italic" textAnchor="middle" fill="#0F0F0F" opacity="0.85">Effective immediately.</text>
    </svg>
  );
}

function HertzCover() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="800" height="450" fill="#F5F1EA" />
      {/* browser frame */}
      <g stroke="#0F0F0F" strokeWidth="1.5" fill="none" opacity="0.9">
        <rect x="140" y="100" width="520" height="280" rx="6" />
        <line x1="140" y1="140" x2="660" y2="140" />
        <circle cx="170" cy="120" r="4" fill="#0F0F0F" opacity="0.5" />
        <circle cx="190" cy="120" r="4" fill="#0F0F0F" opacity="0.5" />
        <circle cx="210" cy="120" r="4" fill="#0F0F0F" opacity="0.5" />
      </g>
      {/* broken content lines */}
      <g stroke="#0F0F0F" strokeWidth="1.5" opacity="0.5" strokeDasharray="6 6">
        <line x1="180" y1="180" x2="620" y2="180" />
        <line x1="180" y1="220" x2="500" y2="220" />
        <line x1="180" y1="260" x2="560" y2="260" />
        <line x1="180" y1="300" x2="440" y2="300" />
      </g>
      {/* big ocher X */}
      <g stroke="#CA8A04" strokeWidth="3" opacity="0.8">
        <line x1="540" y1="280" x2="600" y2="340" />
        <line x1="600" y1="280" x2="540" y2="340" />
      </g>
      <text x="400" y="425" fontFamily="ui-serif, Georgia, serif" fontSize="18" fontStyle="italic" textAnchor="middle" fill="#0F0F0F" opacity="0.85">$32M. Never shipped.</text>
    </svg>
  );
}
