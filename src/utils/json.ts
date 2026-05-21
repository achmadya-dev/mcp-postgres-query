export function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && Buffer.isBuffer(value)) {
    return (value as Buffer).toString("base64");
  }
  return value;
}

export function toJson(payload: unknown): string {
  return JSON.stringify(payload, jsonReplacer, 2);
}
