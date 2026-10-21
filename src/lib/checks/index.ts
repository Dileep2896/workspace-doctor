import type { Finding, WorkspaceSnapshot } from "../types";
import { SEVERITY_RANK } from "../types";
import { indexWorkspace } from "../workspace";
import type { CheckDef } from "./types";
import { missingView } from "./missing-view";
import { staleView } from "./stale-view";
import { nameMismatch } from "./name-mismatch";
import { missingProjection } from "./missing-projection";
import { orphanFolder } from "./orphan-folder";
import { missingActionScript } from "./missing-action-script";
import { entryCountDrift } from "./entry-count-drift";
import { schemaDrift } from "./schema-drift";
import { brokenLink } from "./broken-link";

export type { CheckDef };

export const CHECKS: CheckDef[] = [
  missingView,
  staleView,
  nameMismatch,
  missingProjection,
  orphanFolder,
  missingActionScript,
  entryCountDrift,
  schemaDrift,
  brokenLink,
];

const subjectOf = (f: Finding) => f.object ?? f.id.slice(f.id.indexOf(":") + 1);

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      subjectOf(a).localeCompare(subjectOf(b)) ||
      a.id.localeCompare(b.id),
  );
}

export function runCheck(id: CheckDef["id"], snapshot: WorkspaceSnapshot): Finding[] {
  const check = CHECKS.find((c) => c.id === id);
  if (!check) throw new Error(`Unknown check ${id}`);
  return check.run(indexWorkspace(snapshot));
}

/** Runs all 9 checks and returns findings sorted by severity, then object name. */
export function diagnose(snapshot: WorkspaceSnapshot): Finding[] {
  const ix = indexWorkspace(snapshot);
  return sortFindings(CHECKS.flatMap((c) => c.run(ix)));
}
