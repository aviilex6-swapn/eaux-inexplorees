import { Panel } from "./Panel";
import type { EntreeJournal } from "@/lib/types";

interface JournalPanelProps {
  entries: EntreeJournal[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

export function JournalPanel({ entries }: JournalPanelProps) {
  return (
    <Panel title="Journal de bord" icon="📜">
      {entries.length === 0 ? (
        <p
          className="text-[10px] text-cream-muted/40 text-center py-3"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Aucune entrée dans le journal
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border-l-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderLeftColor: "rgba(232,168,56,0.3)",
              }}
            >
              <div className="flex-1 min-w-0">
                <span
                  className="text-[12px] text-cream-DEFAULT leading-snug"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {entry.contenu}
                </span>
                {entry.auteur && (
                  <span
                    className="text-[8px] text-cream-muted/40 ml-2"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    — {entry.auteur}
                  </span>
                )}
              </div>
              {entry.date && (
                <span
                  className="text-[8px] text-cream-muted/50 flex-shrink-0"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  {formatDate(entry.date)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
