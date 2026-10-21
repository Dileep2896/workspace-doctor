import { describe, it, expect } from "vitest";
import { quoteIdent, quoteLiteral, pivotViewSql, txn } from "@/lib/sql";

describe("quoteIdent", () => {
  it("double-quotes identifiers with spaces", () => {
    expect(quoteIdent("Due Date")).toBe('"Due Date"');
  });
  it("escapes embedded double quotes", () => {
    expect(quoteIdent('Say "hi"')).toBe('"Say ""hi"""');
  });
});

describe("quoteLiteral", () => {
  it("escapes single quotes", () => {
    expect(quoteLiteral("O'Brien")).toBe("'O''Brien'");
  });
});

describe("pivotViewSql", () => {
  const object = { id: "obj_campaign", name: "campaign" };
  const fields = [
    { id: "f2", object_id: "obj_campaign", name: "Channel", type: "enum", sort_order: 1 },
    { id: "f1", object_id: "obj_campaign", name: "Name", type: "text", sort_order: 0 },
    { id: "f3", object_id: "obj_campaign", name: "Launch", type: "action", sort_order: 2 },
    { id: "f4", object_id: "obj_campaign", name: "Budget", type: "number", sort_order: 3 },
  ];
  const sql = pivotViewSql(object, fields);
  it("creates the v_<name> view", () => {
    expect(sql).toContain('CREATE OR REPLACE VIEW "v_campaign" AS');
  });
  it("lists every non-action field explicitly in sort order", () => {
    expect(sql).toContain('IN ("Name", "Channel", "Budget")');
  });
  it("excludes action fields", () => {
    expect(sql).not.toContain('"Launch"');
    expect(sql).toContain("f.type != 'action'");
  });
  it("filters by object id and uses PIVOT", () => {
    expect(sql).toContain("e.object_id = 'obj_campaign'");
    expect(sql).toMatch(/PIVOT/);
    expect(sql).toMatch(/GROUP BY entry_id/);
  });
  it("uses underscores for hyphenated objects", () => {
    expect(pivotViewSql({ id: "o", name: "partner-account" }, [])).toContain('"v_partner_account"');
  });
});

describe("txn", () => {
  it("wraps statements in one transaction", () => {
    expect(txn(["SELECT 1", "SELECT 2;"])).toBe("BEGIN TRANSACTION;\nSELECT 1;\nSELECT 2;\nCOMMIT;");
  });
});
