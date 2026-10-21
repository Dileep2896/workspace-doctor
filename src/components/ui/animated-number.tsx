"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

/**
 * Counts from the currently shown value (initially `from`) to `value` once `play` is true.
 * Reduced motion jumps straight to the final value.
 */
export function AnimatedNumber({
  value,
  from,
  play = true,
  duration = motionTokens.duration.story,
  className,
  testId,
  format = (n: number) => String(n),
}: {
  value: number;
  from?: number;
  play?: boolean;
  duration?: number;
  className?: string;
  testId?: string;
  format?: (n: number) => string;
}) {
  const reduced = useReducedMotion();
  const initial = reduced ? value : (from ?? value);
  const [shown, setShown] = useState(initial);
  const shownRef = useRef(initial);

  useEffect(() => {
    const set = (n: number) => {
      shownRef.current = n;
      setShown(n);
    };
    if (reduced || !play || shownRef.current === value) return;
    const controls = animate(shownRef.current, value, {
      duration,
      ease: motionTokens.easing.smooth,
      onUpdate: (v) => set(Math.round(v)),
      onComplete: () => set(value),
    });
    return () => controls.stop();
  }, [value, play, reduced, duration]);

  return (
    <span className={className} data-testid={testId}>
      {format(reduced ? value : shown)}
    </span>
  );
}
