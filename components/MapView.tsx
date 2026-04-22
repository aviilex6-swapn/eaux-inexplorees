import Image from "next/image";
import Link from "next/link";
import type { Island } from "@/lib/types";

interface HotspotProps {
  island: Island;
}

const STATUS_STYLES = {
  completed: {
    ring: "rgba(45,147,108,0.8)",
    bg:   "rgba(45,147,108,0.15)",
    glow: "0 0 20px rgba(45,147,108,0.5)",
    label: "✓",
  },
  active: {
    ring: "rgba(232,168,56,0.8)",
    bg:   "rgba(232,168,56,0.15)",
    glow: "0 0 20px rgba(232,168,56,0.5)",
    label: "⚡",
  },
  locked: {
    ring: "rgba(255,255,255,0.05)",
    bg:   "rgba(0,0,0,0)",
    glow: "none",
    label: "",
  },
  danger: {
    ring: "rgba(232,72,56,0.8)",
    bg:   "rgba(232,72,56,0.15)",
    glow: "0 0 20px rgba(232,72,56,0.5)",
    label: "⚠",
  },
};

function Hotspot({ island }: HotspotProps) {
  const style = STATUS_STYLES[island.statut];
  const isLocked = island.statut === "locked";

  const hotspot = (
    <div
      className="group absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
    >
      {/* Pulsing ring for active island */}
      {island.statut === "active" && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: "rgba(232,168,56,0.4)", margin: "-6px" }}
        />
      )}

      {/* Main hotspot circle */}
      <div
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300 border-2"
        style={{
          borderColor: isLocked ? "rgba(232,168,56,0)" : style.ring,
          backgroundColor: style.bg,
          boxShadow: isLocked ? "none" : style.glow,
        }}
      >
        {!isLocked && <span>{style.label}</span>}
      </div>

      {/* Hover border (always present, becomes visible on hover for locked) */}
      <div
        className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{
          borderColor: "rgba(232,168,56,0.8)",
          backgroundColor: "rgba(232,168,56,0.15)",
          boxShadow: "0 0 20px rgba(232,168,56,0.5)",
          margin: "-2px",
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap"
      >
        <div
          className="rounded-lg px-3 py-2 text-center shadow-xl"
          style={{
            background: "rgba(17,30,45,0.97)",
            border: "1px solid rgba(232,168,56,0.3)",
          }}
        >
          <p
            className="text-[11px] font-semibold text-cream-DEFAULT"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {island.nom}
          </p>
          {isLocked ? (
            <p className="text-[8px] text-cream-muted/40 mt-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Voilée
            </p>
          ) : (
            <p className="text-[8px] text-gold/70 mt-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {island.statut === "completed" ? "Conquise" : island.statut === "active" ? "En cours" : "Danger"}
            </p>
          )}
        </div>
        {/* Arrow */}
        <div
          className="w-2 h-2 rotate-45 mx-auto -mt-1"
          style={{ background: "rgba(17,30,45,0.97)", border: "1px solid rgba(232,168,56,0.3)", borderTop: "none", borderLeft: "none" }}
        />
      </div>
    </div>
  );

  if (isLocked) return hotspot;

  return (
    <Link href={`/ile/${island.id}`} className="contents">
      {hotspot}
    </Link>
  );
}

interface MapViewProps {
  islands: Island[];
  ileEnCoursId: string;
}

export function MapView({ islands, ileEnCoursId }: MapViewProps) {
  const sortedIslands = [...islands].sort((a, b) => a.ordre - b.ordre);

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
    >
      {/* Map image */}
      <Image
        src="/images/map-state-1-depart.jpg"
        alt="Carte de l'archipel des Eaux Inexplorees"
        width={1200}
        height={800}
        className="w-full h-auto block"
        style={{ imageRendering: "pixelated" }}
        priority
      />

      {/* Route lines between completed/active islands (SVG overlay) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {sortedIslands.slice(0, -1).map((il, i) => {
          const next = sortedIslands[i + 1];
          const done = il.statut === "completed";
          return (
            <line
              key={il.id}
              x1={il.x} y1={il.y}
              x2={next.x} y2={next.y}
              stroke={done ? "rgba(232,168,56,0.45)" : "rgba(232,168,56,0.12)"}
              strokeWidth="0.35"
              strokeDasharray={done ? "1.5 0.5" : "0.8 0.8"}
            />
          );
        })}
      </svg>

      {/* Hotspots */}
      {sortedIslands.map((island) => (
        <Hotspot key={island.id} island={island} />
      ))}

      {/* Ship emoji on current island */}
      {(() => {
        const cur = islands.find((il) => il.id === ileEnCoursId);
        if (!cur) return null;
        return (
          <div
            className="absolute pointer-events-none animate-rock"
            style={{
              left: `${cur.x}%`,
              top:  `${cur.y}%`,
              /* transform handled by @keyframes rock — no override here */
              fontSize: "1.75rem",
              filter: "drop-shadow(0 0 8px rgba(232,168,56,0.7))",
            }}
          >
            ⛵
          </div>
        );
      })()}

      {/* Nautical chart overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(126,200,227,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(126,200,227,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "10% 10%",
        }}
      />

      {/* Bottom label */}
      <div className="absolute bottom-2 left-3 pointer-events-none">
        <span
          className="text-[7px] text-wind/40 uppercase tracking-widest"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Carte des Eaux Inexplorees
        </span>
      </div>
    </div>
  );
}
