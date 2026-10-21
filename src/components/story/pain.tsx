"use client";
import { motion } from "framer-motion";
import type { SidebarItem } from "@/lib/sidebar";
import { ObjectIcon } from "@/components/doctor/object-icon";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Section, rise, usePlay } from "./shared";
import { cn } from "@/lib/cn";

export function Pain({ items, visible }: { items: SidebarItem[]; visible: number }) {
  const { ref, play, reduced } = usePlay<HTMLDivElement>();
  let brokenIndex = 0;
  return (
    <Section label="Pain point" eyebrow="The pain">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div ref={ref} className="rounded-2xl border border-line bg-panel p-4">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Sidebar</span>
            <span className="font-mono text-sm">
              <AnimatedNumber value={visible} from={items.length} play={play} testId="pain-counter" className={cn("text-2xl font-semibold", play ? "text-crit" : "")} />
              <span className="text-muted">/{items.length} objects</span>
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {items.map((i) => {
              const delay = i.visible ? 0 : 0.5 + 0.35 * brokenIndex++;
              const broken = !i.visible && play;
              return (
                <motion.li
                  key={i.name}
                  initial={false}
                  animate={broken ? { opacity: [1, 0.3, 0.9, 0.25], y: 6 } : { opacity: 1, y: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.6, delay }}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <ObjectIcon name={i.icon} className="h-4 w-4 shrink-0 text-muted" />
                  <span className={cn("truncate", broken && "line-through")}>{i.name}</span>
                  {!i.visible && (
                    <motion.span
                      initial={false}
                      animate={{ scale: broken ? 1 : 0 }}
                      transition={reduced ? { duration: 0 } : { delay: delay + 0.3 }}
                      className="ml-auto h-2 w-2 shrink-0 rounded-full bg-crit"
                      aria-hidden="true"
                    />
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
        <div>
          <motion.h2 variants={rise} className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            The agent wrote the rows. The sidebar quietly dropped them.
          </motion.h2>
          <motion.p variants={rise} className="mt-5 max-w-lg text-lg text-muted">
            An object only renders when four things agree. When the agent skips a step, the object disappears with no error: the tree route
            drops it and only writes a console.warn.
          </motion.p>
          <motion.blockquote variants={rise} className="mt-6 border-l-2 border-crit pl-4 text-base italic">
            “this bug makes the product unusable for now”
            <footer className="mt-1 font-mono text-xs not-italic text-muted">a user of a popular agent-built CRM, on a public bug report</footer>
          </motion.blockquote>
        </div>
      </div>
    </Section>
  );
}
