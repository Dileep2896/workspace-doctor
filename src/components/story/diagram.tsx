"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Section, rise, usePlay } from "./shared";
import { motionTokens } from "@/lib/motion-tokens";

const NODES = [
  { id: "row", x: 60, y: 60, label: "objects row", sub: "name = opportunity" },
  { id: "view", x: 420, y: 60, label: "v_<name> view", sub: "v_campaign" },
  { id: "dir", x: 60, y: 230, label: "folder", sub: "opportunities/" },
  { id: "yaml", x: 420, y: 230, label: ".object.yaml", sub: 'name: "opportunities"' },
] as const;

const W = 220;
const H = 70;
const center = (id: (typeof NODES)[number]["id"]) => {
  const n = NODES.find((x) => x.id === id)!;
  return { x: n.x + W / 2, y: n.y + H / 2 };
};

const LINKS = [
  { a: "row", b: "view", broken: true, note: "campaign: no v_campaign" },
  { a: "row", b: "dir", broken: true, note: "opportunity ≠ opportunities" },
  { a: "dir", b: "yaml", broken: false, note: "" },
  { a: "view", b: "yaml", broken: false, note: "" },
] as const;

/** Before→after: two links snap red, then the Doctor's fix redraws them green. */
export function Diagram() {
  const { ref, play, reduced } = usePlay<HTMLDivElement>();
  const [timerFired, setTimerFired] = useState(false);
  useEffect(() => {
    if (reduced || !play) return;
    const t = setTimeout(() => setTimerFired(true), 2600);
    return () => clearTimeout(t);
  }, [play, reduced]);
  const fixed = reduced || timerFired;

  const dur = reduced ? 0 : motionTokens.duration.story;
  return (
    <Section label="Why it breaks" eyebrow="Why it breaks">
      <motion.h2 variants={rise} className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Four things must agree. The agent has to remember all four, every time.
      </motion.h2>
      <motion.p variants={rise} className="mt-4 max-w-2xl text-lg text-muted">
        Agent-built CRMs typically enforce this with capitalised “MANDATORY” rules in the agent prompt. Prose rules are not a check.
      </motion.p>
      <div ref={ref} className="mt-10 rounded-2xl border border-line bg-panel p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-3 font-mono text-xs">
          <span className={fixed ? "text-muted" : "text-crit"}>before</span>
          <span className="text-muted">→</span>
          <span className={fixed ? "text-accent" : "text-muted"}>after Doctor</span>
        </div>
        <svg viewBox="0 0 700 330" className="h-auto w-full" role="img" aria-label="DB row, pivot view, folder and .object.yaml must all agree">
          {LINKS.map((l, i) => {
            const a = center(l.a);
            const b = center(l.b);
            const isBroken = l.broken && !fixed;
            const color = l.broken ? (fixed ? "var(--accent)" : "var(--crit)") : "var(--muted)";
            return (
              <g key={i}>
                <motion.path
                  d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
                  stroke={color}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={isBroken ? "10 14" : undefined}
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: play ? (isBroken ? 0.55 : 1) : 0 }}
                  transition={{ duration: dur, delay: reduced ? 0 : 0.2 + i * 0.15, ease: motionTokens.easing.smooth }}
                />
                {l.note && (
                  <motion.text
                    x={(a.x + b.x) / 2 + (l.a === "row" && l.b === "dir" ? 14 : 0)}
                    y={(a.y + b.y) / 2 + (l.a === "row" && l.b === "view" ? -12 : 0)}
                    textAnchor={l.a === "row" && l.b === "dir" ? "start" : "middle"}
                    className="font-mono"
                    fontSize="15"
                    fill={fixed ? "var(--accent)" : "var(--crit)"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: play ? 1 : 0 }}
                    transition={{ delay: reduced ? 0 : 1.2 }}
                  >
                    {fixed ? "aligned ✓" : l.note}
                  </motion.text>
                )}
              </g>
            );
          })}
          {NODES.map((n, i) => (
            <motion.g
              key={n.id}
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: play ? 1 : 0, y: play ? 0 : 12 }}
              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.1 }}
            >
              <rect x={n.x} y={n.y} width={W} height={H} rx={14} fill="var(--panel-2)" stroke={fixed ? "var(--accent)" : "var(--line)"} strokeWidth={2} />
              <text x={n.x + 18} y={n.y + 30} fontSize="17" fontWeight={600} fill="var(--ink)">{n.label}</text>
              <text x={n.x + 18} y={n.y + 52} fontSize="13" className="font-mono" fill="var(--muted)">
                {fixed ? (n.id === "view" ? "v_campaign ✓" : n.id === "dir" ? "opportunity/" : n.id === "yaml" ? 'name: "opportunity"' : n.sub) : n.sub}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </Section>
  );
}
