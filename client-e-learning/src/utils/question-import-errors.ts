import type { CsvImportError } from "@/types/question-import";

function csvCell(value: string | number | null | undefined): string {
  let text = String(value ?? "");
  // Prevent spreadsheet formulas in exported untrusted CSV values.
  if (/^\s*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export function downloadQuestionImportErrors(
  fileName: string,
  errors: CsvImportError[],
): void {
  if (!errors.length) return;
  const header = ["row_number", "field", "error_code", "error_message", "raw_value"];
  const rows = errors.map((error) => [
    error.rowNumber, error.field, error.code, error.message, error.rawValue,
  ]);
  const csv = "\uFEFF" + [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n") + "\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.replace(/\.csv$/i, "") + "-validation-errors.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
