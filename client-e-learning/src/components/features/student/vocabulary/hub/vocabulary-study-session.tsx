"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import type {
  RecordVocabularyReviewRequest,
  StudentVocabularyStudyCard,
  VocabularyFsrsRating,
} from "@/types/student-vocabulary-review";
import { VocabularyFlashcard } from "../vocabulary-flashcard";
import { VocabularyPractice } from "../vocabulary-practice";
import { getVocabularyDueLabel, vocabularyUnitCardsKey, type StudyStep } from "./vocabulary-hub-types";

interface VocabularyStudySessionProps {
  unitId: number;
  card: StudentVocabularyStudyCard;
  allCards: StudentVocabularyStudyCard[];
  onRecorded: (dueAt: string | null) => void;
}

export function VocabularyStudySession({
  unitId,
  card,
  allCards,
  onRecorded,
}: VocabularyStudySessionProps) {
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState<StudyStep>("front");
  const [pendingAttempt, setPendingAttempt] = useState<RecordVocabularyReviewRequest | null>(null);
  const canRate = card.state === "NEW" || card.due;

  const review = useMutation({
    mutationFn: (payload: RecordVocabularyReviewRequest) =>
      studentVocabularyReviewService.recordReview(card.wordId, payload),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vocabularyUnitCardsKey(unitId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "vocabulary", "overview"] }),
      ]);
      onRecorded(result.data?.dueAt ?? null);
    },
  });

  const record = (rating: VocabularyFsrsRating) => {
    if (!canRate || review.isPending || pendingAttempt) return;
    const payload = { requestId: crypto.randomUUID(), rating };
    setPendingAttempt(payload);
    review.mutate(payload);
  };

  return (
    <div className="space-y-4">
      {step !== "practice" && (
        <VocabularyFlashcard
          card={card}
          revealed={revealed}
          onReveal={() => {
            setRevealed((value) => !value);
            setStep("back");
          }}
        />
      )}
      {!revealed ? (
        <p className="student-body text-center text-muted-foreground">
          Lật thẻ để xem nghĩa, ví dụ và tự đánh giá khả năng nhớ.
        </p>
      ) : (
        <div className="space-y-3">
          {step !== "practice" && step !== "remembered" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep("remembered")}
                className="student-control student-control--secondary inline-flex min-h-12 items-center justify-center gap-2 px-4"
              >
                <CheckCircle2 className="size-5" aria-hidden="true" /> Đã nhớ
              </button>
              <button
                type="button"
                onClick={() => setStep("practice")}
                className="student-control student-control--action inline-flex min-h-12 items-center justify-center gap-2 px-4"
              >
                <RotateCcw className="size-5" aria-hidden="true" /> Chưa nhớ · Luyện thêm
              </button>
            </div>
          )}
          {step === "practice" && <VocabularyPractice card={card} unitCards={allCards} />}
          {step === "remembered" && (
            <PaperSurface as="section" className="space-y-3 p-4">
              <h3 className="student-card-title text-foreground">Bạn nhớ từ này ở mức nào?</h3>
              <p className="student-body text-muted-foreground">
                FSRS sẽ tự tính lịch ôn tiếp theo; bạn không cần chọn số ngày.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { rating: "HARD", label: "Khó", detail: "Nhớ nhưng chật vật" },
                    { rating: "GOOD", label: "Tốt", detail: "Nhớ sau khi nghĩ" },
                    { rating: "EASY", label: "Dễ", detail: "Nhớ ngay" },
                  ] as const
                ).map(({ rating, label, detail }) => (
                  <button
                    type="button"
                    key={rating}
                    disabled={!canRate || review.isPending || pendingAttempt !== null}
                    className="student-vocab-option flex-col items-start gap-1"
                    onClick={() => record(rating)}
                  >
                    <span>{label}</span>
                    <span className="student-caption text-muted-foreground">{detail}</span>
                  </button>
                ))}
              </div>
            </PaperSurface>
          )}
          {step === "practice" && canRate && (
            <button
              type="button"
              disabled={review.isPending || pendingAttempt !== null}
              onClick={() => record("AGAIN")}
              className="student-control student-control--secondary inline-flex min-h-12 w-full items-center justify-center gap-2 px-4"
            >
              Ghi nhận chưa nhớ · FSRS sẽ nhắc lại
            </button>
          )}
          {step !== "back" && (
            <button
              type="button"
              className="student-label min-h-11 text-primary underline"
              onClick={() => setStep("back")}
            >
              Quay lại lựa chọn
            </button>
          )}
          {!canRate && (
            <p className="student-body text-muted-foreground">
              {getVocabularyDueLabel(card)}. Bạn vẫn được xem từ và luyện thêm nhưng chưa cập nhật
              lịch ôn trước hạn.
            </p>
          )}
        </div>
      )}
      {review.isPending && (
        <p className="student-body text-center text-muted-foreground" role="status">
          Đang lưu lịch ôn...
        </p>
      )}
      {review.isError && (
        <PaperSurface as="section" className="space-y-2 p-4" role="alert">
          <p className="student-body text-destructive">
            {review.error instanceof Error ? review.error.message : "Không lưu được lần ôn này."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!pendingAttempt || review.isPending}
              className="student-control student-control--action px-4"
              onClick={() => pendingAttempt && review.mutate(pendingAttempt)}
            >
              Thử gửi lại
            </button>
            <button
              type="button"
              className="student-control student-control--quiet px-4"
              onClick={() => {
                setPendingAttempt(null);
                review.reset();
              }}
            >
              Bỏ đánh giá này
            </button>
          </div>
        </PaperSurface>
      )}
    </div>
  );
}

