"use client";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

/** True once the element has scrolled into view (or immediately under reduced motion). */
export function usePlay<T extends Element>(margin = "-15% 0px") {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: margin as `${number}% 0px` });
  const reduced = useReducedMotion() ?? false;
  return { ref, play: inView || reduced, reduced };
}

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: motionTokens.stagger, delayChildren: 0.1 } },
};

export const rise = {
  hidden: { opacity: 0, y: motionTokens.distance.lg },
  visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth } },
};

export function Section({ label, eyebrow, children, className }: { label: string; eyebrow: string; children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <section aria-label={label} className={cn("relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-center px-4 py-20 sm:px-8", className)}>
      <motion.div
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="w-full"
      >
        <motion.p variants={rise} className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {eyebrow}
        </motion.p>
        {children}
      </motion.div>
    </section>
  );
}
