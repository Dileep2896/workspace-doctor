import { makeFinding, type CheckDef } from "./types";
import { projectionOf } from "../workspace";
import type { FixOp } from "../types";

function stub(objectName: string, label: string, file: string): string {
  return [
    "#!/usr/bin/env node",
    `// Stub created by Workspace Doctor for action "${label}" on object "${objectName}".`,
    "// Replace with the real implementation; the button now reports TODO instead of 'Script not found'.",
    `console.log(JSON.stringify({ ok: false, message: ${JSON.stringify(`TODO: implement ${file}`)} }));`,
    "process.exit(0);",
    "",
  ].join("\n");
}

export const missingActionScript: CheckDef = {
  id: "missing-action-script",
  label: "Missing action script",
  severity: "warning",
  run(ix) {
    return ix.s.db.objects.flatMap((o) => {
      const dir = projectionOf(ix, o.id).dir ?? o.name;
      const missing: { path: string; label: string; file: string }[] = [];
      for (const f of ix.fieldsOf(o.id)) {
        if (f.type !== "action") continue;
        for (const a of f.default_value?.actions ?? []) {
          const path = `${dir}/.actions/${a.scriptPath}`;
          if (!(path in ix.s.fs.files)) missing.push({ path, label: a.label, file: a.scriptPath });
        }
      }
      if (!missing.length) return [];
      const ops: FixOp[] = [{ kind: "mkdir", path: `${dir}/.actions` }];
      for (const m of missing) ops.push({ kind: "writeFile", path: m.path, content: stub(o.name, m.label, m.file) });
      return [
        makeFinding("missing-action-script", o.name, {
          severity: "warning",
          object: o.name,
          title: `${o.name}: "${missing.map((m) => m.label).join('", "')}" button has no script`,
          why: `Action fields run \`<object>/.actions/<scriptPath>\` when clicked, and the actions skill warns that skipping the script makes the button show "Script not found". ${missing.map((m) => `\`${m.path}\``).join(", ")} does not exist.`,
          evidence: { missing: missing.map((m) => m.path), actions: missing.map((m) => m.label) },
          safe: true,
          fix: { summary: `Write ${missing.length} stub script(s) that report TODO and exit 0`, ops },
        }),
      ];
    });
  },
};
