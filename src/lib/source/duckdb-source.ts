import type { WorkspaceSource } from "./workspace-source";
import type { WorkspaceSnapshot } from "../types";

export class NotImplementedInDemo extends Error {
  constructor() {
    super("DuckDbWorkspaceSource is a documented stub; the demo runs on seed data only.");
    this.name = "NotImplementedInDemo";
  }
}

/**
 * Where the real reader would go inside a host CRM app. Not used by the demo.
 *
 *   import { DuckDBInstance } from "@duckdb/node-api";
 *   const db = await DuckDBInstance.create(`${root}/workspace.duckdb`, { access_mode: "READ_ONLY" });
 *   const con = await db.connect();
 *   objectColumns <- SELECT column_name FROM information_schema.columns WHERE table_name = 'objects'
 *   objects       <- SELECT * FROM objects
 *   fields        <- SELECT * FROM fields ORDER BY object_id, sort_order
 *   entryCounts   <- SELECT object_id, COUNT(*) FROM entries GROUP BY object_id
 *   entries       <- SELECT id, object_id FROM entries WHERE id IN (SELECT entry_id FROM documents)
 *   views         <- SELECT table_name, column_name FROM information_schema.columns
 *                    WHERE table_name IN (SELECT table_name FROM information_schema.tables WHERE table_type = 'VIEW')
 *   documents     <- SELECT * FROM documents
 *   fs            <- fs.readdir(root, { recursive: true }) + readFile for every `.object.yaml`
 *                    and existence checks for `.actions/*` and document paths
 */
export class DuckDbWorkspaceSource implements WorkspaceSource {
  constructor(readonly workspaceRoot: string) {}
  async load(): Promise<WorkspaceSnapshot> {
    throw new NotImplementedInDemo();
  }
}
