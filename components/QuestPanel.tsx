import { Panel } from "./Panel";
import type { Quete } from "@/lib/types";

interface QuestCardProps {
  quest: Quete;
}

function QuestCard({ quest }: QuestCardProps) {
  const isAccomplie = quest.statut === "accomplie";
  const isEchouee  = quest.statut === "echouee";

  const borderColor = isAccomplie ? "#2D936C" : isEchouee ? "#E84838" : "#E8A838";

  const hasPct = quest.valeur_actuelle !== undefined && quest.valeur_max !== undefined && quest.valeur_max > 0;
  const pct = hasPct
    ? Math.min(100, Math.round((quest.valeur_actuelle! / quest.valeur_max!) * 100))
    : null;

  return (
    <div
      className="rounded-md p-2.5 mb-2 border-l-[3px]"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderLeftColor: borderColor,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className="text-[13px] font-bold text-cream-DEFAULT leading-tight"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {quest.titre}
        </span>
        {isAccomplie && (
          <span
            className="text-[8px] text-compass flex-shrink-0"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ✓
          </span>
        )}
        {isEchouee && (
          <span
            className="text-[8px] text-danger flex-shrink-0"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ✗
          </span>
        )}
      </div>

      <div
        className="text-[10px] mb-2 leading-relaxed"
        style={{ color: "#a08060", fontFamily: "'Cinzel', serif" }}
      >
        {quest.description}
      </div>

      {/* Progress bar */}
      {pct !== null && (
        <>
          <div
            className="h-1 rounded-full overflow-hidden mb-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #E8A838, #fdcb6e)",
              }}
            />
          </div>
          <div
            className="text-right text-[9px] text-cream-muted/50"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            {quest.valeur_actuelle} / {quest.valeur_max}
          </div>
        </>
      )}

      {/* Deadline + responsable */}
      <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
        {quest.responsable && (
          <span
            className="text-[8px] text-cream-muted/50"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ⚓ {quest.responsable}
          </span>
        )}
        {quest.deadline && (
          <span
            className="text-[8px] text-cream-muted/40"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ⏳ {new Date(quest.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

interface QuestPanelProps {
  quetes: Quete[];
  nomIle?: string;
}

export function QuestPanel({ quetes, nomIle }: QuestPanelProps) {
  const actives    = quetes.filter((q) => q.statut === "active");
  const accomplies = quetes.filter((q) => q.statut === "accomplie");

  return (
    <Panel
      title={nomIle ? `Quêtes de ${nomIle}` : "Quêtes de l'île"}
      icon="🎯"
      titleRight={
        <span
          className="text-[8px] text-gold/60"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          {actives.length} active{actives.length > 1 ? "s" : ""}
        </span>
      }
    >
      {quetes.length === 0 ? (
        <p
          className="text-[10px] text-cream-muted/40 text-center py-3"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Aucune quête pour cette île
        </p>
      ) : (
        <>
          {actives.map((q) => <QuestCard key={q.id} quest={q} />)}
          {accomplies.map((q) => (
            <div key={q.id} className="opacity-50">
              <QuestCard quest={q} />
            </div>
          ))}
        </>
      )}
    </Panel>
  );
}
