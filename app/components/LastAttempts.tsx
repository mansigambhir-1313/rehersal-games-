"use client";

import { useSyncExternalStore } from "react";
import { loadSessions } from "@/lib/storage";
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

function getSnapshot(): Session[] {
  return loadSessions();
}

function getServerSnapshot(): Session[] {
  return [];
}

export function LastAttempts() {
  const sessions = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = sessions.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="text-sm text-[color:var(--color-muted)] italic">
        First session. Good.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color:var(--color-divider)] px-3 py-2 bg-[color:var(--color-paper)]"
          title={new Date(s.startedAt).toLocaleString()}
        >
          <span className="font-mono-num text-lg text-[color:var(--color-ink)]">
            {s.gradeResult?.scores.decisionQuality ?? 0}
          </span>
          <span className="text-xs text-[color:var(--color-muted)]">
            {new Date(s.startedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
