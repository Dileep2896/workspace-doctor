import type { DbEffect, Finding, WorkspaceSnapshot } from "./types";
import { diagnose } from "./checks";
import { parentDirs, resolveInside } from "./names";

export class FixConflictError extends Error {
  constructor(public readonly finding: Finding) {
    super(finding.title);
    this.name = "FixConflictError";
  }
}

export type ApplyResult = { snapshot: WorkspaceSnapshot; conflict?: Finding };

function ensureDir(s: WorkspaceSnapshot, path: string) {
  for (const d of [...parentDirs(path), path]) if (!s.fs.dirs.includes(d)) s.fs.dirs.push(d);
}

const dirExists = (s: WorkspaceSnapshot, path: string) =>
  s.fs.dirs.includes(path) || Object.keys(s.fs.files).some((f) => f.startsWith(`${path}/`));

const swapPrefix = (p: string, from: string, to: string) =>
  p === from ? to : p.startsWith(`${from}/`) ? `${to}${p.slice(from.length)}` : p;

/** Moves a directory subtree (dirs + files) from `from` to `to` inside the snapshot. */
function moveTree(s: WorkspaceSnapshot, from: string, to: string) {
  s.fs.dirs = [...new Set(s.fs.dirs.map((d) => swapPrefix(d, from, to)))];
  s.fs.files = Object.fromEntries(Object.entries(s.fs.files).map(([p, c]) => [swapPrefix(p, from, to), c]));
  ensureDir(s, to);
}

function applyEffect(s: WorkspaceSnapshot, e: DbEffect) {
  const db = s.db;
  switch (e.type) {
    case "createView":
      db.views = [...db.views.filter((v) => v.name !== e.name), { name: e.name, columns: [...e.columns] }];
      break;
    case "dropView":
      db.views = db.views.filter((v) => v.name !== e.name);
      break;
    case "dropObjectColumn":
      db.objectColumns = db.objectColumns.filter((c) => c !== e.column);
      if (e.column === "icon") for (const o of db.objects) delete o.icon;
      break;
    case "addObjectColumn":
      if (!db.objectColumns.includes(e.column)) db.objectColumns.push(e.column);
      break;
    case "deleteDocument":
      db.documents = db.documents.filter((d) => d.id !== e.id);
      break;
    case "setDocumentPath":
      for (const d of db.documents) if (d.id === e.id) d.file_path = e.file_path;
      break;
    case "clearDocumentEntry":
      for (const d of db.documents) if (d.id === e.id) delete d.entry_id;
      break;
    case "rewriteDocumentPrefix":
      for (const d of db.documents) d.file_path = swapPrefix(d.file_path, e.from, e.to);
      break;
    case "fieldToText":
      for (const f of db.fields) {
        if (f.id !== e.fieldId) continue;
        f.type = "text";
        delete f.related_object_id;
        delete f.relationship_type;
      }
      break;
  }
}

function conflictFor(finding: Finding, from: string, to: string): Finding {
  const subject = finding.object ?? to;
  return {
    id: `conflict:${subject}`,
    check: "conflict",
    severity: "critical",
    object: finding.object,
    title: `Blocked: ${to}/ already exists`,
    why: `Applying "${finding.title}" would move ${from}/ onto ${to}/, which already exists. The Doctor never overwrites a folder, so nothing was changed. Merge or archive ${to}/ by hand, then run the Doctor again.`,
    evidence: { from, to, blockedFinding: finding.id },
    safe: false,
    fix: { summary: "Manual review required", ops: [] },
  };
}

/**
 * Pure: replays a finding's fix plan on a deep copy of the snapshot. Every path is checked with
 * resolveInside (throws PathTraversalError). A rename/move onto an existing directory returns the
 * original snapshot plus a `conflict` finding instead of overwriting.
 */
export function applyFixDetailed(snapshot: WorkspaceSnapshot, finding: Finding): ApplyResult {
  const next = structuredClone(snapshot);
  const root = next.workspaceRoot;
  for (const op of finding.fix.ops) {
    switch (op.kind) {
      case "sql":
        for (const e of op.effects ?? []) applyEffect(next, e);
        break;
      case "mkdir":
        ensureDir(next, resolveInside(root, op.path));
        break;
      case "writeFile": {
        const p = resolveInside(root, op.path);
        const parent = p.split("/").slice(0, -1).join("/");
        if (parent) ensureDir(next, parent);
        next.fs.files[p] = op.content;
        break;
      }
      case "rename":
      case "move": {
        const from = resolveInside(root, op.from);
        const to = resolveInside(root, op.to);
        if (dirExists(next, to)) return { snapshot, conflict: conflictFor(finding, from, to) };
        moveTree(next, from, to);
        break;
      }
    }
  }
  if (next.meta?.projectionErrors && finding.check === "missing-projection" && finding.object) {
    delete next.meta.projectionErrors[finding.object];
  }
  return { snapshot: next };
}

export function applyFix(snapshot: WorkspaceSnapshot, finding: Finding): WorkspaceSnapshot {
  const r = applyFixDetailed(snapshot, finding);
  if (r.conflict) throw new FixConflictError(r.conflict);
  return r.snapshot;
}

/**
 * Applies fixes in severity order, re-diagnosing after each one so every plan is computed
 * against the current state. Conflicts are skipped, never forced.
 */
export function applyAll(snapshot: WorkspaceSnapshot, opts: { safeOnly?: boolean } = {}): WorkspaceSnapshot {
  let s = snapshot;
  const attempted = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const next = diagnose(s).find((f) => (!opts.safeOnly || f.safe) && !attempted.has(f.id));
    if (!next) break;
    attempted.add(next.id);
    s = applyFixDetailed(s, next).snapshot;
  }
  return s;
}

export const HISTORY_LIMIT = 50;

export function pushHistory(history: WorkspaceSnapshot[], snapshot: WorkspaceSnapshot): WorkspaceSnapshot[] {
  return [...history, snapshot].slice(-HISTORY_LIMIT);
}

export function undo(history: WorkspaceSnapshot[], current: WorkspaceSnapshot) {
  const prev = history[history.length - 1];
  if (!prev) return { snapshot: current, history };
  return { snapshot: prev, history: history.slice(0, -1) };
}
