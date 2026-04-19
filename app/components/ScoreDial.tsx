"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";

/**
 * Animated circular score dial — arc draws from 0 to the target DQ%.
 */
export function ScoreDial({ value, size = 220 }: { value: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const v = useMotionValue(0);
  const dash = useTransform(v, (x) => `${(x / 100) * c} ${c}`);
  const displayed = useTransform(v, (x) => Math.round(x));

  useEffect(() => {
    const controls = animate(v, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, v]);

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-divider)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-ink)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          style={{ strokeDasharray: dash }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div className="font-mono-num text-6xl font-medium text-[color:var(--color-ink)] tabular-nums">
          {displayed}
        </motion.div>
        <div className="text-xs tracking-widest text-[color:var(--color-muted)] mt-1">
          DECISION QUALITY
        </div>
      </div>
    </div>
  );
}
