"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";
import { VocabularyReviewSession } from "./vocabulary-review-session";
import { VocabularyFreePractice } from "./vocabulary-free-practice";
import { useVocabularyLearnQueue } from "./use-vocabulary-learn-queue";
import { useVocabularyReviewQueue } from "./use-vocabulary-review-queue";

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
  const isReview = tab === "review";
  const learn = useVocabularyLearnQueue(unitId, cards);
  const reviewQueue = useVocabularyReviewQueue(unitId, isReview, cards, nowMs);
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
        !reviewQueue.ready ? (
          <PaperSurface as="section" className="p-8 text-center" role="status">
            <p className="student-body text-muted-foreground">Đang chuẩn bị lượt ôn...</p>
          </PaperSurface>
        ) : reviewQueue.currentCard ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="student-caption text-muted-foreground">Các từ đến hạn trong lượt này</p>
                <span className="student-typewriter text-sm font-bold">
                  Từ {reviewQueue.completedCount + 1}/{reviewQueue.totalCount}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Tiến độ lượt ôn từ vựng"
                aria-valuemin={0}
                aria-valuemax={reviewQueue.totalCount}
                aria-valuenow={reviewQueue.completedCount}
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${(reviewQueue.completedCount / reviewQueue.totalCount) * 100}%` }}
                />
              </div>
            </div>
            <VocabularyReviewSession
              key={`review-${unitId}-${reviewQueue.currentCard.wordId}`}
              unitId={unitId}
              card={reviewQueue.currentCard}
              onRecorded={reviewQueue.complete}
            />
          </div>
        ) : (
          <PaperSurface as="section" className="space-y-3 p-8 text-center">
            <h3 className="student-card-title text-foreground">
              {reviewQueue.totalCount > 0 ? "Hoàn thành lượt ôn!" : "Không có từ đến hạn ôn"}
            </h3>
            <p className="student-body text-muted-foreground">
              {reviewQueue.totalCount > 0
                ? `Bạn đã xử lý ${reviewQueue.completedCount}/${reviewQueue.totalCount} từ đến hạn. Các từ quên sẽ quay về tab Học từ mới.`
                : "Các từ đã học sẽ xuất hiện khi đến lịch ôn tiếp theo."}
            </p>
            {reviewQueue.totalCount > 0 && (
              <button
                type="button"
                className="student-control student-control--secondary px-4"
                onClick={reviewQueue.restart}
              >
                Kiểm tra lượt ôn mới
              </button>
            )}
          </PaperSurface>
        )
      : learnMode === "practice" ? (
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
