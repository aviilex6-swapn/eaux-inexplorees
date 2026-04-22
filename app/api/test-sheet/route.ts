/**
 * GET /api/test-sheet
 *
 * Diagnostic endpoint: tests connectivity to each Google Sheet tab.
 * Returns JSON with status per tab + first 2 rows of each.
 *
 * Usage:
 *   curl http://localhost:3000/api/test-sheet | jq .
 *   or visit http://localhost:3000/api/test-sheet in the browser
 */

import { NextResponse } from "next/server";
import { SHEET_URLS, toCsvUrl } from "@/lib/config";
import { isLoginPage, parseHtmlTable } from "@/lib/htmlParser";
import Papa from "papaparse";

export const dynamic = "force-dynamic"; // never cache this diagnostic route

type TabStatus = {
  tab: string;
  csvUrl: string;
  pubhtmlUrl: string;
  csvStatus: number | "error";
  csvRows: number;
  csvStrategy: "ok" | "login" | "empty" | "error";
  htmlStatus: number | "error";
  htmlRows: number;
  htmlStrategy: "ok" | "login" | "empty" | "error";
  sample: Record<string, string>[];
  recommendation: string;
};

async function testTab(name: string, pubhtmlUrl: string): Promise<TabStatus> {
  const csvUrl = toCsvUrl(pubhtmlUrl);
  let csvStatus: number | "error" = "error";
  let csvRows = 0;
  let csvStrategy: TabStatus["csvStrategy"] = "error";
  let htmlStatus: number | "error" = "error";
  let htmlRows = 0;
  let htmlStrategy: TabStatus["htmlStrategy"] = "error";
  let sample: Record<string, string>[] = [];

  if (!pubhtmlUrl) {
    return {
      tab: name, csvUrl: "", pubhtmlUrl: "",
      csvStatus: "error", csvRows: 0, csvStrategy: "error",
      htmlStatus: "error", htmlRows: 0, htmlStrategy: "error",
      sample: [],
      recommendation: "⚠️ URL manquante — fournissez l'URL pubhtml pour cet onglet.",
    };
  }

  // Test CSV
  try {
    const res = await fetch(csvUrl, { cache: "no-store" });
    csvStatus = res.status;
    const body = await res.text();
    if (isLoginPage(body)) {
      csvStrategy = "login";
    } else if (body.includes(",")) {
      const { data } = Papa.parse<Record<string, string>>(body, { header: true, skipEmptyLines: true });
      csvRows = data.length;
      csvStrategy = csvRows > 0 ? "ok" : "empty";
      if (csvRows > 0) sample = data.slice(0, 2) as Record<string, string>[];
    } else {
      csvStrategy = "empty";
    }
  } catch {
    csvStatus = "error";
    csvStrategy = "error";
  }

  // Test HTML (pubhtml)
  try {
    const res = await fetch(pubhtmlUrl, { cache: "no-store" });
    htmlStatus = res.status;
    const body = await res.text();
    if (isLoginPage(body)) {
      htmlStrategy = "login";
    } else {
      const rows = parseHtmlTable(body);
      htmlRows = rows.length;
      htmlStrategy = htmlRows > 0 ? "ok" : "empty";
      if (htmlRows > 0 && sample.length === 0) sample = rows.slice(0, 2);
    }
  } catch {
    htmlStatus = "error";
    htmlStrategy = "error";
  }

  // Build recommendation
  let recommendation = "";
  if (csvStrategy === "ok" || htmlStrategy === "ok") {
    recommendation = "✅ Données accessibles";
  } else if (csvStrategy === "login" || htmlStrategy === "login") {
    recommendation =
      "❌ Sheet non public. Actions requises :\n" +
      "  1. Ouvrir le Google Sheet\n" +
      "  2. Fichier > Partager > Publier sur le web\n" +
      "  3. Sélectionner l'onglet > Format : Page web\n" +
      "  4. Cliquer sur Publier\n" +
      "  Si vous êtes sur Google Workspace : demandez à l'admin d'activer\n" +
      "  'Autoriser les utilisateurs à publier des fichiers sur le web'";
  } else if (csvStrategy === "empty" && htmlStrategy === "empty") {
    recommendation = "⚠️ Onglet accessible mais vide — vérifiez que les données sont bien dans l'onglet.";
  } else {
    recommendation = "❌ Inaccessible — vérifiez l'URL et les permissions.";
  }

  return {
    tab: name, csvUrl, pubhtmlUrl,
    csvStatus, csvRows, csvStrategy,
    htmlStatus, htmlRows, htmlStrategy,
    sample,
    recommendation,
  };
}

export async function GET() {
  const results = await Promise.all(
    Object.entries(SHEET_URLS).map(([name, url]) => testTab(name, url))
  );

  const allOk = results.every((r) => r.csvStrategy === "ok" || r.htmlStrategy === "ok");
  const summary = allOk
    ? "✅ Tous les onglets sont accessibles"
    : `⚠️ ${results.filter((r) => r.csvStrategy !== "ok" && r.htmlStrategy !== "ok").length} onglet(s) inaccessible(s)`;

  return NextResponse.json(
    { summary, tabs: results },
    { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}
