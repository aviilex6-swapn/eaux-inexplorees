import Link from "next/link";
import { notFound } from "next/navigation";
import { getIslands, getIslandById, getQuetes } from "@/lib/sheet";
import { ISLAND_STATUS, RESOURCE_META } from "@/lib/config";

export const revalidate = 60;

export async function generateStaticParams() {
  const islands = await getIslands();
  return islands.map((il) => ({ id: il.id }));
}

// ─── Theme palette ────────────────────────────────────────────────────────────
const THEME_BG: Record<string, string> = {
  tutoriel: "radial-gradient(ellipse at 20% 40%, rgba(22,101,52,0.35) 0%, transparent 65%)",
  food:     "radial-gradient(ellipse at 20% 40%, rgba(194,65,12,0.35) 0%, transparent 65%)",
  geek:     "radial-gradient(ellipse at 20% 40%, rgba(29,78,216,0.35) 0%, transparent 65%)",
  nature:   "radial-gradient(ellipse at 20% 40%, rgba(20,83,45,0.35) 0%, transparent 65%)",
  mystere:  "radial-gradient(ellipse at 20% 40%, rgba(88,28,135,0.35) 0%, transparent 65%)",
  default:  "radial-gradient(ellipse at 20% 40%, rgba(30,58,138,0.25) 0%, transparent 65%)",
};

const THEME_ACCENT: Record<string, string> = {
  tutoriel: "#22c55e",
  food:     "#f97316",
  geek:     "#60a5fa",
  nature:   "#4ade80",
  mystere:  "#a855f7",
  default:  "#E8A838",
};

function themeKey(theme: string): string {
  const t = theme.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t.includes("tuto"))   return "tutoriel";
  if (t.includes("food"))   return "food";
  if (t.includes("geek") || t.includes("tech")) return "geek";
  if (t.includes("natur"))  return "nature";
  if (t.includes("myst"))   return "mystere";
  return "default";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RewardPill({
  emoji, label, value, color,
}: {
  emoji: string; label: string; value: number; color: string;
}) {
  if (!value) return null;
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}12` }}
    >
      <span className="text-base">{emoji}</span>
      <div>
        <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color, fontFamily: "'Press Start 2P', monospace" }}>
          +{value}
        </p>
        <p className="text-[7px] text-cream-muted/60 uppercase tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

interface PageProps {
  params: { id: string };
}

export default async function IlePage({ params }: PageProps) {
  const [island, allIslands, { data: allQuetes }] = await Promise.all([
    getIslandById(params.id),
    getIslands(),
    getQuetes(),
  ]);

  if (!island) notFound();

  const sorted = [...allIslands].sort((a, b) => a.ordre - b.ordre);
  const idx    = sorted.findIndex((il) => il.id === island.id);
  const prev   = idx > 0                  ? sorted[idx - 1] : null;
  const next   = idx < sorted.length - 1  ? sorted[idx + 1] : null;

  const statusMeta  = ISLAND_STATUS[island.statut];
  const isLocked    = island.statut === "locked";
  const tk          = themeKey(island.theme);
  const accentColor = THEME_ACCENT[tk];
  const bgGradient  = THEME_BG[tk];

  // Quêtes for this island (active only shown on active island, all shown otherwise)
  const islandQuetes = allQuetes.filter((q) =>
    q.ile_id === island.id || q.ile_id === params.id
  );
  const activeQuetes    = islandQuetes.filter((q) => q.statut === "active");
  const completedQuetes = islandQuetes.filter((q) => q.statut === "accomplie");

  return (
    <div className="min-h-screen" style={{ background: "#0f1923" }}>
      {/* Full-page theme glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: bgGradient, zIndex: 0 }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: "rgba(15,25,35,0.85)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
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
          <span className="text-sm">{isLocked ? "🌫️" : island.emoji}</span>
          <span
            className="text-xs font-bold truncate"
            style={{ fontFamily: "'Cinzel', serif", color: accentColor }}
          >
            {isLocked ? "Île mystérieuse" : island.nom}
          </span>
          {island.theme && (
            <span
              className="ml-auto text-[7px] uppercase tracking-widest px-2 py-1 rounded border"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                color: accentColor,
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}12`,
              }}
            >
              {island.theme}
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">

        {/* Hero */}
        <div
          className="rounded-[10px] border p-8 mb-6 relative overflow-hidden"
          style={{ background: "rgba(0,0,0,0.5)", borderColor: `${accentColor}30` }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: `radial-gradient(ellipse at 30% 50%, ${accentColor} 0%, transparent 65%)` }}
          />
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4 flex-wrap">
              <span className="text-5xl">{isLocked ? "🌫️" : island.emoji}</span>
              <div>
                {/* Status badge */}
                <span
                  className="text-[7px] uppercase tracking-widest px-2 py-1 rounded-full border mr-2"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: statusMeta.color,
                    borderColor: `${statusMeta.color}50`,
                    backgroundColor: `${statusMeta.color}15`,
                  }}
                >
                  {statusMeta.label}
                </span>
                <h1
                  className="text-2xl md:text-3xl font-bold mt-2"
                  style={{ fontFamily: "'Cinzel', serif", color: accentColor }}
                >
                  {isLocked ? "Île Inconnue" : island.nom}
                </h1>
                <p
                  className="text-[8px] uppercase tracking-widest mt-1"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
                >
                  Île #{island.ordre} · {island.x.toFixed(0)}°N {island.y.toFixed(0)}°O
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "rgba(240,228,200,0.75)", fontFamily: "'Cinzel', serif" }}>
              {isLocked
                ? "Ces eaux restent voilées par les brumes du destin. Continuez votre voyage pour lever le mystère..."
                : island.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Challenge */}
          <div
            className="rounded-[10px] border p-5"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span>⚔️</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
              >
                Défi de l&apos;Île
              </span>
            </div>
            {isLocked ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">🔒</p>
                <p
                  className="text-[8px] uppercase tracking-widest"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.25)" }}
                >
                  {"Défi non révélé"}
                </p>
              </div>
            ) : (
              <div
                className="p-4 rounded-xl border"
                style={{ borderColor: `${accentColor}25`, backgroundColor: `${accentColor}08` }}
              >
                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.9)" }}>
                  {island.defi}
                </p>
              </div>
            )}
          </div>

          {/* Rewards */}
          <div
            className="rounded-[10px] border p-5"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span>🎁</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
              >
                Récompenses
              </span>
            </div>
            {isLocked ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">❓</p>
                <p
                  className="text-[8px] uppercase tracking-widest"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.25)" }}
                >
                  Mystères cachés...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <RewardPill emoji={RESOURCE_META.vent.emoji}     label={RESOURCE_META.vent.label}     value={island.recompense_vent}     color={RESOURCE_META.vent.color}     />
                  <RewardPill emoji={RESOURCE_META.or.emoji}       label={RESOURCE_META.or.label}       value={island.recompense_or}       color={RESOURCE_META.or.color}       />
                  <RewardPill emoji={RESOURCE_META.bois.emoji}     label={RESOURCE_META.bois.label}     value={island.recompense_bois}     color={RESOURCE_META.bois.color}     />
                  <RewardPill emoji={RESOURCE_META.boussole.emoji} label={RESOURCE_META.boussole.label} value={island.recompense_boussole} color={RESOURCE_META.boussole.color} />
                </div>
                {island.recompense_texte && (
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                    style={{ borderColor: "rgba(232,168,56,0.25)", backgroundColor: "rgba(232,168,56,0.06)" }}
                  >
                    <span>🏆</span>
                    <div>
                      <p
                        className="text-[7px] uppercase tracking-widest"
                        style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
                      >
                        Récompense spéciale
                      </p>
                      <p className="text-xs mt-0.5" style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}>
                        {island.recompense_texte}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mécanique spéciale */}
        {!isLocked && island.mecanique_speciale && (
          <div
            className="rounded-[10px] border p-5 mb-5"
            style={{
              background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(0,0,0,0.4) 100%)`,
              borderColor: `${accentColor}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span>⚙️</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: accentColor }}
              >
                Mécanique Spéciale
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.8)" }}>
              {island.mecanique_speciale}
            </p>
          </div>
        )}

        {/* Quêtes de cette île */}
        {!isLocked && islandQuetes.length > 0 && (
          <div
            className="rounded-[10px] border p-5 mb-5"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span>📜</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
              >
                Quêtes de cette île
              </span>
              <span
                className="ml-auto text-[7px] px-1.5 py-0.5 rounded"
                style={{ fontFamily: "'Press Start 2P', monospace", background: "rgba(232,168,56,0.15)", color: "#E8A838" }}
              >
                {activeQuetes.length} actives
              </span>
            </div>

            <div className="space-y-3">
              {[...activeQuetes, ...completedQuetes].map((q) => {
                const pct = q.valeur_max ? Math.min(100, Math.round(((q.valeur_actuelle ?? 0) / q.valeur_max) * 100)) : null;
                const isAccomplie = q.statut === "accomplie";
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg border"
                    style={{
                      borderColor: isAccomplie ? "rgba(45,147,108,0.3)" : "rgba(232,168,56,0.15)",
                      backgroundColor: isAccomplie ? "rgba(45,147,108,0.06)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{isAccomplie ? "✅" : "📋"}</span>
                          <span
                            className="text-xs font-bold"
                            style={{
                              fontFamily: "'Cinzel', serif",
                              color: isAccomplie ? "#2D936C" : "rgba(240,228,200,0.9)",
                            }}
                          >
                            {q.titre}
                          </span>
                        </div>
                        <p className="text-xs leading-snug" style={{ color: "rgba(240,228,200,0.5)", fontFamily: "'Cinzel', serif" }}>
                          {q.description}
                        </p>
                      </div>
                      {q.responsable && (
                        <span
                          className="text-[7px] uppercase tracking-widest flex-shrink-0"
                          style={{ fontFamily: "'Press Start 2P', monospace", color: accentColor }}
                        >
                          {q.responsable}
                        </span>
                      )}
                    </div>
                    {pct !== null && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[7px]" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.3)" }}>
                            Progression
                          </span>
                          <span className="text-[7px]" style={{ fontFamily: "'Press Start 2P', monospace", color: accentColor }}>
                            {q.valeur_actuelle}/{q.valeur_max}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: isAccomplie
                                ? "linear-gradient(90deg, #2D936C, #4ade80)"
                                : `linear-gradient(90deg, ${accentColor}, ${accentColor}bb)`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {q.recompense && (
                      <p
                        className="mt-2 text-[7px] uppercase tracking-widest"
                        style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(232,168,56,0.6)" }}
                      >
                        Récompense : {q.recompense}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Route maritime */}
        <div
          className="rounded-[10px] border p-5 mb-6"
          style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span>🧭</span>
            <span
              className="text-[9px] uppercase tracking-[2px]"
              style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
            >
              Route Maritime
            </span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {sorted.map((il, i) => {
              const isCurrent = il.id === island.id;
              const colors: Record<string, string> = { completed: "#2D936C", active: "#E8A838", locked: "#334155", danger: "#E84838" };
              const c = colors[il.statut] ?? "#334155";
              return (
                <div key={il.id} className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    href={il.statut !== "locked" ? `/ile/${il.id}` : "#"}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-200"
                      style={{
                        borderColor: isCurrent ? "#E8A838" : `${c}60`,
                        backgroundColor: `${c}15`,
                        transform: isCurrent ? "scale(1.25)" : undefined,
                        boxShadow: isCurrent ? "0 0 12px rgba(232,168,56,0.5)" : undefined,
                      }}
                    >
                      {il.emoji && il.statut !== "locked" ? il.emoji : il.statut === "completed" ? "✓" : il.statut === "active" ? "⚡" : "🔒"}
                    </div>
                    <span
                      className="text-[7px] max-w-[64px] text-center leading-tight uppercase tracking-wide"
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        color: isCurrent ? "#E8A838" : il.statut === "locked" ? "rgba(240,228,200,0.2)" : "rgba(240,228,200,0.5)",
                      }}
                    >
                      {il.nom}
                    </span>
                  </Link>
                  {i < sorted.length - 1 && (
                    <div
                      className="w-6 h-px flex-shrink-0"
                      style={{ backgroundColor: il.statut === "completed" ? "rgba(45,147,108,0.5)" : "rgba(255,255,255,0.1)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex gap-3">
          {prev ? (
            <Link
              href={`/ile/${prev.id}`}
              className="flex-1 rounded-[10px] border p-3 flex items-center gap-2 transition-all hover:border-gold/30"
              style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
            >
              <span style={{ color: "#E8A838" }}>←</span>
              <div>
                <p className="text-[7px] uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}>
                  Île précédente
                </p>
                <p className="text-xs mt-0.5" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.85)" }}>
                  {prev.nom}
                </p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          <Link
            href="/"
            className="rounded-[10px] border px-4 flex items-center justify-center transition-all hover:border-gold/30"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
          >
            <span className="text-xl">🗺️</span>
          </Link>

          {next ? (
            <Link
              href={`/ile/${next.id}`}
              className="flex-1 rounded-[10px] border p-3 flex items-center justify-end gap-2 transition-all hover:border-gold/30"
              style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
            >
              <div className="text-right">
                <p className="text-[7px] uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}>
                  Île suivante
                </p>
                <p className="text-xs mt-0.5" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.85)" }}>
                  {next.nom}
                </p>
              </div>
              <span style={{ color: "#E8A838" }}>→</span>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </main>
    </div>
  );
}
