import { parse, stringify, Scalar, parseDocument } from "yaml";

export type ObjectYamlField = { name: string; type: string; [k: string]: unknown };
export type ObjectYaml = {
  name: string;
  description?: string;
  icon?: string;
  default_view?: string;
  entry_count?: number;
  fields: ObjectYamlField[];
  [k: string]: unknown;
};

/** Parses a .object.yaml; returns null when it is not valid YAML or has no name. */
export function parseObjectYaml(text: string): ObjectYaml | null {
  let data: unknown;
  try {
    data = parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.name !== "string" || !obj.name) return null;
  return { ...obj, name: obj.name, fields: Array.isArray(obj.fields) ? (obj.fields as ObjectYamlField[]) : [] };
}

const KEY_ORDER = ["name", "description", "icon", "default_view", "entry_count", "fields"];

export function emitObjectYaml(doc: ObjectYaml): string {
  const ordered: Record<string, unknown> = {};
  for (const k of KEY_ORDER) if (doc[k] !== undefined) ordered[k] = doc[k];
  for (const [k, v] of Object.entries(doc)) if (!(k in ordered) && v !== undefined) ordered[k] = v;
  const d = parseDocument(stringify(ordered));
  // Always quote the name so YAML never coerces it (e.g. `yes`, `null`, `0123`).
  const nameNode = d.get("name", true);
  if (nameNode instanceof Scalar) nameNode.type = Scalar.QUOTE_DOUBLE;
  return d.toString({ lineWidth: 0 });
}

/** Rewrites only the given top-level keys, preserving the rest of the document. */
export function patchObjectYaml(text: string, patch: Partial<ObjectYaml>): string {
  const current = parseObjectYaml(text) ?? { name: String(patch.name ?? ""), fields: [] };
  return emitObjectYaml({ ...current, ...patch } as ObjectYaml);
}
