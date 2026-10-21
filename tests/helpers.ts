import { WorkspaceBuilder, type ObjectSpec } from "@/data/seeds/builder";

export const PEOPLE: ObjectSpec = {
  id: "obj_people",
  name: "people",
  icon: "users",
  count: 3,
  fields: [{ name: "Full Name" }, { name: "Email Address", type: "email" }],
};

export const DEAL: ObjectSpec = {
  id: "obj_deal",
  name: "deal",
  default_view: "kanban",
  count: 2,
  fields: [
    { name: "Deal Name" },
    { name: "Stage", type: "enum" },
    { name: "Send Proposal", type: "action", actions: [{ label: "Send Proposal", scriptPath: "send-proposal.js" }] },
  ],
};

/** A healthy two-object workspace; tests break one thing at a time. */
export function healthy() {
  return new WorkspaceBuilder().addObject(PEOPLE).addObject(DEAL);
}
