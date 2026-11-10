"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Volume2, Sparkles, AlertCircle, ImagePlus, X } from "lucide-react";
import type {
  VocabularyWord,
  CreateVocabularyWordRequest,
  UpdateVocabularyWordRequest,
  VocabularyPartOfSpeech,
  VocabularyRelatedTerms,
  emptyVocabularyRelatedTerms,
} from "@/types/vocabulary";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import { contentService } from "@/services/content.service";
import { VocabularyRelatedTermsEditor } from "./vocabulary-related-terms-editor";
import { VocabularyFlashcardPreview } from "./vocabulary-flashcard-preview";

interface VocabularyWordModalProps {
  unitId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word?: VocabularyWord | null;
  onSubmit: (payload: CreateVocabularyWordRequest | UpdateVocabularyWordRequest) => Promise<void>;
  isPending: boolean;
}

export function VocabularyWordModal({
  unitId,
  open,
  onOpenChange,
  word,
  onSubmit,
  isPending,
}: VocabularyWordModalProps) {
  const [wordText, setWordText] = useState("");
  const [meaningVi, setMeaningVi] = useState("");
  const [pronunciationUk, setPronunciationUk] = useState("");
  const [pronunciationUs, setPronunciationUs] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState<VocabularyPartOfSpeech | "">("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleMeaningVi, setExampleMeaningVi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [relatedTerms, setRelatedTerms] = useState<VocabularyRelatedTerms>(emptyVocabularyRelatedTerms);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (word) {
      setWordText(word.word);
      setMeaningVi(word.meaningVi);
      setPronunciationUk(word.pronunciationUk || "");
      setPronunciationUs(word.pronunciationUs || "");
      setPartOfSpeech(word.partOfSpeech || "");
      setDifficulty(word.difficulty || "EASY");
      setExampleSentence(word.exampleSentence || "");
      setExampleMeaningVi(word.exampleMeaningVi || "");
      setImageUrl(word.imageUrl || "");
      setRelatedTerms({
        wordFamilies: [...(word.relatedTerms?.wordFamilies ?? [])],
        synonyms: [...(word.relatedTerms?.synonyms ?? [])],
        antonyms: [...(word.relatedTerms?.antonyms ?? [])],
      });
    } else {
      setWordText("");
      setMeaningVi("");
      setPronunciationUk("");
      setPronunciationUs("");
      setPartOfSpeech("");
      setDifficulty("EASY");
      setExampleSentence("");
      setExampleMeaningVi("");
      setImageUrl("");
      setRelatedTerms(emptyVocabularyRelatedTerms());
    }
    setError(null);
  }, [word, open]);

  // Pronounce word using Web Speech API
  const handleSpeak = () => speakVocabulary(wordText, "US");

  const handleUploadImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Chỉ hỗ trợ ảnh có kích thước không quá 5 MB.");
      return;
    }
    setIsUploadingImage(true);
    setError(null);
    try {
      const response = await contentService.uploadMedia(file);
      if (!response.data?.url) throw new Error("Tải ảnh lên thành công nhưng chưa nhận được đường dẫn ảnh.");
      setImageUrl(response.data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không tải được ảnh.");
    } finally {
      setIsUploadingImage(false);
    }
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
        pronunciationUk: pronunciationUk.trim() || undefined,
        pronunciationUs: pronunciationUs.trim() || undefined,
        partOfSpeech: partOfSpeech || undefined,
        difficulty,
        exampleSentence: exampleSentence.trim() || undefined,
        exampleMeaningVi: exampleMeaningVi.trim() || undefined,
        imageUrl: imageUrl || undefined,
        audioUrl: word?.audioUrl ?? undefined,
        relatedTerms,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu từ vựng";
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-title font-bold text-foreground">
            <Sparkles className="size-5 text-primary" />
            <span>{word ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-body-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b border-border pb-2">
            <h3 className="text-body-sm font-extrabold text-foreground">1. Thông tin từ vựng và phát âm</h3>
            <p className="text-label text-muted-foreground">Chỉ từ tiếng Anh và nghĩa tiếng Việt là bắt buộc.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English Word */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-label font-bold text-foreground">
                  Từ vựng tiếng Anh <span className="text-destructive">*</span>
                </label>
                {wordText.trim() && (
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="flex min-h-10 items-center gap-1 rounded-lg px-2 text-label font-semibold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Nghe US</span>
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
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Vietnamese Meaning */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-label font-bold text-foreground">
                Nghĩa tiếng Việt <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: hộp bút, ba lô đi học..."
                value={meaningVi}
                onChange={(e) => setMeaningVi(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* IPA variants: reference text only; audio is synthesized by the browser. */}
            <div className="space-y-1">
              <label className="text-label font-bold text-foreground">
                IPA Anh–Anh (UK, tùy chọn)
              </label>
              <button type="button" disabled={!wordText.trim()} onClick={() => speakVocabulary(wordText, "UK")}
                className="inline-flex min-h-10 items-center gap-1 text-label font-semibold text-primary hover:underline disabled:opacity-50">
                <Volume2 className="size-4" /> Nghe UK
              </button>
              <input
                type="text"
                placeholder="IPA en-GB"
                value={pronunciationUk}
                onChange={(e) => setPronunciationUk(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label font-bold text-foreground">IPA Anh–Mỹ (US, tùy chọn)</label>
              <button type="button" disabled={!wordText.trim()} onClick={() => speakVocabulary(wordText, "US")}
                className="inline-flex min-h-10 items-center gap-1 text-label font-semibold text-primary hover:underline disabled:opacity-50">
                <Volume2 className="size-4" /> Nghe US
              </button>
              <input
                type="text"
                placeholder="IPA en-US"
                value={pronunciationUs}
                onChange={(e) => setPronunciationUs(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Part of Speech */}
            <div className="space-y-1">
              <label className="text-label font-bold text-foreground">
                Từ loại
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as VocabularyPartOfSpeech | "")}
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Chưa phân loại</option>
                <option value="NOUN">Danh từ (Noun)</option>
                <option value="VERB">Động từ (Verb)</option>
                <option value="ADJECTIVE">Tính từ (Adjective)</option>
                <option value="ADVERB">Trạng từ (Adverb)</option>
                <option value="PREPOSITION">Giới từ (Preposition)</option>
                <option value="PHRASE">Cụm từ (Phrase)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-label font-bold text-foreground">
                Mức độ khó
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`min-h-10 rounded-lg border px-2 py-2 text-label font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      difficulty === diff
                        ? diff === "EASY"
                          ? "border-success bg-success/10 text-success ring-2 ring-success/20"
                          : diff === "MEDIUM"
                          ? "border-warning bg-warning/10 text-warning ring-2 ring-warning/20"
                          : "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/20"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {diff === "EASY" ? "Dễ (Easy)" : diff === "MEDIUM" ? "Vừa (Medium)" : "Khó (Hard)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Example sentence */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-label font-bold text-foreground">
                Câu ví dụ tiếng Anh (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: I have a new blue pencil case."
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Example Vietnamese */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-label font-bold text-foreground">
                Dịch nghĩa câu ví dụ (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Tôi có một chiếc hộp bút màu xanh mới."
                value={exampleMeaningVi}
                onChange={(e) => setExampleMeaningVi(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <section className="space-y-3 border-t border-border pt-4">
            <div>
              <h3 className="text-body-sm font-extrabold text-foreground">2. Hình minh họa</h3>
              <p className="text-label text-muted-foreground">Không bắt buộc. Ảnh được tải lên qua Media hiện có.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-label font-semibold text-primary hover:bg-muted">
                <ImagePlus className="size-4" /> {isUploadingImage ? "Đang tải ảnh..." : imageUrl ? "Thay ảnh" : "Chọn ảnh"}
                <input type="file" accept="image/*" disabled={isUploadingImage || isPending}
                  onChange={(event) => { void handleUploadImage(event.target.files?.[0]); event.target.value = ""; }} className="sr-only" />
              </label>
              {imageUrl && <button type="button" disabled={isUploadingImage || isPending} onClick={() => setImageUrl("")}
                className="inline-flex min-h-10 items-center gap-1 text-label font-semibold text-destructive hover:underline">
                <X className="size-4" /> Bỏ ảnh khỏi từ này
              </button>}
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-4">
            <div>
              <h3 className="text-body-sm font-extrabold text-foreground">3. Từ liên quan</h3>
              <p className="text-label text-muted-foreground">Tùy chọn · hỗ trợ tìm từ đã có hoặc thêm trực tiếp. Từ liên quan không tự trở thành một VocabularyWord mới.</p>
            </div>
            <VocabularyRelatedTermsEditor unitId={unitId} currentWordId={word?.id} value={relatedTerms} onChange={setRelatedTerms}
              disabled={isPending || isUploadingImage} />
          </section>

          <section className="border-t border-border pt-4">
            <VocabularyFlashcardPreview word={wordText} meaningVi={meaningVi} pronunciationUk={pronunciationUk}
              pronunciationUs={pronunciationUs} partOfSpeech={partOfSpeech} exampleSentence={exampleSentence}
              exampleMeaningVi={exampleMeaningVi} imageUrl={imageUrl} relatedTerms={relatedTerms} />
          </section>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-h-10 rounded-lg border border-border bg-card px-4 py-2 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending || isUploadingImage}
              className="min-h-10 rounded-lg bg-primary px-5 py-2 text-body-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : word ? "Cập nhật" : "Thêm từ vựng"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

