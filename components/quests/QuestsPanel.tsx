import type { Quest } from "@/lib/types";
import { QuestStatusBadge } from "@/components/ui/StatusBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface QuestCardProps {
  quest: Quest;
}

function QuestCard({ quest }: QuestCardProps) {
  const isActive = quest.statut === "active";

  return (
    <div
      className={`panel p-3 transition-all duration-200 ${
        isActive ? "hover:border-gold/30" : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4
          className={`font-cinzel text-xs font-semibold ${
            isActive ? "text-cream-DEFAULT" : "text-cream-muted"
          }`}
        >
          {quest.titre}
        </h4>
        <QuestStatusBadge status={quest.statut} />
      </div>

      <p className="label-pixel text-cream-muted/70 text-[8px] leading-relaxed mb-2">
        {quest.description}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🗡️</span>
          <span className="label-pixel text-cream-muted/60 text-[7px]">{quest.responsable}</span>
        </div>
        {quest.deadline && (
          <span className="label-pixel text-[7px] text-cream-muted/60">
            ⏳ {new Date(quest.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {quest.recompense && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <span className="label-pixel text-gold/80 text-[7px]">🎁 {quest.recompense}</span>
        </div>
      )}
    </div>
  );
}

interface QuestsPanelProps {
  quests: Quest[];
}

export function QuestsPanel({ quests }: QuestsPanelProps) {
  const active = quests.filter((q) => q.statut === "active");
  const done = quests.filter((q) => q.statut !== "active");

  return (
    <div>
      <SectionHeader
        title="Quêtes"
        subtitle={`${active.length} active${active.length > 1 ? "s" : ""} · ${done.length} accomplie${done.length > 1 ? "s" : ""}`}
        icon="📜"
      />
      <div className="space-y-2">
        {active.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
        {done.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  );
}
