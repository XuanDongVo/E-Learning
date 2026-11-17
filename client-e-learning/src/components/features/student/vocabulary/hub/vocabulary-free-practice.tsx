"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { getVocabularyDueLabel } from "./vocabulary-hub-types";
import { VocabularyStudySession } from "./vocabulary-study-session";

export function VocabularyFreePractice({
  unitId,
  cards,
  onGoLearn,
}: {
  unitId: number;
  cards: StudentVocabularyStudyCard[];
  onGoLearn: () => void;
}) {
  const [wordId, setWordId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const learnedCards = useMemo(
    () => cards.filter((card) => card.state !== "NEW"),
    [cards],
  );
  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("vi");
    return learnedCards.filter((card) =>
      !value || (card.word + " " + card.meaningVi).toLocaleLowerCase("vi").includes(value),
    );
  }, [learnedCards, search]);
  const current = learnedCards.find((card) => card.wordId === wordId);

  return (
    <div className="space-y-4">
      <p className="student-body text-muted-foreground">
        Chọn từ đã học để luyện Flashcard, Trắc nghiệm, Gõ từ hoặc Phát âm.
        Luyện tự do không ghi rating và không thay đổi lịch ôn FSRS.
      </p>

      {current ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="student-caption text-muted-foreground">
              Đang luyện: <strong className="text-foreground">{current.word}</strong>
              {" · "}{getVocabularyDueLabel(current)}
            </p>
            <button
              type="button"
              className="student-control student-control--quiet px-4"
              onClick={() => setWordId(null)}
            >
              Chọn từ khác
            </button>
          </div>
          <VocabularyStudySession
            key={current.wordId}
            sessionMode="FREE_PRACTICE"
            unitId={unitId}
            card={current}
            allCards={cards}
            onPracticeDone={() => setWordId(null)}
          />
        </>
      ) : learnedCards.length === 0 ? (
        <PaperSurface as="section" className="space-y-3 p-7 text-center">
          <h3 className="student-card-title text-foreground">Chưa có từ đã học</h3>
          <p className="student-body text-muted-foreground">
            Hãy học từ mới hoặc đánh dấu một từ đã biết trong tab Xem từ để bắt đầu luyện.
          </p>
          <button
            type="button"
            className="student-control student-control--action px-5"
            onClick={onGoLearn}
          >
            Học từ mới
          </button>
        </PaperSurface>
      ) : (
        <>
          <div className="relative max-w-lg">
            <label htmlFor="vocab-free-practice-search" className="student-label mb-2 block">
              Tìm từ muốn luyện
            </label>
            <Search className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="vocab-free-practice-search"
              type="search"
              className="student-field pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nhập từ hoặc nghĩa..."
            />
          </div>
          {filtered.length === 0 ? (
            <PaperSurface as="section" className="p-6 text-center">
              <p className="student-body text-muted-foreground">Không tìm thấy từ phù hợp.</p>
            </PaperSurface>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {filtered.map((card) => (
                <li key={card.wordId} className="min-w-0">
                  <button
                    type="button"
                    className="student-control student-control--quiet flex h-full w-full min-w-0 items-center justify-between gap-3 px-4 py-3 text-left"
                    onClick={() => setWordId(card.wordId)}
                    aria-label={`Luyện lại từ ${card.word}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="student-body block break-words font-semibold text-foreground">{card.word}</span>
                      <span className="student-caption block break-words text-muted-foreground">{card.meaningVi}</span>
                      <span className="student-caption block text-muted-foreground">{getVocabularyDueLabel(card)}</span>
                    </span>
                    <span className="student-label shrink-0 text-primary">Luyện</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
