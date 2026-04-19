"use client";

import { useCallback, useState } from "react";
import { Share2, Check } from "lucide-react";
import { reportDecisionEvent } from "@/lib/integration/rehearsal";

export function ShareButton({
  scenarioId,
  decisionQuality,
  scenarioTitle,
}: {
  scenarioId: string;
  decisionQuality: number;
  scenarioTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const playUrl = `${origin}/play?scenario=${scenarioId}`;
    const text = `I scored ${decisionQuality} on "${scenarioTitle}" — Inversion Gym.\nCan you do better? ${playUrl}`;
    reportDecisionEvent({ kind: "share_clicked", destination: "copy" });
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: "Inversion Gym",
          text,
          url: playUrl,
        });
        return;
      }
    } catch {
      // user cancelled native share; fall through to copy
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // last resort — textarea copy
      const t = document.createElement("textarea");
      t.value = text;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  }, [decisionQuality, scenarioId, scenarioTitle]);

  return (
    <button type="button" className="pill-ghost" onClick={share} aria-live="polite">
      {copied ? (
        <>
          <Check size={14} />
          Copied
        </>
      ) : (
        <>
          <Share2 size={14} />
          Share score
        </>
      )}
    </button>
  );
}
