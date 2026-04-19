"use client";

import { useEffect, useState } from "react";

export function TimerBar({
  running,
  durationMs,
  onExpire,
  paused,
}: {
  running: boolean;
  durationMs: number;
  onExpire: () => void;
  paused?: boolean;
}) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    if (!running || paused) return;
    const start = Date.now();
    const startingRemaining = remaining;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const next = Math.max(0, startingRemaining - elapsed);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onExpire();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused]);

  const pct = Math.max(0, Math.min(1, remaining / durationMs));
  const seconds = Math.ceil(remaining / 1000);
  const lastTen = seconds <= 10;

  return (
    <div
      role="timer"
      aria-label={`Time remaining: ${seconds} seconds`}
      className="flex items-center gap-4 w-full"
    >
      <div className="relative flex-1 h-[3px] bg-[color:var(--color-divider)] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${pct * 100}%`,
            background: lastTen
              ? "var(--color-missed)"
              : "var(--color-ink)",
          }}
        />
      </div>
      <div
        className={
          lastTen
            ? "font-mono-num text-sm tabular-nums text-[color:var(--color-missed)] w-10 text-right"
            : "font-mono-num text-sm tabular-nums text-[color:var(--color-muted)] w-10 text-right"
        }
      >
        {seconds.toString().padStart(2, "0")}s
      </div>
    </div>
  );
}
