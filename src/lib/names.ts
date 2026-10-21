/** Minimal POSIX normalize (no node:path, so this module also runs in the browser bundle). */
function normalize(p: string): string {
  const abs = p.startsWith("/");
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      if (out.length && out[out.length - 1] !== "..") out.pop();
      else if (!abs) out.push("..");
      continue;
    }
    out.push(seg);
  }
  const joined = out.join("/");
  return abs ? `/${joined}` : joined || ".";
}

/** The view name the tree route looks for: 'v_' + name.replaceAll('-', '_'). */
export function viewNameFor(objectName: string): string {
  return `v_${objectName.replaceAll("-", "_")}`;
}

/** Singular/plural spellings an agent tends to drift between (opportunity <-> opportunities). */
export function nameVariants(name: string): string[] {
  const out = new Set<string>([name]);
  if (name.endsWith("ies")) out.add(`${name.slice(0, -3)}y`);
  else if (name.endsWith("es")) {
    out.add(name.slice(0, -2));
    out.add(name.slice(0, -1));
  } else if (name.endsWith("s")) out.add(name.slice(0, -1));
  if (name.endsWith("y")) out.add(`${name.slice(0, -1)}ies`);
  if (/(s|x|z|ch|sh)$/.test(name)) out.add(`${name}es`);
  else out.add(`${name}s`);
  return [...out];
}

export class PathTraversalError extends Error {
  constructor(public readonly path: string) {
    super(`Refusing to touch a path outside the workspace root: ${JSON.stringify(path)}`);
    this.name = "PathTraversalError";
  }
}

/**
 * Normalises `p` to a path relative to `root` and throws if it would escape the root.
 * Every file operation the Doctor plans or applies goes through this.
 */
export function resolveInside(root: string, p: string): string {
  if (!p) throw new PathTraversalError(p);
  const normRoot = normalize(root).replace(/\/+$/, "");
  let rel: string;
  if (p.startsWith("/")) {
    const abs = normalize(p);
    if (abs !== normRoot && !abs.startsWith(`${normRoot}/`)) throw new PathTraversalError(p);
    rel = abs.slice(normRoot.length + 1);
  } else {
    rel = normalize(p);
  }
  rel = rel.replace(/\/+$/, "");
  if (!rel || rel === "." || rel === ".." || rel.startsWith("../")) throw new PathTraversalError(p);
  return rel;
}

export function archivePathFor(dir: string, nowIso: string): string {
  return `tmp/doctor-archive/${nowIso.replaceAll(":", "-")}/${dir}`;
}

export function parentDirs(path: string): string[] {
  const parts = path.split("/");
  const out: string[] = [];
  for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join("/"));
  return out;
}
