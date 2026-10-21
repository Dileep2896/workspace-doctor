"use client";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/cn";

export function VisibleCounter({ visible, total }: { visible: number; total: number }) {
  const all = visible === total;
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3">
      <div className="text-xs text-muted">Objects visible in the sidebar</div>
      <div className={cn("mt-1 font-mono text-3xl font-semibold tabular-nums", all ? "text-accent" : "text-crit")}>
        <span className="sr-only" data-testid="visible-count">{`${visible}/${total}`}</span>
        <span aria-hidden="true">
          <AnimatedNumber value={visible} />
          <span className="text-muted">/{total}</span>
        </span>
      </div>
    </div>
  );
}
