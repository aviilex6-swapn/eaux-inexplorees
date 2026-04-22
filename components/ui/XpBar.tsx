interface XpBarProps {
  xp: number;
  xpMax: number;
  level: number;
  color?: string;
}

export function XpBar({ xp, xpMax, level, color = "#E8A838" }: XpBarProps) {
  const pct = Math.min(100, Math.round((xp / Math.max(xpMax, 1)) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="label-pixel text-cream-muted">
          NIV. <span style={{ color }} className="text-glow-gold">{level}</span>
        </span>
        <span className="label-pixel text-cream-muted">
          {xp} / {xpMax} XP
        </span>
      </div>
      <div className="xp-bar">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
