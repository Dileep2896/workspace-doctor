import { z } from "zod";

/** Mirrors the workspace DuckDB EAV schema. */
export const ObjectRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  /** Legacy column retired in newer schema versions. Only present when objectColumns has "icon". */
  icon: z.string().optional(),
  default_view: z.string().default("table"),
  immutable: z.boolean().default(false),
});

export const ActionSchema = z.object({ label: z.string(), scriptPath: z.string() });

export const FieldRowSchema = z.object({
  id: z.string().min(1),
  object_id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  related_object_id: z.string().optional(),
  relationship_type: z.string().optional(),
  default_value: z.object({ actions: z.array(ActionSchema).optional() }).passthrough().optional(),
  sort_order: z.number().int(),
});

export const DocumentRowSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  file_path: z.string().min(1),
  parent_object_id: z.string().optional(),
  entry_id: z.string().optional(),
});

export const WorkspaceSnapshotSchema = z.object({
  workspaceRoot: z.string().min(1),
  db: z.object({
    objectColumns: z.array(z.string()),
    objects: z.array(ObjectRowSchema),
    fields: z.array(FieldRowSchema),
    entryCounts: z.record(z.string(), z.number().int().nonnegative()),
    entries: z.array(z.object({ id: z.string(), object_id: z.string() })),
    views: z.array(z.object({ name: z.string(), columns: z.array(z.string()) })),
    documents: z.array(DocumentRowSchema),
  }),
  fs: z.object({ dirs: z.array(z.string()), files: z.record(z.string(), z.string()) }),
  /** Errors the real tree route only console.warn()s; surfaced as evidence. */
  meta: z.object({ projectionErrors: z.record(z.string(), z.string()).optional() }).optional(),
});

export type ObjectRow = z.infer<typeof ObjectRowSchema>;
export type FieldRow = z.infer<typeof FieldRowSchema>;
export type DocumentRow = z.infer<typeof DocumentRowSchema>;
export type WorkspaceSnapshot = z.infer<typeof WorkspaceSnapshotSchema>;

export type Severity = "critical" | "warning" | "info";
export const SEVERITY_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export type CheckId =
  | "missing-view"
  | "stale-view"
  | "name-mismatch"
  | "missing-projection"
  | "orphan-folder"
  | "missing-action-script"
  | "entry-count-drift"
  | "schema-drift"
  | "broken-link"
  | "conflict";

/**
 * Structured description of what a SQL statement does, so the pure `applyFix` can
 * replay it on an in-memory snapshot. The `sql` string is what a real DuckDB would run.
 */
export type DbEffect =
  | { type: "createView"; name: string; columns: string[] }
  | { type: "dropView"; name: string }
  | { type: "dropObjectColumn"; column: string }
  | { type: "addObjectColumn"; column: string }
  | { type: "deleteDocument"; id: string }
  | { type: "setDocumentPath"; id: string; file_path: string }
  | { type: "clearDocumentEntry"; id: string }
  | { type: "rewriteDocumentPrefix"; from: string; to: string }
  | { type: "fieldToText"; fieldId: string };

export type FixOp =
  | { kind: "sql"; sql: string; effects?: DbEffect[] }
  | { kind: "mkdir"; path: string }
  | { kind: "writeFile"; path: string; content: string }
  | { kind: "rename"; from: string; to: string }
  | { kind: "move"; from: string; to: string };

export type FixPlan = { summary: string; ops: FixOp[] };

export type Finding = {
  id: string;
  check: CheckId;
  severity: Severity;
  object?: string;
  title: string;
  why: string;
  evidence: Record<string, unknown>;
  fix: FixPlan;
  safe: boolean;
};
