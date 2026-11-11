"use client";

import { useMemo, useState } from "react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

export function VocabularyMultipleChoice({ card, cards, onComplete }: { card: StudentVocabularyStudyCard; cards: StudentVocabularyStudyCard[]; onComplete: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const choices = useMemo(() => {
    const options = [card.meaningVi];
    for (const other of cards) {
      if (other.wordId !== card.wordId && !options.some((value) => value.trim().toLowerCase() === other.meaningVi.trim().toLowerCase())) {
        options.push(other.meaningVi);
      }
      if (options.length === 4) break;
    }
    return options.sort((a, b) => a.localeCompare(b, "vi"));
  }, [card, cards]);

  return (
    <section className="space-y-4">
      <h3 className="student-card-title text-center text-foreground">“{card.word}” có nghĩa là gì?</h3>
      {choices.length < 2 ? (
        <p className="student-body text-center text-muted-foreground">Không đủ đáp án khác nhau để tạo trắc nghiệm. Bạn có thể chuyển sang Gõ từ hoặc Phát âm.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {choices.map((choice) => (
            <button type="button" key={choice} disabled={selected !== null} onClick={() => { setSelected(choice); onComplete(); }}
              className="student-vocab-option text-left" aria-pressed={selected === choice}>{choice}</button>
          ))}
        </div>
      )}
      {selected !== null && (
        <p role="status" className="student-body text-center text-foreground">
          {selected === card.meaningVi ? "Chính xác!" : `Chưa chính xác. Đáp án là: ${card.meaningVi}`}
        </p>
      )}
    </section>
  );
}
