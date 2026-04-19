"use client";

import { Plus } from "lucide-react";

export function CauseChipPool({
  chips,
  onInsert,
  disabled,
}: {
  chips: string[];
  onInsert: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onInsert(c)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-divider)] px-3 py-1.5 text-xs text-[color:var(--color-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={12} />
          {c}
        </button>
      ))}
    </div>
  );
}
