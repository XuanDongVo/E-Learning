
"use client";

import { useTranslations } from "next-intl";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, RotateCcw } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";

interface VocabularyFreePracticeProps {
  unitId: number;
  cards: StudentVocabularyStudyCard[];
  onGoLearn: () => void;
}

export function VocabularyFreePractice({
  unitId,
  cards,
  onGoLearn,
}: VocabularyFreePracticeProps) {
  const t = useTranslations("student.vocabulary.freePractice");
  // Chỉ lấy các từ đã có tiến độ FSRS.
  const learnedCards = useMemo(
    () => cards.filter((card) => card.state !== "NEW"),
    [cards],
  );

  // Những từ đã hoàn thành trong lượt luyện hiện tại.
  // Chỉ lưu ở frontend, không cập nhật FSRS.
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    () => new Set(),
  );

  // Dùng để reset VocabularyStudySession khi luyện lại.
  const [revision, setRevision] = useState(0);

  const completedCount = learnedCards.filter((card) =>
    completedIds.has(card.wordId),
  ).length;

  const totalCount = learnedCards.length;

  const remainingCards = learnedCards.filter(
    (card) => !completedIds.has(card.wordId),
  );

  // Tự động chọn từ tiếp theo.
  const currentCard = remainingCards[0] ?? null;

  const isComplete =
    totalCount > 0 && remainingCards.length === 0;

  const progress =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  const handlePracticeDone = () => {
    if (!currentCard) return;

    setCompletedIds((previous) => {
      const next = new Set(previous);
      next.add(currentCard.wordId);
      return next;
    });
  };

  const handleRestart = () => {
    setCompletedIds(new Set());
    setRevision((previous) => previous + 1);
  };

  // Chưa có từ đã học.
  if (totalCount === 0) {
    return (
      <PaperSurface
        as="section"
        className="space-y-4 p-6 text-center sm:p-8"
      >
        <BookOpen
          className="mx-auto size-9 text-primary"
          aria-hidden="true"
        />

        <h3 className="student-card-title text-foreground">
          {t("noLearned")}
        </h3>

        <p className="student-body text-muted-foreground">
          {t("noLearnedDesc")}
        </p>

        <button
          type="button"
          className="student-control student-control--action px-5"
          onClick={onGoLearn}
        >
          {t("startLearning")}
        </button>
      </PaperSurface>
    );
  }

  // Đã luyện hết các từ.
  if (isComplete) {
    return (
      <PaperSurface
        as="section"
        className="space-y-4 p-6 text-center sm:p-8"
      >
        <CheckCircle2
          className="mx-auto size-10 text-success"
          aria-hidden="true"
        />

        <h3 className="student-card-title text-foreground">
          {t("complete")}
        </h3>

        <p className="student-body text-muted-foreground">
          {t("completeDesc", { count: totalCount })}
        </p>

        <p className="student-caption text-muted-foreground">
          {t("unchangedFsrs")}
        </p>

        <button
          type="button"
          className="student-control student-control--action inline-flex items-center gap-2 px-5"
          onClick={handleRestart}
        >
          <RotateCcw
            className="size-4"
            aria-hidden="true"
          />
          {t("restart")}
        </button>
      </PaperSurface>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="student-vocab-free-practice space-y-4">
      {/* Tiến độ lượt luyện */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="student-card-title text-foreground">
              {t("title")}
            </h3>

            <p className="student-caption text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <span className="student-typewriter text-sm font-bold text-foreground">
            {t("progress", { current: completedCount + 1, total: totalCount })}
          </span>
        </div>

        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={t("progressLabel")}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={completedCount}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dùng lại giao diện StudySession hiện tại */}
      <VocabularyStudySession
        key={`${unitId}-${currentCard.wordId}-${revision}`}
        unitId={unitId}
        card={currentCard}
        allCards={cards}
        sessionMode="FREE_PRACTICE"
        onPracticeDone={handlePracticeDone}
      />
    </div>
  );
}
