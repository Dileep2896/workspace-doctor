import { describe, it, expect } from "vitest";
import { viewNameFor, resolveInside, PathTraversalError, nameVariants, archivePathFor } from "@/lib/names";

describe("viewNameFor", () => {
  it("prefixes v_ and keeps underscores", () => {
    expect(viewNameFor("people")).toBe("v_people");
    expect(viewNameFor("sales_rep")).toBe("v_sales_rep");
  });
  it("replaces every hyphen with an underscore (the hyphen trap)", () => {
    expect(viewNameFor("partner-account")).toBe("v_partner_account");
    expect(viewNameFor("a-b-c")).toBe("v_a_b_c");
  });
});

describe("nameVariants", () => {
  it("includes singular/plural spellings", () => {
    expect(nameVariants("opportunity")).toContain("opportunities");
    expect(nameVariants("contract")).toContain("contracts");
    expect(nameVariants("contracts")).toContain("contract");
    expect(nameVariants("activities")).toContain("activity");
    expect(nameVariants("box")).toContain("boxes");
  });
});

describe("resolveInside", () => {
  const root = "/Users/demo/.agent-crm/workspace";
  it("normalises safe relative paths", () => {
    expect(resolveInside(root, "deal/.actions/x.js")).toBe("deal/.actions/x.js");
    expect(resolveInside(root, "./deal//notes/../x.md")).toBe("deal/x.md");
  });
  it("accepts absolute paths inside the root", () => {
    expect(resolveInside(root, `${root}/people/a.md`)).toBe("people/a.md");
  });
  it("rejects ../ traversal", () => {
    expect(() => resolveInside(root, "../evil.sh")).toThrow(PathTraversalError);
    expect(() => resolveInside(root, "deal/../../etc/passwd")).toThrow(PathTraversalError);
  });
  it("rejects absolute paths outside the root and empty paths", () => {
    expect(() => resolveInside(root, "/etc/passwd")).toThrow(PathTraversalError);
    expect(() => resolveInside(root, "")).toThrow(PathTraversalError);
    expect(() => resolveInside(root, ".")).toThrow(PathTraversalError);
  });
});

describe("archivePathFor", () => {
  it("builds a timestamped tmp/doctor-archive path", () => {
    expect(archivePathFor("vendor", "2026-10-21T09:00:00Z")).toBe("tmp/doctor-archive/2026-10-21T09-00-00Z/vendor");
  });
});
