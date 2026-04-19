import Link from "next/link";
import { Home, Sparkles, BookMarked, ScrollText, ClipboardList, Brain, BarChart3, FileText, Rocket } from "lucide-react";
import { SoundToggle } from "@/components/SoundProvider";

/**
 * Sidebar shell matching Rehearsal's design.
 * "Games" is the new active top-level item. Others are decorative in v1
 * (they link to '#' until we integrate with the real Rehearsal app).
 */
export function Nav() {
  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-[color:var(--color-divider)] px-4 py-6 gap-8 bg-[color:var(--color-paper)]">
      <Link href="/" className="px-3 text-2xl font-display tracking-tight">
        <span className="underline decoration-[color:var(--color-sparkle)] decoration-2 underline-offset-4">Re</span>
        <span>hearsal</span>
      </Link>

      <div className="flex flex-col gap-1">
        <NavItem href="#" icon={<Home size={18} />} label="Home" />
        <NavItem href="#" icon={<Sparkles size={18} />} label="Create" />

        <NavSection label="APPS" />
        <NavItem href="#" icon={<BookMarked size={18} />} label="Your Briefs" />
        <NavItem href="#" icon={<ScrollText size={18} />} label="Role Plays" />
        <NavItem href="/" icon={<Brain size={18} />} label="Games" active />
        <NavItem href="#" icon={<FileText size={18} />} label="Make Resume" />
        <NavItem href="#" icon={<ClipboardList size={18} />} label="Aptitude Test" />
        <NavItem href="#" icon={<Sparkles size={18} />} label="Ask Coach" />

        <NavSection label="YOUR ACCOUNT" />
        <NavItem href="#" icon={<ClipboardList size={18} />} label="Notebook" />
        <NavItem href="#" icon={<BarChart3 size={18} />} label="History" />
        <NavItem href="#" icon={<FileText size={18} />} label="Resumes" />
        <NavItem href="#" icon={<Brain size={18} />} label="Memories" />
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button className="pill-ink w-full justify-center">
          <Rocket size={16} />
          Upgrade to PRO
        </button>
        <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[color:var(--color-muted)]">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-[color:var(--color-reasoning-bg)] text-[color:var(--color-reasoning-ink)] grid place-items-center text-xs font-medium">M</div>
            Mansi Gam…
          </div>
          <SoundToggle />
        </div>
      </div>
    </aside>
  );
}

function NavSection({ label }: { label: string }) {
  return (
    <div className="px-3 mt-4 mb-1 text-[10px] font-medium tracking-widest text-[color:var(--color-muted)]">
      {label}
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex items-center gap-3 rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-3 py-2.5 text-sm font-medium"
          : "flex items-center gap-3 rounded-[var(--radius-pill)] text-[color:var(--color-ink)] px-3 py-2.5 text-sm hover:bg-[color:var(--color-ghost)] transition-colors"
      }
    >
      <span className="text-[color:currentColor] opacity-80">{icon}</span>
      {label}
    </Link>
  );
}
