import type { WorkspaceSource } from "./workspace-source";
import { getScenario, type ScenarioId } from "@/data/seeds";

/** In-memory snapshot from the typed seed files. The only source used by the demo. */
export class SeedWorkspaceSource implements WorkspaceSource {
  constructor(private readonly scenario: ScenarioId) {}
  async load() {
    return getScenario(this.scenario);
  }
}
