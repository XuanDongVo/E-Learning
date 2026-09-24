"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import type { ContentView } from "@/types/content";
import { Badge } from "./badge";

type ImportStage = "upload" | "validating" | "preview" | "importing" | "done";

type PreviewRow = {
  row: number;
  question: string;
  type: string;
  difficulty: string;
  status: "valid" | "error";
  error?: string;
};

// Mock validation result — replace with the real response from
// POST /api/v1/question-banks/{bankId}/questions/import/validate
function mockValidate(fileName: string): PreviewRow[] {
  const base: PreviewRow[] = Array.from({ length: 12 }, (_, index) => ({
    row: index + 2, // header is row 1
    question: `Sample imported question ${index + 1} from ${fileName}`,
    type: "MULTIPLE_CHOICE",
    difficulty: index % 3 === 0 ? "HARD" : "EASY",
    status: "valid",
  }));

  // Seed a couple of realistic errors so the preview isn't misleadingly clean.
  base[3] = { ...base[3], status: "error", error: "Missing correct answer" };
  base[9] = { ...base[9], status: "error", error: "Question text is empty" };

  return base;
}

export function ImportQuestions({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  const [stage, setStage] = useState<ImportStage>("upload");
  const [fileName, setFileName] = useState<string>();
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((row) => row.status === "valid");
  const errorRows = rows.filter((row) => row.status === "error");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const isSpreadsheet = /\.(csv|xlsx|xls)$/i.test(file.name);
    if (!isSpreadsheet) return;

    setFileName(file.name);
    setStage("validating");

    // TODO: upload the file and call the real validate endpoint.
    setTimeout(() => {
      setRows(mockValidate(file.name));
      setStage("preview");
    }, 900);
  };

  const handleImport = () => {
    setStage("importing");
    // TODO: POST /api/v1/question-banks/{bankId}/questions/import
    // with only the valid rows (or the full file + "skip errors" flag).
    setTimeout(() => setStage("done"), 900);
  };

  const reset = () => {
    setStage("upload");
    setFileName(undefined);
    setRows([]);
  };

  return (
    <>
      <div className="mb-5">
        {/* <button
          type="button"
          onClick={() => onNavigate("bank")}
          className="inline-flex w-fit items-center gap-1.5 text-body-sm font-medium text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={15} />
          Back to Past Simple - Basic
        </button> */}

        <h1 className="mt-3 text-page-title font-bold text-slate-900">Import questions</h1>
        <p className="mt-1 text-body-sm text-slate-400">
          Upload a CSV or Excel file to add many questions at once.
        </p>
      </div>

      {stage === "upload" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-6">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDraggingFile(false);
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition ${
              isDraggingFile ? "border-primary bg-primary-light/30" : "border-slate-200 bg-slate-50/50"
            }`}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm">
              <FileSpreadsheet className="text-primary" size={26} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your file here
              </p>
              <p className="mt-0.5 text-xs text-slate-400">CSV or Excel (.xlsx, .xls), up to 10 MB</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Choose file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-body-sm text-slate-500">
            <span>Need the correct format?</span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-primary-hover"
            >
              <Download size={14} />
              Download template
            </button>
          </div>
        </section>
      )}

      {stage === "validating" && (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="text-sm font-semibold text-slate-800">Validating {fileName}...</p>
          <p className="text-xs text-slate-400">Checking formatting and required fields.</p>
        </section>
      )}

      {stage === "preview" && (
        <>
          <section className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <FileSpreadsheet size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{fileName}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 size={13} /> {validRows.length} valid
                  </span>
                  {errorRows.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-rose-600">
                      <XCircle size={13} /> {errorRows.length} errors
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:self-auto"
            >
              <X size={14} />
              Choose a different file
            </button>
          </section>

          {errorRows.length > 0 && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                {errorRows.length} row{errorRows.length > 1 ? "s" : ""} need attention and will be skipped.
                You can import the {validRows.length} valid question{validRows.length !== 1 ? "s" : ""} now
                and fix the rest afterwards.
              </span>
            </div>
          )}

          <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="w-14 p-2.5">Row</th>
                    <th className="p-2.5">Question</th>
                    <th className="w-32 p-2.5">Difficulty</th>
                    <th className="w-28 p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.row}
                      className={`border-b border-slate-100 last:border-0 ${
                        row.status === "error" ? "bg-rose-50/40" : ""
                      }`}
                    >
                      <td className="p-2.5 font-mono text-slate-400">{row.row}</td>
                      <td className="max-w-[320px] truncate p-2.5 text-slate-700">{row.question}</td>
                      <td className="p-2.5 text-slate-500">{row.difficulty}</td>
                      <td className="p-2.5">
                        {row.status === "valid" ? (
                          <Badge tone="green">Valid</Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                            <XCircle size={13} />
                            {row.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="sticky bottom-4 flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validRows.length === 0}
              onClick={handleImport}
              className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Import {validRows.length} question{validRows.length !== 1 ? "s" : ""}
            </button>
          </div>
        </>
      )}

      {stage === "importing" && (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="text-sm font-semibold text-slate-800">Importing {validRows.length} questions...</p>
        </section>
      )}

      {stage === "done" && (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} />
          </span>
          <p className="text-sm font-semibold text-slate-800">
            {validRows.length} questions imported successfully
          </p>
          {errorRows.length > 0 && (
            <p className="text-xs text-slate-400">
              {errorRows.length} rows were skipped due to errors and were not imported.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            {errorRows.length > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Download size={14} />
                Download error file
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate("bank")}
              className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Back to question bank
            </button>
          </div>
        </section>
      )}
    </>
  );
}