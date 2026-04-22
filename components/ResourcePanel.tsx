import { Panel } from "./Panel";
import type { ScoresCumules } from "@/lib/types";

const RESOURCES = [
  { key: "vent"     as const, emoji: "💨", label: "Vent",     color: "#7EC8E3" },
  { key: "or"       as const, emoji: "🪙", label: "Or",       color: "#E8A838" },
  { key: "bois"     as const, emoji: "🪵", label: "Bois",     color: "#D4A574" },
  { key: "boussole" as const, emoji: "🧭", label: "Boussole", color: "#2D936C" },
] as const;

interface ResourceBoxProps {
  emoji: string;
  label: string;
  color: string;
  value: number;
  max?: number;
}

function ResourceBox({ emoji, label, color, value, max = 100 }: ResourceBoxProps) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div
      className="rounded-md p-2.5 border"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex items-center gap-1.5 mb-1.5 text-cream-muted/60"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "9px",
        }}
      >
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <div
        className="text-[22px] font-bold leading-none mb-2"
        style={{ color, fontFamily: "'Cinzel', serif" }}
      >
        {value}
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full rounded-full bar-animate"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

interface ResourcePanelProps {
  scores: ScoresCumules;
}

export function ResourcePanel({ scores }: ResourcePanelProps) {
  return (
    <Panel title="Cale du navire" icon="⚖️">
      <div className="grid grid-cols-2 gap-2.5">
        {RESOURCES.map((r) => (
          <ResourceBox
            key={r.key}
            emoji={r.emoji}
            label={r.label}
            color={r.color}
            value={scores[r.key]}
          />
        ))}
      </div>

      {/* Total */}
      <div
        className="mt-3 pt-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span
          className="text-[8px] uppercase tracking-[1px] text-cream-muted/40"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Total cumulé
        </span>
        <span
          className="text-sm font-bold text-gold"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {scores.total} pts
        </span>
      </div>
    </Panel>
  );
}
