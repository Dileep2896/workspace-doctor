const show = (v: unknown) => (v === null || v === undefined ? "none" : typeof v === "object" ? JSON.stringify(v) : String(v));

export function EvidenceTable({ evidence }: { evidence: Record<string, unknown> }) {
  return (
    <table className="w-full table-fixed text-left text-[12px]">
      <caption className="sr-only">Evidence</caption>
      <tbody>
        {Object.entries(evidence).map(([k, v]) => (
          <tr key={k} className="border-b border-line last:border-0">
            <th scope="row" className="w-1/3 py-1.5 pr-2 align-top font-medium text-muted">{k}</th>
            <td className={`break-words py-1.5 font-mono ${v === null || v === false ? "text-crit" : ""}`}>{show(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
