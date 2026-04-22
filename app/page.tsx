import {
  getIslands,
  getCrew,
  getModules,
  getScoresCumules,
  getEtatVoyage,
  getQuetes,
  getEvenementActuel,
  getJournal,
} from "@/lib/sheet";

import { Header }       from "@/components/Header";
import { MapView }      from "@/components/MapView";
import { IslandPanel }  from "@/components/IslandPanel";
import { ResourcePanel } from "@/components/ResourcePanel";
import { Countdown }    from "@/components/Countdown";
import { Panel }        from "@/components/Panel";
import { ShipPanel }    from "@/components/ShipPanel";
import { EventPanel }   from "@/components/EventPanel";
import { QuestPanel }   from "@/components/QuestPanel";
import { JournalPanel } from "@/components/JournalPanel";

export const revalidate = 60;

export default async function HomePage() {
  // ── Fetch all data in parallel ──────────────────────────────────────────
  const [
    islands, crew, modulesResult, scores, etat,
    quetesResult, eventActuel, journalResult,
  ] = await Promise.all([
    getIslands(),
    getCrew(),
    getModules(),
    getScoresCumules(),
    getEtatVoyage(),
    getQuetes(),
    getEvenementActuel(),
    getJournal(),
  ]);

  const modules     = modulesResult.data;
  const quetes      = quetesResult.data;
  const journal     = journalResult.data;

  // ── Module visibility helpers ─────────────────────────────────────────────
  function isModuleVisible(id: string): boolean {
    if (modules.length === 0) return true; // show all if modules not loaded
    const mod = modules.find(
      (m) => m.id.toLowerCase() === id.toLowerCase() || m.nom.toLowerCase().includes(id.toLowerCase())
    );
    return mod ? mod.visible : true;
  }

  const showQuetes     = isModuleVisible("quetes");
  const showJournal    = isModuleVisible("journal");
  const showEvenements = isModuleVisible("evenements");

  // Countdown target — next Monday at 9h if not specified in sheet
  const countdownTarget = etat.date_maree
    ? `${etat.date_maree}T09:00:00`
    : (() => {
        const d = new Date();
        const daysUntil = d.getDay() === 1 ? 7 : (8 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + daysUntil);
        d.setHours(9, 0, 0, 0);
        return d.toISOString();
      })();

  // Quetes filtered to current island
  const quetesIle = quetes.filter(
    (q) => !q.ile_id || q.ile_id === etat.ile_en_cours_id
  );

  return (
    <div
      className="min-h-screen p-5"
      style={{
        background: "#1a2838",
        backgroundImage: `
          radial-gradient(ellipse at top, #2a3f58 0%, transparent 50%),
          radial-gradient(ellipse at bottom, #0f1a26 0%, transparent 50%)
        `,
        fontFamily: "'Cinzel', serif",
        color: "#f0e4c8",
      }}
    >
      <div
        className="dashboard-grid mx-auto"
        style={{ maxWidth: "1600px" }}
      >
        {/* ══ HEADER (full width) ══════════════════════════════════════════ */}
        <div style={{ gridColumn: "1 / -1" }}>
          <Header
            semaine={etat.semaine}
            dateMaree={etat.date_maree ?? ""}
            nomIleEnCours={etat.ile_en_cours_nom}
          />
        </div>

        {/* ══ MAP (left, column 1) ════════════════════════════════════════ */}
        <div>
          <MapView islands={islands} ileEnCoursId={etat.ile_en_cours_id} />
        </div>

        {/* ══ SIDE PANEL (right, column 2) ════════════════════════════════ */}
        <div className="flex flex-col gap-4">

          {/* 1 — Île en cours */}
          <IslandPanel etat={etat} />

          {/* 2 — Cale du navire */}
          <ResourcePanel scores={scores} />

          {/* 3 — Prochaine marée (countdown) */}
          <Panel title="Prochaine marée" icon="🌊">
            <Countdown targetDate={countdownTarget} />
          </Panel>
        </div>

        {/* ══ BOTTOM GRID (full width, 2 columns) ═════════════════════════ */}
        <div
          style={{ gridColumn: "1 / -1" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* ─ Left: Ship + Crew ─ */}
          <ShipPanel crew={crew} />

          {/* ─ Right: Events + Quests + Journal stacked ─ */}
          <div className="flex flex-col gap-4">
            {showEvenements && (
              <EventPanel event={eventActuel} />
            )}

            {showQuetes && (
              <QuestPanel
                quetes={quetesIle.length > 0 ? quetesIle : quetes}
                nomIle={etat.ile_en_cours_nom}
              />
            )}

            {showJournal && (
              <JournalPanel entries={journal} />
            )}

            {/* Fallback if all modules hidden */}
            {!showEvenements && !showQuetes && !showJournal && (
              <Panel title="Modules" icon="⚙️">
                <p
                  className="text-[10px] text-cream-muted/40 text-center py-4"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Tous les panneaux sont masqués via la config modules.
                </p>
              </Panel>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <p
          className="text-[7px] uppercase tracking-[2px]"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: "rgba(240,228,200,0.2)",
          }}
        >
          Eaux Inexplorees · Saison I · Revalidation 60s ·{" "}
          <a href="/debug" className="hover:opacity-60 transition-opacity">debug</a>
          {" "}·{" "}
          <a href="/api/test-sheet" className="hover:opacity-60 transition-opacity">diagnostic</a>
        </p>
      </div>
    </div>
  );
}
