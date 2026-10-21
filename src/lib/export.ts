import type { Finding, FixOp } from "./types";
import { NOW } from "./now";

/** POSIX single-quote shell quoting: every path is safe, including spaces, $ and quotes. */
export function shQuote(s: string): string {
  return `'${s.replaceAll("'", `'\\''`)}'`;
}

function heredocTag(content: string): string {
  let tag = "DOCTOR_EOF";
  while (content.includes(tag)) tag += "_";
  return tag;
}

function shellFor(op: FixOp): string[] {
  switch (op.kind) {
    case "mkdir":
      return [`mkdir -p ${shQuote(op.path)}`];
    case "writeFile": {
      const tag = heredocTag(op.content);
      const dir = op.path.split("/").slice(0, -1).join("/");
      return [
        ...(dir ? [`mkdir -p ${shQuote(dir)}`] : []),
        `cat > ${shQuote(op.path)} <<'${tag}'`,
        op.content.replace(/\n$/, ""),
        tag,
      ];
    }
    case "rename":
      return [
        `if [ -e ${shQuote(op.to)} ]; then echo "conflict: ${op.to.replaceAll('"', "")} exists" >&2; exit 1; fi`,
        `mv ${shQuote(op.from)} ${shQuote(op.to)}`,
      ];
    case "move": {
      const parent = op.to.split("/").slice(0, -1).join("/");
      return [
        `if [ -e ${shQuote(op.to)} ]; then echo "conflict: target exists" >&2; exit 1; fi`,
        ...(parent ? [`mkdir -p ${shQuote(parent)}`] : []),
        `mv ${shQuote(op.from)} ${shQuote(op.to)}`,
      ];
    }
    case "sql":
      return [];
  }
}

/**
 * Exports the fix plan as `doctor-fix.sql` (one transaction per finding, run with
 * `duckdb workspace.duckdb < doctor-fix.sql`) and `doctor-fix.sh` (file operations).
 */
export function exportPlan(findings: Finding[]): { sql: string; sh: string } {
  const sql: string[] = [`-- Workspace Doctor fix plan, generated ${NOW}`, "-- Run: duckdb workspace.duckdb < doctor-fix.sql", ""];
  const sh: string[] = [
    "#!/usr/bin/env bash",
    `# Workspace Doctor fix plan, generated ${NOW}`,
    "set -euo pipefail",
    'cd "${WORKSPACE_DIR:?set WORKSPACE_DIR to your workspace folder}"',
    "",
  ];
  for (const f of findings) {
    const sqlOps = f.fix.ops.filter((o) => o.kind === "sql");
    if (sqlOps.length) sql.push(`-- ${f.id}`, ...sqlOps.map((o) => (o.kind === "sql" ? o.sql : "")), "");
    const fsLines = f.fix.ops.flatMap(shellFor);
    if (fsLines.length) sh.push(`# ${f.id}`, ...fsLines, "");
  }
  return { sql: sql.join("\n"), sh: sh.join("\n") };
}
