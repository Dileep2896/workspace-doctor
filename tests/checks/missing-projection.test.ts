import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy, PEOPLE } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";
import { parseObjectYaml } from "@/lib/object-yaml";

describe("check missing-projection", () => {
  it("passes when every object has a directory and .object.yaml", () => {
    expect(runCheck("missing-projection", healthy().build())).toEqual([]);
  });
  it("flags a DB-only object and writes a yaml built from DB fields", () => {
    const s = new WorkspaceBuilder()
      .addObject(PEOPLE, { dir: null })
      .withProjectionError("people", "EACCES: permission denied, mkdir 'people'")
      .build();
    const [f] = runCheck("missing-projection", s);
    expect(f?.id).toBe("missing-projection:people");
    expect(f?.severity).toBe("critical");
    expect(f?.evidence).toMatchObject({ dir: null, yaml: null, lastProjectionError: expect.stringContaining("EACCES") });
    expect(f?.fix.ops[0]).toEqual({ kind: "mkdir", path: "people" });
    const write = f?.fix.ops[1];
    const yaml = write?.kind === "writeFile" ? parseObjectYaml(write.content) : null;
    expect(yaml).toMatchObject({ name: "people", entry_count: 3, default_view: "table", icon: "users" });
    expect(yaml?.fields.map((x) => x.name)).toEqual(["Full Name", "Email Address"]);
  });
  it("flags a directory that exists without .object.yaml", () => {
    const s = new WorkspaceBuilder().addObject(PEOPLE, { yamlName: null }).build();
    expect(runCheck("missing-projection", s)[0]?.evidence).toMatchObject({ dir: "people", yaml: null });
  });
});
