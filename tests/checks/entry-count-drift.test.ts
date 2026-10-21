import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy, PEOPLE } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";
import { parseObjectYaml } from "@/lib/object-yaml";

describe("check entry-count-drift", () => {
  it("passes when yaml entry_count matches COUNT(entries)", () => {
    expect(runCheck("entry-count-drift", healthy().build())).toEqual([]);
  });
  it("flags drift as info and rewrites the yaml count", () => {
    const s = new WorkspaceBuilder().addObject(PEOPLE, { yamlEntryCount: 1 }).build();
    const [f] = runCheck("entry-count-drift", s);
    expect(f?.id).toBe("entry-count-drift:people");
    expect(f?.severity).toBe("info");
    expect(f?.evidence).toEqual({ yaml: 1, db: 3 });
    const w = f?.fix.ops[0];
    expect(w?.kind === "writeFile" && parseObjectYaml(w.content)?.entry_count).toBe(3);
  });
  it("skips objects with no yaml (missing-projection owns those)", () => {
    const s = new WorkspaceBuilder().addObject(PEOPLE, { dir: null }).build();
    expect(runCheck("entry-count-drift", s)).toEqual([]);
  });
});
