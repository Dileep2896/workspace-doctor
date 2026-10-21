import { z } from "zod";
import { getScenario, isScenario } from "@/data/seeds";
import { WorkspaceSnapshotSchema } from "@/lib/types";
import { buildReport } from "@/lib/report";

export const dynamic = "force-dynamic";

const PostBody = z.object({ snapshot: WorkspaceSnapshotSchema });

const bad = (error: string, details?: unknown) => Response.json({ error, ...(details ? { details } : {}) }, { status: 400 });

/** GET /api/doctor?scenario=acme -> { scenario, score, counts, sidebar, afterSafeFixes, findings } */
export async function GET(req: Request) {
  const scenario = new URL(req.url).searchParams.get("scenario") ?? "acme";
  if (!isScenario(scenario)) return bad(`Unknown scenario "${scenario}"`);
  return Response.json({ scenario, ...buildReport(getScenario(scenario)) });
}

/** POST { snapshot } -> same report. The agent post-write hook shape. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Body must be JSON");
  }
  const parsed = PostBody.safeParse(body);
  if (!parsed.success) return bad("Invalid snapshot", parsed.error.issues.slice(0, 5));
  return Response.json({ scenario: "posted", ...buildReport(parsed.data.snapshot) });
}
