"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import type { RecordVocabularyReviewRequest, StudentVocabularyStudyCard, VocabularyFsrsRating } from "@/types/student-vocabulary-review";
import { VocabularyFlashcard } from "./vocabulary-flash-card";
import { VocabularyMultipleChoice } from "./vocabulary-multiple-choice";
import { VocabularyTypingRecall } from "./vocabulary-typing-recall";
import { VocabularyPronunciation } from "./vocabulary-pronunciation";
import { VocabularyRatingPanel } from "./vocabulary-rating-panel";
import { vocabularyUnitCardsKey } from "./vocabulary-hub-types";

type StudyMode = "WORD" | "MULTIPLE_CHOICE" | "TYPING" | "PRONUNCIATION";
const MODES = [
  { key: "WORD", label: "Từ" },
  { key: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { key: "TYPING", label: "Gõ từ" },
  { key: "PRONUNCIATION", label: "Phát âm" },
] as const;

export function VocabularyStudySession({ unitId, card, allCards, onRetry, onRecorded }: {
  unitId: number;
  card: StudentVocabularyStudyCard;
  allCards: StudentVocabularyStudyCard[];
  onRetry: () => void;
  onRecorded: () => void;
}) {
  const [mode, setMode] = useState<StudyMode>("WORD");
  const [wordRevealed, setWordRevealed] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [pendingAttempt, setPendingAttempt] = useState<RecordVocabularyReviewRequest | null>(null);
  const queryClient = useQueryClient();
  const preview = useQuery({
    queryKey: ["student", "vocabulary", "review-preview", card.wordId],
    queryFn: () => studentVocabularyReviewService.previewReview(card.wordId),
    enabled: ratingOpen,
    staleTime: 0,
  });
  const dueTimes = preview.data?.data?.dueAtByRating;
  const formatDue = (value?: string) => {
    if (!value) return "Theo FSRS";
    const hours = (new Date(value).getTime() - Date.now()) / 3_600_000;
    return hours < 24 ? `${Math.max(1, Math.round(hours))} giờ` : `${Math.max(1, Math.round(hours / 24))} ngày`;
  };
  const review = useMutation({
    mutationFn: (payload: RecordVocabularyReviewRequest) => studentVocabularyReviewService.recordReview(card.wordId, payload),
    onSuccess: async () => {
      onRecorded();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vocabularyUnitCardsKey(unitId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "vocabulary", "overview"] }),
      ]);
    },
  });

  const handleRate = (rating: VocabularyFsrsRating) => {
    if (review.isPending || pendingAttempt) return;
    if (rating === "AGAIN") { onRetry(); return; }
    const payload = { requestId: crypto.randomUUID(), rating };
    setPendingAttempt(payload);
    review.mutate(payload);
  };

  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Cách học từ vựng">
      {MODES.map((item) => <button type="button" role="tab" key={item.key} aria-selected={mode === item.key}
        disabled={review.isPending || pendingAttempt !== null} onClick={() => { setMode(item.key); setRatingOpen(false); }}
        className={`student-control px-3 ${mode === item.key ? "student-filter-active" : "student-control--quiet"}`}>
        {item.label}
      </button>)}
    </div>
    {!ratingOpen && <div role="tabpanel" className="space-y-4">
      {mode === "WORD" && <VocabularyFlashcard key={card.wordId} cards={[card]} mode="study" onReveal={() => setWordRevealed(true)} />}
      {mode !== "WORD" && <PaperSurface as="section" className="space-y-4 p-5 sm:p-7">
        {mode === "MULTIPLE_CHOICE" && <VocabularyMultipleChoice key={card.wordId} card={card} cards={allCards} />}
        {mode === "TYPING" && <VocabularyTypingRecall key={card.wordId} card={card} />}
        {mode === "PRONUNCIATION" && <VocabularyPronunciation key={card.wordId} card={card} />}
      </PaperSurface>}
      {(mode !== "WORD" || wordRevealed) && <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="student-control student-control--secondary min-h-12" onClick={() => {
          const index = MODES.findIndex((item) => item.key === mode);
          setMode(MODES[(index + 1) % MODES.length].key);
        }}>Chưa nhớ · Luyện tiếp</button>
        <button type="button" className="student-control student-control--action min-h-12" onClick={() => setRatingOpen(true)}>Đã thuộc · Đánh giá</button>
      </div>}
    </div>}
    {ratingOpen && <>
      {preview.isPending && <p role="status" className="student-caption text-muted-foreground">Đang tính lịch ôn dự kiến...</p>}
      {preview.isError && <p role="alert" className="student-body text-destructive">{preview.error instanceof Error ? preview.error.message : "Không tải được lịch ôn."}</p>}
      <VocabularyRatingPanel busy={review.isPending || pendingAttempt !== null}
        scheduleUnavailable={preview.isPending || preview.isError}
        onBack={() => setRatingOpen(false)} onRate={handleRate}
        times={{ HARD: formatDue(dueTimes?.HARD), GOOD: formatDue(dueTimes?.GOOD), EASY: formatDue(dueTimes?.EASY) }} />
    </>}
    {review.isPending && <p role="status" className="student-body text-center text-muted-foreground">Đang lưu lịch ôn...</p>}
    {review.isError && <PaperSurface as="section" role="alert" className="space-y-3 p-4">
      <p className="student-body text-destructive">{review.error instanceof Error ? review.error.message : "Không lưu được lần học."}</p>
      <div className="flex gap-2">
        <button type="button" disabled={!pendingAttempt || review.isPending} className="student-control student-control--action px-4"
          onClick={() => pendingAttempt && review.mutate(pendingAttempt)}>Thử gửi lại</button>
        <button type="button" className="student-control student-control--quiet px-4"
          onClick={() => { setPendingAttempt(null); review.reset(); }}>Bỏ đánh giá</button>
      </div>
    </PaperSurface>}
  </div>;
}
