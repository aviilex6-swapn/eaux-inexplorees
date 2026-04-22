import { RESOURCE_META, type ResourceKey } from "@/lib/config";

interface ResourceBarProps {
  type: ResourceKey;
  value: number;
  max: number;
  showLabel?: boolean;
}

export function ResourceBar({ type, value, max, showLabel = true }: ResourceBarProps) {
  const meta = RESOURCE_META[type];
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="label-pixel text-cream-muted flex items-center gap-1.5">
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </span>
          <span className="label-pixel" style={{ color: meta.color }}>
            {value}/{max}
          </span>
        </div>
      )}
      <div className="resource-bar">
        <div
          className="resource-bar-fill"
          style={{
            width: `${pct}%`,
            backgroundColor: meta.color,
            boxShadow: `0 0 8px ${meta.color}60`,
          }}
        />
      </div>
    </div>
  );
}

interface ResourcesGridProps {
  vent: number; or: number; bois: number; boussole: number;
  vent_max: number; or_max: number; bois_max: number; boussole_max: number;
}

export function ResourcesGrid(props: ResourcesGridProps) {
  const resources: Array<{ key: ResourceKey; value: number; max: number }> = [
    { key: "vent", value: props.vent, max: props.vent_max },
    { key: "or", value: props.or, max: props.or_max },
    { key: "bois", value: props.bois, max: props.bois_max },
    { key: "boussole", value: props.boussole, max: props.boussole_max },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {resources.map(({ key, value, max }) => (
        <ResourceBar key={key} type={key} value={value} max={max} />
      ))}
    </div>
  );
}
