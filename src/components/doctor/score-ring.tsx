"use client";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { motionTokens } from "@/lib/motion-tokens";

const R = 52;
const C = 2 * Math.PI * R;

export function scoreTone(score: number) {
  return score >= 85 ? "var(--accent)" : score >= 60 ? "var(--warn)" : "var(--crit)";
}

export function ScoreRing({ score, from, play = true, size = 132, testId = "score-value" }: { score: number; from?: number; play?: boolean; size?: number; testId?: string }) {
  const reduced = useReducedMotion();
  const target = play || reduced ? score : (from ?? score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} data-testid={testId} data-value={score}>
      <span className="sr-only">{`Health score ${score} of 100`}</span>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={false}
          animate={{ strokeDashoffset: C * (1 - target / 100), stroke: scoreTone(target) }}
          transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.story, ease: motionTokens.easing.smooth }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <AnimatedNumber value={score} from={from} play={play} className="font-mono text-4xl font-semibold tabular-nums" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">health</span>
      </div>
    </div>
  );
}
