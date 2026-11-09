"use client";

import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet } from "lucide-react";
import { downloadQuestionImportErrors } from "@/utils/question-import-errors";
import type { CsvValidationResult } from "@/types/question-import";

export function QuestionImportReport({ result }: { result: CsvValidationResult }) {
  return (
    <section className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-slate-800">
      <div className="flex flex-wrap items-start gap-2">
        <FileSpreadsheet size={18} className="mt-0.5 shrink-0 text-emerald-700" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            Đã nạp {result.validCount} câu từ {result.fileName} — chưa lưu
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Bạn có thể chỉnh sửa, thêm, xóa và xem trước trước khi nhấn Save Questions.
          </p>
        </div>
        <CheckCircle2 size={18} className="shrink-0 text-emerald-700" />
      </div>
      {result.invalidCount > 0 && (
        <details className="mt-3 rounded-lg border border-amber-200 bg-white p-3">
          <summary className="cursor-pointer font-semibold text-amber-900">
            <AlertTriangle size={15} className="mr-1 inline align-text-bottom" />
            Xem {result.invalidCount} câu lỗi CSV ({result.errors.length} lỗi)
          </summary>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => downloadQuestionImportErrors(result.fileName, result.errors)}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50"
            >
              <Download size={14} /> Tải báo cáo lỗi
            </button>
          </div>
          <div className="mt-2 max-h-52 overflow-auto">
            <table className="w-full min-w-[540px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr><th className="p-2">Dòng</th><th className="p-2">Trường</th><th className="p-2">Lỗi</th></tr>
              </thead>
              <tbody>
                {result.errors.map((error, index) => (
                  <tr key={error.rowNumber + "-" + error.code + "-" + index} className="border-t border-slate-100">
                    <td className="p-2 font-mono">{error.rowNumber}</td>
                    <td className="p-2">{error.field}</td>
                    <td className="p-2">
                      <span className="font-medium text-rose-700">{error.message}</span>
                      <span className="ml-2 text-slate-400">{error.code}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
