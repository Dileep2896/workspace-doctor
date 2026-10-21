import type { Finding, Severity } from "./types";

export const SEVERITY_WEIGHT: Record<Severity, number> = { critical: 8, warning: 3, info: 1 };

export function severityCounts(findings: Finding[]): Record<Severity, number> {
  const out: Record<Severity, number> = { critical: 0, warning: 0, info: 0 };
  for (const f of findings) out[f.severity] += 1;
  return out;
}

/** clamp(100 - (8*critical + 3*warning + 1*info), 0, 100) */
export function healthScore(findings: Finding[]): number {
  const c = severityCounts(findings);
  const raw = 100 - (SEVERITY_WEIGHT.critical * c.critical + SEVERITY_WEIGHT.warning * c.warning + SEVERITY_WEIGHT.info * c.info);
  return Math.max(0, Math.min(100, raw));
}
