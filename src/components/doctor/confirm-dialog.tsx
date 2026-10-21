"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Finding } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FixPlanDiff } from "./fix-plan-diff";
import { motionTokens, springs } from "@/lib/motion-tokens";

/** Confirmation for "needs review" fixes: focus trap, Escape closes, scroll lock, aria-modal. */
export function ConfirmDialog({ finding, onConfirm, onCancel }: { finding: Finding | null; onConfirm: () => void; onCancel: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const confirmBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!finding) return;
    const prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const els = panel.current.querySelectorAll<HTMLElement>("button, summary, [href], [tabindex]:not([tabindex='-1'])");
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [finding, onCancel]);

  return (
    <AnimatePresence>
      {finding && (
        <motion.div
          key="confirm"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onCancel} aria-hidden="true" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-line bg-panel p-5 shadow-2xl"
            initial={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
            transition={springs.gentle}
          >
            <h2 id="confirm-title" className="text-base font-semibold">Review this fix</h2>
            <p id="confirm-desc" className="mt-1 text-sm text-muted">
              {`"${finding.title}" changes data a person may care about. Folders are archived, never removed, and you can Undo.`}
            </p>
            <p className="mt-3 text-sm">{finding.fix.summary}</p>
            <div className="mt-3">
              <FixPlanDiff plan={finding.fix} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button ref={confirmBtn} variant="primary" onClick={onConfirm}>Apply anyway</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
