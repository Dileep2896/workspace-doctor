import type { WorkspaceSnapshot } from "./types";
import { diagnose } from "./checks";
import { healthScore, severityCounts } from "./score";
import { simulateSidebar } from "./sidebar";
import { applyAll } from "./apply";

/** The shape returned by the API route and `pnpm doctor --json`. */
export function buildReport(snapshot: WorkspaceSnapshot) {
  const findings = diagnose(snapshot);
  const afterSafe = applyAll(snapshot, { safeOnly: true });
  return {
    score: healthScore(findings),
    counts: severityCounts(findings),
    sidebar: simulateSidebar(snapshot),
    afterSafeFixes: { score: healthScore(diagnose(afterSafe)), visibleCount: simulateSidebar(afterSafe).visibleCount },
    findings,
  };
}
