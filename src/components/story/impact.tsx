"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScoreRing } from "@/components/doctor/score-ring";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Section, rise, usePlay } from "./shared";
import { motionTokens } from "@/lib/motion-tokens";

export type ImpactNumbers = {
  before: { score: number; visible: number; findings: number };
  after: { score: number; visible: number; findings: number };
  total: number;
};

export function Impact({ n }: { n: ImpactNumbers }) {
  const { ref, play, reduced } = usePlay<HTMLDivElement>();
  return (
    <Section label="Impact" eyebrow="Impact">
      <motion.h2 variants={rise} className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        From a GitHub issue and a wait, to one click.
      </motion.h2>
      <motion.p variants={rise} data-testid="impact-from" className="mt-4 font-mono text-sm text-muted">
        {`Acme seed, computed live: score ${n.before.score} · ${n.before.visible}/${n.total} visible · ${n.before.findings} findings → after all fixes`}
      </motion.p>
      <div ref={ref} className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-panel p-6">
          <ScoreRing score={play ? n.after.score : n.before.score} from={n.before.score} play={play} size={168} testId="impact-ring" />
          <div className="text-sm text-muted">
            Health score <AnimatedNumber value={n.after.score} from={n.before.score} play={play} testId="impact-score" className="sr-only" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-panel p-6">
          <div className="font-mono text-6xl font-semibold tabular-nums text-accent">
            <span className="sr-only" data-testid="impact-visible">{`${play ? n.after.visible : n.before.visible}/${n.total}`}</span>
            <span aria-hidden="true">
              <AnimatedNumber value={n.after.visible} from={n.before.visible} play={play} />
              <span className="text-muted">/{n.total}</span>
            </span>
          </div>
          <div className="text-sm text-muted">objects visible in the sidebar</div>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">open findings</span>
            <AnimatedNumber value={n.after.findings} from={n.before.findings} play={play} testId="impact-findings" className="font-mono text-4xl font-semibold tabular-nums" />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-panel-2">
            <motion.div
              className="h-full rounded-full bg-crit"
              initial={false}
              animate={{ width: play ? `${(n.after.findings / Math.max(n.before.findings, 1)) * 100}%` : "100%" }}
              transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.story, ease: motionTokens.easing.smooth }}
            />
          </div>
          <div className="text-xs text-muted">{`${n.before.findings} → ${n.after.findings}: no tickets, no waiting on the CTO`}</div>
        </div>
      </div>
      <motion.div variants={rise} className="mt-12">
        <Link href="/doctor" className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-accent-ink hover:brightness-110">
          Open the Doctor <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </motion.div>
    </Section>
  );
}
