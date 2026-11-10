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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-title font-bold text-foreground">
            <Zap className="size-5 fill-primary text-primary" />
            <span>Nhập nhanh danh sách từ vựng (Bulk Import)</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-body-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "input" ? (
          <div className="space-y-3">
            <p className="text-body-sm leading-relaxed text-muted-foreground">
              Dán danh sách từ vựng theo cấu trúc mỗi dòng một từ:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
                Từ tiếng Anh - Nghĩa tiếng Việt
              </code>
            </p>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`pencil case - hộp bút\ncalculator - máy tính bỏ túi\nbackpack - ba lô\nlibrary - thư viện\ncompass - com-pa`}
              className="w-full rounded-lg border border-input bg-background p-3.5 font-mono text-body-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-label font-semibold text-muted-foreground">Mức độ khó mặc định:</span>
                <select
                  value={defaultDifficulty}
                  onChange={(e) => setDefaultDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                  className="min-h-10 rounded-lg border border-input bg-background px-2.5 py-1 text-body-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="EASY">Dễ (Easy)</option>
                  <option value="MEDIUM">Vừa (Medium)</option>
                  <option value="HARD">Khó (Hard)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="min-h-10 rounded-lg border border-border bg-card px-4 py-2 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                <CheckCircle2 className="size-4 text-success" />
                <span className="text-label font-bold text-foreground">
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

            <div className="max-h-[min(20rem,40dvh)] divide-y divide-border overflow-y-auto border border-border bg-muted/30">
              {parsedWords.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-white transition">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-muted-foreground">{idx + 1}.</span>
                    <span className="font-bold text-foreground">{item.word}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{item.meaningVi}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="min-h-10 rounded-lg border border-border bg-card px-4 py-2 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={isPending || parsedWords.length === 0}
                onClick={handleImport}
                className="min-h-10 rounded-lg bg-primary px-5 py-2 text-body-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
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

