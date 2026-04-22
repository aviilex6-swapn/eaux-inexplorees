import { Panel } from "./Panel";
import type { EtatVoyage, KPI, ScoresBinome } from "@/lib/types";
import { RESOURCE_META } from "@/lib/config";

interface WeekPanelProps {
  etatVoyage: EtatVoyage;
  kpis: KPI[];
  scores: ScoresBinome[];
}

const RESOURCES = ["vent", "or", "bois", "boussole"] as const;

const TENDANCE_ICON = { up: "↑", down: "↓", stable: "→" } as const;
const TENDANCE_COLOR = { up: "#2D936C", down: "#E84838", stable: "#7EC8E3" } as const;

export function WeekPanel({ etatVoyage, kpis, scores }: WeekPanelProps) {
  const progressPct =
    etatVoyage.seuil_passage > 0
      ? Math.min(100, Math.round((etatVoyage.score_actuel / etatVoyage.seuil_passage) * 100))
      : 0;

  // Per-resource max across all binômes — makes bars relative to each other
  const resourceMax = RESOURCES.reduce(
    (acc, key) => ({ ...acc, [key]: Math.max(...scores.map((s) => s[key]), 1) }),
    {} as Record<(typeof RESOURCES)[number], number>
  );

  return (
    <Panel title="Semaine en cours" icon="📅">

      {/* ── 1. Progression de l'île ────────────────────────────────────── */}
      <div className="mb-4">
        <div
          className="text-[8px] uppercase tracking-[1.5px] mb-2"
          style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
        >
          Progression de l&apos;île
        </div>

        <div className="flex justify-between items-baseline mb-1.5">
          <span
            className="text-[11px] font-bold truncate mr-2"
            style={{ fontFamily: "'Cinzel', serif", color: "#f0e4c8" }}
          >
            {etatVoyage.ile_en_cours_emoji} {etatVoyage.ile_en_cours_nom}
          </span>
          <span
            className="text-[8px] flex-shrink-0"
            style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
          >
            {etatVoyage.score_actuel} / {etatVoyage.seuil_passage}
          </span>
        </div>

        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full bar-animate"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #2D936C, #E8A838)",
              boxShadow: "0 0 8px rgba(232,168,56,0.4)",
            }}
          />
        </div>

        <div
          className="text-right mt-1 text-[7px]"
          style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.3)" }}
        >
          {progressPct}%
        </div>
      </div>

      {/* ── 2. Scores hebdo ────────────────────────────────────────────── */}
      {scores.length > 0 && (
        <div
          className="mb-4 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="text-[8px] uppercase tracking-[1.5px] mb-2"
            style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
          >
            Scores hebdo
          </div>

          <div className="grid grid-cols-2 gap-2">
            {scores.slice(0, 2).map((binome) => (
              <div
                key={binome.nom}
                className="rounded-md p-2 border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="text-[7px] uppercase tracking-[0.5px] mb-2 truncate"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838", opacity: 0.8 }}
                >
                  {binome.nom}
                </div>

                <div className="space-y-1.5">
                  {RESOURCES.map((key) => {
                    const meta = RESOURCE_META[key];
                    const pct = Math.round((binome[key] / resourceMax[key]) * 100);
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="text-[10px] leading-none w-4 text-center">{meta.emoji}</span>
                        <div
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                          <div
                            className="h-full rounded-full bar-animate"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <span
                          className="text-[8px] w-5 text-right tabular-nums leading-none"
                          style={{ color: meta.color, fontFamily: "'Cinzel', serif" }}
                        >
                          {binome[key]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="mt-2 pt-1.5 text-right text-[7px]"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: "'Press Start 2P', monospace",
                    color: "rgba(232,168,56,0.6)",
                  }}
                >
                  {binome.total} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. KPIs ────────────────────────────────────────────────────── */}
      {kpis.length > 0 && (
        <div
          className="pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="text-[8px] uppercase tracking-[1.5px] mb-2.5"
            style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
          >
            KPIs
          </div>

          <div className="space-y-3">
            {kpis.map((kpi) => {
              const pct = kpi.cible > 0 ? Math.min(100, Math.round((kpi.valeur / kpi.cible) * 100)) : 0;
              const barColor = pct >= 100 ? "#2D936C" : pct >= 70 ? "#E8A838" : "#7EC8E3";

              return (
                <div key={kpi.id}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="text-[10px] truncate"
                        style={{ fontFamily: "'Cinzel', serif", color: "#f0e4c8" }}
                      >
                        {kpi.nom}
                      </span>
                      <span
                        className="text-[9px] font-bold flex-shrink-0"
                        style={{ color: TENDANCE_COLOR[kpi.tendance] }}
                      >
                        {TENDANCE_ICON[kpi.tendance]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {kpi.responsable && (
                        <span
                          className="text-[6px] px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(232,168,56,0.12)",
                            color: "#E8A838",
                            fontFamily: "'Press Start 2P', monospace",
                          }}
                        >
                          {kpi.responsable}
                        </span>
                      )}
                      <span
                        className="text-[8px] tabular-nums"
                        style={{ color: barColor, fontFamily: "'Cinzel', serif" }}
                      >
                        {kpi.valeur}{kpi.unite}
                        <span style={{ color: "rgba(240,228,200,0.3)" }}> / </span>
                        {kpi.cible}{kpi.unite}
                      </span>
                    </div>
                  </div>

                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full bar-animate"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                        boxShadow: `0 0 4px ${barColor}80`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Panel>
  );
}
