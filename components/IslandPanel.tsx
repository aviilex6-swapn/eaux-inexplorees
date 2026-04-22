import Link from "next/link";
import { Panel } from "./Panel";
import type { EtatVoyage } from "@/lib/types";

interface IslandPanelProps {
  etat: EtatVoyage;
}

export function IslandPanel({ etat }: IslandPanelProps) {
  return (
    <Panel title="Île en cours" icon="🏝️">
      {/* Island identity */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-[50px] h-[50px] rounded-lg flex items-center justify-center text-[26px] flex-shrink-0 border-2"
          style={{
            background: "linear-gradient(135deg, rgba(232,168,56,0.3), rgba(232,168,56,0.1))",
            borderColor: "#E8A838",
          }}
        >
          {etat.ile_en_cours_emoji || "🏝️"}
        </div>
        <div className="min-w-0">
          <div
            className="text-base font-bold text-cream-DEFAULT truncate"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {etat.ile_en_cours_nom}
          </div>
          {etat.ile_en_cours_theme && (
            <div
              className="text-[10px] text-gold/70 uppercase tracking-[1.5px] mt-0.5"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              Thème : {etat.ile_en_cours_theme}
            </div>
          )}
        </div>
      </div>

      {/* Progress toward next island */}
      {etat.seuil_passage > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span
              className="text-[8px] text-cream-muted/60 uppercase tracking-[1px]"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              Progression
            </span>
            <span
              className="text-[8px] text-gold"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              {etat.score_actuel} / {etat.seuil_passage}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((etat.score_actuel / etat.seuil_passage) * 100))}%`,
                background: "linear-gradient(90deg, #2D936C, #E8A838)",
                boxShadow: "0 0 8px rgba(232,168,56,0.4)",
              }}
            />
          </div>
        </div>
      )}

      {/* Special mechanic note */}
      {etat.ile_en_cours_mecanique && (
        <div
          className="rounded-lg p-2.5 text-[10px] leading-relaxed italic"
          style={{
            background: "rgba(232,168,56,0.06)",
            border: "1px dashed rgba(232,168,56,0.25)",
            color: "#c4a080",
            fontFamily: "'Cinzel', serif",
          }}
        >
          {etat.ile_en_cours_mecanique}
        </div>
      )}

      {/* Link to island detail */}
      {etat.ile_en_cours_id && (
        <Link
          href={`/ile/${etat.ile_en_cours_id}`}
          className="mt-3 flex items-center justify-center gap-2 text-[8px] text-gold/60 hover:text-gold transition-colors uppercase tracking-[1.5px] py-1.5"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Voir le défi →
        </Link>
      )}
    </Panel>
  );
}
