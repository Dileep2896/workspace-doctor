"use client";
import { motion } from "framer-motion";
import { Check, Coins } from "lucide-react";
import { Section, rise } from "./shared";

const REASONS = [
  "The most-reported bug class in this space: users of agent-built CRMs describe objects vanishing as making the product unusable.",
  "Turns 30 lines of capitalized “MANDATORY” prompt rules into a check the agent can run after every write.",
  "Safe by design: preview the exact SQL, undo, archive instead of delete.",
];

export function Decision() {
  return (
    <Section label="The decision" eyebrow="The decision">
      <motion.h2 variants={rise} className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Two pain points. One that breaks the product.
      </motion.h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <motion.div variants={rise} className="rounded-2xl border border-line bg-panel p-6 opacity-50">
          <div className="flex items-center gap-2 text-muted">
            <Coins className="h-5 w-5" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Option A</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold">Agent cost guard</h3>
          <p className="mt-2 text-muted">Real pain (users of agent tools report burning hundreds of dollars in tokens in about an hour), but it needs live provider usage data to be convincing.</p>
        </motion.div>
        <motion.div variants={rise} className="relative rounded-2xl border-2 border-accent bg-accent/5 p-6 shadow-[0_0_60px_-20px_var(--accent)]">
          <div className="flex items-center gap-2 text-accent">
            <Check className="h-5 w-5" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Option B · chosen</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold">Workspace Doctor</h3>
          <ul className="mt-4 space-y-3">
            {REASONS.map((r) => (
              <motion.li key={r} variants={rise} className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{r}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Section>
  );
}
