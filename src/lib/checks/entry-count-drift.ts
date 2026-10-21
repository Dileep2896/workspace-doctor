import { makeFinding, type CheckDef } from "./types";
import { projectionOf } from "../workspace";
import { patchObjectYaml } from "../object-yaml";

export const entryCountDrift: CheckDef = {
  id: "entry-count-drift",
  label: "Entry count drift",
  severity: "info",
  run(ix) {
    return ix.s.db.objects.flatMap((o) => {
      const p = projectionOf(ix, o.id);
      if (!p.yaml || !p.yamlPath || p.yamlText === null) return [];
      const db = ix.s.db.entryCounts[o.id] ?? 0;
      const yaml = p.yaml.entry_count;
      if (typeof yaml !== "number" || yaml === db) return [];
      return [
        makeFinding("entry-count-drift", o.name, {
          severity: "info",
          object: o.name,
          title: `${o.name}: entry_count ${yaml} in yaml, ${db} in DB`,
          why: `The sidebar badge and object header read \`entry_count\` from .object.yaml, and the CRM skill says to refresh it after every insert ("ENTRY COUNT"). The agent changed ${Math.abs(db - yaml)} entries without updating it, so the UI shows ${yaml} while COUNT(entries) is ${db}.`,
          evidence: { yaml, db },
          safe: true,
          fix: {
            summary: `Set entry_count: ${db}`,
            ops: [{ kind: "writeFile", path: p.yamlPath, content: patchObjectYaml(p.yamlText, { entry_count: db }) }],
          },
        }),
      ];
    });
  },
};
