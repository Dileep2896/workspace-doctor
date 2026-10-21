import { makeFinding, type CheckDef } from "./types";
import { archivePathFor } from "../names";
import { NOW } from "../now";

export const orphanFolder: CheckDef = {
  id: "orphan-folder",
  label: "Orphan object folder",
  severity: "warning",
  run(ix) {
    return ix.roots.flatMap((r) => {
      if (!r.yaml || ix.claimed.has(r.dir)) return [];
      const to = archivePathFor(r.dir, NOW);
      return [
        makeFinding("orphan-folder", r.dir, {
          severity: "warning",
          title: `${r.dir}/: folder with .object.yaml but no DB object`,
          why: `\`${r.dir}/.object.yaml\` declares an object named "${r.yaml.name}", but no row in \`objects\` matches it. The tree shows it as an object folder that opens to an empty table, and deleted objects keep reappearing this way. It may hold notes you want, so the Doctor archives it instead of deleting it.`,
          evidence: { dir: r.dir, yamlName: r.yaml.name, yamlEntryCount: r.yaml.entry_count ?? null, dbObject: null },
          safe: false,
          fix: { summary: `Move ${r.dir}/ to ${to}/ (nothing is deleted)`, ops: [{ kind: "move", from: r.dir, to }] },
        }),
      ];
    });
  },
};
