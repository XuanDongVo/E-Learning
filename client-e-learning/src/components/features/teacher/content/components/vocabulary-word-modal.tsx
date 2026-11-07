"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Volume2, Sparkles, AlertCircle } from "lucide-react";
import type {
  VocabularyWord,
  CreateVocabularyWordRequest,
  UpdateVocabularyWordRequest,
} from "@/types/vocabulary";

interface VocabularyWordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word?: VocabularyWord | null;
  onSubmit: (payload: CreateVocabularyWordRequest | UpdateVocabularyWordRequest) => Promise<void>;
  isPending: boolean;
}

export function VocabularyWordModal({
  open,
  onOpenChange,
  word,
  onSubmit,
  isPending,
}: VocabularyWordModalProps) {
  const [wordText, setWordText] = useState("");
  const [meaningVi, setMeaningVi] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("Noun");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleMeaningVi, setExampleMeaningVi] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (word) {
      setWordText(word.word);
      setMeaningVi(word.meaningVi);
      setPronunciation(word.pronunciation || "");
      setPartOfSpeech(word.partOfSpeech || "Noun");
      setDifficulty(word.difficulty || "EASY");
      setExampleSentence(word.exampleSentence || "");
      setExampleMeaningVi(word.exampleMeaningVi || "");
    } else {
      setWordText("");
      setMeaningVi("");
      setPronunciation("");
      setPartOfSpeech("Noun");
      setDifficulty("EASY");
      setExampleSentence("");
      setExampleMeaningVi("");
    }
    setError(null);
  }, [word, open]);

  // Pronounce word using Web Speech API
  const handleSpeak = () => {
    if (!wordText.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(wordText.trim());
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim()) {
      setError("Vui lòng nhập từ vựng tiếng Anh");
      return;
    }
    if (!meaningVi.trim()) {
      setError("Vui lòng nhập nghĩa tiếng Việt");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        word: wordText.trim(),
        meaningVi: meaningVi.trim(),
        pronunciation: pronunciation.trim() || undefined,
        partOfSpeech: partOfSpeech.trim() || undefined,
        difficulty,
        exampleSentence: exampleSentence.trim() || undefined,
        exampleMeaningVi: exampleMeaningVi.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu từ vựng";
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>{word ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English Word */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Từ vựng tiếng Anh <span className="text-red-500">*</span>
                </label>
                {wordText.trim() && (
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Nghe phát âm</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ví dụ: pencil case, backpack..."
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Vietnamese Meaning */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Nghĩa tiếng Việt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: hộp bút, ba lô đi học..."
                value={meaningVi}
                onChange={(e) => setMeaningVi(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Pronunciation (IPA) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Phiên âm IPA (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: /ˈpensl keɪs/"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Part of Speech */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Từ loại
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="Noun">Danh từ (Noun)</option>
                <option value="Verb">Động từ (Verb)</option>
                <option value="Adjective">Tính từ (Adjective)</option>
                <option value="Adverb">Trạng từ (Adverb)</option>
                <option value="Preposition">Giới từ (Preposition)</option>
                <option value="Phrase">Cụm từ (Phrase)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Mức độ khó
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`rounded-lg py-2 text-xs font-bold border transition ${
                      difficulty === diff
                        ? diff === "EASY"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                          : diff === "MEDIUM"
                          ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20"
                          : "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {diff === "EASY" ? "Dễ (Easy)" : diff === "MEDIUM" ? "Vừa (Medium)" : "Khó (Hard)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Example sentence */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Câu ví dụ tiếng Anh (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: I have a new blue pencil case."
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Example Vietnamese */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Dịch nghĩa câu ví dụ (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Tôi có một chiếc hộp bút màu xanh mới."
                value={exampleMeaningVi}
                onChange={(e) => setExampleMeaningVi(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
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
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-dark transition disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : word ? "Cập nhật" : "Thêm từ vựng"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

