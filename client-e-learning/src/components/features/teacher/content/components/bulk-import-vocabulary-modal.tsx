"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Zap, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import type { CreateVocabularyWordRequest } from "@/types/vocabulary";

interface BulkImportVocabularyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (words: CreateVocabularyWordRequest[]) => Promise<void>;
  isPending: boolean;
}

export function BulkImportVocabularyModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: BulkImportVocabularyModalProps) {
  const [rawText, setRawText] = useState("");
  const [defaultDifficulty, setDefaultDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [parsedWords, setParsedWords] = useState<CreateVocabularyWordRequest[]>([]);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    if (!rawText.trim()) {
      setError("Vui lòng dán danh sách từ vựng vào ô bên dưới");
      return;
    }

    const lines = rawText.split("\n");
    const results: CreateVocabularyWordRequest[] = [];

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Split by common delimiters: " - ", ":", "\t", or " – "
      let parts: string[] = [];
      if (cleanLine.includes(" - ")) {
        parts = cleanLine.split(" - ");
      } else if (cleanLine.includes(" – ")) {
        parts = cleanLine.split(" – ");
      } else if (cleanLine.includes(":")) {
        parts = cleanLine.split(":");
      } else if (cleanLine.includes("\t")) {
        parts = cleanLine.split("\t");
      } else if (cleanLine.includes(",")) {
        parts = cleanLine.split(",");
      }

      if (parts.length >= 2) {
        const word = parts[0].trim();
        const meaningVi = parts.slice(1).join(" - ").trim();
        if (word && meaningVi) {
          results.push({
            word,
            meaningVi,
            difficulty: defaultDifficulty,
            partOfSpeech: "Noun",
          });
        }
      }
    });

    if (results.length === 0) {
      setError("Không tìm thấy dòng từ vựng hợp lệ. Mỗi dòng cần có dạng: 'từ tiếng anh - nghĩa tiếng việt'");
      return;
    }

    setParsedWords(results);
    setStep("preview");
  };

  const handleRemoveItem = (index: number) => {
    setParsedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (parsedWords.length === 0) {
      setError("Không có từ vựng nào để nhập");
      return;
    }

    try {
      setError(null);
      await onSubmit(parsedWords);
      setRawText("");
      setParsedWords([]);
      setStep("input");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi nhập danh sách từ";
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span>Nhập nhanh danh sách từ vựng (Bulk Import)</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "input" ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Dán danh sách từ vựng theo cấu trúc mỗi dòng một từ:{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 font-semibold font-mono">
                Từ tiếng Anh - Nghĩa tiếng Việt
              </code>
            </p>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`pencil case - hộp bút\ncalculator - máy tính bỏ túi\nbackpack - ba lô\nlibrary - thư viện\ncompass - com-pa`}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-mono text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 leading-relaxed placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Mức độ khó mặc định:</span>
                <select
                  value={defaultDifficulty}
                  onChange={(e) => setDefaultDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-primary"
                >
                  <option value="EASY">Dễ (Easy)</option>
                  <option value="MEDIUM">Vừa (Medium)</option>
                  <option value="HARD">Khó (Hard)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleParse}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-dark transition"
              >
                Kiểm tra & Xem trước
              </button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">
                  Đã nhận diện {parsedWords.length} từ vựng hợp lệ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                ← Nhập lại văn bản
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
              {parsedWords.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-white transition">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 w-5">{idx + 1}.</span>
                    <span className="font-bold text-slate-800">{item.word}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-600">{item.meaningVi}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={isPending || parsedWords.length === 0}
                onClick={handleImport}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isPending ? "Đang lưu..." : `Lưu tất cả (${parsedWords.length} từ)`}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

