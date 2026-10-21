import { viewNameFor } from "./names";

export function quoteIdent(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

export function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

type FieldLike = { name: string; type: string; sort_order: number };

/** Non-action fields in sort order: exactly the columns a v_<object> pivot view exposes. */
export function viewFieldNames(fields: FieldLike[]): string[] {
  return [...fields]
    .filter((f) => f.type !== "action")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((f) => f.name);
}

/**
 * CREATE OR REPLACE VIEW v_<object> as an explicit PIVOT, following
 * the workspace SQL conventions: field names double-quoted, IN (...) listed
 * explicitly, action fields excluded.
 */
export function pivotViewSql(object: { id: string; name: string }, fields: FieldLike[]): string {
  const names = viewFieldNames(fields);
  const inList = names.length ? names.map(quoteIdent).join(", ") : "NULL";
  return [
    `CREATE OR REPLACE VIEW ${quoteIdent(viewNameFor(object.name))} AS`,
    "PIVOT (",
    "  SELECT e.id AS entry_id, f.name AS field_name, ef.value",
    "  FROM entries e",
    "  JOIN entry_fields ef ON ef.entry_id = e.id",
    "  JOIN fields f ON f.id = ef.field_id",
    `  WHERE e.object_id = ${quoteLiteral(object.id)} AND f.type != 'action'`,
    `) ON field_name IN (${inList})`,
    "USING first(value)",
    "GROUP BY entry_id",
  ].join("\n");
}

export function txn(statements: string[]): string {
  const body = statements.map((s) => (s.trimEnd().endsWith(";") ? s.trimEnd() : `${s.trimEnd()};`));
  return ["BEGIN TRANSACTION;", ...body, "COMMIT;"].join("\n");
}
