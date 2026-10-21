import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy, PEOPLE } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";

describe("check missing-view", () => {
  it("reports nothing when every object has its v_<name> view", () => {
    expect(runCheck("missing-view", healthy().build())).toEqual([]);
  });
  it("flags an object with no pivot view as critical, with a safe CREATE VIEW fix", () => {
    const s = new WorkspaceBuilder().addObject(PEOPLE, { view: "none" }).build();
    const [f] = runCheck("missing-view", s);
    expect(f?.id).toBe("missing-view:people");
    expect(f?.severity).toBe("critical");
    expect(f?.safe).toBe(true);
    expect(f?.why).toMatch(/the sidebar loader/);
    const sql = f?.fix.ops.find((o) => o.kind === "sql");
    expect(sql && sql.kind === "sql" && sql.sql).toContain('CREATE OR REPLACE VIEW "v_people"');
  });
  it("catches the hyphen trap and drops the misnamed view", () => {
    const s = new WorkspaceBuilder()
      .addObject({ id: "o_pa", name: "partner-account", count: 1, fields: [{ name: "Name" }] }, { view: { name: "v_partner-account" } })
      .build();
    const [f] = runCheck("missing-view", s);
    expect(f?.id).toBe("missing-view:partner-account");
    expect(f?.evidence).toMatchObject({ expected: "v_partner_account", found: "v_partner-account" });
    const sql = f?.fix.ops[0];
    expect(sql?.kind === "sql" && sql.sql).toContain('DROP VIEW IF EXISTS "v_partner-account"');
  });
});
