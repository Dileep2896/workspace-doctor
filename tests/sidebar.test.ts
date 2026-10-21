import { describe, it, expect } from "vitest";
import { simulateSidebar } from "@/lib/sidebar";
import { getScenario } from "@/data/seeds";

describe("simulateSidebar", () => {
  const sb = simulateSidebar(getScenario("acme"));
  const by = (n: string) => sb.items.find((i) => i.name === n)!;
  it("lists every DB object with a reason", () => {
    expect(sb.items).toHaveLength(11);
    expect(by("people")).toMatchObject({ visible: true });
  });
  it("hides objects without their v_<name> view", () => {
    expect(by("campaign")).toMatchObject({ visible: false, reason: expect.stringMatching(/v_campaign/) });
    expect(by("partner-account")).toMatchObject({ visible: false, reason: expect.stringMatching(/v_partner_account/) });
  });
  it("hides misaligned and unprojected objects", () => {
    expect(by("opportunity").visible).toBe(false);
    expect(by("contract").visible).toBe(false);
    expect(by("meeting").visible).toBe(false);
  });
  it("reports orphan root folders", () => {
    expect(sb.orphans.map((o) => o.dir)).toEqual(expect.arrayContaining(["vendor", "opportunities"]));
  });
});
