"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

type QueueState = {
  unseen: number[];
  retry: number[];
  completed: number[];
  current: number | null;
  revision: number;
  currentIsRetry: boolean;
};

const MAX_RETRY = 5;

function initialQueue(ids: number[]): QueueState {
  return { unseen: ids.slice(1), retry: [], completed: [], current: ids[0] ?? null, revision: 0, currentIsRetry: false };
}

function nextWord(queue: QueueState): QueueState {
  if (queue.retry.length >= MAX_RETRY || queue.unseen.length === 0) {
    const [current, ...retry] = queue.retry;
    return { ...queue, retry, current: current ?? null, revision: queue.revision + 1, currentIsRetry: current != null };
  }
  const [current, ...unseen] = queue.unseen;
  return { ...queue, unseen, current: current ?? null, revision: queue.revision + 1, currentIsRetry: false };
}

export function useVocabularyLearnQueue(unitId: number, cards: StudentVocabularyStudyCard[]) {
  const ids = useMemo(() => cards.filter((card) => card.state === "NEW").map((card) => card.wordId), [cards]);
  const allIds = useMemo(() => new Set(cards.map((card) => card.wordId)), [cards]);
  const storageKey = `vocabulary-learn-queue:${unitId}`;
  const [queue, setQueue] = useState<QueueState>(() => initialQueue(ids));

  useEffect(() => {
    const valid = new Set(ids);
    let restored: QueueState | null = null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as QueueState;
        if (Array.isArray(parsed.unseen) && Array.isArray(parsed.retry) && Array.isArray(parsed.completed)) {
          const unique = (items: number[]) => [...new Set(items.filter((id) => valid.has(id)))];
          const completed = [...new Set(parsed.completed.filter((id) => allIds.has(id)))];
          const retry = unique(parsed.retry).filter((id) => !completed.includes(id)).slice(0, MAX_RETRY);
          const current = parsed.current != null && valid.has(parsed.current) && !completed.includes(parsed.current)
            ? parsed.current : null;
          const used = new Set([...completed, ...retry, ...(current == null ? [] : [current])]);
          const unseen = [...unique(parsed.unseen), ...ids].filter((id) => !used.has(id));
          restored = { unseen, retry, completed, current, revision: Number.isSafeInteger(parsed.revision) ? parsed.revision : 0, currentIsRetry: Boolean(parsed.currentIsRetry) };
          if (restored.current == null) restored = nextWord(restored);
        }
      }
    } catch { /* Invalid or blocked session storage: start safely from the server snapshot. */ }
    setQueue(restored ?? initialQueue(ids));
    // Only reset when the unit changes; successful ratings are reconciled separately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  useEffect(() => {
    setQueue((prev) => {
      const valid = new Set(ids);
      const completed = prev.completed.filter((id) => allIds.has(id));
      const retry = prev.retry.filter((id) => valid.has(id));
      const current = prev.current !== null && valid.has(prev.current) ? prev.current : null;
      const used = new Set([...completed, ...retry, ...(current === null ? [] : [current])]);
      const unseen = [...prev.unseen.filter((id) => valid.has(id)), ...ids.filter((id) => !used.has(id))];
      if (current === null) return nextWord({ unseen, retry, completed, current, revision: prev.revision, currentIsRetry: false });
      return { unseen: [...new Set(unseen)], retry, completed, current, revision: prev.revision, currentIsRetry: prev.currentIsRetry };
    });
  }, [ids, allIds]);

  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(queue)); } catch { /* Non-blocking. */ }
  }, [storageKey, queue]);

  const markForRetry = useCallback(() => setQueue((prev) => {
    if (prev.current === null) return prev;
    const retry = [...prev.retry.filter((id) => id !== prev.current), prev.current];
    return nextWord({ ...prev, retry, current: null });
  }), []);

  const markCompleted = useCallback(() => setQueue((prev) => {
    if (prev.current === null) return prev;
    return nextWord({ ...prev, current: null, completed: [...prev.completed, prev.current] });
  }), []);

  const currentCard = cards.find((card) => card.wordId === queue.current);
  return {
    currentCard,
    revision: queue.revision,
    pendingRetryCount: queue.retry.length + (queue.currentIsRetry ? 1 : 0),
    completedCount: queue.completed.length,
    remainingCount: queue.unseen.length,
    markForRetry,
    markCompleted,
  };
}
