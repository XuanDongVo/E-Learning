"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import { downloadAssignmentQuestionTemplate } from "@/services/assignment.service";

export function AssignmentQuestionImport({
  assignmentId,
  existingCount,
  locked,
  onClose,
  onImported,
}: {
  assignmentId: number;
  existingCount: number;
  locked: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof assignmentQuestionService.previewImport>>["data"]>();
  const [busy, setBusy] = useState(false);

  const remaining = Math.max(0, 100 - existingCount);
  const validRows = preview?.rows.filter((row) => row.valid) ?? [];
  const canImport = !locked && !!preview && validRows.length > 0 && validRows.length <= remaining;

  const fileHint = useMemo(() => {
    if (!file) return "Only .xlsx files up to 5MB are supported.";
    return `${file.name} · ${Math.round(file.size / 1024)} KB`;
  }, [file]);

  const chooseFile = (nextFile: File | null) => {
    if (!nextFile) return;

    if (!nextFile.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please choose an .xlsx file.");
      return;
    }

    if (nextFile.size > 5 * 1024 * 1024) {
      toast.error("The Excel file must be 5MB or smaller.");
      return;
    }

    setFile(nextFile);
    setPreview(undefined);
  };

  const previewFile = async () => {
    if (!file || locked) return;

    setBusy(true);
    try {
      const response = await assignmentQuestionService.previewImport(
        assignmentId,
        file,
      );
      setPreview(response.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not preview the file.",
      );
    } finally {
      setBusy(false);
    }
  };

  const importValidRows = async () => {
    if (!preview || !canImport) return;

    setBusy(true);
    try {
      await assignmentQuestionService.create(
        assignmentId,
        validRows.map((row) => row.question),
      );
      toast.success(`${validRows.length} questions imported.`);
      onImported();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not import questions.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 p-4">
      <div className="mx-auto flex h-full max-w-3xl items-center">
        <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-start justify-between border-b border-border p-5">
            <div>
              <p className="text-body-sm font-bold text-primary">
                Excel import
              </p>
              <h2 className="mt-1 text-section-title font-bold">
                Import assignment questions
              </h2>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Template → upload → preview → import valid rows.
              </p>
            </div>

            <button type="button" onClick={onClose} className="grid size-8 place-items-center hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-body-sm font-bold">
                <Upload className="size-4" />
                Choose .xlsx
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                />
              </label>

              <button
                type="button"
                onClick={() => downloadAssignmentQuestionTemplate()}
                className="inline-flex items-center gap-2 text-body-sm font-bold text-primary"
              >
                <Download className="size-4" />
                Download template
              </button>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">{fileHint}</p>

            <div className="mt-4 flex items-center justify-between gap-3 border-y border-border py-3">
              <p className="text-body-sm text-muted-foreground">
                {remaining} question slots remaining
              </p>

              <button
                type="button"
                onClick={previewFile}
                disabled={!file || busy || locked}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Preview file
              </button>
            </div>

            {preview && (
              <div className="mt-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Summary label="Rows" value={preview.totalRows} />
                  <Summary label="Valid" value={preview.validRows} />
                  <Summary label="Invalid" value={preview.invalidRows} />
                </div>

                {validRows.length > remaining && (
                  <div className="mt-4 flex gap-2 border border-amber-200 bg-amber-50 p-3 text-body-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <p>
                      This import exceeds the 100-question Assignment limit.
                      Remove some rows and preview again.
                    </p>
                  </div>
                )}

                <div className="mt-4 border border-border">
                  <div className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    <span>Row</span>
                    <span>Question</span>
                    <span>Status</span>
                  </div>

                  <div className="divide-y divide-border">
                    {preview.rows.map((row) => (
                      <div key={row.rowNumber} className="grid grid-cols-[64px_1fr_auto] gap-3 px-3 py-3">
                        <span className="text-body-sm font-semibold tabular-nums">
                          {row.rowNumber}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-body-sm font-medium">
                            {row.question.content || "Untitled question"}
                          </p>
                          {row.errors.length > 0 && (
                            <p className="mt-1 text-[11px] text-rose-600">
                              {row.errors.join(" · ")}
                            </p>
                          )}
                        </div>

                        <span className={`inline-flex h-fit items-center gap-1 text-[11px] font-bold ${
                          row.valid ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {row.valid ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <AlertTriangle className="size-3.5" />
                          )}
                          {row.valid ? "Valid" : "Invalid"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border p-5">
            <p className="text-body-sm text-muted-foreground">
              Only valid rows are imported. The server validates them again.
            </p>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-body-sm font-bold">
                Cancel
              </button>
              <button
                type="button"
                onClick={importValidRows}
                disabled={!canImport || busy}
                className="rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                Import {validRows.length} questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}
