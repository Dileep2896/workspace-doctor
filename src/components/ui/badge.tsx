import { cn } from "@/lib/cn";
import type { Severity } from "@/lib/types";

const TONE: Record<Severity | "safe" | "review", string> = {
  critical: "text-crit border-crit/40 bg-crit/10",
  warning: "text-warn border-warn/40 bg-warn/10",
  info: "text-info border-info/40 bg-info/10",
  safe: "text-accent border-accent/40 bg-accent/10",
  review: "text-muted border-line bg-panel-2",
};

export function Badge({ tone, children, className }: { tone: keyof typeof TONE; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide", TONE[tone], className)}>
      {children}
    </span>
  );
}
