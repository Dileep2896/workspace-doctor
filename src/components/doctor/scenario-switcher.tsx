"use client";
import { SCENARIOS, SCENARIO_INFO, type ScenarioId } from "@/data/seeds";
import { Segmented } from "@/components/ui/segmented";

export function ScenarioSwitcher({ value, onChange }: { value: ScenarioId; onChange: (s: ScenarioId) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <Segmented label="Workspace scenario" value={value} onChange={onChange} options={SCENARIOS.map((s) => ({ value: s, label: SCENARIO_INFO[s].label }))} />
      <p className="text-[11px] text-muted">{SCENARIO_INFO[value].blurb}</p>
    </div>
  );
}
