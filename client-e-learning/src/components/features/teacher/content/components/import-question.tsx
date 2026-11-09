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
import { useAuth } from "@/components/auth/auth-provider";
import { createQuestionImportHandoff } from "@/services/content/question-import-handoff";
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
    error.rowNumber,
    error.field,
    error.code,
    error.message,
    error.rawValue,
  ]);
  const csv =
    "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
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
  const { user } = useAuth();
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

  const continueToEditor = () => {
    if (!result || !user || user.role !== "TEACHER" || result.validCount === 0) return;
    try {
      const importId = createQuestionImportHandoff(bankId, user.id, result);
      const query = new URLSearchParams(window.location.search);
      query.set("mode", "bulk-create");
      query.set("importId", importId);
      window.location.assign(window.location.pathname + "?" + query.toString());
    } catch {
      setErrorMessage("Không thể lưu tạm dữ liệu CSV trong trình duyệt. Vui lòng kiểm tra dung lượng bộ nhớ.");
    }
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
    <div className="space-y-6">
      {/* Header điều hướng */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate("bank", bankId)}
            className="mb-2.5 inline-flex items-center gap-2 rounded-md border-2 border-ink bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft size={14} className="text-primary" /> Question Bank
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Import CSV Questions
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Kiểm tra và chuẩn hóa dữ liệu trước khi nạp vào ngân hàng đề · Chưa lưu trực tiếp.
          </p>
        </div>

        <a
          href={TEMPLATE_PATH}
          download="question-bank-csv-v1.csv"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-muted active:translate-y-0"
        >
          <Download size={15} className="text-primary" /> Tải file CSV mẫu
        </a>
      </div>

      {/* Thông số định dạng file */}
      <section className="rounded-xl border-2 border-ink bg-card p-5 text-card-foreground shadow-pop">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded border border-ink bg-primary-soft text-primary font-bold text-xs">
            i
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Quy chuẩn định dạng CSV v1
          </h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Bảng mã UTF-8, giới hạn tối đa 2 MB (~1.000 câu). Các cột dữ liệu phải sắp xếp đúng theo thứ tự file mẫu.
          Hỗ trợ: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK và TYPE_ANSWER.
        </p>

        <details className="group mt-3 rounded-lg border-2 border-border bg-background p-3 text-xs">
          <summary className="cursor-pointer font-bold text-primary hover:underline">
            Bấm để xem chi tiết quy tắc điền dữ liệu từng dạng câu
          </summary>
          <ul className="mt-3 list-inside list-disc space-y-1.5 leading-relaxed text-foreground">
            <li><strong className="font-semibold text-primary">difficulty:</strong> Nhận giá trị EASY, MEDIUM hoặc HARD; cột content là bắt buộc.</li>
            <li><strong className="font-semibold text-primary">Dạng trắc nghiệm:</strong> Điền liên tiếp từ option_a, tối thiểu 2 và tối đa 4 phương án.</li>
            <li><strong className="font-semibold text-primary">correct_answer:</strong> Với SINGLE_CHOICE điền B; với MULTIPLE_CHOICE điền các chữ cái ngăn cách bằng gạch đứng: A|C.</li>
            <li><strong className="font-semibold text-primary">TRUE_FALSE:</strong> Giá trị TRUE hoặc FALSE; bỏ trống các cột option_a đến option_d.</li>
            <li><strong className="font-semibold text-primary">FILL_IN_BLANK:</strong> Nội dung câu hỏi phải chứa ký hiệu 4 dấu gạch dưới: <code className="rounded border border-border bg-muted px-1">____</code>.</li>
            <li><strong className="font-semibold text-primary">TYPE_ANSWER:</strong> Danh sách các đáp án được chấp nhận, ngăn cách bởi dấu gạch đứng <code className="rounded border border-border bg-muted px-1">|</code>.</li>
            <li>Nội dung có chứa dấu phẩy phải được bọc trong cặp dấu ngoặc kép theo chuẩn CSV quốc tế.</li>
          </ul>
        </details>
      </section>

      {/* Input file ẩn */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Chọn file CSV"
        disabled={stage === "validating"}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {/* Giai đoạn 1: Upload / Drag & Drop */}
      {(stage === "upload" || stage === "error") && (
        <section className="rounded-xl border-2 border-ink bg-card p-6 shadow-pop sm:p-8">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              // if (stage !== "validating") setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center gap-3.5 rounded-xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
              dragging
                ? "border-primary bg-primary-soft/40 shadow-inner"
                : "border-border bg-background/50 hover:bg-muted/30"
            }`}
          >
            <div className="grid size-16 place-items-center rounded-2xl border-2 border-ink bg-primary text-primary-foreground shadow-pop-sm">
              <Upload size={28} />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Kéo thả file CSV vào đây</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Định dạng .csv chuẩn UTF-8 · Dung lượng không quá 2 MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-lg border-2 border-ink bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Chọn file từ máy
            </button>
          </div>

          {stage === "error" && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-lg border-2 border-destructive bg-destructive-soft p-4 text-xs font-medium text-destructive"
            >
              <XCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <strong className="font-bold">Không thể đọc file {fileName}.</strong>
                <p className="mt-1 break-words">{errorMessage}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Giai đoạn 2: Đang xác thực */}
      {stage === "validating" && (
        <section
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3.5 rounded-xl border-2 border-ink bg-card p-12 text-center shadow-pop"
        >
          <div className="grid size-14 place-items-center rounded-xl border-2 border-ink bg-primary-soft text-primary shadow-pop-sm">
            <Loader2 className="animate-spin" size={28} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Đang kiểm tra {fileName}...</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Hệ thống đang đối soát dữ liệu và phân tích từng câu hỏi.
            </p>
          </div>
        </section>
      )}

      {/* Giai đoạn 3: Báo cáo kết quả */}
      {stage === "report" && result && (
        <div className="space-y-6">
          {/* Card tổng kết số liệu */}
          <section className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl border-2 border-ink bg-primary-soft text-primary shadow-pop-sm">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <p className="break-all text-sm font-bold text-foreground">{result.fileName}</p>
                  <p className="text-xs text-muted-foreground">Kiểm tra hoàn tất · Chưa lưu vào ngân hàng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border-2 border-ink bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-muted active:translate-y-0"
              >
                Chọn file khác
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border-2 border-ink bg-muted/40 p-4 text-center shadow-pop-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tổng số câu</span>
                <strong className="mt-1 block text-2xl font-black text-foreground">{result.totalRows}</strong>
              </div>
              <div className="rounded-lg border-2 border-ink bg-success-soft p-4 text-center text-success shadow-pop-sm">
                <span className="text-xs font-bold uppercase tracking-wider">Hợp lệ</span>
                <strong className="mt-1 block text-2xl font-black">{result.validCount}</strong>
              </div>
              <div className="rounded-lg border-2 border-ink bg-warning-soft p-4 text-center text-warning shadow-pop-sm">
                <span className="text-xs font-bold uppercase tracking-wider">Không hợp lệ</span>
                <strong className="mt-1 block text-2xl font-black">{result.invalidCount}</strong>
              </div>
            </div>
          </section>

          {/* Bảng chi tiết lỗi (nếu có) */}
          {result.invalidCount > 0 ? (
            <section className="overflow-hidden rounded-xl border-2 border-ink bg-card shadow-pop">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-warning-soft px-5 py-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-warning">
                  <AlertTriangle size={18} />
                  <span>Phát hiện {result.invalidCount} câu không hợp lệ ({result.errors.length} lỗi)</span>
                </div>
                <button
                  type="button"
                  onClick={() => exportErrors(result.fileName, result.errors)}
                  className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download size={14} className="text-primary" /> Tải báo cáo lỗi (.csv)
                </button>
              </div>

              <div className="max-h-80 overflow-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="sticky top-0 border-b-2 border-border bg-muted/90 font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <tr>
                      <th className="p-3 w-16 text-center">Dòng</th>
                      <th className="p-3 w-36">Trường</th>
                      <th className="p-3">Chi tiết lỗi</th>
                      <th className="p-3 w-48">Dữ liệu gốc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.errors.map((error, index) => (
                      <tr key={`${error.rowNumber}-${error.code}-${index}`} className="hover:bg-muted/30">
                        <td className="p-3 text-center font-mono font-bold text-foreground">{error.rowNumber}</td>
                        <td className="p-3 font-semibold text-primary">{error.field}</td>
                        <td className="p-3">
                          <span className="block font-bold text-destructive">{error.message}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{error.code}</span>
                        </td>
                        <td className="max-w-48 break-all p-3 font-mono text-[11px] text-muted-foreground">
                          {error.rawValue || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border-2 border-ink bg-success-soft p-4 text-xs font-bold text-success shadow-pop-sm">
              <CheckCircle2 size={18} /> Toàn bộ các câu hỏi trong file đều đạt tiêu chuẩn hợp lệ.
            </div>
          )}

          {/* Danh sách câu hợp lệ xem trước */}
          {result.validCount > 0 && (
            <section className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CheckCircle2 size={18} className="text-success" />
                <span>Danh sách {result.validCount} câu hợp lệ sẵn sàng chuyển đổi</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Dữ liệu đã được hệ thống chuẩn hóa cấu trúc. Bạn có thể mở rộng danh sách để xem nhanh.
              </p>

              <details className="mt-3 rounded-lg border-2 border-border bg-background p-3">
                <summary className="cursor-pointer text-xs font-bold text-primary hover:underline">
                  Bấm để xem chi tiết {result.validCount} câu hợp lệ
                </summary>
                <ol className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                  {result.validQuestions.map(({ rowNumber, question }) => (
                    <li
                      key={rowNumber}
                      className="rounded-md border border-border bg-card p-2.5 text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                          Dòng {rowNumber}
                        </span>
                        <span className="rounded border border-primary/30 bg-primary-soft px-1.5 py-0.5 font-bold text-[10px] text-primary">
                          {question.type}
                        </span>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap break-words font-medium text-foreground">
                        {question.content}
                      </p>
                    </li>
                  ))}
                </ol>
              </details>
            </section>
          )}

          {/* Action Footer Bar */}
          <div className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop">
            <div className="flex items-start gap-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-primary text-primary-foreground shadow-pop-sm">
                <Info size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Giai đoạn kiểm tra hoàn tất</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {result.validCount > 0
                    ? `Có ${result.validCount} câu hợp lệ sẽ được chuyển sang giao diện Bulk Creator để bạn chỉnh sửa lần cuối trước khi lưu. Các câu bị lỗi sẽ tự động được bỏ qua.`
                    : "Không tìm thấy câu hỏi nào hợp lệ. Vui lòng chỉnh sửa lại theo báo cáo lỗi và tải lên lại."}
                </p>
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="mt-3 text-xs font-bold text-destructive">
                {errorMessage}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t-2 border-border pt-4">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border-2 border-ink bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-muted active:translate-y-0"
              >
                Chọn lại file
              </button>
              <button
                type="button"
                disabled={!user || user.role !== "TEACHER" || result.validCount === 0}
                onClick={continueToEditor}
                className="rounded-lg border-2 border-ink bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
              >
                Chuyển {result.validCount} câu vào trình soạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
