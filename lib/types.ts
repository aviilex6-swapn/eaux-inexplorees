import type { IslandStatus } from "./config";

// ─── Raw sheet row (before mapping) ──────────────────────────────────────────
export type RawRow = Record<string, string>;

// ─── Fetch metadata ───────────────────────────────────────────────────────────
export type FetchStrategy = "csv" | "html" | "mock";

export interface SheetResult<T> {
  data: T[];
  strategy: FetchStrategy;  // which strategy succeeded
  error?: string;           // set when falling back to mock
}

// ─── Île ─────────────────────────────────────────────────────────────────────
export interface Island {
  id: string;
  nom: string;
  description: string;
  statut: IslandStatus;
  x: number;   // % position on map (0–100)
  y: number;
  recompense_vent: number;
  recompense_or: number;
  recompense_bois: number;
  recompense_boussole: number;
  recompense_texte: string;    // human-readable reward (e.g. "Déjeuner d'équipe")
  defi: string;
  ordre: number;
  emoji: string;               // e.g. "🍔"
  theme: string;               // Tutoriel | Food | Geek | Nature | Mystère
  mecanique_speciale: string;  // special rule text for this island
}

// ─── Membre d'équipage ────────────────────────────────────────────────────────
export interface Membre {
  id: string;
  nom: string;
  role: string;
  niveau: number;
  xp: number;
  xp_max: number;
  competence: string;
  humeur: string;        // emoji
  perimetre?: string;    // marketing scope (e.g. "Social Media, Email")
  marques?: string;      // brands/accounts (e.g. "Instagram @brand, LinkedIn")
  contributions?: {      // individual resource totals
    vent: number;
    or: number;
    bois: number;
    boussole: number;
  };
}

// ─── Module (visibilité des sections) ────────────────────────────────────────
export interface Module {
  id: string;
  nom: string;
  visible: boolean;
  ordre: number;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────
export interface KPI {
  id: string;
  nom: string;
  valeur: number;
  cible: number;
  unite: string;
  tendance: "up" | "down" | "stable";
  responsable: string;
  binome?: string;
  objectif_lec?: number;
  objectif_swapn?: number;
  total_combine?: number;
}

// ─── Scores cumulés ───────────────────────────────────────────────────────────
export interface ScoresCumules {
  vent: number;
  or: number;
  bois: number;
  boussole: number;
  total: number;
}

// ─── Scores par binôme (onglet Scores, une ligne par binôme) ─────────────────
export interface ScoresBinome {
  nom: string;
  vent: number;
  or: number;
  bois: number;
  boussole: number;
  total: number;
}

// ─── État du voyage (île en cours) ────────────────────────────────────────────
export interface EtatVoyage {
  semaine: number;
  ile_en_cours_id: string;
  ile_en_cours_nom: string;
  ile_en_cours_emoji: string;   // e.g. "🍔"
  ile_en_cours_theme: string;   // e.g. "Food"
  ile_en_cours_mecanique: string; // special mechanics text
  prochaine_ile_id: string;
  prochaine_ile_nom: string;
  seuil_passage: number;  // score needed to move to next island
  score_actuel: number;
  date_maree: string;     // ISO date of next tide day, e.g. "2026-04-27"
}

// ─── Quête ────────────────────────────────────────────────────────────────────
export interface Quete {
  id: string;
  titre: string;
  description: string;
  statut: "active" | "accomplie" | "echouee";
  recompense: string;
  deadline: string;        // ISO date string or ""
  responsable: string;
  ile_id: string;
  valeur_actuelle?: number;  // current progress value
  valeur_max?: number;       // target value (for progress bar)
}

// ─── Événement en mer ────────────────────────────────────────────────────────
export interface Evenement {
  id: string;
  titre: string;
  description: string;
  type: "tempete" | "decouverte" | "commerce" | "danger" | "bonus";
  date_debut: string;
  date_fin: string;   // empty = still active
  actif: boolean;
}

// ─── Journal de bord ─────────────────────────────────────────────────────────
export interface EntreeJournal {
  id: string;
  date: string;
  auteur: string;
  contenu: string;
  visible: boolean;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  nom: string;
  description: string;
  emoji: string;
  debloque: boolean;
  date_deblocage: string;
  condition: string;
}

// ─── Legacy aliases (used by existing components) ────────────────────────────
export type CrewMember = Membre;

export interface Resources {
  vent: number;
  or: number;
  bois: number;
  boussole: number;
  vent_max: number;
  or_max: number;
  bois_max: number;
  boussole_max: number;
}

export interface Quest {
  id: string;
  titre: string;
  description: string;
  statut: "active" | "completed" | "failed";
  recompense: string;
  deadline?: string;
  responsable: string;
}

export interface SeaEvent {
  id: string;
  titre: string;
  description: string;
  type: "tempete" | "decouverte" | "commerce" | "danger" | "bonus";
  date: string;
  actif: boolean;
}

export interface Ship {
  nom: string;
  niveau: number;
  xp: number;
  xp_max: number;
  ile_actuelle: string;
  cap: string;
  vitesse: number;
  moral: number;
}
