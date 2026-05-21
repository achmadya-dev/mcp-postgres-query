export function stripComments(sql: string): string {
  const noBlock = sql.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//gs, "");
  const lines: string[] = [];
  for (const line of noBlock.split(/\r?\n/)) {
    lines.push(line.split("--", 1)[0]!);
  }
  return lines.join(" ");
}

export function stripStringLiterals(sql: string): string {
  return sql
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1\$/g, "$$$$")
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/"(?:""|[^"])*"/g, '""');
}

export function normalizeSql(sql: string): string {
  return stripStringLiterals(stripComments(sql));
}
