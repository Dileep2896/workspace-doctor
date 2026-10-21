import type { WorkspaceSnapshot } from "./types";
import { viewNameFor } from "./names";
import { indexWorkspace, projectionOf } from "./workspace";

export type SidebarItem = { name: string; icon?: string; visible: boolean; reason: string; dir: string | null };
export type SidebarSimulation = {
  items: SidebarItem[];
  /** Root folders with a .object.yaml that do not render as a DB object. */
  orphans: { dir: string; yamlName: string }[];
  visibleCount: number;
  total: number;
};

/**
 * Re-implements what a typical tree route renders: DB objects joined to a view named
 * 'v_' + name.replaceAll('-', '_'), and only root-level folders whose name and .object.yaml
 * name both equal the DB name.
 */
export function simulateSidebar(s: WorkspaceSnapshot): SidebarSimulation {
  const ix = indexWorkspace(s);
  const items: SidebarItem[] = s.db.objects.map((o) => {
    const p = projectionOf(ix, o.id);
    const yamlIcon = typeof p.yaml?.icon === "string" ? p.yaml.icon : undefined;
    const base = { name: o.name, icon: o.icon ?? yamlIcon, dir: p.dir };
    if (!ix.hasView(o.name)) return { ...base, visible: false, reason: `no ${viewNameFor(o.name)} view, so the sidebar loader skips it` };
    if (!p.dir) return { ...base, visible: false, reason: "no folder on disk" };
    if (!p.yaml) return { ...base, visible: false, reason: "folder has no .object.yaml" };
    if (p.dir !== o.name) return { ...base, visible: false, reason: `folder is ${p.dir}/, not ${o.name}/` };
    if (p.yaml.name !== o.name) return { ...base, visible: false, reason: `.object.yaml name is "${p.yaml.name}"` };
    return { ...base, visible: true, reason: "aligned" };
  });
  const visibleNames = new Set(items.filter((i) => i.visible).map((i) => i.name));
  const orphans = ix.roots
    .filter((r) => r.yaml && !visibleNames.has(r.dir))
    .map((r) => ({ dir: r.dir, yamlName: r.yaml?.name ?? "" }));
  return { items, orphans, visibleCount: visibleNames.size, total: items.length };
}
