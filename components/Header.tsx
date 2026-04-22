import Link from "next/link";
import { Countdown } from "./Countdown";

interface HeaderProps {
  semaine: number;
  dateMaree: string; // ISO date
  nomIleEnCours: string;
}

/** Next monday from a given date (used as default tide day) */
function nextMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export function Header({ semaine, dateMaree, nomIleEnCours }: HeaderProps) {
  // Use sheet date if provided, otherwise next Monday
  const target = dateMaree ? `${dateMaree}T09:00:00` : nextMonday();

  return (
    <header
      className="rounded-[12px] border px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: "rgba(0,0,0,0.3)",
        borderColor: "rgba(232,168,56,0.2)",
      }}
    >
      {/* Left: branding */}
      <div>
        <p
          className="text-[11px] uppercase tracking-[3px] text-cream-muted/60 mb-1"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          ⚓ Eaux Inexplorees ⚓
        </p>
        <h1
          className="text-2xl font-bold text-cream-DEFAULT tracking-[2px]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Voyage de l&apos;équipage marketing
        </h1>
        <p className="text-sm text-gold/70 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
          En route vers — {nomIleEnCours}
        </p>
      </div>

      {/* Center: nav links */}
      <nav className="hidden lg:flex items-center gap-3">
        <Link
          href="/equipage"
          className="text-[9px] uppercase tracking-[1.5px] text-cream-muted/60 hover:text-gold transition-colors border border-white/10 hover:border-gold/30 px-3 py-1.5 rounded-lg"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Équipage
        </Link>
        <a
          href="/debug"
          className="text-[9px] uppercase tracking-[1.5px] text-cream-muted/40 hover:text-cream-muted/70 transition-colors px-2 py-1"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Debug
        </a>
      </nav>

      {/* Right: week + countdown */}
      <div className="text-right flex-shrink-0">
        <div
          className="inline-block bg-gold text-navy-DEFAULT font-bold text-sm px-3 py-1.5 rounded-md mb-1 tracking-[1px]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Semaine {semaine}
        </div>
        <div
          className="text-[11px] text-cream-muted/60"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <Countdown targetDate={target} />
        </div>
      </div>
    </header>
  );
}
