import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";

const OPP = { id: "obj_opp", name: "opportunity", count: 4, fields: [{ name: "Name" }] };

describe("check name-mismatch", () => {
  it("passes when DB name, dir and yaml name agree", () => {
    expect(runCheck("name-mismatch", healthy().build())).toEqual([]);
  });
  it("flags a pluralised directory + yaml and plans a rename", () => {
    const s = new WorkspaceBuilder().addObject(OPP, { dir: "opportunities", yamlName: "opportunities" }).build();
    const [f] = runCheck("name-mismatch", s);
    expect(f?.id).toBe("name-mismatch:opportunity");
    expect(f?.severity).toBe("critical");
    expect(f?.evidence).toEqual({ db: "opportunity", dir: "opportunities", yaml: "opportunities" });
    expect(f?.fix.ops).toContainEqual({ kind: "rename", from: "opportunities", to: "opportunity" });
    expect(f?.safe).toBe(true);
  });
  it("flags a yaml-only mismatch and only rewrites the yaml", () => {
    const s = new WorkspaceBuilder().addObject({ ...OPP, name: "contract", id: "c" }, { yamlName: "contracts" }).build();
    const [f] = runCheck("name-mismatch", s);
    expect(f?.evidence).toEqual({ db: "contract", dir: "contract", yaml: "contracts" });
    expect(f?.fix.ops.some((o) => o.kind === "rename")).toBe(false);
    expect(f?.fix.ops).toContainEqual(expect.objectContaining({ kind: "writeFile", path: "contract/.object.yaml" }));
  });
  it("re-points documents that live under the renamed directory", () => {
    const s = new WorkspaceBuilder()
      .addObject(OPP, { dir: "opportunities", yamlName: "opportunities" })
      .addFile("opportunities/notes.md", "# notes")
      .addDocument({ id: "d1", title: "Notes", file_path: "opportunities/notes.md" })
      .build();
    const sql = runCheck("name-mismatch", s)[0]?.fix.ops.find((o) => o.kind === "sql");
    expect(sql?.kind === "sql" && sql.sql).toMatch(/UPDATE documents SET file_path/);
  });
});
