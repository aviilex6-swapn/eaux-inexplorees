import Link from "next/link";
import type { Island, Ship } from "@/lib/types";
import { ISLAND_STATUS } from "@/lib/config";

interface MapCanvasProps {
  islands: Island[];
  ship: Ship;
}

// SVG path connecting islands in order
function SeaRoute({ islands }: { islands: Island[] }) {
  const sorted = [...islands].sort((a, b) => a.ordre - b.ordre);
  if (sorted.length < 2) return null;

  const points = sorted.map((il) => `${il.x},${il.y}`).join(" ");

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker id="arrow" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <polygon points="0 0, 4 2, 0 4" fill="rgba(232,168,56,0.5)" />
        </marker>
      </defs>
      {/* Dashed route line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgba(232,168,56,0.25)"
        strokeWidth="0.4"
        strokeDasharray="1.2 0.8"
      />
      {/* Completed segments brighter */}
      {sorted.slice(0, -1).map((il, i) => {
        const next = sorted[i + 1];
        const done = il.statut === "completed" && next.statut !== "locked";
        return done ? (
          <line
            key={il.id}
            x1={il.x} y1={il.y}
            x2={next.x} y2={next.y}
            stroke="rgba(232,168,56,0.55)"
            strokeWidth="0.5"
            strokeDasharray="1.5 0.6"
          />
        ) : null;
      })}
    </svg>
  );
}

// Ship marker
function ShipMarker({ island }: { island: Island | undefined }) {
  if (!island) return null;
  return (
    <div
      className="island-node z-20"
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
    >
      <div className="animate-float text-2xl drop-shadow-[0_0_12px_rgba(232,168,56,0.8)] select-none pointer-events-none">
        ⛵
      </div>
    </div>
  );
}

// Individual island node
function IslandNode({ island, isCurrent }: { island: Island; isCurrent: boolean }) {
  const meta = ISLAND_STATUS[island.statut];
  const isLocked = island.statut === "locked";

  const sizeClass = isCurrent ? "w-10 h-10" : "w-8 h-8";

  const icons: Record<Island["statut"], string> = {
    completed: "✓",
    active: "⚡",
    locked: "🔒",
    danger: "⚠",
  };

  return (
    <Link
      href={isLocked ? "#" : `/ile/${island.id}`}
      className={`island-node group z-10 ${isLocked ? "cursor-default" : ""}`}
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
      title={island.nom}
    >
      {/* Glow ring */}
      <div
        className={`island-ring absolute inset-0 rounded-full transition-all duration-300 ${
          isCurrent ? "scale-150 opacity-60" : "scale-100 opacity-0 group-hover:opacity-40"
        }`}
        style={{ backgroundColor: meta.color, filter: "blur(8px)" }}
      />

      {/* Island circle */}
      <div
        className={`relative ${sizeClass} rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 group-hover:scale-110`}
        style={{
          backgroundColor: isLocked ? "rgba(17,30,45,0.9)" : `${meta.color}22`,
          borderColor: isLocked ? "rgba(255,255,255,0.1)" : meta.color,
          boxShadow: isLocked ? "none" : `0 0 16px ${meta.color}50`,
          color: isLocked ? "rgba(255,255,255,0.2)" : meta.color,
        }}
      >
        {icons[island.statut]}
      </div>

      {/* Label */}
      <div
        className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30"
        style={{ minWidth: "max-content" }}
      >
        <div className="bg-navy-dark/95 border border-white/10 rounded-lg px-3 py-1.5 shadow-xl">
          <p className="font-cinzel text-[11px] text-gold font-semibold">{island.nom}</p>
          <p className="label-pixel text-cream-muted text-[8px] mt-0.5">{ISLAND_STATUS[island.statut].label}</p>
        </div>
      </div>

      {/* Order number */}
      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-navy-dark border border-white/20 flex items-center justify-center">
        <span className="font-pixel text-[7px] text-cream-muted">{island.ordre}</span>
      </div>
    </Link>
  );
}

export function MapCanvas({ islands, ship }: MapCanvasProps) {
  const currentIsland = islands.find((il) => il.id === ship.ile_actuelle);

  return (
    <div className="relative w-full h-full min-h-[480px] overflow-hidden rounded-panel sea-lines">
      {/* Ocean texture gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-light/30 via-transparent to-navy-deeper/50 pointer-events-none" />

      {/* Grid lines suggesting a nautical chart */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(126,200,227,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(126,200,227,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "10% 10%",
        }}
      />

      {/* Route SVG */}
      <SeaRoute islands={islands} />

      {/* Island nodes */}
      {islands.map((island) => (
        <IslandNode
          key={island.id}
          island={island}
          isCurrent={island.id === ship.ile_actuelle}
        />
      ))}

      {/* Ship */}
      <ShipMarker island={currentIsland} />

      {/* Corner compass rose */}
      <div className="absolute bottom-3 right-3 text-4xl opacity-20 select-none pointer-events-none">
        🧭
      </div>

      {/* Scale label */}
      <div className="absolute bottom-3 left-3">
        <span className="label-pixel text-wind/50 text-[7px]">CARTE DES EAUX INEXPLOREES</span>
      </div>
    </div>
  );
}
