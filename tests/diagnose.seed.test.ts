import { describe, it, expect } from "vitest";
import { diagnose, CHECKS } from "@/lib/checks";
import { getScenario, SCENARIOS } from "@/data/seeds";
import { healthScore, severityCounts } from "@/lib/score";
import { simulateSidebar } from "@/lib/sidebar";
import { WorkspaceSnapshotSchema } from "@/lib/types";

const ACME_IDS = [
  "missing-view:campaign",
  "name-mismatch:contract",
  "missing-projection:meeting",
  "name-mismatch:opportunity",
  "missing-view:partner-account",
  "broken-link:doc-doc_acme_renewal",
  "missing-action-script:deal",
  "stale-view:invoice",
  "broken-link:doc-doc_jane_doe",
  "broken-link:field-obj_task_f5",
  "orphan-folder:vendor",
  "schema-drift:objects.icon",
  "entry-count-drift:task",
];

describe("registry", () => {
  it("has the 9 checks", () => {
    expect(CHECKS.map((c) => c.id)).toEqual([
      "missing-view",
      "stale-view",
      "name-mismatch",
      "missing-projection",
      "orphan-folder",
      "missing-action-script",
      "entry-count-drift",
      "schema-drift",
      "broken-link",
    ]);
  });
});

describe("seed scenarios", () => {
  it("every seed passes zod validation", () => {
    for (const id of SCENARIOS) expect(WorkspaceSnapshotSchema.safeParse(getScenario(id)).success).toBe(true);
  });

  it("acme: exactly 13 findings (5 critical / 6 warning / 2 info), sorted by severity then object", () => {
    const findings = diagnose(getScenario("acme"));
    expect(findings.map((f) => f.id)).toEqual(ACME_IDS);
    expect(severityCounts(findings)).toEqual({ critical: 5, warning: 6, info: 2 });
  });

  it("acme: health score 40 and 6/11 objects visible", () => {
    const s = getScenario("acme");
    expect(healthScore(diagnose(s))).toBe(40);
    const sb = simulateSidebar(s);
    expect(sb.visibleCount).toBe(6);
    expect(sb.total).toBe(11);
  });

  it("every acme finding is complete (why, evidence, fix plan)", () => {
    for (const f of diagnose(getScenario("acme"))) {
      expect(f.id).toBe(`${f.check}:${f.id.slice(f.check.length + 1)}`);
      expect(f.title.length).toBeGreaterThan(5);
      expect(f.why.length).toBeGreaterThan(40);
      expect(Object.keys(f.evidence).length).toBeGreaterThan(0);
      expect(f.fix.summary.length).toBeGreaterThan(5);
      expect(f.fix.ops.length).toBeGreaterThan(0);
    }
  });

  it("clean: 0 findings, score 100, all visible", () => {
    const s = getScenario("clean");
    expect(diagnose(s)).toEqual([]);
    expect(healthScore([])).toBe(100);
    const sb = simulateSidebar(s);
    expect(sb.visibleCount).toBe(sb.total);
  });

  it("legacy-drift: three name mismatches plus missing hidden_in_sidebar", () => {
    const findings = diagnose(getScenario("legacy-drift"));
    expect(findings.map((f) => f.id)).toEqual([
      "name-mismatch:activity",
      "name-mismatch:brand",
      "name-mismatch:opportunity",
      "schema-drift:objects.hidden_in_sidebar",
    ]);
    expect(healthScore(findings)).toBe(75);
    expect(simulateSidebar(getScenario("legacy-drift")).visibleCount).toBe(3);
  });

  it("getScenario returns an independent copy each call", () => {
    const a = getScenario("acme");
    a.db.objects.pop();
    expect(getScenario("acme").db.objects).toHaveLength(11);
  });
});
