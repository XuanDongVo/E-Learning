"use client";

import { useTranslations } from "next-intl";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentMascotScene } from "@/components/student-ui/visuals/pipo/student-mascot-scene";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";
import { VocabularyReviewSession } from "./vocabulary-review-session";
import { VocabularyFreePractice } from "./vocabulary-free-practice";
import { useVocabularyLearnQueue } from "./use-vocabulary-learn-queue";
import { useVocabularyReviewQueue } from "./use-vocabulary-review-queue";

type LearnMode = "new" | "practice";

function reviewProgressPercent(completed: number, total: number) {
  return total > 0 ? (completed / total) * 100 : 0;
}

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
  const t = useTranslations("student.vocabulary.studyTab");
  const [learnMode, setLearnMode] = useState<LearnMode>("new");
  const isReview = tab === "review";
  const learn = useVocabularyLearnQueue(unitId, cards);
  const reviewQueue = useVocabularyReviewQueue(unitId, isReview, cards, nowMs);
  const learnedCount = cards.filter((card) => card.state !== "NEW").length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="student-section-title text-foreground">
          {isReview ? t("reviewTitle") : t("learnTitle")}
        </h2>
        {!isReview && (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={t("modeLabel")}
          >
            <button
              type="button"
              aria-pressed={learnMode === "new"}
              onClick={() => setLearnMode("new")}
              className={`student-control px-4 ${learnMode === "new" ? "student-filter-active" : "student-control--quiet"}`}
            >
              {t("new")}
            </button>
            <button
              type="button"
              aria-pressed={learnMode === "practice"}
              onClick={() => setLearnMode("practice")}
              className={`student-control px-4 ${learnMode === "practice" ? "student-filter-active" : "student-control--quiet"}`}
            >
              {t("practice", { count: learnedCount })}
            </button>
          </div>
        )}
      </div>

      {isReview ? (
        !reviewQueue.ready ? (
          <PaperSurface as="section" className="p-8 text-center" role="status">
            <p className="student-body text-muted-foreground">
              {t("preparing")}
            </p>
          </PaperSurface>
        ) : reviewQueue.currentCard ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="student-caption text-muted-foreground">
                  {t("dueWords")}
                </p>
                <span className="student-typewriter text-sm font-bold">
                  {t("progress", { current: reviewQueue.completedCount + 1, total: reviewQueue.totalCount })}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={t("progressLabel")}
                aria-valuemin={0}
                aria-valuemax={reviewQueue.totalCount}
                aria-valuenow={reviewQueue.completedCount}
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{
                    width: `${reviewProgressPercent(
                      reviewQueue.completedCount,
                      reviewQueue.totalCount,
                    )}%`,
                  }}
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
            {reviewQueue.totalCount > 0 && (
              <StudentMascotScene
                variant="feedback" mood="cheer" prop="book" size="compact"
                message={t("reviewMascot")}
                className="mx-auto"
              />
            )}
            <h3 className="student-card-title text-foreground">
              {reviewQueue.totalCount > 0
                ? t("reviewComplete")
                : t("noDue")}
            </h3>
            <p className="student-body text-muted-foreground">
              {reviewQueue.totalCount > 0
                ? t("reviewCompleteDesc", { completed: reviewQueue.completedCount, total: reviewQueue.totalCount })
                : t("noDueDesc")}
            </p>
            {reviewQueue.totalCount > 0 && (
              <button
                type="button"
                className="student-control student-control--secondary px-4"
                onClick={reviewQueue.restart}
              >
                {t("restartReview")}
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
            {t("learnStats", { completed: learn.completedCount, retry: learn.pendingRetryCount, remaining: learn.remainingCount })}
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
              {learnedCount > 0 && (
                <StudentMascotScene
                  variant="feedback" mood="happy" prop="book"
                  message={t("learnMascot")}
                  className="mx-auto"
                />
              )}
              <BookOpen
                className="mx-auto size-7 text-primary"
                aria-hidden="true"
              />
              <h3 className="student-card-title text-foreground">
                {learnedCount > 0
                  ? t("allLearned")
                  : t("noNew")}
              </h3>
              <p className="student-body text-muted-foreground">
                {t("learnEmptyDesc")}
              </p>
              {learnedCount > 0 && (
                <button
                  type="button"
                  className="student-control student-control--action px-5"
                  onClick={() => setLearnMode("practice")}
                >
                  {t("practiceLearned")}
                </button>
              )}
            </PaperSurface>
          )}
        </>
      )}
    </section>
  );
}
