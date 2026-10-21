"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Megaphone, Search, MessageSquareText, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { highlightSql } from "@/components/doctor/sql-block";
import { Section, rise } from "./shared";

const SQL = 'CREATE OR REPLACE VIEW "v_campaign" AS\nPIVOT (...) ON field_name\nIN ("Name", "Channel", "Budget", "Status")';

function loop(reduced: boolean | null, t: Record<string, unknown> = {}) {
  return reduced ? { duration: 0 } : { duration: 2.4, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" as const, ...t };
}

export function Steps() {
  const reduced = useReducedMotion();
  return (
    <Section label="The feature" eyebrow="The feature">
      <motion.h2 variants={rise} className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Diagnose. Explain. Fix.
      </motion.h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <motion.div variants={rise} className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center gap-2 text-accent"><Search className="h-4 w-4" aria-hidden="true" /><span className="font-mono text-xs uppercase tracking-[0.2em]">1 · Diagnose</span></div>
          <p className="mt-2 text-sm text-muted">9 checks over the DuckDB catalog and the files, drawn from the failure modes users report in this space.</p>
          <motion.div
            className="mt-4 flex items-center gap-2 rounded-lg border border-crit/40 bg-panel-2 px-3 py-2 text-sm"
            animate={reduced ? undefined : { boxShadow: ["0 0 0 0 rgba(248,113,113,0)", "0 0 0 6px rgba(248,113,113,0.18)", "0 0 0 0 rgba(248,113,113,0)"] }}
            transition={loop(reduced)}
          >
            <Badge tone="critical">critical</Badge>
            <span className="truncate">campaign: hidden, no pivot view</span>
          </motion.div>
        </motion.div>
        <motion.div variants={rise} className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center gap-2 text-accent"><MessageSquareText className="h-4 w-4" aria-hidden="true" /><span className="font-mono text-xs uppercase tracking-[0.2em]">2 · Explain</span></div>
          <p className="mt-2 text-sm text-muted">Plain English on why the UI hides it, plus the exact SQL and file diff.</p>
          <pre className="relative mt-4 overflow-hidden rounded-lg border border-line bg-panel-2 p-3 font-mono text-[11px] leading-relaxed">
            <code>{highlightSql(SQL)}</code>
            {!reduced && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 origin-right bg-panel-2"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: [1, 0, 0] }}
                transition={loop(reduced, { times: [0, 0.7, 1] })}
              />
            )}
          </pre>
        </motion.div>
        <motion.div variants={rise} className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center gap-2 text-accent"><Wand2 className="h-4 w-4" aria-hidden="true" /><span className="font-mono text-xs uppercase tracking-[0.2em]">3 · Fix</span></div>
          <p className="mt-2 text-sm text-muted">One click, or “Fix all safe issues”. Undo anytime. Review fixes ask first.</p>
          <div className="mt-4 space-y-1 rounded-lg border border-line bg-panel-2 p-2 text-sm">
            <div className="flex items-center gap-2 px-2 py-1 text-muted"><span className="h-4 w-4 rounded bg-line" aria-hidden="true" />people</div>
            <motion.div
              className="flex items-center gap-2 rounded-md bg-accent/10 px-2 py-1 text-accent"
              initial={reduced ? false : { x: -40, opacity: 0 }}
              animate={reduced ? { x: 0, opacity: 1 } : { x: [-40, 0, 0], opacity: [0, 1, 1] }}
              transition={loop(reduced, { times: [0, 0.35, 1] })}
            >
              <Megaphone className="h-4 w-4" aria-hidden="true" /> campaign
            </motion.div>
            <div className="flex items-center gap-2 px-2 py-1 text-muted"><span className="h-4 w-4 rounded bg-line" aria-hidden="true" />task</div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
