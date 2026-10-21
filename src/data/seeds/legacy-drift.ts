import { WorkspaceBuilder, CURRENT_OBJECT_COLUMNS } from "./builder";

/** A workspace created by an older app version, with yaml/dir drift and an old objects schema. */
export function buildLegacyDrift() {
  return new WorkspaceBuilder({ objectColumns: CURRENT_OBJECT_COLUMNS.filter((c) => c !== "hidden_in_sidebar") })
    .addObject({ id: "obj_company", name: "company", count: 41, fields: [{ name: "Company Name" }, { name: "Domain", type: "url" }] })
    .addObject({ id: "obj_people", name: "people", count: 96, fields: [{ name: "Full Name" }, { name: "Email Address", type: "email" }] })
    .addObject({ id: "obj_task", name: "task", count: 23, fields: [{ name: "Title" }, { name: "Status", type: "enum" }] })
    .addObject(
      { id: "obj_activity", name: "activity", count: 310, fields: [{ name: "Subject" }, { name: "Type", type: "enum" }] },
      { dir: "activities", yamlName: "activities" },
    )
    .addObject({ id: "obj_brand", name: "brand", count: 7, fields: [{ name: "Brand Name" }] }, { yamlName: "brands" })
    .addObject(
      { id: "obj_opportunity", name: "opportunity", count: 18, fields: [{ name: "Name" }, { name: "Stage", type: "enum" }] },
      { dir: "opportunities", yamlName: "opportunity" },
    )
    .build();
}
