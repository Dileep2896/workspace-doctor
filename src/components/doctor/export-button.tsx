"use client";
import { Download } from "lucide-react";
import type { Finding } from "@/lib/types";
import { exportPlan } from "@/lib/export";
import { Button } from "@/components/ui/button";

function saveFile(name: string, text: string, type: string) {
  if (typeof URL.createObjectURL !== "function") return;
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportButton({ findings }: { findings: Finding[] }) {
  return (
    <Button
      disabled={!findings.length}
      onClick={() => {
        const { sql, sh } = exportPlan(findings);
        saveFile("doctor-fix.sql", sql, "application/sql");
        saveFile("doctor-fix.sh", sh, "text/x-shellscript");
      }}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export plan
    </Button>
  );
}
