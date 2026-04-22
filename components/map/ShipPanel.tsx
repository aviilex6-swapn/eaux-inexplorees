import type { Ship, Island } from "@/lib/types";
import { XpBar } from "@/components/ui/XpBar";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface ShipPanelProps {
  ship: Ship;
  currentIsland?: Island;
  nextIsland?: Island;
}

export function ShipPanel({ ship, currentIsland, nextIsland }: ShipPanelProps) {
  const moralColor =
    ship.moral >= 80 ? "#2D936C" : ship.moral >= 50 ? "#E8A838" : "#E84838";

  return (
    <div>
      <SectionHeader title="Le Navire" icon="⛵" />

      {/* Ship name and level */}
      <div className="panel p-4 mb-3 bg-gradient-to-br from-gold/8 to-transparent border-gold/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl animate-float">⛵</div>
          <div>
            <h3 className="font-cinzel text-gold text-sm font-bold tracking-wider">
              {ship.nom}
            </h3>
            <p className="label-pixel text-cream-muted text-[8px]">Corvette de Classe II</p>
          </div>
        </div>
        <XpBar xp={ship.xp} xpMax={ship.xp_max} level={ship.niveau} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="panel p-2.5 text-center">
          <p className="label-pixel text-cream-muted text-[8px]">VITESSE</p>
          <p className="font-cinzel text-wind text-lg font-bold">{ship.vitesse}</p>
          <p className="label-pixel text-cream-muted/60 text-[7px]">nœuds</p>
        </div>
        <div className="panel p-2.5 text-center">
          <p className="label-pixel text-cream-muted text-[8px]">MORAL</p>
          <p className="font-cinzel text-lg font-bold" style={{ color: moralColor }}>
            {ship.moral}%
          </p>
          <p className="label-pixel text-cream-muted/60 text-[7px]">
            {ship.moral >= 80 ? "Excellent" : ship.moral >= 50 ? "Stable" : "Bas"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="panel p-3 space-y-2">
        <p className="label-pixel text-cream-muted text-[8px] mb-2">NAVIGATION</p>
        {currentIsland && (
          <div className="flex items-center gap-2">
            <span className="text-xs">📍</span>
            <div>
              <p className="label-pixel text-[8px] text-cream-muted">Position actuelle</p>
              <p className="font-cinzel text-cream-DEFAULT text-xs">{currentIsland.nom}</p>
            </div>
          </div>
        )}
        {nextIsland && (
          <div className="flex items-center gap-2">
            <span className="text-xs">🧭</span>
            <div>
              <p className="label-pixel text-[8px] text-cream-muted">Cap mis sur</p>
              <p className="font-cinzel text-gold text-xs">{nextIsland.nom}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
