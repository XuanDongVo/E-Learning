"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";
import { VocabularyReviewSession } from "./vocabulary-review-session";
import { VocabularyFreePractice } from "./vocabulary-free-practice";
import { useVocabularyLearnQueue } from "./use-vocabulary-learn-queue";

type LearnMode = "new" | "practice";

export function VocabularyStudyTab({
  tab,
  unitId,
  cards,
}: {
  tab: "learn" | "review";
  unitId: number;
  cards: StudentVocabularyStudyCard[];
}) {
  const [learnMode, setLearnMode] = useState<LearnMode>("new");
  const learn = useVocabularyLearnQueue(unitId, cards);
  const reviewCard = cards.find((card) => card.state !== "NEW" && card.due);
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
        reviewCard ? (
          <VocabularyReviewSession
            key={`review-${reviewCard.wordId}`}
            unitId={unitId}
            card={reviewCard}
          />
        ) : (
          <PaperSurface as="section" className="space-y-2 p-8 text-center">
            <h3 className="student-card-title text-foreground">Không có từ đến hạn ôn</h3>
            <p className="student-body text-muted-foreground">
              Các từ đã học sẽ xuất hiện khi đến lịch ôn tiếp theo.
            </p>
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
