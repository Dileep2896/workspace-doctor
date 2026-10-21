import type { DocumentRow, FieldRow, ObjectRow, WorkspaceSnapshot } from "@/lib/types";
import { viewNameFor } from "@/lib/names";
import { viewFieldNames } from "@/lib/sql";
import { emitObjectYaml } from "@/lib/object-yaml";

export const DEFAULT_ROOT = "/Users/demo/.agent-crm/workspace";

/** Columns of `objects` the current UI queries. */
export const CURRENT_OBJECT_COLUMNS = [
  "id",
  "name",
  "description",
  "default_view",
  "immutable",
  "hidden_in_sidebar",
  "sort_order",
  "created_at",
  "updated_at",
];

export type FieldSpec = {
  name: string;
  type?: string;
  related?: string;
  relationship_type?: string;
  actions?: { label: string; scriptPath: string }[];
};

export type ObjectSpec = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  default_view?: string;
  count: number;
  fields: FieldSpec[];
};

export type ObjectState = {
  /** "ok" (default) builds the correct view; "none" omits it; an object overrides name/columns. */
  view?: "ok" | "none" | { name?: string; columns?: string[] };
  /** Root directory name; null = no directory at all. Defaults to the object name. */
  dir?: string | null;
  /** `name:` written in .object.yaml; null = no yaml file. Defaults to the object name. */
  yamlName?: string | null;
  yamlEntryCount?: number;
  /** Create the .actions scripts referenced by action fields (default true). */
  scripts?: boolean;
};

/** Small fluent builder so seeds and tests describe workspaces declaratively. */
export class WorkspaceBuilder {
  private s: WorkspaceSnapshot;

  constructor(opts: { root?: string; objectColumns?: string[] } = {}) {
    this.s = {
      workspaceRoot: opts.root ?? DEFAULT_ROOT,
      db: {
        objectColumns: opts.objectColumns ?? [...CURRENT_OBJECT_COLUMNS],
        objects: [],
        fields: [],
        entryCounts: {},
        entries: [],
        views: [],
        documents: [],
      },
      fs: { dirs: [], files: {} },
    };
  }

  addObject(spec: ObjectSpec, state: ObjectState = {}): this {
    const row: ObjectRow = {
      id: spec.id,
      name: spec.name,
      description: spec.description,
      default_view: spec.default_view ?? "table",
      immutable: false,
    };
    if (spec.icon) row.icon = spec.icon;
    this.s.db.objects.push(row);

    const fields: FieldRow[] = spec.fields.map((f, i) => ({
      id: `${spec.id}_f${i}`,
      object_id: spec.id,
      name: f.name,
      type: f.type ?? (f.related ? "relation" : "text"),
      related_object_id: f.related,
      relationship_type: f.related ? (f.relationship_type ?? "many_to_one") : undefined,
      default_value: f.actions ? { actions: f.actions } : undefined,
      sort_order: i,
    }));
    this.s.db.fields.push(...fields);
    this.s.db.entryCounts[spec.id] = spec.count;

    const view = state.view ?? "ok";
    if (view !== "none") {
      const cols = ["entry_id", ...viewFieldNames(fields)];
      this.s.db.views.push(
        view === "ok"
          ? { name: viewNameFor(spec.name), columns: cols }
          : { name: view.name ?? viewNameFor(spec.name), columns: view.columns ?? cols },
      );
    }

    const dir = state.dir === undefined ? spec.name : state.dir;
    if (dir !== null) {
      this.addDir(dir);
      const yamlName = state.yamlName === undefined ? spec.name : state.yamlName;
      if (yamlName !== null) {
        this.s.fs.files[`${dir}/.object.yaml`] = emitObjectYaml({
          name: yamlName,
          description: spec.description,
          icon: spec.icon,
          default_view: row.default_view,
          entry_count: state.yamlEntryCount ?? spec.count,
          fields: fields.map((f) => ({ name: f.name, type: f.type })),
        });
      }
      if (state.scripts !== false) {
        for (const f of spec.fields) {
          for (const a of f.actions ?? []) {
            this.addDir(`${dir}/.actions`);
            this.s.fs.files[`${dir}/.actions/${a.scriptPath}`] =
              `#!/usr/bin/env node\nconsole.log(JSON.stringify({ ok: true, message: ${JSON.stringify(a.label)} }));\n`;
          }
        }
      }
    }
    return this;
  }

  addDir(path: string): this {
    const parts = path.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const d = parts.slice(0, i).join("/");
      if (!this.s.fs.dirs.includes(d)) this.s.fs.dirs.push(d);
    }
    return this;
  }

  addFile(path: string, content: string): this {
    const parent = path.split("/").slice(0, -1).join("/");
    if (parent) this.addDir(parent);
    this.s.fs.files[path] = content;
    return this;
  }

  addEntry(id: string, objectId: string): this {
    this.s.db.entries.push({ id, object_id: objectId });
    return this;
  }

  addDocument(doc: DocumentRow): this {
    this.s.db.documents.push(doc);
    return this;
  }

  withProjectionError(object: string, message: string): this {
    this.s.meta = { projectionErrors: { ...this.s.meta?.projectionErrors, [object]: message } };
    return this;
  }

  /** Mutate the raw snapshot for edge cases the fluent API does not cover. */
  tweak(fn: (s: WorkspaceSnapshot) => void): this {
    fn(this.s);
    return this;
  }

  build(): WorkspaceSnapshot {
    return structuredClone(this.s);
  }
}
