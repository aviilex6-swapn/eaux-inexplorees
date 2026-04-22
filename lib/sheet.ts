/**
 * lib/sheet.ts — Data layer for Eaux Inexplorees
 *
 * Fetch strategy (in order):
 *  1. CSV  : convert pubhtml URL → pub?output=csv, parse with papaparse
 *  2. HTML : fetch pubhtml as-is, parse HTML table
 *  3. Mock : return static data so the app never crashes
 *
 * WHY the fallback chain:
 *  Google Workspace domains can restrict "Publish to web" so that
 *  server-side fetches (Next.js, Vercel) get a 401/login-redirect even
 *  for sheets marked "public".  The HTML parser catches cases where the
 *  CSV endpoint fails but the pubhtml viewer is accessible.
 *  See: /app/api/test-sheet/route.ts for a live diagnostic.
 */

import Papa from "papaparse";
import { SHEET_URLS, REVALIDATE_SECONDS, toCsvUrl } from "./config";
import { parseHtmlTable, isLoginPage } from "./htmlParser";
import type {
  RawRow, SheetResult,
  Membre, Module, KPI, ScoresCumules, EtatVoyage,
  Quete, Evenement, EntreeJournal, Badge,
  // Legacy aliases
  Island, Resources, Quest, SeaEvent, Ship,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const num = (v: string | undefined, fallback = 0): number =>
  v ? parseFloat(v.replace(/\s/g, "").replace(",", ".")) || fallback : fallback;

const bool = (v: string | undefined): boolean => {
  const s = (v ?? "").toLowerCase().trim();
  return s === "true" || s === "oui" || s === "1" || s === "yes";
};

const date = (v: string | undefined): string => (v ?? "").trim();

/** Normalize a raw column key — handles accented chars, spaces, BOM */
function normalizeKey(k: string): string {
  return k
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip accents
    .replace(/^\uFEFF/, "")           // strip BOM
    .trim()
    .toLowerCase()
    .replace(/[\s\-\.]+/g, "_");
}

/** Re-key a raw row so all keys are normalized */
function normalizeRow(row: Record<string, string>): RawRow {
  const out: RawRow = {};
  for (const [k, v] of Object.entries(row)) {
    out[normalizeKey(k)] = v;
  }
  return out;
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

/**
 * fetchSheetRows
 * Tries CSV → HTML → returns empty array + error string.
 * All network errors are caught; callers never throw.
 */
async function fetchSheetRows(
  pubhtmlUrl: string,
  sheetName: string
): Promise<SheetResult<RawRow>> {
  if (!pubhtmlUrl) {
    return { data: [], strategy: "mock", error: `URL manquante pour "${sheetName}"` };
  }

  // ── Strategy 1 : CSV ──────────────────────────────────────────────────────
  try {
    const csvUrl = toCsvUrl(pubhtmlUrl);
    const res = await fetch(csvUrl, { next: { revalidate: REVALIDATE_SECONDS } });

    if (res.ok) {
      const text = await res.text();
      if (!isLoginPage(text) && text.includes(",")) {
        const { data, errors } = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: normalizeKey,
        });
        if (errors.length > 0) {
          console.warn(`[sheet] CSV parse warnings for "${sheetName}":`, errors.slice(0, 2));
        }
        const rows = data.map(normalizeRow).filter((r) => Object.values(r).some((v) => v !== ""));
        if (rows.length > 0) {
          console.log(`[sheet] "${sheetName}" — ${rows.length} lignes via CSV`);
          return { data: rows, strategy: "csv" };
        }
      }
    }
    console.warn(`[sheet] CSV inaccessible pour "${sheetName}" (HTTP ${res.status}) — essai HTML`);
  } catch (e) {
    console.warn(`[sheet] CSV fetch error pour "${sheetName}":`, e instanceof Error ? e.message : e);
  }

  // ── Strategy 2 : HTML (pubhtml) ───────────────────────────────────────────
  try {
    const res = await fetch(pubhtmlUrl, { next: { revalidate: REVALIDATE_SECONDS } });

    if (res.ok) {
      const html = await res.text();
      if (!isLoginPage(html)) {
        const rows = parseHtmlTable(html).map(normalizeRow);
        if (rows.length > 0) {
          console.log(`[sheet] "${sheetName}" — ${rows.length} lignes via HTML`);
          return { data: rows, strategy: "html" };
        }
      } else {
        console.error(
          `[sheet] "${sheetName}" — le Sheet nécessite une authentification.\n` +
          "  → Vérifiez que le fichier est bien publié via : Fichier > Partager > Publier sur le web\n" +
          "  → Si vous êtes sur Google Workspace, l'admin a peut-être désactivé la publication externe."
        );
        return { data: [], strategy: "mock", error: "Sheet non public (401/login)" };
      }
    }
    console.warn(`[sheet] HTML inaccessible pour "${sheetName}" (HTTP ${res.status})`);
  } catch (e) {
    console.warn(`[sheet] HTML fetch error pour "${sheetName}":`, e instanceof Error ? e.message : e);
  }

  return { data: [], strategy: "mock", error: `Impossible de lire "${sheetName}" — données mock utilisées` };
}

// ─── Getters ─────────────────────────────────────────────────────────────────

/** Équipage — onglet "Config Équipage" */
export async function getEquipage(): Promise<SheetResult<Membre>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.equipage, "equipage");

  const membres: Membre[] = data.map((r) => {
    const contribVent     = r.contributions_vent     ?? r.vent     ?? r.contribution_vent;
    const contribOr       = r.contributions_or       ?? r.or       ?? r.contribution_or;
    const contribBois     = r.contributions_bois     ?? r.bois     ?? r.contribution_bois;
    const contribBoussole = r.contributions_boussole ?? r.boussole ?? r.contribution_boussole;
    const hasContribs = contribVent || contribOr || contribBois || contribBoussole;
    return {
      id:         r.id         ?? r.nom?.toLowerCase().replace(/\s+/g, "_") ?? "",
      nom:        r.nom        ?? "",
      role:       r.role       ?? "",
      niveau:     num(r.niveau, 1),
      xp:         num(r.xp),
      xp_max:     num(r.xp_max ?? r.xp_maximum, 100),
      competence: r.competence ?? r.specialite ?? "",
      humeur:     r.humeur     ?? r.emoji ?? "😐",
      perimetre:  r.perimetre  ?? r.scope ?? r.domaine ?? undefined,
      marques:    r.marques    ?? r.brands ?? r.comptes ?? undefined,
      contributions: hasContribs ? {
        vent:     num(contribVent),
        or:       num(contribOr),
        bois:     num(contribBois),
        boussole: num(contribBoussole),
      } : undefined,
    };
  });

  return { data: membres.length > 0 ? membres : MOCK_DATA.equipage, strategy, error };
}

/** Îles — onglet "Îles" */
export async function getIles(): Promise<SheetResult<Island>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.iles, "iles");

  const iles: Island[] = data.map((r, i) => {
    const statut = (() => {
      const s = (r.statut ?? r.status ?? "").toLowerCase();
      if (s.includes("complet") || s.includes("conquis") || s.includes("done")) return "completed" as const;
      if (s.includes("actif") || s.includes("active") || s.includes("cours"))   return "active"    as const;
      if (s.includes("danger") || s.includes("risk"))                            return "danger"    as const;
      return "locked" as const;
    })();
    return {
      id:                  r.id                  ?? r.slug ?? `ile_${i}`,
      nom:                 r.nom                 ?? r.name ?? r.titre ?? "",
      description:         r.description         ?? r.desc ?? "",
      statut,
      x:                   num(r.x              ?? r.position_x ?? r.pos_x, 50),
      y:                   num(r.y              ?? r.position_y ?? r.pos_y, 50),
      recompense_vent:     num(r.recompense_vent     ?? r.vent     ?? r.reward_vent),
      recompense_or:       num(r.recompense_or       ?? r.or       ?? r.reward_or),
      recompense_bois:     num(r.recompense_bois     ?? r.bois     ?? r.reward_bois),
      recompense_boussole: num(r.recompense_boussole ?? r.boussole ?? r.reward_boussole),
      recompense_texte:    r.recompense_texte    ?? r.recompense ?? r.reward_texte ?? "",
      defi:                r.defi                ?? r.challenge  ?? r.objectif ?? "",
      ordre:               num(r.ordre           ?? r.order ?? r.num, i + 1),
      emoji:               r.emoji               ?? r.icone ?? "🏝️",
      theme:               r.theme               ?? r.categorie ?? "",
      mecanique_speciale:  r.mecanique_speciale  ?? r.mecanique ?? r.special ?? "",
    };
  });

  return { data: iles.length > 0 ? iles : MOCK_DATA.islands, strategy, error };
}

/** Modules — onglet "Modules" — visibilité des sections du dashboard */
export async function getModules(): Promise<SheetResult<Module>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.modules, "modules");

  const modules: Module[] = data.map((r, i) => ({
    id:      r.id      ?? r.module ?? `module_${i}`,
    nom:     r.nom     ?? r.module ?? "",
    visible: bool(r.visible ?? r.actif ?? "true"),
    ordre:   num(r.ordre ?? r.order, i),
  }));

  return { data: modules.length > 0 ? modules : MOCK_DATA.modules, strategy, error };
}

/** KPIs — onglet "KPIs" */
export async function getKpis(): Promise<SheetResult<KPI>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.kpis, "kpis");

  const kpis: KPI[] = data.map((r) => {
    const valeur = num(r.valeur ?? r.score ?? r.resultat);
    const cible  = num(r.cible  ?? r.objectif ?? r.target, 100);
    const tendance = (() => {
      const t = (r.tendance ?? r.trend ?? "").toLowerCase();
      if (t.includes("up") || t.includes("hausse") || t.includes("progression")) return "up" as const;
      if (t.includes("down") || t.includes("baisse") || t.includes("regression")) return "down" as const;
      return "stable" as const;
    })();
    return {
      id:          r.id          ?? r.nom?.toLowerCase().replace(/\s+/g, "_") ?? "",
      nom:         r.nom         ?? r.kpi ?? r.indicateur ?? "",
      valeur,
      cible,
      unite:       r.unite       ?? r.unit ?? "",
      tendance,
      responsable: r.responsable ?? "",
    };
  });

  return { data: kpis.length > 0 ? kpis : MOCK_DATA.kpis, strategy, error };
}

/**
 * Scores cumulés — onglet "Tableau de bord" ou "Scores".
 * Expects either:
 *   - Key/value rows  : { cle: "vent", valeur: "68" }
 *   - Single-row totals: { vent: "68", or: "45", bois: "72", boussole: "55" }
 */
export async function getScoresCumules(): Promise<ScoresCumules & { _strategy: string; _error?: string }> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.scores, "scores");

  let vent = 0, or = 0, bois = 0, boussole = 0;

  if (data.length > 0) {
    // Try key/value format first
    const byKey: Record<string, string> = {};
    for (const r of data) {
      const key = (r.cle ?? r.ressource ?? r.resource ?? "").toLowerCase();
      const val = r.valeur ?? r.score ?? r.total ?? "";
      if (key) byKey[key] = val;
    }

    if (Object.keys(byKey).length > 0) {
      vent     = num(byKey.vent);
      or       = num(byKey.or);
      bois     = num(byKey.bois);
      boussole = num(byKey.boussole ?? byKey.compass);
    } else {
      // Single row format
      const r = data[0];
      vent     = num(r.vent);
      or       = num(r.or);
      bois     = num(r.bois);
      boussole = num(r.boussole ?? r.compass ?? r.boussole_pts);
    }
  }

  const totals = (data.length > 0)
    ? { vent, or, bois, boussole, total: vent + or + bois + boussole }
    : { ...MOCK_DATA.scoresCumules };

  return { ...totals, _strategy: strategy, _error: error };
}

/**
 * État du voyage — onglet "Dashboard".
 * Expects key/value rows: { cle: "semaine", valeur: "3" }
 */
export async function getEtatVoyage(): Promise<EtatVoyage & { _strategy: string; _error?: string }> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.dashboard, "dashboard");

  if (data.length === 0) {
    return { ...MOCK_DATA.etatVoyage, _strategy: strategy, _error: error };
  }

  // Build key-value map
  const kv: Record<string, string> = {};
  for (const r of data) {
    const key = (r.cle ?? r.key ?? r.parametre ?? "").toLowerCase().replace(/\s+/g, "_");
    const val = r.valeur ?? r.value ?? r.val ?? "";
    if (key) kv[key] = val;
  }

  return {
    semaine:              num(kv.semaine ?? kv.week, 1),
    ile_en_cours_id:      kv.ile_en_cours_id      ?? kv.ile_actuelle_id   ?? "",
    ile_en_cours_nom:     kv.ile_en_cours_nom     ?? kv.ile_actuelle_nom  ?? kv.ile_actuelle ?? "",
    ile_en_cours_emoji:   kv.ile_en_cours_emoji   ?? kv.ile_emoji         ?? "🏝️",
    ile_en_cours_theme:   kv.ile_en_cours_theme   ?? kv.theme             ?? "",
    ile_en_cours_mecanique: kv.ile_en_cours_mecanique ?? kv.mecanique_speciale ?? "",
    prochaine_ile_id:     kv.prochaine_ile_id     ?? kv.prochaine_id      ?? "",
    prochaine_ile_nom:    kv.prochaine_ile_nom    ?? kv.prochaine_nom     ?? kv.prochaine    ?? "",
    seuil_passage:        num(kv.seuil_passage    ?? kv.seuil ?? kv.objectif, 100),
    score_actuel:         num(kv.score_actuel     ?? kv.score_total ?? kv.score, 0),
    date_maree:           kv.date_maree           ?? kv.maree ?? kv.date_assessment ?? "",
    _strategy: strategy,
    _error: error,
  };
}

/** Quêtes actives — onglet "Quêtes" */
export async function getQuetes(): Promise<SheetResult<Quete>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.quetes, "quetes");

  const quetes: Quete[] = data.map((r, i) => {
    const statut = (() => {
      const s = (r.statut ?? r.status ?? "").toLowerCase();
      if (s.includes("accomp") || s.includes("done") || s.includes("complet")) return "accomplie" as const;
      if (s.includes("echou") || s.includes("fail")) return "echouee" as const;
      return "active" as const;
    })();
    const valeur_actuelle = r.valeur_actuelle ?? r.progression ?? r.actuel ?? r.current;
    const valeur_max = r.valeur_max ?? r.objectif ?? r.max ?? r.target;
    return {
      id:              r.id          ?? `quete_${i}`,
      titre:           r.titre       ?? r.title ?? r.nom ?? "",
      description:     r.description ?? r.desc  ?? "",
      statut,
      recompense:      r.recompense  ?? r.reward ?? "",
      deadline:        date(r.deadline ?? r.echeance ?? r.date_limite),
      responsable:     r.responsable ?? r.assignee ?? r.membre ?? "",
      ile_id:          r.ile_id      ?? r.ile ?? "",
      valeur_actuelle: valeur_actuelle !== undefined ? num(valeur_actuelle) : undefined,
      valeur_max:      valeur_max     !== undefined ? num(valeur_max, 100)  : undefined,
    };
  });

  return { data: quetes.length > 0 ? quetes : MOCK_DATA.quetes, strategy, error };
}

/**
 * Événement en mer actuel — onglet "Événements".
 * Returns the last row where date_fin is empty (still active), or null.
 */
export async function getEvenementActuel(): Promise<(Evenement & { _strategy: string }) | null> {
  if (!SHEET_URLS.evenements) {
    console.warn("[sheet] URL evenements manquante — utilisation des mocks");
    return MOCK_DATA.evenements[0]
      ? { ...MOCK_DATA.evenements[0], _strategy: "mock" }
      : null;
  }

  const { data, strategy } = await fetchSheetRows(SHEET_URLS.evenements, "evenements");

  const events: Evenement[] = data.map((r, i) => {
    const type = (() => {
      const t = (r.type ?? "").toLowerCase();
      if (t.includes("temp") || t.includes("storm"))      return "tempete"   as const;
      if (t.includes("decouv") || t.includes("discover")) return "decouverte" as const;
      if (t.includes("comm") || t.includes("trade"))      return "commerce"  as const;
      if (t.includes("danger") || t.includes("risk"))     return "danger"    as const;
      return "bonus" as const;
    })();
    const dateFin = date(r.date_fin ?? r.fin ?? r.end_date ?? "");
    return {
      id:          r.id         ?? `evt_${i}`,
      titre:       r.titre      ?? r.title ?? r.nom ?? "",
      description: r.description ?? r.desc ?? "",
      type,
      date_debut:  date(r.date_debut ?? r.debut ?? r.start_date ?? r.date ?? ""),
      date_fin:    dateFin,
      actif:       dateFin === "" && bool(r.actif ?? r.active ?? "true"),
    };
  });

  // Return the most recent active event
  const actif = events.filter((e) => e.actif).at(-1);
  if (actif) return { ...actif, _strategy: strategy };

  // Fallback: last event in list
  const last = events.at(-1);
  return last ? { ...last, _strategy: strategy } : null;
}

/** Journal de bord — onglet "Journal" — last 5 visible entries */
export async function getJournal(): Promise<SheetResult<EntreeJournal>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.journal, "journal");

  const entries: EntreeJournal[] = data
    .map((r, i) => ({
      id:      r.id      ?? `journal_${i}`,
      date:    date(r.date ?? r.jour ?? ""),
      auteur:  r.auteur  ?? r.author ?? r.membre ?? "",
      contenu: r.contenu ?? r.message ?? r.texte ?? r.entry ?? "",
      visible: bool(r.visible ?? r.afficher ?? "true"),
    }))
    .filter((e) => e.visible)
    .slice(-5)
    .reverse();

  return { data: entries.length > 0 ? entries : MOCK_DATA.journal, strategy, error };
}

/** Badges — onglet "Badges" */
export async function getBadges(): Promise<SheetResult<Badge>> {
  const { data, strategy, error } = await fetchSheetRows(SHEET_URLS.badges, "badges");

  const badges: Badge[] = data.map((r, i) => ({
    id:             r.id              ?? `badge_${i}`,
    nom:            r.nom             ?? r.name ?? r.titre ?? "",
    description:    r.description     ?? r.desc ?? "",
    emoji:          r.emoji           ?? r.icone ?? "🏅",
    debloque:       bool(r.debloque   ?? r.unlocked ?? r.obtenu ?? "false"),
    date_deblocage: date(r.date_deblocage ?? r.date_unlock ?? r.date ?? ""),
    condition:      r.condition       ?? r.critere ?? "",
  }));

  return { data: badges.length > 0 ? badges : MOCK_DATA.badges, strategy, error };
}

// ─── Legacy getters (used by existing components) ───────────────────────────
// These wrap the new API to stay compatible with /app/page.tsx

export async function getCrew(): Promise<Membre[]> {
  const { data } = await getEquipage();
  return data;
}

export async function getResources(): Promise<Resources> {
  const sc = await getScoresCumules();
  return {
    vent: sc.vent, or: sc.or, bois: sc.bois, boussole: sc.boussole,
    vent_max: 100, or_max: 100, bois_max: 100, boussole_max: 100,
  };
}

export async function getIslands(): Promise<Island[]> {
  const { data } = await getIles();
  return data;
}

export async function getIslandById(id: string): Promise<Island | null> {
  const islands = await getIslands();
  return islands.find((il) => il.id === id) ?? null;
}

export async function getQuests(): Promise<Quest[]> {
  const { data } = await getQuetes();
  return data.map((q) => ({
    id:          q.id,
    titre:       q.titre,
    description: q.description,
    statut:      (q.statut === "accomplie" ? "completed" : q.statut === "echouee" ? "failed" : "active") as Quest["statut"],
    recompense:  q.recompense,
    deadline:    q.deadline || undefined,
    responsable: q.responsable,
  }));
}

export async function getSeaEvents(): Promise<SeaEvent[]> {
  const evt = await getEvenementActuel();
  if (!evt) return [];
  return [{
    id: evt.id, titre: evt.titre, description: evt.description,
    type: evt.type, date: evt.date_debut, actif: evt.actif,
  }];
}

export async function getShip(): Promise<Ship> {
  const etat = await getEtatVoyage();
  return {
    nom: "L'Audacieux",
    niveau: Math.ceil(etat.semaine / 3) || 1,
    xp: etat.score_actuel,
    xp_max: etat.seuil_passage || 500,
    ile_actuelle: etat.ile_en_cours_id,
    cap: etat.prochaine_ile_id,
    vitesse: 7,
    moral: Math.min(100, Math.round((etat.score_actuel / (etat.seuil_passage || 1)) * 100)),
  };
}

// ─── Mock data ───────────────────────────────────────────────────────────────

export const MOCK_DATA = {
  equipage: [
    { id: "nils",    nom: "Nils",    role: "Capitaine",       niveau: 5, xp: 420, xp_max: 500, competence: "Leadership & Vision",   humeur: "🦅", perimetre: "Stratégie globale, Coordination",    marques: "Toutes marques",                                contributions: { vent: 30, or: 25, bois: 20, boussole: 18 } },
    { id: "basile",  nom: "Basile",  role: "Premier Matelot", niveau: 4, xp: 310, xp_max: 400, competence: "Stratégie Digitale",    humeur: "⚡", perimetre: "Social Media, Paid Media",           marques: "Instagram @brand, Meta Ads",                    contributions: { vent: 22, or: 15, bois: 12, boussole: 14 } },
    { id: "thomas",  nom: "Thomas",  role: "Navigateur",      niveau: 4, xp: 280, xp_max: 400, competence: "Analytics & Data",      humeur: "🔍", perimetre: "SEO, Analytics, Reporting",          marques: "GA4, Search Console, Semrush",                  contributions: { vent: 18, or: 10, bois: 25, boussole: 20 } },
    { id: "barbara", nom: "Barbara", role: "Intendante",      niveau: 3, xp: 195, xp_max: 300, competence: "Gestion Budgétaire",    humeur: "💎", perimetre: "Budget, Partenariats, Finance",     marques: "Fournisseurs, Agences créa",                    contributions: { vent: 10, or: 30, bois: 8,  boussole: 5  } },
    { id: "lily",    nom: "Lily",    role: "Vigie",           niveau: 3, xp: 210, xp_max: 300, competence: "Veille & Tendances",    humeur: "🌟", perimetre: "Content, Email, Veille",             marques: "Newsletter, LinkedIn @brand, TikTok",           contributions: { vent: 20, or: 8,  bois: 15, boussole: 12 } },
  ] satisfies Membre[],

  modules: [
    { id: "carte",      nom: "Carte des Mers",    visible: true,  ordre: 1 },
    { id: "equipage",   nom: "Équipage",           visible: true,  ordre: 2 },
    { id: "ressources", nom: "Ressources",         visible: true,  ordre: 3 },
    { id: "quetes",     nom: "Quêtes",             visible: true,  ordre: 4 },
    { id: "evenements", nom: "Événements en mer",  visible: true,  ordre: 5 },
    { id: "journal",    nom: "Journal de bord",    visible: true,  ordre: 6 },
    { id: "badges",     nom: "Badges",             visible: false, ordre: 7 },
  ] satisfies Module[],

  kpis: [
    { id: "followers", nom: "Abonnés Instagram", valeur: 6840,  cible: 10000, unite: "",    tendance: "up"     as const, responsable: "Lily"   },
    { id: "engagement",nom: "Taux engagement",   valeur: 4.2,   cible: 5,     unite: "%",   tendance: "stable" as const, responsable: "Basile" },
    { id: "leads",     nom: "Leads générés",     valeur: 87,    cible: 120,   unite: "",    tendance: "up"     as const, responsable: "Thomas" },
    { id: "budget",    nom: "Budget consommé",   valeur: 12500, cible: 15000, unite: "€",   tendance: "stable" as const, responsable: "Barbara"},
  ] satisfies KPI[],

  scoresCumules: { vent: 68, or: 45, bois: 72, boussole: 55, total: 240 } satisfies ScoresCumules,

  etatVoyage: {
    semaine: 6,
    ile_en_cours_id:        "ile-tempete",
    ile_en_cours_nom:       "Cap de la Tempête",
    ile_en_cours_emoji:     "⚡",
    ile_en_cours_theme:     "Paid Media",
    ile_en_cours_mecanique: "Sur cette île, le Vent représente la portée et l'Or le budget. Chaque euro dépensé devient une ressource.",
    prochaine_ile_id:       "ile-tresor",
    prochaine_ile_nom:      "Île du Trésor",
    seuil_passage: 300,
    score_actuel:  240,
    date_maree:    "2026-04-28",
  } satisfies EtatVoyage,

  quetes: [
    { id: "q1", titre: "Tempête des Réseaux",  description: "Publier 15 posts engageants cette semaine",        statut: "active"    as const, recompense: "20 Or, 15 Vent",  deadline: "2026-04-25", responsable: "Lily",    ile_id: "ile-tempete", valeur_actuelle: 11, valeur_max: 15  },
    { id: "q2", titre: "Le Codex du SEO",      description: "Optimiser 10 pages pour les moteurs de recherche", statut: "active"    as const, recompense: "30 Boussole",      deadline: "2026-04-28", responsable: "Thomas",  ile_id: "ile-tempete", valeur_actuelle: 8,  valeur_max: 10  },
    { id: "q3", titre: "Pavillon de Guerre",   description: "Atteindre 300 pts cumulés sur l'île",              statut: "active"    as const, recompense: "40 Vent, 20 Or",   deadline: "2026-04-30", responsable: "Nils",    ile_id: "ile-tempete", valeur_actuelle: 240, valeur_max: 300 },
    { id: "q4", titre: "Alliance Marchande",   description: "Signer 2 partenariats influenceurs",               statut: "accomplie" as const, recompense: "50 Or",            deadline: "2026-04-15", responsable: "Basile",  ile_id: "ile-brume",   valeur_actuelle: 2,  valeur_max: 2   },
  ] satisfies Quete[],

  evenements: [
    { id: "e1", titre: "Tempête Algorithmique", description: "L'algorithme Instagram a changé. Portée organique -20% pendant 48h.", type: "tempete" as const, date_debut: "2026-04-20", date_fin: "", actif: true  },
    { id: "e2", titre: "Vent Favorable",         description: "Un post est devenu viral ! +500 followers en 24h.",                   type: "decouverte" as const, date_debut: "2026-04-19", date_fin: "2026-04-20", actif: false },
  ] satisfies Evenement[],

  journal: [
    { id: "j1", date: "2026-04-21", auteur: "Nils",   contenu: "Cap maintenu malgré la tempête algorithmique. L'équipage tient bon.", visible: true },
    { id: "j2", date: "2026-04-20", auteur: "Lily",   contenu: "Post viral sur LinkedIn : 47k impressions. Vent dans les voiles !",   visible: true },
    { id: "j3", date: "2026-04-19", auteur: "Thomas", contenu: "Analyse SEO complète. 8 pages sur 10 optimisées.",                    visible: true },
    { id: "j4", date: "2026-04-18", auteur: "Basile", contenu: "Partenariat signé avec @MarketInflu. +50 or dans les cales.",        visible: true },
    { id: "j5", date: "2026-04-17", auteur: "Barbara",contenu: "Budget Q2 validé. 15 000€ alloués aux campagnes paid.",               visible: true },
  ] satisfies EntreeJournal[],

  badges: [
    { id: "b1", nom: "Premier Cap",     description: "Première île conquise",       emoji: "⚓", debloque: true,  date_deblocage: "2026-04-01", condition: "Conquérir l'île de départ" },
    { id: "b2", nom: "Brumes Vaincues", description: "L'Île des Brumes traversée", emoji: "🌫️", debloque: true,  date_deblocage: "2026-04-10", condition: "Conquérir l'Île des Brumes" },
    { id: "b3", nom: "Viral Storm",     description: "10k impressions en 24h",      emoji: "⚡", debloque: true,  date_deblocage: "2026-04-20", condition: "Post viral organique" },
    { id: "b4", nom: "Trésor Caché",    description: "L'île du trésor dévoilée",    emoji: "💎", debloque: false, date_deblocage: "",           condition: "Conquérir l'Île du Trésor" },
    { id: "b5", nom: "Armada",          description: "Tous les KPIs au vert",        emoji: "🏴‍☠️", debloque: false, date_deblocage: "",           condition: "100% des KPIs atteints" },
  ] satisfies Badge[],

  islands: [
    { id: "ile-depart",  nom: "Port de l'Éveil",     description: "Le port natal de l'équipage. Les premiers défis attendent.",              statut: "completed" as const, x: 12, y: 75, recompense_vent: 10, recompense_or: 5,  recompense_bois: 8,  recompense_boussole: 3,   recompense_texte: "Déjeuner d'équipe",    defi: "Cartographier le marché cible",  ordre: 1, emoji: "⚓", theme: "Tutoriel",  mecanique_speciale: "Sur cette île tutoriel, toutes les ressources sont doublées. Travaillez ensemble pour maximiser les gains." },
    { id: "ile-brume",   nom: "Île des Brumes",       description: "Une île mystérieuse cachée dans les nuages. Le branding se révèle.",      statut: "completed" as const, x: 28, y: 55, recompense_vent: 15, recompense_or: 20, recompense_bois: 5,  recompense_boussole: 10,  recompense_texte: "Afterwork craft beer",  defi: "Définir l'identité de marque",   ordre: 2, emoji: "🌫️", theme: "Mystère",   mecanique_speciale: "Dans les brumes, chaque action créative rapporte +50% de Boussole. La direction compte autant que la vitesse." },
    { id: "ile-tempete", nom: "Cap de la Tempête",    description: "Les vents contraires testent la cohésion de l'équipage.",                 statut: "active"    as const, x: 45, y: 35, recompense_vent: 30, recompense_or: 15, recompense_bois: 20, recompense_boussole: 25,  recompense_texte: "Escape Game équipe",   defi: "Lancer la campagne Q2",          ordre: 3, emoji: "⚡", theme: "Geek",      mecanique_speciale: "Sur cette île, le Vent représente la portée et l'Or le budget. Chaque euro dépensé devient une ressource de navigation." },
    { id: "ile-tresor",  nom: "Île du Trésor",        description: "La légende raconte qu'un trésor inestimable s'y cache.",                  statut: "locked"    as const, x: 62, y: 50, recompense_vent: 40, recompense_or: 80, recompense_bois: 30, recompense_boussole: 50,  recompense_texte: "Journée spa équipe",   defi: "Atteindre 10k abonnés",          ordre: 4, emoji: "💎", theme: "Nature",    mecanique_speciale: "Les ressources naturelles abondent ici. Les actions SEO et contenu evergreen rapportent le double de Bois." },
    { id: "ile-sirenes", nom: "Récif des Sirènes",    description: "Les sirènes du marketing digital vous appellent.",                        statut: "locked"    as const, x: 75, y: 30, recompense_vent: 25, recompense_or: 35, recompense_bois: 15, recompense_boussole: 40,  recompense_texte: "Dîner gastronomique", defi: "Viralité organique x3",          ordre: 5, emoji: "🧜", theme: "Food",      mecanique_speciale: "Les sirènes récompensent la créativité. Chaque post viral génère +30 Vent bonus. Attention aux pièges algorithmiques." },
    { id: "ile-horizon", nom: "L'Île de l'Horizon",   description: "La destination finale. Un nouveau monde marketing vous attend.",           statut: "locked"    as const, x: 88, y: 60, recompense_vent: 60, recompense_or: 100,recompense_bois: 50, recompense_boussole: 100, recompense_texte: "Weekend team building", defi: "Conquête du marché",             ordre: 6, emoji: "🌅", theme: "Mystère",   mecanique_speciale: "L'île finale cumule les mécaniques de toutes les îles précédentes. Toutes les ressources sont multipliées par 1.5." },
  ] satisfies Island[],
};
