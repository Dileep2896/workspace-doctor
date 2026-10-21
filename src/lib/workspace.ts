import type { FieldRow, ObjectRow, WorkspaceSnapshot } from "./types";
import { nameVariants, viewNameFor } from "./names";
import { parseObjectYaml, type ObjectYaml } from "./object-yaml";

export type RootDir = { dir: string; yamlPath: string; yamlText: string | null; yaml: ObjectYaml | null };
export type Projection = { dir: string | null; yamlPath: string | null; yamlText: string | null; yaml: ObjectYaml | null };

/** Only root-level directories can be objects (mirrors the tree route; nested folders never are). */
export function rootDirs(s: WorkspaceSnapshot): RootDir[] {
  return s.fs.dirs
    .filter((d) => !d.includes("/") && d !== "tmp" && !d.startsWith("."))
    .sort()
    .map((dir) => {
      const yamlPath = `${dir}/.object.yaml`;
      const yamlText = s.fs.files[yamlPath] ?? null;
      return { dir, yamlPath, yamlText, yaml: yamlText === null ? null : parseObjectYaml(yamlText) };
    });
}

export type WorkspaceIndex = {
  s: WorkspaceSnapshot;
  roots: RootDir[];
  /** objectId -> the directory + yaml that projects it (exact name first, then a plural/singular drift). */
  projection: Map<string, Projection>;
  claimed: Set<string>;
  fieldsOf: (objectId: string) => FieldRow[];
  hasView: (name: string) => boolean;
  objectById: Map<string, ObjectRow>;
};

const EMPTY: Projection = { dir: null, yamlPath: null, yamlText: null, yaml: null };

export function indexWorkspace(s: WorkspaceSnapshot): WorkspaceIndex {
  const roots = rootDirs(s);
  const byDir = new Map(roots.map((r) => [r.dir, r]));
  const dbNames = new Set(s.db.objects.map((o) => o.name));
  const projection = new Map<string, Projection>();
  const claimed = new Set<string>();

  // Pass 1: a folder named exactly like the object always belongs to it.
  for (const o of s.db.objects) {
    const r = byDir.get(o.name);
    if (r) {
      projection.set(o.id, { dir: r.dir, yamlPath: r.yamlText === null ? null : r.yamlPath, yamlText: r.yamlText, yaml: r.yaml });
      claimed.add(r.dir);
    }
  }
  // Pass 2: an unclaimed folder whose name or yaml name is a singular/plural drift of the object.
  for (const o of s.db.objects) {
    if (projection.has(o.id)) continue;
    const variants = new Set(nameVariants(o.name));
    const r = roots.find(
      (x) => !claimed.has(x.dir) && !dbNames.has(x.dir) && x.yaml && (variants.has(x.dir) || variants.has(x.yaml.name)),
    );
    if (r) {
      projection.set(o.id, { dir: r.dir, yamlPath: r.yamlPath, yamlText: r.yamlText, yaml: r.yaml });
      claimed.add(r.dir);
    } else {
      projection.set(o.id, EMPTY);
    }
  }

  const fieldMap = new Map<string, FieldRow[]>();
  for (const f of s.db.fields) fieldMap.set(f.object_id, [...(fieldMap.get(f.object_id) ?? []), f]);
  for (const list of fieldMap.values()) list.sort((a, b) => a.sort_order - b.sort_order);
  const views = new Set(s.db.views.map((v) => v.name));

  return {
    s,
    roots,
    projection,
    claimed,
    fieldsOf: (id) => fieldMap.get(id) ?? [],
    hasView: (name) => views.has(viewNameFor(name)),
    objectById: new Map(s.db.objects.map((o) => [o.id, o])),
  };
}

export function projectionOf(ix: WorkspaceIndex, objectId: string): Projection {
  return ix.projection.get(objectId) ?? EMPTY;
}
