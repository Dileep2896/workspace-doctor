import { describe, it, expect } from "vitest";
import { exportPlan, shQuote } from "@/lib/export";
import { diagnose } from "@/lib/checks";
import { getScenario } from "@/data/seeds";
import type { Finding } from "@/lib/types";

describe("exportPlan", () => {
  const findings = diagnose(getScenario("acme"));
  const { sql, sh } = exportPlan(findings);
  it("has one BEGIN/COMMIT pair per SQL-bearing finding", () => {
    const withSql = findings.filter((f) => f.fix.ops.some((o) => o.kind === "sql")).length;
    expect(sql.match(/BEGIN TRANSACTION;/g)).toHaveLength(withSql);
    expect(sql.match(/COMMIT;/g)).toHaveLength(withSql);
    expect(sql).toContain("-- missing-view:campaign");
  });
  it("shell script is strict and labels every block", () => {
    expect(sh.split("\n")[0]).toBe("#!/usr/bin/env bash");
    expect(sh).toContain("set -euo pipefail");
    expect(sh).toContain("# name-mismatch:opportunity");
    expect(sh).toContain("mv 'opportunities' 'opportunity'");
  });
  it("quotes paths with spaces and quotes", () => {
    const f: Finding = {
      id: "missing-projection:x", check: "missing-projection", severity: "critical", title: "t", why: "w",
      evidence: {}, safe: true, fix: { summary: "s", ops: [{ kind: "mkdir", path: "my dir/it's" }] },
    };
    expect(exportPlan([f]).sh).toContain(`mkdir -p 'my dir/it'\\''s'`);
    expect(shQuote("a b")).toBe("'a b'");
  });
});
