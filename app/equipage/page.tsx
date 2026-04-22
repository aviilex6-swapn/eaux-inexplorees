import Image from "next/image";
import Link from "next/link";
import { getEquipage, getShip, getBadges, getModules } from "@/lib/sheet";
import { RESOURCE_META } from "@/lib/config";
import type { Membre } from "@/lib/types";

export const revalidate = 60;

// ─── Ship level ladder ────────────────────────────────────────────────────────
const SHIP_LEVELS = [
  { niveau: 1, nom: "Barque",    emoji: "🚣", desc: "Embarcation de fortune, mais l'équipage est déterminé." },
  { niveau: 2, nom: "Sloop",     emoji: "⛵", desc: "Un voilier agile, parfait pour les premières explorations." },
  { niveau: 3, nom: "Brigantin", emoji: "🛥️", desc: "Navire de commerce rapide avec une bonne capacité de fret." },
  { niveau: 4, nom: "Frégate",   emoji: "🚢", desc: "Navire de guerre puissant, redouté sur toutes les mers." },
  { niveau: 5, nom: "Galion",    emoji: "🏴‍☠️", desc: "Le summum de la navigation. Les mers vous appartiennent." },
];

function getShipLevel(niveau: number) {
  const clamped = Math.min(5, Math.max(1, niveau));
  return SHIP_LEVELS[clamped - 1];
}

// ─── Helper to check module visibility ───────────────────────────────────────
function isVisible(modules: { nom: string; visible: boolean }[], keyword: string): boolean {
  const found = modules.find(
    (m) => m.nom.toLowerCase().includes(keyword.toLowerCase())
  );
  return found ? found.visible : true; // default visible if not configured
}

// ─── XP progress bar ─────────────────────────────────────────────────────────
function XpBar({ xp, xpMax, level }: { xp: number; xpMax: number; level: number }) {
  const pct = xpMax > 0 ? Math.min(100, Math.round((xp / xpMax) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span
          className="text-[7px] uppercase tracking-widest"
          style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(232,168,56,0.6)" }}
        >
          Niv. {level}
        </span>
        <span
          className="text-[7px]"
          style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
        >
          {xp}/{xpMax} XP
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #E8A838, #f0c060)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Contribution pill ────────────────────────────────────────────────────────
function ContribPill({ emoji, value, color }: { emoji: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded"
      style={{ background: `${color}12`, border: `1px solid ${color}25` }}
    >
      <span className="text-xs">{emoji}</span>
      <span
        className="text-[8px] font-bold"
        style={{ fontFamily: "'Press Start 2P', monospace", color }}
      >
        {value}
      </span>
    </div>
  );
}

export default async function EquipagePage() {
  const [{ data: crew }, ship, { data: badges }, { data: modules }] = await Promise.all([
    getEquipage(),
    getShip(),
    getBadges(),
    getModules(),
  ]);

  const captain  = crew.find((m: Membre) => m.role.toLowerCase().includes("capitaine"));
  const matelots = crew.filter((m: Membre) => !m.role.toLowerCase().includes("capitaine"));

  const shipLevelData  = getShipLevel(ship.niveau);
  const nextLevel      = SHIP_LEVELS[Math.min(4, ship.niveau)]; // next or same if maxed
  const xpPct          = ship.xp_max > 0 ? Math.min(100, Math.round((ship.xp / ship.xp_max) * 100)) : 0;

  const unlockedBadges = badges.filter((b) => b.debloque);
  const lockedBadges   = badges.filter((b) => !b.debloque);

  const showStats  = isVisible(modules, "statistiques");
  const showBadges = isVisible(modules, "badge");
  const showLevel  = isVisible(modules, "niveau");

  return (
    <div className="min-h-screen" style={{ background: "#0f1923" }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(232,168,56,0.12) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: "rgba(15,25,35,0.88)", borderColor: "rgba(255,255,255,0.06)" }}
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
          <span className="text-xs font-bold" style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}>
            {"L'Équipage"}
          </span>
          <span
            className="ml-auto text-[7px] uppercase tracking-widest"
            style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.3)" }}
          >
            {ship.nom}
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">

        {/* Ship image banner */}
        <div
          className="rounded-[10px] border mb-6 overflow-hidden relative"
          style={{ borderColor: "rgba(232,168,56,0.2)" }}
        >
          <Image
            src="/images/ship-crew.jpg"
            alt="Le navire et son équipage"
            width={900}
            height={400}
            className="w-full object-cover"
            style={{ imageRendering: "pixelated", maxHeight: "280px" }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(15,25,35,0.9) 0%, rgba(15,25,35,0.1) 50%, transparent 100%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Cinzel', serif", color: "#E8A838", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
            >
              {ship.nom}
            </h1>
            <p
              className="text-[8px] uppercase tracking-widest mt-1"
              style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.5)" }}
            >
              {shipLevelData.emoji} {shipLevelData.nom} · {crew.length} membres
            </p>
          </div>
        </div>

        {/* Global stats */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Niveau moyen",
                value: crew.length > 0
                  ? (crew.reduce((s: number, m: Membre) => s + m.niveau, 0) / crew.length).toFixed(1)
                  : "—",
                color: "#E8A838",
                icon: "⭐",
              },
              {
                label: "XP cumulé",
                value: crew.reduce((s: number, m: Membre) => s + m.xp, 0),
                color: "#7EC8E3",
                icon: "✨",
              },
              {
                label: "Moral",
                value: `${ship.moral}%`,
                color: "#2D936C",
                icon: "❤️",
              },
              {
                label: "Badges",
                value: unlockedBadges.length,
                color: "#D4A574",
                icon: "🏅",
              },
            ].map(({ label, value, color, icon }) => (
              <div
                key={label}
                className="rounded-[10px] border p-3 text-center"
                style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
              >
                <p className="text-lg mb-1">{icon}</p>
                <p
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Cinzel', serif", color }}
                >
                  {value}
                </p>
                <p
                  className="text-[7px] uppercase tracking-widest mt-0.5"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Captain */}
        {captain && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span>⚓</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
              >
                Capitaine
              </span>
            </div>
            <div
              className="rounded-[10px] border p-5"
              style={{
                background: "linear-gradient(135deg, rgba(232,168,56,0.08) 0%, rgba(0,0,0,0.5) 100%)",
                borderColor: "rgba(232,168,56,0.3)",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-16 h-16 flex items-center justify-center rounded-full text-3xl flex-shrink-0 border-2"
                  style={{ background: "rgba(232,168,56,0.15)", borderColor: "rgba(232,168,56,0.4)" }}
                >
                  {captain.humeur}
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                  >
                    {captain.nom}
                  </h2>
                  <p
                    className="text-[8px] uppercase tracking-widest mt-0.5"
                    style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.5)" }}
                  >
                    {captain.role}
                  </p>
                  <p
                    className="text-[8px] mt-1"
                    style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(232,168,56,0.7)" }}
                  >
                    {captain.competence}
                  </p>
                </div>
              </div>

              <XpBar xp={captain.xp} xpMax={captain.xp_max} level={captain.niveau} />

              {(captain.perimetre || captain.marques) && (
                <div
                  className="mt-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {captain.perimetre && (
                    <div>
                      <p className="text-[7px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.3)" }}>
                        Périmètre
                      </p>
                      <p className="text-xs" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.7)" }}>
                        {captain.perimetre}
                      </p>
                    </div>
                  )}
                  {captain.marques && (
                    <div>
                      <p className="text-[7px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.3)" }}>
                        Marques
                      </p>
                      <p className="text-xs" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.7)" }}>
                        {captain.marques}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {captain.contributions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <ContribPill emoji={RESOURCE_META.vent.emoji}     value={captain.contributions.vent}     color={RESOURCE_META.vent.color}     />
                  <ContribPill emoji={RESOURCE_META.or.emoji}       value={captain.contributions.or}       color={RESOURCE_META.or.color}       />
                  <ContribPill emoji={RESOURCE_META.bois.emoji}     value={captain.contributions.bois}     color={RESOURCE_META.bois.color}     />
                  <ContribPill emoji={RESOURCE_META.boussole.emoji} value={captain.contributions.boussole} color={RESOURCE_META.boussole.color} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matelots */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span>👥</span>
            <span
              className="text-[9px] uppercase tracking-[2px]"
              style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
            >
              Matelots
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matelots.map((member: Membre) => (
              <div
                key={member.id}
                className="rounded-[10px] border p-4"
                style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.12)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full text-2xl flex-shrink-0 border"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    {member.humeur}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-semibold"
                      style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.9)" }}
                    >
                      {member.nom}
                    </h3>
                    <p
                      className="text-[7px] uppercase tracking-widest mt-0.5"
                      style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
                    >
                      {member.role}
                    </p>
                  </div>
                </div>

                <XpBar xp={member.xp} xpMax={member.xp_max} level={member.niveau} />

                {member.competence && (
                  <p
                    className="mt-2 text-[8px]"
                    style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(232,168,56,0.6)" }}
                  >
                    {member.competence}
                  </p>
                )}

                {(member.perimetre || member.marques) && (
                  <div
                    className="mt-3 pt-3 space-y-1.5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {member.perimetre && (
                      <div>
                        <p className="text-[6px] uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.25)" }}>
                          Périmètre
                        </p>
                        <p className="text-[11px] leading-snug mt-0.5" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.6)" }}>
                          {member.perimetre}
                        </p>
                      </div>
                    )}
                    {member.marques && (
                      <div>
                        <p className="text-[6px] uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.25)" }}>
                          Marques
                        </p>
                        <p className="text-[11px] leading-snug mt-0.5" style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.6)" }}>
                          {member.marques}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {member.contributions && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <ContribPill emoji={RESOURCE_META.vent.emoji}     value={member.contributions.vent}     color={RESOURCE_META.vent.color}     />
                    <ContribPill emoji={RESOURCE_META.or.emoji}       value={member.contributions.or}       color={RESOURCE_META.or.color}       />
                    <ContribPill emoji={RESOURCE_META.bois.emoji}     value={member.contributions.bois}     color={RESOURCE_META.bois.color}     />
                    <ContribPill emoji={RESOURCE_META.boussole.emoji} value={member.contributions.boussole} color={RESOURCE_META.boussole.color} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Niveau du navire */}
        {showLevel && (
          <div
            className="rounded-[10px] border p-5 mb-6"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span>⛵</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
              >
                Niveau du Navire
              </span>
            </div>

            {/* Current level */}
            <div
              className="flex items-center gap-4 p-4 rounded-xl border mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(232,168,56,0.08) 0%, rgba(0,0,0,0) 100%)",
                borderColor: "rgba(232,168,56,0.25)",
              }}
            >
              <span className="text-4xl">{shipLevelData.emoji}</span>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                >
                  {shipLevelData.nom}
                </h3>
                <p
                  className="text-xs leading-snug mt-0.5"
                  style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.6)" }}
                >
                  {shipLevelData.desc}
                </p>
              </div>
            </div>

            {/* XP progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span
                  className="text-[7px] uppercase tracking-widest"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.4)" }}
                >
                  XP du navire
                </span>
                <span
                  className="text-[7px]"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
                >
                  {ship.xp} / {ship.xp_max}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${xpPct}%`,
                    background: "linear-gradient(90deg, #E8A838, #f0c060)",
                  }}
                />
              </div>
              {ship.niveau < 5 && (
                <p
                  className="mt-2 text-[7px] uppercase tracking-widest"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.3)" }}
                >
                  Prochain niveau : {nextLevel.emoji} {nextLevel.nom}
                </p>
              )}
            </div>

            {/* Level ladder */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SHIP_LEVELS.map((lvl, i) => {
                const reached = ship.niveau >= lvl.niveau;
                const isCurrent = ship.niveau === lvl.niveau;
                return (
                  <div key={lvl.niveau} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all"
                        style={{
                          borderColor: isCurrent ? "#E8A838" : reached ? "rgba(232,168,56,0.3)" : "rgba(255,255,255,0.06)",
                          backgroundColor: isCurrent ? "rgba(232,168,56,0.15)" : reached ? "rgba(232,168,56,0.05)" : "transparent",
                          transform: isCurrent ? "scale(1.2)" : undefined,
                          boxShadow: isCurrent ? "0 0 10px rgba(232,168,56,0.4)" : undefined,
                          opacity: reached ? 1 : 0.3,
                        }}
                      >
                        {lvl.emoji}
                      </div>
                      <span
                        className="text-[6px] uppercase tracking-wide"
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          color: isCurrent ? "#E8A838" : "rgba(240,228,200,0.3)",
                        }}
                      >
                        {lvl.nom}
                      </span>
                    </div>
                    {i < SHIP_LEVELS.length - 1 && (
                      <div
                        className="w-5 h-px"
                        style={{ backgroundColor: reached ? "rgba(232,168,56,0.4)" : "rgba(255,255,255,0.06)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Badges */}
        {showBadges && badges.length > 0 && (
          <div
            className="rounded-[10px] border p-5 mb-8"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(232,168,56,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span>🏅</span>
              <span
                className="text-[9px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Press Start 2P', monospace", color: "#E8A838" }}
              >
                Badges débloqués
              </span>
              <span
                className="ml-auto text-[7px] px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  background: "rgba(232,168,56,0.15)",
                  color: "#E8A838",
                }}
              >
                {unlockedBadges.length}/{badges.length}
              </span>
            </div>

            {unlockedBadges.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-lg border text-center"
                    style={{
                      background: "rgba(232,168,56,0.05)",
                      borderColor: "rgba(232,168,56,0.2)",
                    }}
                  >
                    <p className="text-2xl mb-1">{badge.emoji}</p>
                    <p
                      className="text-xs font-bold"
                      style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
                    >
                      {badge.nom}
                    </p>
                    <p
                      className="text-[10px] leading-snug mt-0.5"
                      style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.5)" }}
                    >
                      {badge.description}
                    </p>
                    {badge.date_deblocage && (
                      <p
                        className="text-[6px] uppercase tracking-widest mt-1"
                        style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.25)" }}
                      >
                        {badge.date_deblocage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {lockedBadges.length > 0 && (
              <>
                <p
                  className="text-[7px] uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.2)" }}
                >
                  Badges verrouillés
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {lockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-2 rounded-lg border text-center opacity-40"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                    >
                      <p className="text-xl mb-0.5 grayscale">🔒</p>
                      <p
                        className="text-[9px]"
                        style={{ fontFamily: "'Cinzel', serif", color: "rgba(240,228,200,0.4)" }}
                      >
                        {badge.nom}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
