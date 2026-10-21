"use client";
import { AnimatePresence, motion } from "framer-motion";
import { FolderX } from "lucide-react";
import type { SidebarSimulation } from "@/lib/sidebar";
import { Segmented } from "@/components/ui/segmented";
import { ObjectIcon } from "./object-icon";
import { springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export function SidebarPreview({
  current,
  after,
  mode,
  onMode,
}: {
  current: SidebarSimulation;
  after: SidebarSimulation;
  mode: "current" | "after";
  onMode: (m: "current" | "after") => void;
}) {
  const sim = mode === "current" ? current : after;
  const items = [...sim.items].sort((a, b) => Number(b.visible) - Number(a.visible) || a.name.localeCompare(b.name));
  return (
    <section aria-label="Sidebar preview" className="rounded-xl border border-line bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div>
          <div className="text-xs font-medium">CRM sidebar</div>
          <div className="text-[11px] text-muted">{`${sim.visibleCount} of ${sim.total} shown`}</div>
        </div>
        <Segmented
          label="Sidebar state"
          value={mode}
          onChange={onMode}
          options={[
            { value: "current", label: "Current" },
            { value: "after", label: "After safe fixes" },
          ]}
        />
      </div>
      <ul className="space-y-0.5 p-2">
        <AnimatePresence initial={false}>
          {items.map((i) => (
            <motion.li
              key={i.name}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={springs.gentle}
              title={i.reason}
              className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm", i.visible ? "text-ink" : "text-muted/60")}
            >
              <ObjectIcon name={i.icon} className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", !i.visible && "line-through")}>{i.name}</span>
              {!i.visible && (
                <>
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-crit" aria-hidden="true" />
                  <span className="sr-only">{`hidden: ${i.reason}`}</span>
                </>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
        {sim.orphans.length > 0 && (
          <li className="mt-2 border-t border-dashed border-line pt-2 text-[11px] uppercase tracking-wide text-muted">Stray folders</li>
        )}
        {sim.orphans.map((o) => (
          <li key={`orphan-${o.dir}`} className="flex items-center gap-2 px-2 py-1 text-sm text-warn">
            <FolderX className="h-4 w-4" aria-hidden="true" />
            <span className="truncate font-mono text-xs">{o.dir}/</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
