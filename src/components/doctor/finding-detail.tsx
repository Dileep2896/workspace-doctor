"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import type { Finding } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceTable } from "./evidence-table";
import { FixPlanDiff } from "./fix-plan-diff";
import { motionTokens } from "@/lib/motion-tokens";

/** Renders `code` spans written with backticks in the why copy. */
export function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((p, i) =>
        p.startsWith("`") ? (
          <code key={i} className="rounded bg-panel-2 px-1 font-mono text-[0.85em]">{p.slice(1, -1)}</code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function FindingDetail({ finding, onApply }: { finding: Finding | null; onApply: (id: string) => void }) {
  return (
    <section aria-label="Finding detail" className="min-w-0 rounded-xl border border-line bg-panel p-4">
      <AnimatePresence mode="wait" initial={false}>
        {finding ? (
          <motion.div
            key={finding.id}
            initial={{ opacity: 0, y: motionTokens.distance.sm }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -motionTokens.distance.sm }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
            className="space-y-4"
          >
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={finding.severity}>{finding.severity}</Badge>
                <Badge tone={finding.safe ? "safe" : "review"}>{finding.safe ? "safe fix" : "needs review"}</Badge>
                <span className="break-all font-mono text-[11px] text-muted">{finding.id}</span>
              </div>
              <h2 className="text-lg font-semibold leading-snug">{finding.title}</h2>
            </header>
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Why the UI hides or breaks this</h3>
              <p className="text-sm leading-relaxed">
                <Prose text={finding.why} />
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Evidence</h3>
              <EvidenceTable evidence={finding.evidence} />
            </div>
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Fix plan</h3>
              <p className="mb-2 text-sm">{finding.fix.summary}</p>
              <FixPlanDiff plan={finding.fix} />
            </div>
            <Button variant="primary" onClick={() => onApply(finding.id)}>
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Apply fix
            </Button>
          </motion.div>
        ) : (
          <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-muted">
            Select a finding to see why it breaks the UI and the exact fix.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
