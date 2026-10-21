import { describe, it, expect } from "vitest";
import { runCli } from "@/lib/cli";

function run(args: string[]) {
  let out = "";
  const code = runCli(args, (s) => (out += s));
  return { code, out };
}

describe("doctor CLI", () => {
  it("--scenario acme --json prints 13 findings and exits 1 (critical present)", () => {
    const { code, out } = run(["--scenario", "acme", "--json"]);
    expect(code).toBe(1);
    const body = JSON.parse(out);
    expect(body.findings).toHaveLength(13);
    expect(body.score).toBe(40);
  });
  it("prints a table by default", () => {
    const { out } = run(["--scenario", "acme"]);
    expect(out).toMatch(/SEVERITY/);
    expect(out).toMatch(/missing-view:campaign/);
    expect(out).toMatch(/score 40/);
  });
  it("--scenario clean exits 0", () => {
    expect(run(["--scenario", "clean"]).code).toBe(0);
  });
  it("unknown scenario exits 2 with a usage message", () => {
    const { code, out } = run(["--scenario", "nope"]);
    expect(code).toBe(2);
    expect(out).toMatch(/Usage/);
  });
});
