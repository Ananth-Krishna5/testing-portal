/** Escape single quotes for SQLite string literals used by Support Desk /api/query. */
export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}
