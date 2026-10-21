import { makeFinding, plural, type CheckDef } from "./types";
import { viewNameFor } from "../names";
import { pivotViewSql, quoteIdent, txn, viewFieldNames } from "../sql";
import type { DbEffect } from "../types";

const MECHANISM =
  "The sidebar is built from objects that have a live pivot view (the sidebar loader joins `objects` to information_schema.tables on 'v_' + name.replaceAll('-', '_')).";

export const missingView: CheckDef = {
  id: "missing-view",
  label: "Missing pivot view",
  severity: "critical",
  run(ix) {
    return ix.s.db.objects.flatMap((o) => {
      if (ix.hasView(o.name)) return [];
      const expected = viewNameFor(o.name);
      const misnamed = ix.s.db.views.find((v) => v.name !== expected && v.name === `v_${o.name}`);
      const fields = ix.fieldsOf(o.id);
      const count = ix.s.db.entryCounts[o.id] ?? 0;
      const statements: string[] = [];
      const effects: DbEffect[] = [];
      if (misnamed) {
        statements.push(`DROP VIEW IF EXISTS ${quoteIdent(misnamed.name)}`);
        effects.push({ type: "dropView", name: misnamed.name });
      }
      statements.push(pivotViewSql(o, fields));
      effects.push({ type: "createView", name: expected, columns: ["entry_id", ...viewFieldNames(fields)] });
      const why = misnamed
        ? `${MECHANISM} The agent created the view as \`${misnamed.name}\` with a hyphen, so the lookup for \`${expected}\` finds nothing and \`${o.name}\` (${plural(count, "entry")}) is skipped without any error.`
        : `${MECHANISM} \`${o.name}\` has ${plural(fields.length, "field")} and ${plural(count, "entry")} but no \`${expected}\`, so it is skipped without any error.`;
      return [
        makeFinding("missing-view", o.name, {
          severity: "critical",
          object: o.name,
          title: misnamed ? `${o.name}: hidden, view misnamed (${misnamed.name})` : `${o.name}: hidden, no pivot view`,
          why,
          evidence: { expected, found: misnamed?.name ?? null, fields: fields.length, entries: count },
          safe: true,
          fix: {
            summary: misnamed
              ? `Replace ${misnamed.name} with ${expected} (explicit PIVOT)`
              : `Create ${expected} with an explicit PIVOT over ${plural(viewFieldNames(fields).length, "field")}`,
            ops: [{ kind: "sql", sql: txn(statements), effects }],
          },
        }),
      ];
    });
  },
};
