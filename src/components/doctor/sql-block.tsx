import { Fragment } from "react";

const KW = /^(BEGIN|TRANSACTION|COMMIT|CREATE|OR|REPLACE|VIEW|AS|PIVOT|SELECT|FROM|JOIN|ON|WHERE|AND|IN|USING|GROUP|BY|DROP|IF|EXISTS|ALTER|TABLE|COLUMN|ADD|NOT|UPDATE|SET|DELETE|NULL|LIKE|DEFAULT|BOOLEAN|INTEGER)$/;

/** Tiny SQL highlighter: keywords, 'strings' and "identifiers". No dependencies. */
export function highlightSql(sql: string) {
  const parts = sql.split(/('(?:[^']|'')*'|"(?:[^"]|"")*"|\b[A-Za-z_]+\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith("'")) return <span key={i} className="sql-str">{p}</span>;
    if (p.startsWith('"')) return <span key={i} className="sql-ident">{p}</span>;
    if (KW.test(p)) return <span key={i} className="sql-kw">{p}</span>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function SqlBlock({ sql }: { sql: string }) {
  return (
    <pre data-testid="sql-block" className="overflow-x-auto rounded-lg border border-line bg-panel-2 p-3 font-mono text-[12px] leading-relaxed">
      <code>{highlightSql(sql)}</code>
    </pre>
  );
}
