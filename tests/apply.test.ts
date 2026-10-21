import { describe, it, expect } from "vitest";
import { diagnose } from "@/lib/checks";
import { getScenario } from "@/data/seeds";
import { applyFix, applyFixDetailed, applyAll, pushHistory, undo } from "@/lib/apply";
import { healthScore } from "@/lib/score";
import { simulateSidebar } from "@/lib/sidebar";
import { PathTraversalError } from "@/lib/names";
import type { Finding } from "@/lib/types";

const acme = () => getScenario("acme");

describe("applyFix round-trip", () => {
  const ids = diagnose(acme()).map((f) => f.id);
  it.each(ids)("%s: fix clears it and introduces no new findings", (id) => {
    const s = acme();
    const before = diagnose(s);
    const f = before.find((x) => x.id === id)!;
    const after = diagnose(applyFix(s, f)).map((x) => x.id);
    expect(after).not.toContain(id);
    expect(after).toEqual(before.map((x) => x.id).filter((x) => x !== id));
  });
});

describe("purity", () => {
  it("never mutates the input snapshot", () => {
    const s = acme();
    const copy = structuredClone(s);
    for (const f of diagnose(s)) applyFix(s, f);
    applyAll(s);
    expect(s).toEqual(copy);
  });
});

describe("applyAll", () => {
  it("safe fixes -> 11/11 visible and score 87, leaving 5 review findings", () => {
    const s = applyAll(acme(), { safeOnly: true });
    expect(simulateSidebar(s).visibleCount).toBe(11);
    const left = diagnose(s);
    expect(healthScore(left)).toBe(87);
    expect(left).toHaveLength(5);
    expect(left.every((f) => !f.safe)).toBe(true);
  });
  it("all fixes -> 0 findings and score 100 (idempotence)", () => {
    const s = applyAll(acme());
    expect(diagnose(s)).toHaveLength(0);
    expect(healthScore(diagnose(s))).toBe(100);
    expect(applyAll(s)).toEqual(s);
  });
  it("archives the orphan folder instead of deleting it", () => {
    const s = applyAll(acme());
    expect(s.fs.files["tmp/doctor-archive/2026-10-21T09-00-00Z/vendor/.object.yaml"]).toBeDefined();
    expect(s.fs.dirs).not.toContain("vendor");
  });
  it("moves documents along with a renamed directory", () => {
    const s = applyAll(acme(), { safeOnly: true });
    const doc = s.db.documents.find((d) => d.id === "doc_q4_notes");
    expect(doc?.file_path).toBe("opportunity/q4-pipeline-notes.md");
    expect(s.fs.files["opportunity/q4-pipeline-notes.md"]).toBeDefined();
  });
  it("fixes legacy-drift to zero findings", () => {
    expect(diagnose(applyAll(getScenario("legacy-drift")))).toEqual([]);
  });
});

describe("safety", () => {
  it("refuses a rename onto an existing directory and returns a conflict finding", () => {
    const s = acme();
    const f = diagnose(s).find((x) => x.id === "name-mismatch:opportunity")!;
    const clash = { ...s, fs: { ...s.fs, dirs: [...s.fs.dirs, "opportunity"] } };
    const r = applyFixDetailed(clash, f);
    expect(r.conflict?.check).toBe("conflict");
    expect(r.conflict?.id).toBe("conflict:opportunity");
    expect(r.snapshot).toBe(clash);
  });
  it("rejects ops that escape the workspace root", () => {
    const evil: Finding = {
      id: "missing-action-script:evil",
      check: "missing-action-script",
      severity: "warning",
      title: "evil",
      why: "evil",
      evidence: {},
      safe: true,
      fix: { summary: "x", ops: [{ kind: "writeFile", path: "../evil.sh", content: "rm -rf ~" }] },
    };
    expect(() => applyFix(acme(), evil)).toThrow(PathTraversalError);
  });
});

describe("undo history", () => {
  it("restores the exact prior snapshot", () => {
    const s0 = acme();
    const f = diagnose(s0)[0]!;
    const history = pushHistory([], s0);
    const s1 = applyFix(s0, f);
    const { snapshot, history: rest } = undo(history, s1);
    expect(snapshot).toEqual(acme());
    expect(rest).toHaveLength(0);
  });
  it("undo with empty history is a no-op", () => {
    const s = acme();
    expect(undo([], s).snapshot).toBe(s);
  });
});
