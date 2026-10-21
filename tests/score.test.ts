import { describe, it, expect } from "vitest";
import { healthScore, severityCounts } from "@/lib/score";
import type { Finding, Severity } from "@/lib/types";

const f = (severity: Severity, i: number): Finding => ({
  id: `x:${i}`, check: "missing-view", severity, title: "t", why: "w", evidence: {}, safe: true, fix: { summary: "s", ops: [] },
});

describe("healthScore", () => {
  it("is 100 with no findings", () => expect(healthScore([])).toBe(100));
  it("weights critical 8, warning 3, info 1", () => {
    expect(healthScore([f("critical", 1), f("warning", 2), f("info", 3)])).toBe(88);
  });
  it("clamps at 0", () => {
    expect(healthScore(Array.from({ length: 20 }, (_, i) => f("critical", i)))).toBe(0);
  });
  it("counts severities", () => {
    expect(severityCounts([f("info", 1), f("info", 2)])).toEqual({ critical: 0, warning: 0, info: 2 });
  });
});
