import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy, PEOPLE } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";

describe("check broken-link", () => {
  it("passes when documents and relations resolve", () => {
    const s = healthy()
      .addFile("people/jane.md", "# Jane")
      .addEntry("e1", "obj_people")
      .addDocument({ id: "d1", title: "Jane", file_path: "people/jane.md", entry_id: "e1" })
      .build();
    expect(runCheck("broken-link", s)).toEqual([]);
  });
  it("deletes a document row whose file is gone", () => {
    const s = healthy().addDocument({ id: "d1", title: "Gone", file_path: "deal/gone.md" }).build();
    const [f] = runCheck("broken-link", s);
    expect(f?.id).toBe("broken-link:doc-d1");
    expect(f?.severity).toBe("warning");
    expect(f?.safe).toBe(false);
    const sql = f?.fix.ops[0];
    expect(sql?.kind === "sql" && sql.sql).toContain("DELETE FROM documents WHERE id = 'd1'");
  });
  it("re-points a document when a same-slug file exists elsewhere", () => {
    const s = healthy()
      .addFile("deal/archive/gone.md", "# moved")
      .addDocument({ id: "d1", title: "Gone", file_path: "deal/gone.md" })
      .build();
    const sql = runCheck("broken-link", s)[0]?.fix.ops[0];
    expect(sql?.kind === "sql" && sql.sql).toContain("UPDATE documents SET file_path = 'deal/archive/gone.md'");
  });
  it("unlinks a document attached to a deleted entry", () => {
    const s = healthy()
      .addFile("people/jane.md", "# Jane")
      .addDocument({ id: "d2", title: "Jane", file_path: "people/jane.md", entry_id: "deleted" })
      .build();
    const [f] = runCheck("broken-link", s);
    expect(f?.evidence).toMatchObject({ entry_id: "deleted", entryExists: false });
    const sql = f?.fix.ops[0];
    expect(sql?.kind === "sql" && sql.sql).toContain("SET entry_id = NULL");
  });
  it("downgrades a relation field whose target object was deleted", () => {
    const s = new WorkspaceBuilder()
      .addObject({ ...PEOPLE, fields: [{ name: "Full Name" }, { name: "Project", type: "relation", related: "obj_gone" }] })
      .build();
    const [f] = runCheck("broken-link", s);
    expect(f?.id).toBe("broken-link:field-obj_people_f1");
    expect(f?.object).toBe("people");
    const sql = f?.fix.ops[0];
    expect(sql?.kind === "sql" && sql.sql).toContain("SET type = 'text', related_object_id = NULL");
  });
});
