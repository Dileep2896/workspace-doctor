import { makeFinding, type CheckDef } from "./types";
import { projectionOf } from "../workspace";
import { patchObjectYaml } from "../object-yaml";
import { quoteLiteral, txn } from "../sql";
import type { FixOp } from "../types";

export const nameMismatch: CheckDef = {
  id: "name-mismatch",
  label: "Triple-alignment mismatch",
  severity: "critical",
  run(ix) {
    return ix.s.db.objects.flatMap((o) => {
      const p = projectionOf(ix, o.id);
      if (!p.dir || !p.yaml || p.yamlText === null) return [];
      if (p.dir === o.name && p.yaml.name === o.name) return [];
      const renames = p.dir !== o.name;
      const ops: FixOp[] = [];
      if (renames) ops.push({ kind: "rename", from: p.dir, to: o.name });
      ops.push({ kind: "writeFile", path: `${o.name}/.object.yaml`, content: patchObjectYaml(p.yamlText, { name: o.name }) });
      const prefix = `${p.dir}/`;
      const docs = renames ? ix.s.db.documents.filter((d) => d.file_path.startsWith(prefix)) : [];
      if (docs.length) {
        ops.push({
          kind: "sql",
          sql: txn([
            `UPDATE documents SET file_path = ${quoteLiteral(`${o.name}/`)} || substr(file_path, ${prefix.length + 1}) WHERE file_path LIKE ${quoteLiteral(`${prefix}%`)}`,
          ]),
          effects: [{ type: "rewriteDocumentPrefix", from: p.dir, to: o.name }],
        });
      }
      const disagree = [renames ? `the folder is \`${p.dir}/\`` : "", p.yaml.name !== o.name ? `.object.yaml says \`name: "${p.yaml.name}"\`` : ""]
        .filter(Boolean)
        .join(" and ");
      return [
        makeFinding("name-mismatch", o.name, {
          severity: "critical",
          object: o.name,
          title: `${o.name}: name mismatch (${renames ? `folder ${p.dir}/` : `yaml "${p.yaml.name}"`})`,
          why: `Name alignment: the DuckDB object name, the directory and the .object.yaml name must be identical or the UI will not render the object. The DB row is \`${o.name}\` but ${disagree}, so the sidebar shows nothing for it${renames ? ` and treats \`${p.dir}/\` as a stray folder` : ""}.`,
          evidence: { db: o.name, dir: p.dir, yaml: p.yaml.name },
          safe: true,
          fix: {
            summary: renames
              ? `Rename ${p.dir}/ to ${o.name}/ and set name: "${o.name}"${docs.length ? `, re-point ${docs.length} document(s)` : ""}`
              : `Set name: "${o.name}" in ${o.name}/.object.yaml`,
            ops,
          },
        }),
      ];
    });
  },
};
