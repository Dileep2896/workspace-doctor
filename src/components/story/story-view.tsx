"use client";
import { useMemo } from "react";
import { motion, useScroll } from "framer-motion";
import { getScenario } from "@/data/seeds";
import { diagnose } from "@/lib/checks";
import { applyAll } from "@/lib/apply";
import { healthScore } from "@/lib/score";
import { simulateSidebar } from "@/lib/sidebar";
import { Hero } from "./hero";
import { Pain } from "./pain";
import { Diagram } from "./diagram";
import { Decision } from "./decision";
import { Steps } from "./steps";
import { Impact, type ImpactNumbers } from "./impact";

/** Every number on this page is computed from the real engine on the acme seed. */
function useStoryData() {
  return useMemo(() => {
    const acme = getScenario("acme");
    const findings = diagnose(acme);
    const sidebar = simulateSidebar(acme);
    const fixed = applyAll(acme);
    const fixedFindings = diagnose(fixed);
    const numbers: ImpactNumbers = {
      before: { score: healthScore(findings), visible: sidebar.visibleCount, findings: findings.length },
      after: { score: healthScore(fixedFindings), visible: simulateSidebar(fixed).visibleCount, findings: fixedFindings.length },
      total: sidebar.total,
    };
    return { sidebar, numbers };
  }, []);
}

export function StoryView() {
  const { sidebar, numbers } = useStoryData();
  const { scrollYProgress } = useScroll();
  return (
    <div className="relative">
      <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(60%_50%_at_70%_20%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)]"
      />
      <Hero />
      <Pain items={sidebar.items} visible={sidebar.visibleCount} />
      <Diagram />
      <Decision />
      <Steps />
      <Impact n={numbers} />
    </div>
  );
}
