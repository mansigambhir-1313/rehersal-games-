"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function GradingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 backdrop-blur-sm bg-[color:var(--color-paper)]/80 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 max-w-[400px] text-center px-6">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 8, -8, 0],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-[color:var(--color-sparkle)]"
        >
          <Sparkles size={28} />
        </motion.div>
        <div className="font-display text-2xl text-[color:var(--color-ink)]">
          Reading your list against the expert record.
        </div>
        <div className="text-sm text-[color:var(--color-muted)]">
          A few seconds. No heroics.
        </div>
      </div>
    </motion.div>
  );
}
