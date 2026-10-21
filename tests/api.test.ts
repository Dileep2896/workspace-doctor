import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/doctor/route";
import { getScenario } from "@/data/seeds";

describe("GET /api/doctor", () => {
  it("returns findings, score and sidebar for a scenario", async () => {
    const res = await GET(new Request("http://localhost/api/doctor?scenario=acme"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.findings).toHaveLength(13);
    expect(body.score).toBe(40);
    expect(body.sidebar.visibleCount).toBe(6);
  });
  it("defaults to acme", async () => {
    const body = await (await GET(new Request("http://localhost/api/doctor"))).json();
    expect(body.scenario).toBe("acme");
  });
  it("rejects an unknown scenario with 400", async () => {
    expect((await GET(new Request("http://localhost/api/doctor?scenario=nope"))).status).toBe(400);
  });
});

describe("POST /api/doctor", () => {
  const post = (body: unknown) =>
    POST(new Request("http://localhost/api/doctor", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }));
  it("diagnoses a posted snapshot (agent post-write hook)", async () => {
    const res = await post({ snapshot: getScenario("clean") });
    expect(res.status).toBe(200);
    expect((await res.json()).score).toBe(100);
  });
  it("rejects an invalid snapshot with 400", async () => {
    expect((await post({ snapshot: { nope: true } })).status).toBe(400);
  });
  it("rejects malformed JSON with 400", async () => {
    const res = await POST(new Request("http://localhost/api/doctor", { method: "POST", body: "{" }));
    expect(res.status).toBe(400);
  });
});
