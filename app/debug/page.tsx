/**
 * /debug — Server Component qui appelle toutes les fonctions de sheet.ts
 * et affiche les données brutes + la stratégie utilisée.
 * À supprimer ou protéger avant de mettre en production.
 */

import {
  getEquipage, getModules, getKpis,
  getScoresCumules, getEtatVoyage,
  getQuetes, getEvenementActuel,
  getJournal, getBadges,
} from "@/lib/sheet";

export const dynamic = "force-dynamic";

function Section({ title, strategy, error, children }: {
  title: string;
  strategy: string;
  error?: string;
  children: React.ReactNode;
}) {
  const stratColor = {
    csv: "bg-green-900/60 text-green-300 border-green-500/30",
    html: "bg-blue-900/60 text-blue-300 border-blue-500/30",
    mock: "bg-yellow-900/60 text-yellow-300 border-yellow-500/30",
  }[strategy] ?? "bg-gray-800 text-gray-300 border-gray-600";

  return (
    <div className="mb-8 panel p-5">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-cinzel text-gold text-sm font-bold uppercase tracking-widest">{title}</h2>
        <span className={`label-pixel text-[8px] px-2 py-0.5 rounded border ${stratColor}`}>
          {strategy.toUpperCase()}
        </span>
        {error && (
          <span className="label-pixel text-[8px] text-red-400 ml-2 max-w-xs truncate" title={error}>
            ⚠ {error}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table({ rows }: { rows: any[] }) {
  if (!rows.length) return <p className="label-pixel text-cream-muted/40 text-[8px]">— Aucune donnée —</p>;
  const keys = Object.keys(rows[0]).filter((k) => !k.startsWith("_"));
  return (
    <table className="w-full text-[10px] border-collapse">
      <thead>
        <tr>
          {keys.map((k) => (
            <th key={k} className="text-left px-2 py-1 label-pixel text-gold/70 border-b border-white/10 whitespace-nowrap">
              {k}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/3">
            {keys.map((k) => (
              <td key={k} className="px-2 py-1 text-cream-muted font-mono align-top max-w-[200px] truncate">
                {String(row[k] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function DebugPage() {
  const [
    equipage, modules, kpis, scores, etat,
    quetes, evt, journal, badges,
  ] = await Promise.all([
    getEquipage(),
    getModules(),
    getKpis(),
    getScoresCumules(),
    getEtatVoyage(),
    getQuetes(),
    getEvenementActuel(),
    getJournal(),
    getBadges(),
  ]);

  return (
    <div className="min-h-screen sea-lines p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-cinzel text-gold text-2xl font-bold tracking-widest text-glow-gold">
          Debug — Données du Sheet
        </h1>
        <p className="label-pixel text-cream-muted/60 text-[8px] mt-1">
          Page de diagnostic — Server Component — force-dynamic (jamais mis en cache)
        </p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {[
            { label: "CSV", color: "text-green-400" },
            { label: "HTML", color: "text-blue-400" },
            { label: "MOCK", color: "text-yellow-400" },
          ].map(({ label, color }) => (
            <span key={label} className={`label-pixel text-[8px] ${color}`}>■ {label}</span>
          ))}
        </div>
      </div>

      <Section title="Équipage" strategy={equipage.strategy} error={equipage.error}>
        <Table rows={equipage.data} />
      </Section>

      <Section title="Modules" strategy={modules.strategy} error={modules.error}>
        <Table rows={modules.data} />
      </Section>

      <Section title="KPIs" strategy={kpis.strategy} error={kpis.error}>
        <Table rows={kpis.data} />
      </Section>

      <Section title="Scores cumulés" strategy={scores._strategy} error={scores._error}>
        <Table rows={[{ vent: scores.vent, or: scores.or, bois: scores.bois, boussole: scores.boussole, total: scores.total }]} />
      </Section>

      <Section title="État du voyage" strategy={etat._strategy} error={etat._error}>
        <Table rows={[{
          semaine: etat.semaine,
          ile_en_cours: etat.ile_en_cours_nom,
          prochaine_ile: etat.prochaine_ile_nom,
          seuil: etat.seuil_passage,
          score: etat.score_actuel,
        }]} />
      </Section>

      <Section title="Quêtes" strategy={quetes.strategy} error={quetes.error}>
        <Table rows={quetes.data} />
      </Section>

      <Section title="Événement actuel" strategy={evt?._strategy ?? "mock"}>
        {evt
          ? <Table rows={[evt]} />
          : <p className="label-pixel text-cream-muted/40 text-[8px]">— Aucun événement actif —</p>
        }
      </Section>

      <Section title="Journal (5 dernières entrées)" strategy={journal.strategy} error={journal.error}>
        <Table rows={journal.data} />
      </Section>

      <Section title="Badges" strategy={badges.strategy} error={badges.error}>
        <Table rows={badges.data} />
      </Section>

      <div className="mt-8 panel p-4">
        <p className="label-pixel text-cream-muted/50 text-[8px]">
          Route API de diagnostic complet :{" "}
          <a href="/api/test-sheet" className="text-gold hover:underline">/api/test-sheet</a>
        </p>
      </div>
    </div>
  );
}
