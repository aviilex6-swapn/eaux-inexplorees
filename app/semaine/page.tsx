import Link from "next/link";
import { getEtatVoyage, getKpis, getScoresHebdo } from "@/lib/sheet";
import { RESOURCE_META } from "@/lib/config";
import type { KPI, ScoresBinome } from "@/lib/types";

export const revalidate = 60;

const RESOURCES = ["vent", "or", "bois", "boussole"] as const;

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span>{icon}</span>
      <span
        className="text-[9px] uppercase tracking-[2px]"
        style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
      >
        {label}
      </span>
    </div>
  );
}

export default async function SemainePage() {
  const [etat, kpisResult, scoresResult] = await Promise.all([
    getEtatVoyage(),
    getKpis(),
    getScoresHebdo(),
  ]);

  const kpis: KPI[] = kpisResult.data;
  const scores: ScoresBinome[] = scoresResult.data;

  const progressPct =
    etat.seuil_passage > 0
      ? Math.min(100, Math.round((etat.score_actuel / etat.seuil_passage) * 100))
      : 0;



  const kpisVideo = kpis.filter((k) => k.binome === "Binôme Vidéo");
  const kpis360   = kpis.filter((k) => k.binome === "Binôme 360°");

  const dateMareeDisplay = etat.date_maree
    ? new Date(`${etat.date_maree}T09:00:00`).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  return (
    <div className="min-h-screen" style={{ background: "#0f1923" }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(232,168,56,0.10) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      {/* Sticky header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(15,25,35,0.88)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: "rgba(240,228,200,0.6)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            ← Carte
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <span
            className="text-xs font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
          >
            Semaine {etat.semaine}
          </span>
          <span
            className="ml-auto text-[7px] uppercase tracking-widest hidden sm:block"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: "rgba(240,228,200,0.3)",
            }}
          >
            Marée · {dateMareeDisplay}
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5 py-8">

        {/* ── 1. Titre ─────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div
            className="inline-block text-[8px] uppercase tracking-[2px] px-3 py-1.5 rounded mb-3"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              background: "rgba(232,168,56,0.12)",
              color: "#E8A838",
            }}
          >
            Semaine {etat.semaine}
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: "#f0e4c8" }}
          >
            {etat.ile_en_cours_emoji} {etat.ile_en_cours_nom}
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.5)" }}
          >
            Prochaine marée — {dateMareeDisplay}
          </p>
        </div>

        {/* ── 2. Scores hebdo ──────────────────────────────────────────────── */}
        {scores.length > 0 && (
          <section className="mb-10">
            <SectionLabel icon="⚓" label="Scores hebdomadaires" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {scores.slice(0, 2).map((binome) => (
                <div
                  key={binome.nom}
                  className="rounded-[10px] border p-5"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    borderColor: "rgba(232,168,56,0.15)",
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2
                      className="text-sm font-bold"
                      style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                    >
                      {binome.nom}
                    </h2>
                    <span
                      className="text-[8px] px-2 py-1 rounded"
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        background: "rgba(232,168,56,0.12)",
                        color: "#E8A838",
                      }}
                    >
                      {binome.total} pts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {RESOURCES.map((key) => {
                      const meta = RESOURCE_META[key];
                      const pct = Math.round((binome[key] / 20) * 100);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm leading-none">{meta.emoji}</span>
                              <span
                                className="text-[8px] uppercase tracking-wide"
                                style={{
                                  fontFamily: "'Press Start 2P', monospace",
                                  color: "rgba(240,228,200,0.5)",
                                }}
                              >
                                {meta.label}
                              </span>
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums"
                              style={{ fontFamily: "'Cinzel', serif", color: meta.color }}
                            >
                              {binome[key]}
                            </span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: meta.color,
                                boxShadow: `0 0 6px ${meta.color}60`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 3. KPIs par binôme ───────────────────────────────────────────── */}
        {(kpisVideo.length > 0 || kpis360.length > 0) && (
          <section className="mb-10">
            <SectionLabel icon="📊" label="KPIs de la semaine" />
            <div className="space-y-5">

              {/* Binôme Vidéo — colonnes LEC + Swapn + Total */}
              {kpisVideo.length > 0 && (
                <div
                  className="rounded-[10px] border p-5"
                  style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
                >
                  <h3
                    className="text-sm font-bold mb-4"
                    style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                  >
                    📹 Binôme Vidéo
                  </h3>
                  {/* Header */}
                  <div
                    className="grid gap-3 mb-1 pb-2 text-right"
                    style={{
                      gridTemplateColumns: "1fr repeat(3, 5rem)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {["KPI", "Obj. LEC", "Obj. Swapn", "Total"].map((h, i) => (
                      <span
                        key={h}
                        className={`text-[6px] uppercase tracking-wider ${i === 0 ? "text-left" : ""}`}
                        style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.35)" }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  {/* Rows */}
                  {kpisVideo.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="grid gap-3 py-2 text-right"
                      style={{
                        gridTemplateColumns: "1fr repeat(3, 5rem)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span
                        className="text-xs text-left truncate"
                        style={{ fontFamily: "'Cinzel', serif", color: "#f0e4c8" }}
                      >
                        {kpi.nom}
                      </span>
                      <span
                        className="text-xs tabular-nums"
                        style={{ fontFamily: "'Cinzel', serif", color: "#7EC8E3" }}
                      >
                        {kpi.objectif_lec ?? "—"}
                      </span>
                      <span
                        className="text-xs tabular-nums"
                        style={{ fontFamily: "'Cinzel', serif", color: "#7EC8E3" }}
                      >
                        {kpi.objectif_swapn ?? "—"}
                      </span>
                      <span
                        className="text-xs tabular-nums font-bold"
                        style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                      >
                        {kpi.total_combine ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Binôme 360° — colonne LEC uniquement */}
              {kpis360.length > 0 && (
                <div
                  className="rounded-[10px] border p-5"
                  style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
                >
                  <h3
                    className="text-sm font-bold mb-4"
                    style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                  >
                    🔄 Binôme 360°
                  </h3>
                  {/* Header */}
                  <div
                    className="grid gap-3 mb-1 pb-2"
                    style={{
                      gridTemplateColumns: "1fr 5rem",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {["KPI", "Obj. LEC"].map((h, i) => (
                      <span
                        key={h}
                        className={`text-[6px] uppercase tracking-wider ${i === 1 ? "text-right" : ""}`}
                        style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.35)" }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  {/* Rows */}
                  {kpis360.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="grid gap-3 py-2"
                      style={{
                        gridTemplateColumns: "1fr 5rem",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span
                        className="text-xs truncate"
                        style={{ fontFamily: "'Cinzel', serif", color: "#f0e4c8" }}
                      >
                        {kpi.nom}
                      </span>
                      <span
                        className="text-xs tabular-nums text-right"
                        style={{ fontFamily: "'Cinzel', serif", color: "#7EC8E3" }}
                      >
                        {kpi.objectif_lec ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>
        )}

        {/* ── 4. Progression de l'île ──────────────────────────────────────── */}
        <section className="mb-10">
          <SectionLabel icon="🗺️" label="Progression de l'île" />
          <div
            className="rounded-[10px] border p-6"
            style={{
              background: "rgba(0,0,0,0.4)",
              borderColor: "rgba(232,168,56,0.15)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Cinzel', serif", color: "#f0e4c8" }}
                >
                  {etat.ile_en_cours_emoji} {etat.ile_en_cours_nom}
                </h2>
                {etat.ile_en_cours_theme && (
                  <p
                    className="mt-0.5 text-[8px] uppercase tracking-widest"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      color: "rgba(240,228,200,0.4)",
                    }}
                  >
                    Thème : {etat.ile_en_cours_theme}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div>
                  <span
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                  >
                    {etat.score_actuel}
                  </span>
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.4)" }}
                  >
                    {" "}
                    / {etat.seuil_passage}
                  </span>
                </div>
                <p
                  className="text-[7px] uppercase tracking-widest mt-0.5"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: "rgba(240,228,200,0.3)",
                  }}
                >
                  Seuil de passage
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative mb-2">
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #2D936C, #E8A838)",
                    boxShadow: "0 0 12px rgba(232,168,56,0.4)",
                  }}
                />
              </div>
              {/* Threshold marker */}
              <div
                className="absolute top-0 right-0 h-4 w-0.5 rounded-full"
                style={{ background: "rgba(232,168,56,0.6)" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-[7px] uppercase tracking-widest"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: "rgba(240,228,200,0.25)",
                }}
              >
                0
              </span>
              <span
                className="text-[9px] font-bold"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: progressPct >= 100 ? "#2D936C" : "#E8A838",
                }}
              >
                {progressPct}%
              </span>
              <span
                className="text-[7px] uppercase tracking-widest"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: "rgba(240,228,200,0.25)",
                }}
              >
                {etat.seuil_passage}
              </span>
            </div>

            {etat.prochaine_ile_nom && (
              <div
                className="mt-5 pt-4 flex items-center gap-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span
                  className="text-[7px] uppercase tracking-widest"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: "rgba(240,228,200,0.3)",
                  }}
                >
                  Prochaine île :
                </span>
                <span
                  className="text-sm"
                  style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.6)" }}
                >
                  {etat.prochaine_ile_nom}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Back to map */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-bold text-sm transition-all duration-200"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#E8A838",
              borderColor: "rgba(232,168,56,0.3)",
              background: "rgba(232,168,56,0.08)",
            }}
          >
            <span>🗺️</span> Retour à la Carte
          </Link>
        </div>
      </main>
    </div>
  );
}
