import { makeFinding, type CheckDef } from "./types";
import { viewNameFor } from "../names";
import { pivotViewSql, txn, viewFieldNames } from "../sql";

export const staleView: CheckDef = {
  id: "stale-view",
  label: "Stale pivot view",
  severity: "warning",
  run(ix) {
    return ix.s.db.objects.flatMap((o) => {
      const name = viewNameFor(o.name);
      const view = ix.s.db.views.find((v) => v.name === name);
      if (!view) return [];
      const fields = ix.fieldsOf(o.id);
      const expected = ["entry_id", ...viewFieldNames(fields)];
      const missingColumns = expected.filter((c) => !view.columns.includes(c));
      const extraColumns = view.columns.filter((c) => !expected.includes(c));
      if (!missingColumns.length && !extraColumns.length) return [];
      const parts = [
        missingColumns.length ? `is missing ${missingColumns.map((c) => `"${c}"`).join(", ")}` : "",
        extraColumns.length ? `still exposes deleted ${extraColumns.map((c) => `"${c}"`).join(", ")}` : "",
      ].filter(Boolean);
      return [
        makeFinding("stale-view", o.name, {
          severity: "warning",
          object: o.name,
          title: `${o.name}: view out of date (${[...missingColumns, ...extraColumns].join(", ")})`,
          why: `Pivot views list their columns explicitly (PIVOT ... IN (...)), so a view built before a field was added or removed never picks the change up. \`${name}\` ${parts.join(" and ")}, so the table view shows the wrong columns and filters on them fail.`,
          evidence: { view: name, viewColumns: view.columns, expectedColumns: expected, missingColumns, extraColumns },
          safe: true,
          fix: {
            summary: `Regenerate ${name} from the current fields`,
            ops: [{ kind: "sql", sql: txn([pivotViewSql(o, fields)]), effects: [{ type: "createView", name, columns: expected }] }],
          },
        }),
      ];
    });
  },
};
