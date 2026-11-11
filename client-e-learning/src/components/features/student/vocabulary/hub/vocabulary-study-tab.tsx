"use client";

import { CheckCircle2 } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyStudySession } from "./vocabulary-study-session";
import { getVocabularyDueLabel, type HubTab } from "./vocabulary-hub-types";

interface VocabularyStudyTabProps {
  tab: "learn" | "review";
  unitId: number;
  cards: StudentVocabularyStudyCard[];
  queue: StudentVocabularyStudyCard[];
  currentCard?: StudentVocabularyStudyCard;
  focusedCard?: StudentVocabularyStudyCard;
  onSelectCard: (card: StudentVocabularyStudyCard) => void;
  onClearFocus: () => void;
  onPickBrowseTab: () => void;
  onCardRecorded: (savedWord: string, dueAt: string | null) => void;
}

export function VocabularyStudyTab({
  tab,
  unitId,
  cards,
  queue,
  currentCard,
  focusedCard,
  onSelectCard,
  onClearFocus,
  onPickBrowseTab,
  onCardRecorded,
}: VocabularyStudyTabProps) {
  const isReview = tab === "review";

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="student-section-title text-foreground">
          {isReview ? "Ôn tập đến hạn" : "Học và ghi nhớ"}
        </h2>
      </div>

          <VocabularyStudySession
            key={`${tab}-${currentCard.wordId}`}
            unitId={unitId}
            card={currentCard}
            allCards={cards}
            onRecorded={(dueAt) => onCardRecorded(currentCard.word, dueAt)}
          />
    </section>
  );
}

