"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/story", label: "Story" },
  { href: "/doctor", label: "Doctor" },
];

export function SiteNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-12 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/story" className="flex items-center gap-2 text-sm font-semibold">
          <Stethoscope className="h-4 w-4 text-accent" aria-hidden="true" />
          <span>Workspace Doctor</span>
          <span className="hidden text-muted sm:inline">for agent-built CRMs</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
              className={cn("rounded-md px-3 py-1.5 text-sm", path === l.href ? "bg-panel-2 text-ink" : "text-muted hover:text-ink")}
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
