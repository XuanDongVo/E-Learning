"use client";

import { useTranslations } from "next-intl";

import { useMemo, useState } from "react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

export function VocabularyMultipleChoice({ card, cards, onComplete }: { card: StudentVocabularyStudyCard; cards: StudentVocabularyStudyCard[]; onComplete: () => void }) {
  const t = useTranslations("student.vocabulary.multipleChoice");
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
      <h3 className="student-card-title text-center text-foreground">{t("question", { word: card.word })}</h3>
      {choices.length < 2 ? (
        <p className="student-body text-center text-muted-foreground">{t("insufficient")}</p>
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
          {selected === card.meaningVi ? t("correct") : t("incorrect", { answer: card.meaningVi })}
        </p>
      )}
    </section>
  );
}
