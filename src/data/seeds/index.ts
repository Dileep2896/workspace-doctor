import { WorkspaceSnapshotSchema, type WorkspaceSnapshot } from "@/lib/types";
import { buildAcme } from "./acme";
import { buildLegacyDrift } from "./legacy-drift";
import { buildClean } from "./clean";

export const SCENARIOS = ["acme", "legacy-drift", "clean"] as const;
export type ScenarioId = (typeof SCENARIOS)[number];

export const SCENARIO_INFO: Record<ScenarioId, { label: string; blurb: string }> = {
  acme: { label: "Acme Growth", blurb: "Agent added campaigns + an opportunities pipeline; half the sidebar vanished" },
  "legacy-drift": { label: "Legacy workspace", blurb: "Workspace from an older app version: yaml/dir drift and an old objects schema" },
  clean: { label: "Clean", blurb: "A healthy workspace" },
};

// Validated once at load: a malformed seed fails fast instead of rendering nonsense.
const SEEDS: Record<ScenarioId, WorkspaceSnapshot> = {
  acme: WorkspaceSnapshotSchema.parse(buildAcme()),
  "legacy-drift": WorkspaceSnapshotSchema.parse(buildLegacyDrift()),
  clean: WorkspaceSnapshotSchema.parse(buildClean()),
};

export function isScenario(id: unknown): id is ScenarioId {
  return typeof id === "string" && (SCENARIOS as readonly string[]).includes(id);
}

/** Returns an independent deep copy, so callers can never mutate the seed. */
export function getScenario(id: ScenarioId): WorkspaceSnapshot {
  return structuredClone(SEEDS[id]);
}
