import { describe, it, expect } from "vitest";
import { runCheck } from "@/lib/checks";
import { healthy, DEAL } from "../helpers";
import { WorkspaceBuilder } from "@/data/seeds/builder";

describe("check missing-action-script", () => {
  it("passes when every action script exists", () => {
    expect(runCheck("missing-action-script", healthy().build())).toEqual([]);
  });
  it("flags a missing .actions script and writes a stub that exits 0", () => {
    const s = new WorkspaceBuilder().addObject(DEAL, { scripts: false }).build();
    const [f] = runCheck("missing-action-script", s);
    expect(f?.id).toBe("missing-action-script:deal");
    expect(f?.severity).toBe("warning");
    expect(f?.evidence).toMatchObject({ missing: ["deal/.actions/send-proposal.js"] });
    const write = f?.fix.ops.find((o) => o.kind === "writeFile");
    expect(write?.kind === "writeFile" && write.path).toBe("deal/.actions/send-proposal.js");
    expect(write?.kind === "writeFile" && write.content).toMatch(/ok: false/);
    expect(write?.kind === "writeFile" && write.content).toMatch(/process\.exit\(0\)/);
  });
  it("ignores action fields without actions configured", () => {
    const s = new WorkspaceBuilder()
      .addObject({ ...DEAL, fields: [{ name: "Noop", type: "action" }] }, { scripts: false })
      .build();
    expect(runCheck("missing-action-script", s)).toEqual([]);
  });
});
