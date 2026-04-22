import { Panel } from "./Panel";
import type { Evenement } from "@/lib/types";

const EVENT_CONFIG = {
  tempete:    { emoji: "🌊", color: "#E84838", bg: "rgba(232,72,56,0.2)",   border: "rgba(232,72,56,0.4)"   },
  decouverte: { emoji: "✨", color: "#7EC8E3", bg: "rgba(126,200,227,0.2)", border: "rgba(126,200,227,0.4)" },
  commerce:   { emoji: "⚖️", color: "#D4A574", bg: "rgba(212,165,116,0.2)", border: "rgba(212,165,116,0.4)" },
  danger:     { emoji: "⚠️", color: "#E84838", bg: "rgba(232,72,56,0.2)",   border: "rgba(232,72,56,0.4)"   },
  bonus:      { emoji: "🎁", color: "#2D936C", bg: "rgba(45,147,108,0.2)",  border: "rgba(45,147,108,0.4)"  },
} as const;

interface EventPanelProps {
  event: Evenement | null;
}

export function EventPanel({ event }: EventPanelProps) {
  if (!event) {
    return (
      <Panel title="Événement en mer" icon="🌊">
        <p
          className="text-[10px] text-cream-muted/40 text-center py-3"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Calme plat — aucun événement
        </p>
      </Panel>
    );
  }

  const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.bonus;

  return (
    <Panel title="Événement en mer" icon="🌊">
      <div
        className="rounded-lg p-3 flex items-center gap-3"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}
      >
        <div className="text-[28px] flex-shrink-0">{cfg.emoji}</div>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-bold text-cream-DEFAULT mb-1 truncate"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {event.titre}
          </div>
          <div
            className="text-[10px] leading-relaxed"
            style={{ color: "#c4a080", fontFamily: "'Cinzel', serif" }}
          >
            {event.description}
          </div>
        </div>
      </div>

      {event.date_debut && (
        <div className="mt-2 flex justify-end">
          <span
            className="text-[8px] text-cream-muted/40"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            {new Date(event.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        </div>
      )}
    </Panel>
  );
}
