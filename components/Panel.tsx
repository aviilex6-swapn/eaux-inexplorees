import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  titleRight?: ReactNode;
  noPadding?: boolean;
}

/**
 * Generic panel — matches the reference design:
 * bg rgba(0,0,0,0.4) | border gold/20 | rounded-[10px] | backdrop-blur | p-4
 * Title: Press Start 2P 10px, #E8A838, uppercase, letter-spacing 2px
 */
export function Panel({ title, icon, children, className = "", titleRight, noPadding }: PanelProps) {
  return (
    <div
      className={`rounded-[10px] border backdrop-blur-md ${noPadding ? "" : "p-4"} ${className}`}
      style={{
        background: "rgba(0,0,0,0.4)",
        borderColor: "rgba(232,168,56,0.2)",
      }}
    >
      <div
        className="flex items-center justify-between pb-3 mb-3"
        style={{ borderBottom: "1px solid rgba(232,168,56,0.15)" }}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm leading-none">{icon}</span>}
          <span
            className="text-[10px] uppercase tracking-[2px] text-gold font-pixel"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            {title}
          </span>
        </div>
        {titleRight && <div>{titleRight}</div>}
      </div>
      {noPadding ? children : <div>{children}</div>}
    </div>
  );
}
