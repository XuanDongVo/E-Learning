"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import type {
  RecordVocabularyReviewRequest,
  StudentVocabularyStudyCard,
  VocabularyFsrsRating,
  VocabularyReviewResult,
} from "@/types/student-vocabulary-review";
import { VocabularyFlashcard } from "./vocabulary-flash-card";
import { VocabularyRatingPanel } from "./vocabulary-rating-panel";
import {
  formatVocabularyReviewDelay,
  vocabularyUnitCardsKey,
} from "./vocabulary-hub-types";

export function VocabularyReviewSession({
  unitId,
  card,
  onRecorded,
}: {
  unitId: number;
  card: StudentVocabularyStudyCard;
  onRecorded: (result: VocabularyReviewResult) => void;
}) {
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [pending, setPending] = useState<RecordVocabularyReviewRequest | null>(null);
  const preview = useQuery({
    queryKey: ["student", "vocabulary", "review-preview", card.wordId],
    queryFn: () => studentVocabularyReviewService.previewReview(card.wordId),
    enabled: revealed,
    staleTime: 0,
    retry: false,
  });
  const review = useMutation({
    mutationFn: (payload: RecordVocabularyReviewRequest) =>
      studentVocabularyReviewService.recordReview(card.wordId, payload),
    onSuccess: (response) => {
      // Parent owns the success feedback so a cards refetch cannot unmount it prematurely.
      onRecorded(response.data);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: vocabularyUnitCardsKey(unitId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "vocabulary", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["student", "vocabulary", "progress"] }),
      ]);
    },
  });

  const rate = (rating: VocabularyFsrsRating) => {
    if (!revealed || !preview.isSuccess || review.isPending || pending) return;
    const payload = { requestId: crypto.randomUUID(), rating };
    setPending(payload);
    review.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <VocabularyFlashcard
        key={card.wordId}
        cards={[card]}
        mode="study"
        onReveal={() => setRevealed(true)}
      />

      {!revealed ? (
        <p className="student-caption text-center text-muted-foreground">
          Lật thẻ để xem đáp án, sau đó chọn mức độ ghi nhớ.
        </p>
      ) : (
        <div className="space-y-3">
          {preview.isPending && (
            <p role="status" className="student-caption text-center text-muted-foreground">
              Đang tính lịch ôn dự kiến...
            </p>
          )}
          {preview.isError && (
            <PaperSurface as="section" className="space-y-2 p-4" role="alert">
              <p className="student-body text-destructive">
                {preview.error instanceof Error ? preview.error.message : "Không tải được lịch ôn."}
              </p>
              <button
                type="button"
                className="student-control student-control--secondary px-4"
                onClick={() => void preview.refetch()}
              >
                Tải lại lịch ôn
              </button>
            </PaperSurface>
          )}
          <VocabularyRatingPanel
            busy={review.isPending || pending !== null}
            scheduleUnavailable={!preview.isSuccess}
            allowAgainWithoutPreview={false}
            againIsLocal={false}
            onRate={rate}
            times={{
              AGAIN: formatVocabularyReviewDelay(preview.data?.data?.dueAtByRating.AGAIN),
              HARD: formatVocabularyReviewDelay(preview.data?.data?.dueAtByRating.HARD),
              GOOD: formatVocabularyReviewDelay(preview.data?.data?.dueAtByRating.GOOD),
              EASY: formatVocabularyReviewDelay(preview.data?.data?.dueAtByRating.EASY),
            }}
          />
          {review.isPending && (
            <p role="status" className="student-body text-center text-muted-foreground">
              Đang lưu lịch ôn...
            </p>
          )}
          {review.isError && (
            <PaperSurface as="section" role="alert" className="space-y-3 p-4">
              <p className="student-body text-destructive">
                {review.error instanceof Error ? review.error.message : "Không lưu được lượt ôn."}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!pending || review.isPending}
                  className="student-control student-control--action px-4"
                  onClick={() => pending && review.mutate(pending)}
                >
                  Thử gửi lại
                </button>
                <button
                  type="button"
                  disabled={review.isPending}
                  className="student-control student-control--quiet px-4"
                  onClick={() => {
                    setPending(null);
                    review.reset();
                    void preview.refetch();
                  }}
                >
                  Bỏ đánh giá
                </button>
              </div>
            </PaperSurface>
          )}
        </div>
      )}
    </div>
  );
}
