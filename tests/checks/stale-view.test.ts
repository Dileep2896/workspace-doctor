import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy, PEOPLE } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";

describe("check stale-view", () => {
  it("ignores views that match entry_id + non-action fields (action fields are excluded)", () => {
    expect(runCheck("stale-view", healthy().build())).toEqual([]);
  });
  it("flags a view missing a newly added field", () => {
    const s = new WorkspaceBuilder().addObject(PEOPLE, { view: { columns: ["entry_id", "Full Name"] } }).build();
    const [f] = runCheck("stale-view", s);
    expect(f?.id).toBe("stale-view:people");
    expect(f?.severity).toBe("warning");
    expect(f?.evidence).toMatchObject({ missingColumns: ["Email Address"], extraColumns: [] });
    expect(f?.safe).toBe(true);
  });
  it("flags a view still exposing a deleted field", () => {
    const s = new WorkspaceBuilder()
      .addObject(PEOPLE, { view: { columns: ["entry_id", "Full Name", "Email Address", "Fax"] } })
      .build();
    expect(runCheck("stale-view", s)[0]?.evidence).toMatchObject({ extraColumns: ["Fax"] });
  });
  it("does not double-report objects whose view is missing", () => {
    const s = new WorkspaceBuilder().addObject(PEOPLE, { view: "none" }).build();
    expect(runCheck("stale-view", s)).toEqual([]);
  });
});
