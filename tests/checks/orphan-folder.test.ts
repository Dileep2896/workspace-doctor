import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy } from "../helpers";
import { emitObjectYaml } from "@/lib/object-yaml";

const vendorYaml = emitObjectYaml({ name: "vendor", default_view: "table", entry_count: 3, fields: [] });

describe("check orphan-folder", () => {
  it("passes on a healthy workspace", () => {
    expect(runCheck("orphan-folder", healthy().build())).toEqual([]);
  });
  it("flags a root folder whose .object.yaml has no DB row, with a move-to-archive (review) fix", () => {
    const s = healthy().addDir("vendor").addFile("vendor/.object.yaml", vendorYaml).build();
    const [f] = runCheck("orphan-folder", s);
    expect(f?.id).toBe("orphan-folder:vendor");
    expect(f?.severity).toBe("warning");
    expect(f?.safe).toBe(false);
    expect(f?.fix.ops).toEqual([{ kind: "move", from: "vendor", to: "tmp/doctor-archive/2026-10-21T09-00-00Z/vendor" }]);
  });
  it("never classifies a nested folder as an object", () => {
    const s = healthy().addDir("people/vendor").addFile("people/vendor/.object.yaml", vendorYaml).build();
    expect(runCheck("orphan-folder", s)).toEqual([]);
  });
  it("does not report a misnamed folder already claimed by name-mismatch", () => {
    const s = healthy().build();
    s.fs.dirs = s.fs.dirs.map((d) => d.replace(/^deal/, "deals"));
    s.fs.files = Object.fromEntries(Object.entries(s.fs.files).map(([k, v]) => [k.replace(/^deal\//, "deals/"), v]));
    expect(runCheck("orphan-folder", s)).toEqual([]);
    expect(runCheck("name-mismatch", s)[0]?.id).toBe("name-mismatch:deal");
  });
});
