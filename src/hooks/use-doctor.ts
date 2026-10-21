"use client";
import { useMemo, useReducer } from "react";
import { getScenario, type ScenarioId } from "@/data/seeds";
import { diagnose } from "@/lib/checks";
import { applyAll, applyFixDetailed, pushHistory, undo } from "@/lib/apply";
import { healthScore, severityCounts } from "@/lib/score";
import { simulateSidebar } from "@/lib/sidebar";
import type { Finding, Severity, WorkspaceSnapshot } from "@/lib/types";

export type Filter = "all" | Severity;
export type Toast = { id: number; tone: "ok" | "error"; text: string };

export type DoctorState = {
  scenario: ScenarioId;
  snapshot: WorkspaceSnapshot;
  history: WorkspaceSnapshot[];
  selectedId: string | null;
  filter: Filter;
  preview: "current" | "after";
  pendingConfirm: Finding | null;
  toast: Toast | null;
};

export type DoctorAction =
  | { type: "scenario"; scenario: ScenarioId }
  | { type: "select"; id: string | null }
  | { type: "filter"; filter: Filter }
  | { type: "preview"; preview: DoctorState["preview"] }
  | { type: "apply"; id: string }
  | { type: "confirm" }
  | { type: "cancel" }
  | { type: "fixAllSafe" }
  | { type: "undo" }
  | { type: "dismissToast" };

let toastSeq = 0;
const toast = (tone: Toast["tone"], text: string): Toast => ({ id: ++toastSeq, tone, text });

export function initDoctor(scenario: ScenarioId = "acme"): DoctorState {
  const snapshot = getScenario(scenario);
  return {
    scenario,
    snapshot,
    history: [],
    selectedId: diagnose(snapshot)[0]?.id ?? null,
    filter: "all",
    preview: "current",
    pendingConfirm: null,
    toast: null,
  };
}

function commit(state: DoctorState, finding: Finding): DoctorState {
  const before = diagnose(state.snapshot);
  const r = applyFixDetailed(state.snapshot, finding);
  if (r.conflict) return { ...state, pendingConfirm: null, toast: toast("error", r.conflict.title) };
  const after = diagnose(r.snapshot);
  const idx = before.findIndex((f) => f.id === finding.id);
  const nextSel = after[Math.min(Math.max(idx, 0), after.length - 1)]?.id ?? null;
  return {
    ...state,
    snapshot: r.snapshot,
    history: pushHistory(state.history, state.snapshot),
    selectedId: nextSel,
    pendingConfirm: null,
    toast: toast("ok", `Fixed: ${finding.title}`),
  };
}

export function doctorReducer(state: DoctorState, action: DoctorAction): DoctorState {
  switch (action.type) {
    case "scenario":
      return initDoctor(action.scenario);
    case "select":
      return { ...state, selectedId: action.id };
    case "filter":
      return { ...state, filter: action.filter };
    case "preview":
      return { ...state, preview: action.preview };
    case "apply": {
      const f = diagnose(state.snapshot).find((x) => x.id === action.id);
      if (!f) return state;
      return f.safe ? commit(state, f) : { ...state, pendingConfirm: f };
    }
    case "confirm":
      return state.pendingConfirm ? commit(state, state.pendingConfirm) : state;
    case "cancel":
      return { ...state, pendingConfirm: null };
    case "fixAllSafe": {
      const before = diagnose(state.snapshot).filter((f) => f.safe).length;
      if (!before) return state;
      const snapshot = applyAll(state.snapshot, { safeOnly: true });
      const left = diagnose(snapshot);
      return {
        ...state,
        snapshot,
        history: pushHistory(state.history, state.snapshot),
        selectedId: left[0]?.id ?? null,
        toast: toast("ok", `Applied ${before} safe fixes`),
      };
    }
    case "undo": {
      if (!state.history.length) return state;
      const r = undo(state.history, state.snapshot);
      return { ...state, snapshot: r.snapshot, history: r.history, toast: toast("ok", "Undone") };
    }
    case "dismissToast":
      return { ...state, toast: null };
  }
}

export function useDoctor(initial: ScenarioId = "acme") {
  const [state, dispatch] = useReducer(doctorReducer, initial, initDoctor);
  const derived = useMemo(() => {
    const findings = diagnose(state.snapshot);
    const after = applyAll(state.snapshot, { safeOnly: true });
    return {
      findings,
      score: healthScore(findings),
      counts: severityCounts(findings),
      sidebar: simulateSidebar(state.snapshot),
      afterSidebar: simulateSidebar(after),
      afterScore: healthScore(diagnose(after)),
      safeCount: findings.filter((f) => f.safe).length,
    };
  }, [state.snapshot]);
  const selected = derived.findings.find((f) => f.id === state.selectedId) ?? null;
  return { state, dispatch, ...derived, selected };
}
