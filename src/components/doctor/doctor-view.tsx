"use client";
import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Stethoscope, Undo2 } from "lucide-react";
import { useDoctor } from "@/hooks/use-doctor";
import { Button } from "@/components/ui/button";
import { ScenarioSwitcher } from "./scenario-switcher";
import { ScoreRing } from "./score-ring";
import { VisibleCounter } from "./visible-counter";
import { SidebarPreview } from "./sidebar-preview";
import { FindingList } from "./finding-list";
import { FindingDetail } from "./finding-detail";
import { ConfirmDialog } from "./confirm-dialog";
import { ExportButton } from "./export-button";
import { springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export function DoctorView() {
  const d = useDoctor("acme");
  const { state, dispatch } = d;
  const cancel = useCallback(() => dispatch({ type: "cancel" }), [dispatch]);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "dismissToast" }), 3500);
    return () => clearTimeout(t);
  }, [state.toast, dispatch]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Workspace Doctor</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Find, explain and fix the CRM objects your agent broke</h1>
        </div>
        <ScenarioSwitcher value={state.scenario} onChange={(scenario) => dispatch({ type: "scenario", scenario })} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,1.15fr)]">
        <aside className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-line bg-panel p-4">
            <ScoreRing score={d.score} />
            <div className="text-sm">
              <div className="text-crit">{d.counts.critical} critical</div>
              <div className="text-warn">{d.counts.warning} warning</div>
              <div className="text-info">{d.counts.info} info</div>
            </div>
          </div>
          <VisibleCounter visible={d.sidebar.visibleCount} total={d.sidebar.total} />
          <SidebarPreview
            current={d.sidebar}
            after={d.afterSidebar}
            mode={state.preview}
            onMode={(preview) => dispatch({ type: "preview", preview })}
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" disabled={!d.safeCount} onClick={() => dispatch({ type: "fixAllSafe" })}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {`Fix all safe issues${d.safeCount ? ` (${d.safeCount})` : ""}`}
            </Button>
            <Button disabled={!state.history.length} onClick={() => dispatch({ type: "undo" })}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Undo
            </Button>
            <ExportButton findings={d.findings} />
          </div>
          {d.safeCount > 0 && (
            <p className="text-xs text-muted">
              {`Safe fixes take the score to ${d.afterScore} and show ${d.afterSidebar.visibleCount}/${d.afterSidebar.total} objects.`}
            </p>
          )}
          <FindingList
            findings={d.findings}
            counts={d.counts}
            filter={state.filter}
            onFilter={(filter) => dispatch({ type: "filter", filter })}
            selectedId={state.selectedId}
            onSelect={(id) => dispatch({ type: "select", id })}
          />
        </div>

        <FindingDetail finding={d.selected} onApply={(id) => dispatch({ type: "apply", id })} />
      </div>

      <ConfirmDialog finding={state.pendingConfirm} onConfirm={() => dispatch({ type: "confirm" })} onCancel={cancel} />

      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col gap-2">
        <AnimatePresence mode="sync">
          {state.toast && (
            <motion.div
              key={state.toast.id}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={springs.snappy}
              className={cn(
                "pointer-events-auto rounded-lg border bg-panel px-4 py-2 text-sm shadow-lg",
                state.toast.tone === "ok" ? "border-accent/40" : "border-crit/50 text-crit",
              )}
            >
              {state.toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
