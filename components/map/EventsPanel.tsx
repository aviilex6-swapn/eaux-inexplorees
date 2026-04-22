import type { SeaEvent } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";

const EVENT_CONFIG = {
  tempete: { icon: "🌊", color: "#E84838", label: "Tempête" },
  decouverte: { icon: "✨", color: "#7EC8E3", label: "Découverte" },
  commerce: { icon: "⚖️", color: "#D4A574", label: "Commerce" },
  danger: { icon: "⚠️", color: "#E84838", label: "Danger" },
  bonus: { icon: "🎁", color: "#2D936C", label: "Bonus" },
} as const;

interface EventCardProps {
  event: SeaEvent;
}

function EventCard({ event }: EventCardProps) {
  const cfg = EVENT_CONFIG[event.type];

  return (
    <div
      className="panel p-3 flex gap-3 items-start transition-all duration-200"
      style={{
        borderColor: event.actif ? `${cfg.color}30` : "rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-base"
        style={{ backgroundColor: `${cfg.color}15` }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-cinzel text-xs text-cream-DEFAULT font-semibold truncate">
            {event.titre}
          </h4>
          {event.actif && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-gold"
              style={{ backgroundColor: cfg.color }}
            />
          )}
        </div>
        <p className="label-pixel text-cream-muted/70 text-[8px] leading-relaxed">
          {event.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="label-pixel text-[7px]" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          {event.date && (
            <span className="label-pixel text-[7px] text-cream-muted/40">
              {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface EventsPanelProps {
  events: SeaEvent[];
}

export function EventsPanel({ events }: EventsPanelProps) {
  const active = events.filter((e) => e.actif);
  const past = events.filter((e) => !e.actif);

  return (
    <div>
      <SectionHeader
        title="Événements en mer"
        subtitle={active.length > 0 ? `${active.length} événement${active.length > 1 ? "s" : ""} actif${active.length > 1 ? "s" : ""}` : "Calme plat"}
        icon="🌊"
      />
      <div className="space-y-2">
        {active.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
        {past.map((e) => (
          <div key={e.id} className="opacity-50">
            <EventCard event={e} />
          </div>
        ))}
        {events.length === 0 && (
          <p className="label-pixel text-cream-muted/40 text-[8px] text-center py-4">
            Aucun événement signalé
          </p>
        )}
      </div>
    </div>
  );
}
