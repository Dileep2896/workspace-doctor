"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bot } from "lucide-react";
import { Section, rise } from "./shared";

const PROMPT = "add a campaigns table and an opportunities pipeline";

function useTyping(text: string, speedMs = 45) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      id = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(id), x) : x + 1)), speedMs);
    }, 600);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, speedMs, reduced]);
  return reduced ? text : text.slice(0, n);
}

export function Hero() {
  const typed = useTyping(PROMPT);
  const done = typed.length === PROMPT.length;
  return (
    <Section label="The domain" eyebrow="Self-healing data workspaces for agent-built CRMs">
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.h1 variants={rise} className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Agent-built CRMs hand the whole workspace to an AI agent.
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-xl text-lg text-muted">
            A new wave of CRMs lets you type “make me a deals pipeline” and the agent does the rest: it creates objects, fields, pivot views and
            files by itself, writing straight to a local <span className="text-ink">DuckDB</span> file and <span className="text-ink">.object.yaml</span> on disk.
            Flexible, but the workspace now stays healthy only if the agent follows a long checklist on every single write.
          </motion.p>
          <motion.div variants={rise} className="mt-6 flex flex-wrap gap-2 text-xs">
            {["agent-first CRM", "Next.js 15 + React 19", "DuckDB + .object.yaml", "self-healing workspace"].map((c) => (
              <span key={c} className="rounded-full border border-line px-3 py-1 text-muted">{c}</span>
            ))}
          </motion.div>
        </div>
        <motion.div variants={rise} className="rounded-2xl border border-line bg-panel p-5 shadow-2xl shadow-black/30">
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">Chat with your workspace</div>
          <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-accent-ink">
            <span aria-label={PROMPT}>{typed}</span>
            {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent-ink" aria-hidden="true" />}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className="mt-3 flex max-w-[92%] gap-2 rounded-2xl rounded-bl-sm bg-panel-2 px-4 py-2.5 text-sm"
          >
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>Done. Created campaign and opportunity with 8 fields and 34 entries.</span>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
