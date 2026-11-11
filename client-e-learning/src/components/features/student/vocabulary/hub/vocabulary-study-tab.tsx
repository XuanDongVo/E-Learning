"use client";

import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";
import { VocabularyReviewSession } from "./vocabulary-review-session";
import { useVocabularyLearnQueue } from "./use-vocabulary-learn-queue";

export function VocabularyStudyTab({ tab, unitId, cards }: {
  tab: "learn" | "review";
  unitId: number;
  cards: StudentVocabularyStudyCard[];
}) {
  const learn = useVocabularyLearnQueue(unitId, cards);
  const reviewCard = cards.find((card) => card.state !== "NEW" && card.due);
  const isReview = tab === "review";
  const currentCard = isReview ? reviewCard : learn.currentCard;

  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="student-section-title text-foreground">{isReview ? "Ôn tập đến hạn" : "Học và ghi nhớ"}</h2>
      {!isReview && <p className="student-caption text-muted-foreground">
        Hoàn thành: {learn.completedCount} · Chờ học lại: {learn.pendingRetryCount}/5 · Từ mới còn: {learn.remainingCount}
      </p>}
    </div>
    {currentCard ? (
      isReview ? <VocabularyReviewSession key={`review-${currentCard.wordId}`} unitId={unitId} card={currentCard} />
      : <VocabularyStudySession key={`learn-${currentCard.wordId}-${learn.revision}`} unitId={unitId} card={currentCard}
        allCards={cards} onRetry={learn.markForRetry} onRecorded={learn.markCompleted} />
    ) : <PaperSurface as="section" className="space-y-2 p-8 text-center">
      <h3 className="student-card-title text-foreground">{isReview ? "Không có từ đến hạn ôn" : "Đã hoàn thành lượt học"}</h3>
      <p className="student-body text-muted-foreground">{isReview
        ? "Các từ đã học sẽ xuất hiện khi đến lịch ôn tiếp theo."
        : "Bạn đã xử lý hết các từ mới và từ cần học lại trong buổi này."}</p>
    </PaperSurface>}
  </section>;
}
