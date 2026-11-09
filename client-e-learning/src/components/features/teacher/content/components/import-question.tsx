"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileWarning,
  Info,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";

import { toAppError } from "@/lib/errors/app-error";
import { questionImportService } from "@/services/content/content.questionImport.service";
import type { ContentView } from "@/types/content";
import type { CsvImportError, CsvValidationResult } from "@/types/question-import";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const TEMPLATE_PATH = "/templates/question-bank-csv-v1.csv";

type ImportStage = "upload" | "validating" | "report" | "error";

function csvCell(value: string | number | null | undefined): string {
  let text = String(value ?? "");
  // Prevent spreadsheet applications treating untrusted error values as formulas.
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function exportErrors(fileName: string, errors: CsvImportError[]) {
  const header = ["row_number", "field", "error_code", "error_message", "raw_value"];
  const rows = errors.map((error) => [
    error.rowNumber, error.field, error.code, error.message, error.rawValue,
  ]);
  const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.replace(/\.csv$/i, "") + "-validation-errors.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function validationMessage(error: unknown): string {
  const appError = toAppError(error);
  const raw = appError.message.replace(/^\[[A-Z0-9_]+\]\s*/, "").trim();
  if (!raw || /^\s*<(!doctype|html)/i.test(raw)) {
    return "Không thể kiểm tra file. Vui lòng thử lại.";
  }
  return raw;
}

export function ImportQuestions({
  bankId,
  onNavigate,
}: {
  bankId: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const [stage, setStage] = useState<ImportStage>("upload");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<CsvValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  // Ignore an old response if a new file was selected or the page unmounted.
  useEffect(() => () => { requestId.current += 1; }, []);

  const reset = () => {
    requestId.current += 1;
    setStage("upload");
    setResult(null);
    setErrorMessage("");
    setFileName("");
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const currentRequest = ++requestId.current;
    setResult(null);
    setFileName(file.name);
    setErrorMessage("");

    if (!/\.csv$/i.test(file.name)) {
      setErrorMessage("Chỉ hỗ trợ file .csv. Excel (.xlsx, .xls) chưa được hỗ trợ.");
      setStage("error");
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      setErrorMessage("File CSV phải có dữ liệu và không vượt quá 2 MB.");
      setStage("error");
      return;
    }

    setStage("validating");
    try {
      const response = await questionImportService.validate(bankId, file);
      if (requestId.current !== currentRequest) return;
      if (!Array.isArray(response.validQuestions) || !Array.isArray(response.errors)) {
        throw new Error("Dữ liệu xác thực CSV không đúng định dạng.");
      }
      setResult(response);
      setStage("report");
    } catch (error) {
      if (requestId.current !== currentRequest) return;
      setErrorMessage(validationMessage(error));
      setStage("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => onNavigate("bank", bankId)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Question Bank
          </button>
          <h1 className="text-page-title font-bold text-slate-900">Import CSV Questions</h1>
          <p className="mt-1 text-body-sm text-slate-500">
            Kiểm tra dữ liệu trước khi thêm vào Question Bank. Validation không lưu câu hỏi.
          </p>
        </div>
        <a
          href={TEMPLATE_PATH}
          download="question-bank-csv-v1.csv"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
        >
          <Download size={16} /> Tải file CSV mẫu
        </a>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-800">Định dạng CSV v1</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          UTF-8, tối đa 2 MB / 1.000 câu. Các cột phải đúng thứ tự trong file mẫu.
          Hỗ trợ SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK và TYPE_ANSWER.
          Không hỗ trợ CLOZE/MATCHING trong Question Bank CSV.
        </p>
        <details className="mt-3 text-xs text-slate-600">
          <summary className="cursor-pointer font-semibold text-primary">Xem quy tắc điền dữ liệu</summary>
          <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
            <li>difficulty: EASY, MEDIUM hoặc HARD; content bắt buộc.</li>
            <li>Choice: điền liên tiếp từ option_a, tối thiểu hai và tối đa bốn lựa chọn.</li>
            <li>correct_answer của SINGLE_CHOICE: B; MULTIPLE_CHOICE: A|C.</li>
            <li>TRUE_FALSE: TRUE hoặc FALSE; không điền option_a đến option_d.</li>
            <li>FILL_IN_BLANK: content phải chứa ____; đáp án có thể ngăn cách bằng |.</li>
            <li>TYPE_ANSWER: các đáp án chấp nhận ngăn cách bằng |.</li>
            <li>Đặt nội dung chứa dấu phẩy trong dấu ngoặc kép theo chuẩn CSV.</li>
          </ul>
        </details>
      </section>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Chọn file CSV"
        disabled={stage === "validating"}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {(stage === "upload" || stage === "error") && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div
            onDragOver={(event) => { event.preventDefault(); if (stage !== "validating") setDragging(true); }}
            onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition sm:p-12 ${dragging ? "border-primary bg-primary-light/30" : "border-slate-200 bg-slate-50/50"}`}
          >
            <div className="grid size-14 place-items-center rounded-full bg-white text-primary shadow-sm"><Upload size={26} /></div>
            <p className="text-sm font-semibold text-slate-800">Kéo thả file CSV vào đây</p>
            <p className="text-xs text-slate-500">Hoặc chọn file từ máy · .csv UTF-8 · tối đa 2 MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Chọn file CSV
            </button>
          </div>
          {stage === "error" && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <XCircle size={17} className="mt-0.5 shrink-0" />
              <div>
                <strong>Không thể kiểm tra {fileName}.</strong>
                <p className="mt-1 break-words">{errorMessage}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {stage === "validating" && (
        <section role="status" aria-live="polite" className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="text-sm font-semibold text-slate-800">Đang kiểm tra {fileName}...</p>
          <p className="text-xs text-slate-500">Backend đang phân tích và validate từng câu hỏi. Chưa lưu dữ liệu.</p>
        </section>
      )}

      {stage === "report" && result && (
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600"><FileSpreadsheet size={20} /></div>
                <div>
                  <p className="break-all text-sm font-bold text-slate-800">{result.fileName}</p>
                  <p className="text-xs text-slate-500">Đã kiểm tra xong · Chưa thêm vào Question Bank</p>
                </div>
              </div>
              <button type="button" onClick={reset} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Chọn file khác
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-3 text-center"><strong className="block text-xl text-slate-900">{result.totalRows}</strong><span className="text-xs text-slate-500">Tổng câu</span></div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center"><strong className="block text-xl text-emerald-700">{result.validCount}</strong><span className="text-xs text-emerald-700">Hợp lệ</span></div>
              <div className="rounded-lg bg-amber-50 p-3 text-center"><strong className="block text-xl text-amber-700">{result.invalidCount}</strong><span className="text-xs text-amber-700">Không hợp lệ</span></div>
            </div>
          </section>

          {result.invalidCount > 0 ? (
            <section className="overflow-hidden rounded-xl border border-amber-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <AlertTriangle size={18} /> {result.invalidCount} câu không hợp lệ · {result.errors.length} lỗi
                </div>
                <button
                  type="button"
                  onClick={() => exportErrors(result.fileName, result.errors)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50"
                >
                  <Download size={15} /> Tải báo cáo lỗi
                </button>
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full min-w-[630px] text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500">
                    <tr><th className="p-3">Dòng</th><th className="p-3">Trường</th><th className="p-3">Lỗi</th><th className="p-3">Giá trị</th></tr>
                  </thead>
                  <tbody>
                    {result.errors.map((error, index) => (
                      <tr key={`${error.rowNumber}-${error.code}-${index}`} className="border-t border-slate-100">
                        <td className="p-3 font-mono text-slate-500">{error.rowNumber}</td>
                        <td className="p-3 font-medium text-slate-700">{error.field}</td>
                        <td className="p-3"><span className="block font-medium text-rose-700">{error.message}</span><span className="mt-0.5 block text-[11px] text-slate-400">{error.code}</span></td>
                        <td className="max-w-44 break-all p-3 text-slate-500">{error.rawValue || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <CheckCircle2 size={18} /> Tất cả câu hỏi đều hợp lệ.
            </div>
          )}

          {result.validCount > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CheckCircle2 size={17} className="text-emerald-600" /> {result.validCount} câu hợp lệ
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Dữ liệu đã được backend chuẩn hóa. Chưa có câu hỏi nào được lưu.
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-primary">Xem danh sách câu hợp lệ</summary>
                <ol className="mt-2 max-h-64 space-y-2 overflow-auto">
                  {result.validQuestions.map(({ rowNumber, question }) => (
                    <li key={rowNumber} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                      <span className="font-mono text-slate-400">Dòng {rowNumber}</span>
                      <span className="ml-2 font-semibold text-slate-700">{question.type}</span>
                      <p className="mt-1 whitespace-pre-wrap break-words text-slate-700">{question.content}</p>
                    </li>
                  ))}
                </ol>
              </details>
            </section>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-2 text-slate-700">
              <Info size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Partial import — bước kiểm tra đã hoàn tất</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {result.validCount > 0
                    ? `${result.validCount} câu hợp lệ đã sẵn sàng để chuyển sang BulkQuestionCreator. ${result.invalidCount} câu lỗi sẽ bị bỏ qua khi tiếp tục.`
                    : "Không có câu nào hợp lệ. Vui lòng sửa CSV và tải lên lại."}
                  {" "}Bước chuyển vào trình chỉnh sửa và lưu nằm trong Phase 3, chưa được kích hoạt ở Phase 2.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={reset} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Chọn lại file
              </button>
              <button type="button" disabled title="Tích hợp BulkQuestionCreator sẽ được triển khai trong Phase 3" className="cursor-not-allowed rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white opacity-60">
                Tiếp tục với {result.validCount} câu (Phase 3)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
