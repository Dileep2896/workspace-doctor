import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy } from "../helpers";
import { WorkspaceBuilder, CURRENT_OBJECT_COLUMNS } from "@/data/seeds/builder";

describe("check schema-drift", () => {
  it("passes on the current objects schema", () => {
    expect(runCheck("schema-drift", healthy().build())).toEqual([]);
  });
  it("flags the retired icon column and copies icons into yaml before dropping", () => {
    const s = healthy().build();
    s.db.objectColumns = [...CURRENT_OBJECT_COLUMNS, "icon"];
    const [f] = runCheck("schema-drift", s);
    expect(f?.id).toBe("schema-drift:objects.icon");
    expect(f?.severity).toBe("info");
    expect(f?.safe).toBe(false);
    const sql = f?.fix.ops.find((o) => o.kind === "sql");
    expect(sql?.kind === "sql" && sql.sql).toContain("ALTER TABLE objects DROP COLUMN icon");
    expect(f?.fix.ops).toContainEqual(expect.objectContaining({ kind: "writeFile", path: "people/.object.yaml" }));
  });
  it("flags missing hidden_in_sidebar with ADD COLUMN IF NOT EXISTS", () => {
    const s = new WorkspaceBuilder({ objectColumns: CURRENT_OBJECT_COLUMNS.filter((c) => c !== "hidden_in_sidebar") }).build();
    const [f] = runCheck("schema-drift", s);
    expect(f?.id).toBe("schema-drift:objects.hidden_in_sidebar");
    const sql = f?.fix.ops[0];
    expect(sql?.kind === "sql" && sql.sql).toContain("ADD COLUMN IF NOT EXISTS hidden_in_sidebar BOOLEAN DEFAULT false");
  });
});
