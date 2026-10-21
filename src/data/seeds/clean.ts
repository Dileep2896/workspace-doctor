import { WorkspaceBuilder } from "./builder";

/** A healthy workspace: every object aligned, every view current. The "All clear" state. */
export function buildClean() {
  return new WorkspaceBuilder()
    .addObject({ id: "obj_people", name: "people", count: 120, fields: [{ name: "Full Name" }, { name: "Email Address", type: "email" }] })
    .addObject({ id: "obj_company", name: "company", count: 45, fields: [{ name: "Company Name" }, { name: "Domain", type: "url" }] })
    .addObject({
      id: "obj_deal", name: "deal", default_view: "kanban", count: 18,
      fields: [{ name: "Deal Name" }, { name: "Stage", type: "enum" }, { name: "Company", related: "obj_company" }, { name: "Send Proposal", type: "action", actions: [{ label: "Send Proposal", scriptPath: "send-proposal.js" }] }],
    })
    .addObject({ id: "obj_task", name: "task", count: 30, fields: [{ name: "Title" }, { name: "Status", type: "enum" }] })
    .addEntry("ent_company_0001", "obj_company")
    .addFile("company/initech-notes.md", "# Initech\n")
    .addDocument({ id: "doc_initech", title: "Initech notes", file_path: "company/initech-notes.md", parent_object_id: "obj_company", entry_id: "ent_company_0001" })
    .build();
}
