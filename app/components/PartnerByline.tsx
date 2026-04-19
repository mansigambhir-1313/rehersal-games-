import type { SeniorPartner } from "@/lib/types";

/**
 * Small "Graded by …" / "Reporting to …" attribution chip rendered above or
 * below the partner's verdict. Reinforces the fiction: the player is being
 * graded by a named human, not a model. Keep it quiet — this is a byline,
 * not a banner.
 */
export function PartnerByline({
  partner,
  prefix = "Graded by",
}: {
  partner: SeniorPartner;
  prefix?: string;
}) {
  const initials = partner.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex items-center gap-3 text-xs text-[color:var(--color-muted)]">
      <span
        aria-hidden="true"
        className="inline-flex size-7 items-center justify-center rounded-full bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] font-display"
      >
        {initials}
      </span>
      <span>
        {prefix}{" "}
        <span className="text-[color:var(--color-ink)] font-medium">
          {partner.name}
        </span>{" "}
        · {partner.role}
      </span>
    </div>
  );
}
