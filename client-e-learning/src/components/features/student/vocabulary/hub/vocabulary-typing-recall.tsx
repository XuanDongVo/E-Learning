"use client";

import { useTranslations } from "next-intl";

import { useState } from "react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

const normalize = (value: string) => value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");

export function VocabularyTypingRecall({ card, onComplete, onReset }: { card: StudentVocabularyStudyCard; onComplete: () => void; onReset: () => void }) {
  const t = useTranslations("student.vocabulary.typing");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (answer.trim()) { setChecked(true); onComplete(); } }}>
      <label className="student-card-title block text-center text-foreground" htmlFor="vocabulary-recall-answer">
        {t("prompt", { meaning: card.meaningVi })}
      </label>
      <input id="vocabulary-recall-answer" className="student-field w-full" spellCheck={false} autoComplete="off"
        value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); onReset(); }} placeholder={t("placeholder")} />
      <button type="submit" className="student-control student-control--action w-full" disabled={!answer.trim()}>{t("check")}</button>
      {checked && <p role="status" className="student-body text-center text-foreground">
        {normalize(answer) === normalize(card.word) ? t("correct") : t("incorrect", { answer: card.word })}
      </p>}
    </form>
  );
}
