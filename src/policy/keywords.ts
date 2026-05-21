import { stripComments } from "./sanitize.js";

export const READ_KEYWORDS: ReadonlySet<string> = new Set([
  "SELECT",
  "EXPLAIN",
  "TABLE",
  "VALUES",
  "SHOW",
]);

export const DDL_KEYWORDS: ReadonlySet<string> = new Set([
  "CREATE",
  "ALTER",
  "DROP",
  "TRUNCATE",
  "RENAME",
  "GRANT",
  "REVOKE",
  "COMMENT",
]);

export interface BannedPattern {
  name: string;
  regex: RegExp;
  reason: string;
}

/** Konstruk SQL yang dilarang oleh kebijakan server (selalu ditolak). */
export const BANNED_PATTERNS: readonly BannedPattern[] = [
  {
    name: "cte",
    regex: /\bWITH\b/i,
    reason:
      "Common Table Expression (WITH ...) tidak diizinkan. Tulis ulang kueri tanpa CTE.",
  },
  {
    name: "row_number",
    regex: /\bROW_NUMBER\s*\(/i,
    reason:
      "Fungsi window ROW_NUMBER() tidak diizinkan. Gunakan pendekatan alternatif (mis. JOIN/agregasi).",
  },
];

/** Ambil keyword pertama dari SQL (huruf besar, tanpa quote). */
export function firstKeyword(sql: string): string {
  const text = stripComments(sql).trim();
  if (!text) return "";
  const token = text.split(/\s+/)[0]!.toUpperCase().replace(/^[`"]|[`"]$/g, "");
  return token;
}
