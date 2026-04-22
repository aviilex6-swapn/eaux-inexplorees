import { ISLAND_STATUS, type IslandStatus } from "@/lib/config";

interface StatusBadgeProps {
  status: IslandStatus;
}

const STATUS_ICONS: Record<IslandStatus, string> = {
  completed: "✓",
  active: "⚡",
  locked: "🔒",
  danger: "⚠",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = ISLAND_STATUS[status];
  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${meta.color}22`,
        color: meta.color,
        border: `1px solid ${meta.color}44`,
      }}
    >
      {STATUS_ICONS[status]} {meta.label}
    </span>
  );
}

interface QuestStatusBadgeProps {
  status: "active" | "completed" | "failed";
}

export function QuestStatusBadge({ status }: QuestStatusBadgeProps) {
  const config = {
    active: { label: "En cours", color: "#E8A838", icon: "⚡" },
    completed: { label: "Accomplie", color: "#2D936C", icon: "✓" },
    failed: { label: "Échouée", color: "#E84838", icon: "✗" },
  }[status];

  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${config.color}22`,
        color: config.color,
        border: `1px solid ${config.color}44`,
      }}
    >
      {config.icon} {config.label}
    </span>
  );
}
