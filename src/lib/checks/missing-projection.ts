import { makeFinding, plural, type CheckDef } from "./types";
import { projectionOf } from "../workspace";
import { emitObjectYaml } from "../object-yaml";
import { viewNameFor } from "../names";

export const missingProjection: CheckDef = {
  id: "missing-projection",
  label: "Missing filesystem projection",
  severity: "critical",
  run(ix) {
    return ix.s.db.objects.flatMap((o) => {
      const p = projectionOf(ix, o.id);
      if (p.dir && p.yaml) return [];
      const count = ix.s.db.entryCounts[o.id] ?? 0;
      const fields = ix.fieldsOf(o.id);
      const lastProjectionError = ix.s.meta?.projectionErrors?.[o.name];
      const yaml = emitObjectYaml({
        name: o.name,
        description: o.description,
        icon: o.icon,
        default_view: o.default_view,
        entry_count: count,
        fields: fields.map((f) => ({ name: f.name, type: f.type })),
      });
      return [
        makeFinding("missing-projection", o.name, {
          severity: "critical",
          object: o.name,
          title: p.dir ? `${o.name}: folder has no .object.yaml` : `${o.name}: DB-only object, no folder or .object.yaml`,
          why: `Every object must be projected to \`<name>/.object.yaml\` ("NEVER SKIP FILESYSTEM PROJECTION ... the object will be invisible in the sidebar"). \`${o.name}\` has ${plural(count, "entry")} in DuckDB but ${p.dir ? "its folder has no .object.yaml" : "no folder on disk"}. The tree route tries to self-heal this on each request, but its errors only go to console.warn${lastProjectionError ? ` (last one: ${lastProjectionError})` : ""}.`,
          evidence: {
            db: o.name,
            view: ix.hasView(o.name) ? viewNameFor(o.name) : null,
            dir: p.dir,
            yaml: null,
            entries: count,
            ...(lastProjectionError ? { lastProjectionError } : {}),
          },
          safe: true,
          fix: {
            summary: `Create ${o.name}/ and write .object.yaml from ${plural(fields.length, "DB field")}`,
            ops: [
              { kind: "mkdir", path: o.name },
              { kind: "writeFile", path: `${o.name}/.object.yaml`, content: yaml },
            ],
          },
        }),
      ];
    });
  },
};
