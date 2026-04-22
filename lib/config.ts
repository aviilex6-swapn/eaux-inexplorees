// ─── Sheet URLs (pubhtml format as published by Google Sheets) ───────────────
// Source: Fichier > Partager > Publier sur le web > Feuille > Page web
// NB : les URL pubhtml renvoient du HTML ; on les convertit en CSV côté serveur.

export const SHEET_URLS = {
  equipage:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=1360318487&single=true",
  modules:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=751991954&single=true",
  kpis:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=902234529&single=true",
  scores:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=2108992543&single=true",
  dashboard: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=1202437603&single=true",
  iles:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=885229995&single=true",
  quetes:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=1738919617&single=true",
  // evenements URL was truncated in the original — provide the corrected GID when known
  evenements: "",
  journal:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=351092814&single=true",
  badges:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOSG2VZ86RSLNCXpBpaOp8Q1jRDeNmw1yHytVlzVgQI7TqQi8CVdokaO8QlLmwUA/pubhtml?gid=1325752878&single=true",
} as const;

export type SheetName = keyof typeof SHEET_URLS;

/**
 * Convert a pubhtml URL → pub?output=csv URL.
 * pubhtml : .../pubhtml?gid=XXX&single=true
 * csv     : .../pub?gid=XXX&single=true&output=csv
 */
export function toCsvUrl(pubhtmlUrl: string): string {
  return pubhtmlUrl
    .replace("/pubhtml?", "/pub?")
    .replace("&single=true", "&single=true&output=csv");
}

// Revalidation interval in seconds
export const REVALIDATE_SECONDS = 60;

// ─── Game constants ───────────────────────────────────────────────────────────

export const RESOURCE_META = {
  vent:      { label: "Vent",     color: "#7EC8E3", emoji: "💨", unit: "nœuds"   },
  or:        { label: "Or",       color: "#E8A838", emoji: "🪙", unit: "pièces"  },
  bois:      { label: "Bois",     color: "#D4A574", emoji: "🪵", unit: "planches"},
  boussole:  { label: "Boussole", color: "#2D936C", emoji: "🧭", unit: "pts"     },
} as const;

export type ResourceKey = keyof typeof RESOURCE_META;

export const ISLAND_STATUS = {
  completed: { label: "Conquise", color: "#2D936C" },
  active:    { label: "En cours", color: "#E8A838" },
  locked:    { label: "Voilée",   color: "#4a5568" },
  danger:    { label: "Danger",   color: "#E84838" },
} as const;

export type IslandStatus = keyof typeof ISLAND_STATUS;
