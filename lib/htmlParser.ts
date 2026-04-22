/**
 * Parse an HTML table from a Google Sheets pubhtml response.
 *
 * Google Sheets pubhtml structure:
 *   <table class="waffle">
 *     <thead>
 *       <tr>
 *         <th class="freezebar-…"></th>   ← row-number column, skip
 *         …
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr>
 *         <th class="row-headers-background">  ← row-number cell, skip
 *         <td class="s0 softmerge">…</td>      ← actual data cells
 *         …
 *       </tr>
 *     </tbody>
 *   </table>
 *
 * The first <tr> in <tbody> is the header row (column names).
 * All subsequent <tr> rows are data rows.
 */

type RawRow = Record<string, string>;

/** Strip HTML tags and decode common HTML entities from a cell value. */
function cleanCell(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .trim();
}

/** Extract all <td>…</td> content from a single <tr> string. */
function extractCells(trHtml: string): string[] {
  const cells: string[] = [];
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m: RegExpExecArray | null;
  while ((m = tdRegex.exec(trHtml)) !== null) {
    cells.push(cleanCell(m[1]));
  }
  return cells;
}

/** Extract all <tr>…</tr> strings from an HTML string. */
function extractRows(html: string): string[] {
  const rows: string[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m: RegExpExecArray | null;
  while ((m = trRegex.exec(html)) !== null) {
    rows.push(m[1]);
  }
  return rows;
}

/**
 * Main parser: HTML string → array of plain objects.
 * Returns [] if no valid table is found.
 */
export function parseHtmlTable(html: string, options: { stopAtEmptyRow?: boolean } = {}): RawRow[] {
  // Quick sanity check
  if (!html.includes("<table") || !html.includes("<td")) {
    return [];
  }

  // Extract the first <table>…</table> block
  const tableMatch = html.match(/<table[\s\S]*?>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rows = extractRows(tableHtml);

  if (rows.length < 2) return [];

  // Find the first row with >= 3 non-empty cells — the real header row.
  // Rows above it are decorative (title, description, section labels).
  let headerRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (extractCells(rows[i]).filter((c) => c !== "").length >= 3) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) return [];

  const headers = extractCells(rows[headerRowIndex]).map((h) =>
    h.toLowerCase().trim().replace(/\s+/g, "_")
  );

  // Skip rows where all cells are empty (blank separator rows in Sheets)
  const dataRows: RawRow[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const cells = extractCells(rows[i]);
    if (cells.every((c) => c === "")) {
      if (options.stopAtEmptyRow) break;
      continue;
    }

    const row: RawRow = {};
    headers.forEach((header, j) => {
      if (header) row[header] = cells[j] ?? "";
    });
    dataRows.push(row);
  }

  return dataRows;
}

/**
 * Detect whether a response body is an HTML login/error page (not sheet data).
 * Google returns a JS-heavy login redirect when the sheet is not public.
 */
export function isLoginPage(body: string): boolean {
  return (
    body.includes("accounts.google.com") ||
    body.includes("show-login-page") ||
    body.includes("storage_access_granted") ||
    (body.includes("<!DOCTYPE html>") && !body.includes("<table"))
  );
}
