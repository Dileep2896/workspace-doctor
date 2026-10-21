import { makeFinding, type CheckDef } from "./types";
import { projectionOf } from "../workspace";
import { patchObjectYaml } from "../object-yaml";
import { txn } from "../sql";
import type { Finding, FixOp } from "../types";

const REQUIRED: Record<string, string> = {
  hidden_in_sidebar: "BOOLEAN DEFAULT false",
  sort_order: "INTEGER DEFAULT 0",
};

export const schemaDrift: CheckDef = {
  id: "schema-drift",
  label: "objects schema drift",
  severity: "info",
  run(ix) {
    const cols = ix.s.db.objectColumns;
    const out: Finding[] = [];
    if (cols.includes("icon")) {
      const ops: FixOp[] = [];
      const withIcon = ix.s.db.objects.filter((o) => o.icon);
      for (const o of withIcon) {
        const p = projectionOf(ix, o.id);
        if (p.yamlPath && p.yamlText !== null) {
          ops.push({ kind: "writeFile", path: p.yamlPath, content: patchObjectYaml(p.yamlText, { icon: o.icon }) });
        }
      }
      ops.push({ kind: "sql", sql: txn(["ALTER TABLE objects DROP COLUMN icon"]), effects: [{ type: "dropObjectColumn", column: "icon" }] });
      out.push(
        makeFinding("schema-drift", "objects.icon", {
          severity: "info",
          title: "objects table still has the legacy icon column",
          why: "Icons moved from the `objects` table into .object.yaml. Users of agent-built CRMs report what drift here does: when the server and the DB disagree about the `icon` column, the tree query throws a Binder Error, the tree builder receives zero objects and the whole sidebar goes empty. Copying the icons into yaml first keeps them.",
          evidence: { column: "icon", objectsWithIcon: withIcon.map((o) => o.name), columns: cols },
          safe: false,
          fix: { summary: `Copy ${withIcon.length} icon(s) into .object.yaml, then drop the icon column`, ops },
        }),
      );
    }
    for (const [col, ddl] of Object.entries(REQUIRED)) {
      if (cols.includes(col)) continue;
      out.push(
        makeFinding("schema-drift", `objects.${col}`, {
          severity: "info",
          title: `objects table is missing ${col}`,
          why: `The running UI selects \`objects.${col}\`. A workspace created by an older version of the app never got that migration, so the query fails and the sidebar can come back empty.`,
          evidence: { column: col, columns: cols },
          safe: false,
          fix: {
            summary: `Add ${col} to objects (IF NOT EXISTS)`,
            ops: [
              {
                kind: "sql",
                sql: txn([`ALTER TABLE objects ADD COLUMN IF NOT EXISTS ${col} ${ddl}`]),
                effects: [{ type: "addObjectColumn", column: col }],
              },
            ],
          },
        }),
      );
    }
    return out;
  },
};
