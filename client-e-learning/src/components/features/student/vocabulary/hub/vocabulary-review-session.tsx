"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { getAppErrorMessage, toAppError } from "@/lib/errors/app-error";
import { studentVocabularyQueryKeys } from "@/services/student/student-vocabulary-query-keys";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import type {
  RecordVocabularyReviewRequest,
  StudentVocabularyStudyCard,
  VocabularyFsrsRating,
  VocabularyReviewResult,
} from "@/types/student-vocabulary-review";
import { VocabularyFlashcard } from "./vocabulary-flash-card";
import { VocabularyRatingPanel } from "./vocabulary-rating-panel";
import { formatVocabularyReviewDelay, vocabularyUnitCardsKey } from "./vocabulary-hub-types";

export function VocabularyReviewSession({
  unitId,
  card,
  onRecorded,
  onSkip,
}: {
  unitId?: number;
  card: StudentVocabularyStudyCard;
  onRecorded: (result: VocabularyReviewResult) => void;
  onSkip?: () => void;
}) {
  const t = useTranslations("student.vocabulary.reviewSession");
  const tErrors = useTranslations("errors");
  const formatDue = (value?: string) =>
    formatVocabularyReviewDelay(value, Date.now(), {
      fsrs: t("delayFsrs"),
      now: t("delayNow"),
      underMinute: t("delayUnderMinute"),
      minutes: (count) => t("delayMinutes", { count }),
      hours: (count) => t("delayHours", { count }),
      days: (count) => t("delayDays", { count }),
    });
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [pending, setPending] = useState<RecordVocabularyReviewRequest | null>(null);
  const preview = useQuery({
    queryKey: studentVocabularyQueryKeys.reviewPreview(card.wordId),
    queryFn: () => studentVocabularyReviewService.previewReview(card.wordId),
    enabled: revealed,
    staleTime: 0,
    retry: false,
  });
  const review = useMutation({
    mutationFn: (payload: RecordVocabularyReviewRequest) =>
      studentVocabularyReviewService.recordReview(card.wordId, payload),
    onSuccess: (response) => {
      if (!response.data) return;
      onRecorded(response.data);
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: studentVocabularyQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: studentVocabularyQueryKeys.libraryRoot }),
      ];
      if (unitId != null) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: vocabularyUnitCardsKey(unitId) }));
      } else {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: studentVocabularyQueryKeys.progress }),
        );
      }
      // Keep the existing Unit flow's progress invalidation disabled; the global pass refreshes it.
      void Promise.all(invalidations);
    },
  });
  const staleReview =
    review.isError && toAppError(review.error).code === "VOCABULARY_REVIEW_NOT_DUE";

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
        <p className="student-caption text-center text-muted-foreground">{t("flipHint")}</p>
      ) : (
        <div className="space-y-3">
          {preview.isPending ? (
            <p role="status" className="student-caption text-center text-muted-foreground">
              {t("previewLoading")}
            </p>
          ) : null}
          {preview.isError ? (
            <PaperSurface as="section" className="space-y-2 p-4" role="alert">
              <p className="student-body text-destructive">
                {getAppErrorMessage(preview.error, tErrors as (key: string) => string)}
              </p>
              <button
                type="button"
                className="student-control student-control--secondary px-4"
                onClick={() => void preview.refetch()}
              >
                {t("reloadPreview")}
              </button>
            </PaperSurface>
          ) : null}
          <VocabularyRatingPanel
            busy={review.isPending || pending !== null}
            scheduleUnavailable={!preview.isSuccess}
            allowAgainWithoutPreview={false}
            againIsLocal={false}
            onRate={rate}
            times={{
              AGAIN: formatDue(preview.data?.data?.dueAtByRating.AGAIN),
              HARD: formatDue(preview.data?.data?.dueAtByRating.HARD),
              GOOD: formatDue(preview.data?.data?.dueAtByRating.GOOD),
              EASY: formatDue(preview.data?.data?.dueAtByRating.EASY),
            }}
          />
          {review.isPending ? (
            <p role="status" className="student-body text-center text-muted-foreground">{t("saving")}</p>
          ) : null}
          {review.isError ? (
            <PaperSurface as="section" role="alert" className="space-y-3 p-4">
              <p className="student-body text-destructive">
                {getAppErrorMessage(review.error, tErrors as (key: string) => string)}
              </p>
              <div className="flex flex-wrap gap-2">
                {!staleReview ? (
                  <button
                    type="button"
                    disabled={!pending || review.isPending}
                    className="student-control student-control--action px-4"
                    onClick={() => pending && review.mutate(pending)}
                  >
                    {t("retrySave")}
                  </button>
                ) : null}
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
                  {t("discard")}
                </button>
                {staleReview && onSkip ? (
                  <button type="button" className="student-control student-control--secondary px-4" onClick={onSkip}>
                    {t("skipStale")}
                  </button>
                ) : null}
              </div>
            </PaperSurface>
          ) : null}
        </div>
      )}
    </div>
  );
}
