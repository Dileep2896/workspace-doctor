import { WorkspaceBuilder, CURRENT_OBJECT_COLUMNS } from "./builder";

/**
 * "Acme Growth": a 6-person B2B startup running outbound on a local agent-built CRM. The user asked the agent
 * to "add a campaigns table and an opportunities pipeline" and half the sidebar disappeared.
 * Every defect below maps to a failure mode that users of agent-built CRMs report.
 */
export function buildAcme() {
  return (
    new WorkspaceBuilder({ objectColumns: [...CURRENT_OBJECT_COLUMNS, "icon"] })
      // healthy
      .addObject({
        id: "obj_people", name: "people", icon: "users", description: "Contacts across every account", count: 214,
        fields: [{ name: "Full Name" }, { name: "Email Address", type: "email" }, { name: "Company", related: "obj_company" }, { name: "Phone", type: "phone" }, { name: "Title" }],
      })
      .addObject({
        id: "obj_company", name: "company", icon: "building-2", description: "Accounts we sell to", count: 88,
        fields: [{ name: "Company Name" }, { name: "Domain", type: "url" }, { name: "Industry", type: "enum" }, { name: "Employees", type: "number" }],
      })
      .addObject({
        id: "obj_lead", name: "lead", icon: "target", description: "Inbound and outbound leads", count: 131,
        fields: [{ name: "Lead Name" }, { name: "Source", type: "enum" }, { name: "Score", type: "number" }, { name: "Owner", type: "user" }],
      })
      // visible, but the "Send Proposal" button has no script
      .addObject(
        {
          id: "obj_deal", name: "deal", icon: "handshake", description: "Pipeline deals", default_view: "kanban", count: 37,
          fields: [
            { name: "Deal Name" }, { name: "Stage", type: "enum" }, { name: "Amount", type: "number" }, { name: "Close Date", type: "date" },
            { name: "Company", related: "obj_company" },
            { name: "Send Proposal", type: "action", actions: [{ label: "Send Proposal", scriptPath: "send-proposal.js" }] },
          ],
        },
        { scripts: false },
      )
      // visible; yaml says 40 entries, DB has 47; relation to the deleted `project` object
      .addObject(
        {
          id: "obj_task", name: "task", icon: "check-square", description: "Follow-ups and to-dos", count: 47,
          fields: [{ name: "Title" }, { name: "Status", type: "enum" }, { name: "Due", type: "date" }, { name: "Assignee", type: "user" }, { name: "Priority", type: "enum" }, { name: "Related Project", related: "obj_project" }],
        },
        { yamlEntryCount: 40 },
      )
      // visible; "Due Date" was added after v_invoice was built
      .addObject(
        {
          id: "obj_invoice", name: "invoice", icon: "receipt", description: "Billing", count: 19,
          fields: [{ name: "Invoice #" }, { name: "Amount", type: "number" }, { name: "Status", type: "enum" }, { name: "Due Date", type: "date" }],
        },
        { view: { columns: ["entry_id", "Invoice #", "Amount", "Status"] } },
      )
      // hidden: the agent pluralised the folder and the yaml name
      .addObject(
        {
          id: "obj_opportunity", name: "opportunity", icon: "trending-up", description: "Opportunities pipeline", default_view: "kanban", count: 22,
          fields: [{ name: "Name" }, { name: "Stage", type: "enum" }, { name: "Value", type: "number" }, { name: "Probability", type: "number" }],
        },
        { dir: "opportunities", yamlName: "opportunities" },
      )
      // hidden: folder is right, yaml name is plural
      .addObject(
        {
          id: "obj_contract", name: "contract", icon: "file-signature", description: "Signed contracts", count: 9,
          fields: [{ name: "Contract Name" }, { name: "Signed On", type: "date" }, { name: "Value", type: "number" }],
        },
        { yamlName: "contracts" },
      )
      // hidden: object + 4 fields, but the agent never created v_campaign
      .addObject(
        {
          id: "obj_campaign", name: "campaign", icon: "megaphone", description: "Outbound campaigns", count: 12,
          fields: [{ name: "Name" }, { name: "Channel", type: "enum" }, { name: "Budget", type: "number" }, { name: "Status", type: "enum" }],
        },
        { view: "none" },
      )
      // hidden: the hyphen trap
      .addObject(
        {
          id: "obj_partner_account", name: "partner-account", icon: "users-round", description: "Channel partners", count: 6,
          fields: [{ name: "Partner Name" }, { name: "Tier", type: "enum" }, { name: "Region" }],
        },
        { view: { name: "v_partner-account" } },
      )
      // hidden: DB + view, projection failed (the self-heal case)
      .addObject(
        {
          id: "obj_meeting", name: "meeting", icon: "calendar", description: "Recorded meetings", count: 58,
          fields: [{ name: "Title" }, { name: "Date", type: "date" }, { name: "Attendees" }, { name: "Summary", type: "richtext" }],
        },
        { dir: null },
      )
      .withProjectionError("meeting", "EACCES: permission denied, mkdir '/Users/demo/.agent-crm/workspace/meeting'")
      // orphan folder left behind after `vendor` was deleted from the DB
      .addDir("vendor")
      .addFile("vendor/.object.yaml", 'name: "vendor"\ndefault_view: table\nentry_count: 3\nfields:\n  - name: Vendor Name\n    type: text\n')
      .addFile("vendor/acme-supplies.md", "# Acme Supplies\nNet-30, renews in March.\n")
      // documents
      .addEntry("ent_deal_0001", "obj_deal")
      .addEntry("ent_company_0007", "obj_company")
      .addEntry("ent_people_0001", "obj_people")
      .addFile("people/jane-doe-001.md", "# Call with Jane Doe\nInterested in the Growth plan.\n")
      .addFile("company/globex-kickoff.md", "# Globex kickoff\nAgenda and owners.\n")
      .addFile("opportunities/q4-pipeline-notes.md", "# Q4 pipeline notes\n")
      .addDocument({ id: "doc_acme_renewal", title: "Acme renewal proposal", file_path: "deal/acme-renewal-001.md", parent_object_id: "obj_deal", entry_id: "ent_deal_0001" })
      .addDocument({ id: "doc_jane_doe", title: "Jane Doe call notes", file_path: "people/jane-doe-001.md", parent_object_id: "obj_people", entry_id: "ent_people_0042" })
      .addDocument({ id: "doc_q4_notes", title: "Q4 pipeline notes", file_path: "opportunities/q4-pipeline-notes.md", parent_object_id: "obj_opportunity" })
      .addDocument({ id: "doc_kickoff", title: "Globex kickoff", file_path: "company/globex-kickoff.md", parent_object_id: "obj_company", entry_id: "ent_company_0007" })
      .build()
  );
}
