"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import type { Finding, Severity } from "@/lib/types";
import type { Filter } from "@/hooks/use-doctor";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export function FindingList({
  findings,
  counts,
  filter,
  onFilter,
  selectedId,
  onSelect,
}: {
  findings: Finding[];
  counts: Record<Severity, number>;
  filter: Filter;
  onFilter: (f: Filter) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const shown = filter === "all" ? findings : findings.filter((f) => f.severity === filter);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Segmented
        label="Severity filter"
        value={filter}
        onChange={onFilter}
        options={[
          { value: "all", label: `All ${findings.length}` },
          { value: "critical", label: `Critical ${counts.critical}` },
          { value: "warning", label: `Warning ${counts.warning}` },
          { value: "info", label: `Info ${counts.info}` },
        ]}
      />
      {findings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: motionTokens.distance.sm }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-10 text-center"
        >
          <CircleCheck className="h-8 w-8 text-accent" aria-hidden="true" />
          <p className="font-medium">All clear: every object is visible.</p>
          <p className="text-sm text-muted">DB rows, pivot views, folders and .object.yaml files agree.</p>
        </motion.div>
      )}
      <ul aria-label="Findings" className="flex flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((f) => (
            <motion.li
              key={f.id}
              layout="position"
              initial={{ opacity: 0, y: motionTokens.distance.sm }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: motionTokens.distance.xl, transition: { duration: motionTokens.duration.normal } }}
              transition={springs.gentle}
            >
              <button
                type="button"
                onClick={() => onSelect(f.id)}
                aria-current={f.id === selectedId ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  f.id === selectedId ? "border-accent/60 bg-panel-2" : "border-line bg-panel hover:bg-panel-2",
                )}
              >
                <Badge tone={f.severity} className="mt-0.5 shrink-0">{f.severity}</Badge>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{f.title}</span>
                  <span className="block truncate font-mono text-[11px] text-muted">{f.id}</span>
                </span>
                <Badge tone={f.safe ? "safe" : "review"} className="mt-0.5 shrink-0">{f.safe ? "safe" : "review"}</Badge>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {findings.length > 0 && shown.length === 0 && <p className="text-sm text-muted">{`No ${filter} findings.`}</p>}
    </div>
  );
}
