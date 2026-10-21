import { describe, it, expect } from "vitest";
import { parseObjectYaml, emitObjectYaml, patchObjectYaml } from "@/lib/object-yaml";

describe("object yaml", () => {
  const doc = {
    name: "deal",
    description: "Sales deals",
    icon: "handshake",
    default_view: "kanban",
    entry_count: 37,
    fields: [{ name: "Deal Name", type: "text" }, { name: "Stage", type: "enum" }],
  };
  it("round-trips", () => {
    expect(parseObjectYaml(emitObjectYaml(doc))).toEqual(doc);
  });
  it("quotes the name so YAML never coerces it", () => {
    expect(emitObjectYaml({ ...doc, name: "yes" })).toContain('name: "yes"');
  });
  it("returns null for invalid or nameless yaml", () => {
    expect(parseObjectYaml(": : :\n  - [")).toBeNull();
    expect(parseObjectYaml("description: no name")).toBeNull();
  });
  it("patches selected keys and keeps the rest", () => {
    const patched = parseObjectYaml(patchObjectYaml(emitObjectYaml(doc), { name: "deals", entry_count: 40 }));
    expect(patched).toEqual({ ...doc, name: "deals", entry_count: 40 });
  });
});
