"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import type { RecordVocabularyReviewRequest, StudentVocabularyStudyCard, VocabularyFsrsRating } from "@/types/student-vocabulary-review";
import { VocabularyFlashcard } from "./vocabulary-flash-card";
import { vocabularyUnitCardsKey } from "./vocabulary-hub-types";

/** Review uses server-side AGAIN; Learn's Học lại is a local queue action. */
export function VocabularyReviewSession({ unitId, card }: { unitId: number; card: StudentVocabularyStudyCard }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<RecordVocabularyReviewRequest | null>(null);
  const review = useMutation({
    mutationFn: (payload: RecordVocabularyReviewRequest) => studentVocabularyReviewService.recordReview(card.wordId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vocabularyUnitCardsKey(unitId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "vocabulary", "overview"] }),
      ]);
    },
  });
  const rate = (rating: VocabularyFsrsRating) => {
    if (review.isPending || pending) return;
    const payload = { requestId: crypto.randomUUID(), rating };
    setPending(payload); review.mutate(payload);
  };
  return <div className="space-y-4">
    <VocabularyFlashcard key={card.wordId} cards={[card]} mode="study" />
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {(["AGAIN", "HARD", "GOOD", "EASY"] as const).map((rating) => <button key={rating} type="button"
        disabled={review.isPending || pending !== null} className="student-vocab-option"
        onClick={() => rate(rating)}>{({ AGAIN: "Học lại", HARD: "Khó", GOOD: "Tốt", EASY: "Dễ" })[rating]}</button>)}
    </div>
    {review.isPending && <p role="status" className="student-body text-muted-foreground">Đang lưu lịch ôn...</p>}
    {review.isError && <PaperSurface role="alert" className="space-y-3 p-4">
      <p className="student-body text-destructive">{review.error instanceof Error ? review.error.message : "Không thể lưu lịch ôn."}</p>
      <button type="button" className="student-control student-control--action px-4" disabled={!pending || review.isPending}
        onClick={() => pending && review.mutate(pending)}>Thử gửi lại</button>
      <button type="button" className="student-control student-control--quiet px-4" onClick={() => { setPending(null); review.reset(); }}>Bỏ đánh giá</button>
    </PaperSurface>}
  </div>;
}
