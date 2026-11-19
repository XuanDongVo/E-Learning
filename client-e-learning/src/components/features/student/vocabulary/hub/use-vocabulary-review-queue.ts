"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudentVocabularyStudyCard, VocabularyReviewResult } from "@/types/student-vocabulary-review";
import { isVocabularyCardDue } from "./vocabulary-hub-types";

type ReviewQueue = {
  unitId: number;
  ids: number[];
  completedIds: number[];
};

/**
 * Snapshot all due words at the beginning of a Review pass.
 * React Query refetches must not change the pass denominator or repeat AGAIN.
 * A new pass (or a full reload) takes a fresh server-authoritative snapshot.
 */
export function useVocabularyReviewQueue(
  unitId: number,
  active: boolean,
  cards: StudentVocabularyStudyCard[],
  nowMs: number,
) {
  const [queue, setQueue] = useState<ReviewQueue | null>(null);

  // Begin a pass when entering Review. Ignore further cards refetches.
  useEffect(() => {
    if (!active) return;
    setQueue((previous) => {
      if (previous?.unitId === unitId) return previous;
      return {
        unitId,
        ids: cards.filter((card) => isVocabularyCardDue(card, nowMs)).map((card) => card.wordId),
        completedIds: [],
      };
    });
  }, [active, unitId, cards, nowMs]);

  // Outside Review, let the next entry take a fresh snapshot.
  useEffect(() => {
    if (!active) setQueue(null);
  }, [active]);

  const complete = useCallback((result: VocabularyReviewResult) => {
    setQueue((previous) => {
      if (!previous || !previous.ids.includes(result.wordId)
          || previous.completedIds.includes(result.wordId)) return previous;
      return { ...previous, completedIds: [...previous.completedIds, result.wordId] };
    });
  }, []);

  const restart = useCallback(() => {
    setQueue({
      unitId,
      ids: cards.filter((card) => isVocabularyCardDue(card, Date.now())).map((card) => card.wordId),
      completedIds: [],
    });
  }, [unitId, cards]);

  const currentCard = useMemo(() => {
    if (!active || !queue || queue.unitId !== unitId) return null;
    const nextId = queue.ids.find((id) => !queue.completedIds.includes(id));
    return nextId == null ? null : cards.find((card) => card.wordId === nextId) ?? null;
  }, [active, queue, unitId, cards]);

  return {
    ready: !!queue && queue.unitId === unitId,
    currentCard,
    completedCount: queue?.unitId === unitId ? queue.completedIds.length : 0,
    totalCount: queue?.unitId === unitId ? queue.ids.length : 0,
    complete,
    restart,
  };
}
