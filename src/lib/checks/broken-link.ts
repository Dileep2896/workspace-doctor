import { makeFinding, type CheckDef } from "./types";
import { quoteLiteral, txn } from "../sql";
import type { DbEffect, Finding } from "../types";

const basename = (p: string) => p.split("/").pop() ?? p;

export const brokenLink: CheckDef = {
  id: "broken-link",
  label: "Broken link",
  severity: "warning",
  run(ix) {
    const { s } = ix;
    const out: Finding[] = [];
    const entryIds = new Set(s.db.entries.map((e) => e.id));

    for (const d of s.db.documents) {
      const fileExists = d.file_path in s.fs.files;
      const entryExists = d.entry_id === undefined || entryIds.has(d.entry_id);
      if (fileExists && entryExists) continue;
      const statements: string[] = [];
      const effects: DbEffect[] = [];
      let summary = "";
      let removed = false;
      if (!fileExists) {
        const alt = Object.keys(s.fs.files)
          .filter((p) => p !== d.file_path && basename(p) === basename(d.file_path))
          .sort()[0];
        if (alt) {
          statements.push(`UPDATE documents SET file_path = ${quoteLiteral(alt)} WHERE id = ${quoteLiteral(d.id)}`);
          effects.push({ type: "setDocumentPath", id: d.id, file_path: alt });
          summary = `Re-point the document to ${alt}`;
        } else {
          statements.push(`DELETE FROM documents WHERE id = ${quoteLiteral(d.id)}`);
          effects.push({ type: "deleteDocument", id: d.id });
          summary = "Remove the dangling document row (its file is already gone)";
          removed = true;
        }
      }
      if (!entryExists && !removed) {
        statements.push(`UPDATE documents SET entry_id = NULL WHERE id = ${quoteLiteral(d.id)}`);
        effects.push({ type: "clearDocumentEntry", id: d.id });
        summary = summary ? `${summary} and unlink the deleted entry` : "Unlink the document from the deleted entry (keeps the file)";
      }
      const owner = d.parent_object_id ? ix.objectById.get(d.parent_object_id)?.name : undefined;
      out.push(
        makeFinding("broken-link", `doc-${d.id}`, {
          severity: "warning",
          object: owner,
          title: !fileExists ? `"${d.title}": file ${d.file_path} is missing` : `"${d.title}": linked entry was deleted`,
          why: !fileExists
            ? `The \`documents\` row points at \`${d.file_path}\`, which no longer exists, so the record's Documents tab shows a dead link that 404s when opened.`
            : `The document is attached to entry \`${d.entry_id}\`, which was deleted. It no longer shows on any record, so the note is effectively lost.`,
          evidence: { document: d.id, file_path: d.file_path, fileExists, ...(d.entry_id ? { entry_id: d.entry_id, entryExists } : {}) },
          safe: false,
          fix: { summary, ops: [{ kind: "sql", sql: txn(statements), effects }] },
        }),
      );
    }

    for (const f of s.db.fields) {
      if (!f.related_object_id || ix.objectById.has(f.related_object_id)) continue;
      const owner = ix.objectById.get(f.object_id)?.name;
      out.push(
        makeFinding("broken-link", `field-${f.id}`, {
          severity: "warning",
          object: owner,
          title: `${owner ?? f.object_id}."${f.name}": relation to a deleted object`,
          why: `The relation field points at object \`${f.related_object_id}\`, which no longer exists. The relation picker renders empty and saving a value fails. Downgrading it to text keeps the stored values readable.`,
          evidence: { field: f.name, related_object_id: f.related_object_id, targetExists: false },
          safe: false,
          fix: {
            summary: `Convert "${f.name}" to a text field`,
            ops: [
              {
                kind: "sql",
                sql: txn([`UPDATE fields SET type = 'text', related_object_id = NULL, relationship_type = NULL WHERE id = ${quoteLiteral(f.id)}`]),
                effects: [{ type: "fieldToText", fieldId: f.id }],
              },
            ],
          },
        }),
      );
    }
    return out;
  },
};
