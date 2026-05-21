import { toJson } from "./json.js";

export interface ToolTextResponse {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
}

export function jsonResponse(payload: unknown): ToolTextResponse {
  return { content: [{ type: "text", text: toJson(payload) }] };
}

export function errorResponse(message: string): ToolTextResponse {
  return jsonResponse({ ok: false, error: message });
}
