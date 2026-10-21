import { getScenario, isScenario, SCENARIOS } from "@/data/seeds";
import { buildReport } from "./report";

const USAGE = `Usage: pnpm run doctor [--scenario ${SCENARIOS.join("|")}] [--json]
Exits 1 when critical findings exist, so an agent can run it after every schema change.`;

const pad = (s: string, n: number) => (s.length >= n ? `${s.slice(0, n - 1)}…` : s.padEnd(n));

/** Testable CLI core: returns the exit code and writes output through `write`. */
export function runCli(argv: string[], write: (s: string) => void): number {
  const json = argv.includes("--json");
  const i = argv.indexOf("--scenario");
  const scenario = i >= 0 ? argv[i + 1] : "acme";
  if (argv.includes("--help") || !isScenario(scenario)) {
    write(`${USAGE}\n`);
    return argv.includes("--help") ? 0 : 2;
  }
  const report = buildReport(getScenario(scenario));
  if (json) {
    write(`${JSON.stringify({ scenario, ...report }, null, 2)}\n`);
  } else {
    const lines = [
      `Workspace Doctor: ${scenario}  score ${report.score}/100  visible ${report.sidebar.visibleCount}/${report.sidebar.total}`,
      `${report.counts.critical} critical, ${report.counts.warning} warning, ${report.counts.info} info`,
      "",
      `${pad("SEVERITY", 10)}${pad("SAFE", 8)}${pad("ID", 38)}TITLE`,
      ...report.findings.map((f) => `${pad(f.severity, 10)}${pad(f.safe ? "yes" : "review", 8)}${pad(f.id, 38)}${f.title}`),
      "",
      report.findings.length ? `After safe fixes: score ${report.afterSafeFixes.score}, visible ${report.afterSafeFixes.visibleCount}/${report.sidebar.total}` : "All clear: every object is visible.",
    ];
    write(`${lines.join("\n")}\n`);
  }
  return report.counts.critical > 0 ? 1 : 0;
}
