import type { StatementKind } from "../types.js";
import { DDL_KEYWORDS, READ_KEYWORDS } from "./keywords.js";

export function classifyStatement(keyword: string): StatementKind {
  if (READ_KEYWORDS.has(keyword)) return "read";
  if (keyword === "INSERT") return "insert";
  if (keyword === "UPDATE") return "update";
  if (keyword === "DELETE") return "delete";
  if (DDL_KEYWORDS.has(keyword)) return "ddl";
  return "other";
}
