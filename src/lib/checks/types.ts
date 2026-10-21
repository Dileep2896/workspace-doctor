import type { CheckId, Finding, Severity } from "../types";
import type { WorkspaceIndex } from "../workspace";

export type CheckDef = {
  id: Exclude<CheckId, "conflict">;
  label: string;
  severity: Severity;
  run: (ix: WorkspaceIndex) => Finding[];
};

export function makeFinding(check: CheckDef["id"], subject: string, rest: Omit<Finding, "id" | "check">): Finding {
  return { id: `${check}:${subject}`, check, ...rest };
}

export function plural(n: number, word: string): string {
  if (n === 1) return `1 ${word}`;
  return `${n} ${word.endsWith("y") ? `${word.slice(0, -1)}ies` : `${word}s`}`;
}
