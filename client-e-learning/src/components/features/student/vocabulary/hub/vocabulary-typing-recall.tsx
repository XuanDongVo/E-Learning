"use client";

import { useState } from "react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

const normalize = (value: string) => value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");

export function VocabularyTypingRecall({ card }: { card: StudentVocabularyStudyCard }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (answer.trim()) setChecked(true); }}>
      <label className="student-card-title block text-center text-foreground" htmlFor="vocabulary-recall-answer">
        Gõ từ tiếng Anh có nghĩa là “{card.meaningVi}”
      </label>
      <input id="vocabulary-recall-answer" className="student-field w-full" spellCheck={false} autoComplete="off"
        value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} placeholder="Nhập từ..." />
      <button type="submit" className="student-control student-control--action w-full" disabled={!answer.trim()}>Kiểm tra</button>
      {checked && <p role="status" className="student-body text-center text-foreground">
        {normalize(answer) === normalize(card.word) ? "Chính xác!" : `Chưa chính xác. Đáp án là: ${card.word}`}
      </p>}
    </form>
  );
}
