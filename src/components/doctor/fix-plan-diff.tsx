import { Database, FileCode2, FolderInput, FolderPlus } from "lucide-react";
import type { FixPlan } from "@/lib/types";
import { SqlBlock } from "./sql-block";

/** Shows a fix plan as a diff: file operations as +/- lines, SQL highlighted. */
export function FixPlanDiff({ plan }: { plan: FixPlan }) {
  const fileOps = plan.ops.filter((o) => o.kind !== "sql");
  const sqlOps = plan.ops.filter((o) => o.kind === "sql");
  return (
    <div className="space-y-3">
      {fileOps.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-line bg-panel-2 p-3 font-mono text-[12px]" aria-label="File operations">
          {fileOps.map((op, i) => {
            if (op.kind === "mkdir") {
              return (
                <li key={i} className="flex items-center gap-2 text-accent">
                  <FolderPlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="break-all">+ {op.path}/</span>
                </li>
              );
            }
            if (op.kind === "writeFile") {
              return (
                <li key={i}>
                  <details>
                    <summary className="flex cursor-pointer items-center gap-2 text-accent">
                      <FileCode2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="break-all">~ {op.path}</span>
                    </summary>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap border-l-2 border-accent/40 pl-3 text-muted">{op.content}</pre>
                  </details>
                </li>
              );
            }
            if (op.kind === "rename" || op.kind === "move") {
              return (
                <li key={i} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-crit">
                    <FolderInput className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="break-all">− {op.from}/</span>
                  </div>
                  <div className="break-all pl-5 text-accent">+ {op.to}/</div>
                </li>
              );
            }
            return null;
          })}
        </ul>
      )}
      {sqlOps.map((op, i) =>
        op.kind === "sql" ? (
          <div key={i}>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
              <Database className="h-3 w-3" aria-hidden="true" /> DuckDB
            </div>
            <SqlBlock sql={op.sql} />
          </div>
        ) : null,
      )}
    </div>
  );
}
