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

export const BANNED_PATTERNS: readonly BannedPattern[] = [
  {
    name: "cte",
    regex: /\bWITH\b/i,
    reason:
      "Common Table Expression (WITH ...) is not allowed. Rewrite the query without a CTE.",
  },
  {
    name: "row_number",
    regex: /\bROW_NUMBER\s*\(/i,
    reason:
      "Window function ROW_NUMBER() is not allowed. Use an alternative approach (e.g. JOIN/aggregation).",
  },
];

export function firstKeyword(sql: string): string {
  const text = stripComments(sql).trim();
  if (!text) return "";
  const token = text.split(/\s+/)[0]!.toUpperCase().replace(/^[`"]|[`"]$/g, "");
  return token;
}
