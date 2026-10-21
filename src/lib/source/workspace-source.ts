import type { WorkspaceSnapshot } from "../types";

/** Everything the Doctor reads comes through this interface, so the real DuckDB reader is a drop-in. */
export interface WorkspaceSource {
  load(): Promise<WorkspaceSnapshot>;
}
