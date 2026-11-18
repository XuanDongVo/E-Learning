"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard, VocabularyReviewResult } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";
import { VocabularyReviewSession } from "./vocabulary-review-session";
import { VocabularyFreePractice } from "./vocabulary-free-practice";
import { useVocabularyLearnQueue } from "./use-vocabulary-learn-queue";
import { isVocabularyCardDue, formatVocabularyReviewDate, formatVocabularyReviewDelay } from "./vocabulary-hub-types";

type LearnMode = "new" | "practice";

export function VocabularyStudyTab({
  tab,
  unitId,
  cards,
  nowMs,
}: {
  tab: "learn" | "review";
  unitId: number;
  cards: StudentVocabularyStudyCard[];
  nowMs: number;
}) {
  const [learnMode, setLearnMode] = useState<LearnMode>("new");
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(() => new Set());
  const [savedReview, setSavedReview] = useState<VocabularyReviewResult | null>(null);
  const learn = useVocabularyLearnQueue(unitId, cards);
  const dueCards = cards.filter((card) => isVocabularyCardDue(card, nowMs));
  const reviewCard = dueCards.find((card) => !reviewedIds.has(card.wordId));
  const isReview = tab === "review";
  const learnedCount = cards.filter((card) => card.state !== "NEW").length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="student-section-title text-foreground">
          {isReview ? "Ôn tập đến hạn" : "Học và ghi nhớ"}
        </h2>
        {!isReview && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn cách học từ vựng">
            <button
              type="button"
              aria-pressed={learnMode === "new"}
              onClick={() => setLearnMode("new")}
              className={`student-control px-4 ${learnMode === "new" ? "student-filter-active" : "student-control--quiet"}`}
            >
              Học từ mới
            </button>
            <button
              type="button"
              aria-pressed={learnMode === "practice"}
              onClick={() => setLearnMode("practice")}
              className={`student-control px-4 ${learnMode === "practice" ? "student-filter-active" : "student-control--quiet"}`}
            >
              Luyện tự do ({learnedCount})
            </button>
          </div>
        )}
      </div>

      {isReview ? (
        savedReview ? (
          <PaperSurface as="section" className="space-y-3 p-5" role="status">
            <h3 className="student-card-title text-foreground">Đã lưu lượt ôn</h3>
            <p className="student-body text-muted-foreground">
              {savedReview.rating === "AGAIN"
                ? "Từ này cần củng cố thêm. Bạn có thể luyện lại trong tab Học."
                : "Lịch ôn tiếp theo đã được cập nhật."}
            </p>
            <p className="student-body text-foreground">
              Ôn tiếp: <strong>{formatVocabularyReviewDate(savedReview.dueAt)}</strong>
              {" · "}{formatVocabularyReviewDelay(savedReview.dueAt, Date.parse(savedReview.reviewedAt))}
            </p>
            <button
              type="button"
              className="student-control student-control--action w-full"
              onClick={() => {
                setReviewedIds((previous) => new Set(previous).add(savedReview.wordId));
                setSavedReview(null);
              }}
            >
              Tiếp tục ôn từ khác
            </button>
          </PaperSurface>
        ) : reviewCard ? (
          <VocabularyReviewSession
            key={`review-${reviewCard.wordId}`}
            unitId={unitId}
            card={reviewCard}
            onRecorded={setSavedReview}
          />
        ) : (
          <PaperSurface as="section" className="space-y-2 p-8 text-center">
            <h3 className="student-card-title text-foreground">
              {dueCards.length > 0 ? "Đã hoàn thành lượt ôn này!" : "Không có từ đến hạn ôn"}
            </h3>
            <p className="student-body text-muted-foreground">
              {dueCards.length > 0
                ? "Bạn đã xử lý các từ đến hạn trong lượt này. Những từ chọn Học lại có thể tiếp tục xuất hiện khi bắt đầu lượt ôn mới."
                : "Các từ đã học sẽ xuất hiện khi đến lịch ôn tiếp theo."}
            </p>
            {dueCards.length > 0 && (
              <button
                type="button"
                className="student-control student-control--secondary px-4"
                onClick={() => {
                  setSavedReview(null);
                  setReviewedIds(new Set());
                }}
              >
                Kiểm tra lượt ôn mới
              </button>
            )}
          </PaperSurface>
        )
      ) : learnMode === "practice" ? (
        <VocabularyFreePractice
          unitId={unitId}
          cards={cards}
          onGoLearn={() => setLearnMode("new")}
        />
      ) : (
        <>
          <p className="student-caption text-muted-foreground !text-sm">
            Hoàn thành: {learn.completedCount} · Chờ học lại: {learn.pendingRetryCount}/5 · Từ mới còn: {learn.remainingCount}
          </p>
          {learn.currentCard ? (
            <VocabularyStudySession
              key={`learn-${learn.currentCard.wordId}-${learn.revision}`}
              sessionMode="INITIAL_LEARN"
              unitId={unitId}
              card={learn.currentCard}
              allCards={cards}
              onRetry={learn.markForRetry}
              onRecorded={learn.markCompleted}
            />
          ) : (
            <PaperSurface as="section" className="space-y-3 p-7 text-center">
              <BookOpen className="mx-auto size-7 text-primary" aria-hidden="true" />
              <h3 className="student-card-title text-foreground">
                {learnedCount > 0 ? "Bạn đã học hết từ mới!" : "Chưa có từ mới để học"}
              </h3>
              <p className="student-body text-muted-foreground">
                Bạn vẫn có thể luyện lại những từ đã học bất cứ lúc nào.
                Luyện tự do không thay đổi lịch ôn FSRS.
              </p>
              {learnedCount > 0 && (
                <button
                  type="button"
                  className="student-control student-control--action px-5"
                  onClick={() => setLearnMode("practice")}
                >
                  Luyện lại từ đã học
                </button>
              )}
            </PaperSurface>
          )}
        </>
      )}
    </section>
  );
}
