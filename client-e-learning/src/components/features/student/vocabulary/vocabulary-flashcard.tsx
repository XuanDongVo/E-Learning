"use client";

import { useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

const WORD_CLASS: Record<string, string> = {
  NOUN: "Danh từ", VERB: "Động từ", ADJECTIVE: "Tính từ",
  ADVERB: "Trạng từ", PREPOSITION: "Giới từ", PHRASE: "Cụm từ",
};

export function VocabularyFlashcard({
  card,
  revealed,
  onReveal,
}: {
  card: StudentVocabularyStudyCard;
  revealed: boolean;
  onReveal: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(card.imageUrl && !imageFailed);
  const groups = [
    { label: "Họ từ", items: card.relatedTerms?.wordFamilies ?? [] },
    { label: "Đồng nghĩa", items: card.relatedTerms?.synonyms ?? [] },
    { label: "Trái nghĩa", items: card.relatedTerms?.antonyms ?? [] },
  ];

  return (
    <PaperSurface as="article" variant={revealed ? "plain" : "lined"} tape tapePosition="right"
      className="student-vocab-flashcard text-center" aria-live="polite">
      <div className="student-meta text-muted-foreground">
        {revealed ? "MẶT SAU · GHI NHỚ" : "MẶT TRƯỚC · ĐỌC & NGHE"}
      </div>
      {!revealed ? (
        <>
          <div className="space-y-2">
            {card.partOfSpeech && <span className="student-chip">{WORD_CLASS[card.partOfSpeech] ?? card.partOfSpeech}</span>}
            <h2 className="student-vocab-word text-foreground">{card.word}</h2>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-5">
            <button type="button" className="student-control student-control--quiet flex min-h-11 items-center gap-2 px-3"
              onClick={() => speakVocabulary(card.word, "UK")} aria-label={`Nghe phát âm Anh–Anh của ${card.word}`}>
              <Volume2 className="size-4" aria-hidden="true" /> UK {card.pronunciationUk || "· Nghe từ"}
            </button>
            <button type="button" className="student-control student-control--quiet flex min-h-11 items-center gap-2 px-3"
              onClick={() => speakVocabulary(card.word, "US")} aria-label={`Nghe phát âm Anh–Mỹ của ${card.word}`}>
              <Volume2 className="size-4" aria-hidden="true" /> US {card.pronunciationUs || "· Nghe từ"}
            </button>
          </div>
          <p className="student-body text-muted-foreground">Đọc hoặc nghe trước khi lật để nhớ nghĩa.</p>
        </>
      ) : (
        <div className={`student-vocab-answer ${hasImage ? "student-vocab-answer--illustrated" : "student-vocab-answer--text"}`}>
          {hasImage && (
            <figure className="student-vocab-answer-image">
              {/* Teacher-configured illustration; shown only after flip to avoid giving away the answer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.imageUrl!} alt={`Minh họa cho ${card.word}`} onError={() => setImageFailed(true)} />
            </figure>
          )}
          <div className="student-vocab-answer-copy space-y-4 text-left">
            <div className={hasImage ? "" : "text-center"}>
              <span className="student-meta text-muted-foreground">{card.word}</span>
              <h2 className="student-vocab-meaning mt-1 text-foreground">{card.meaningVi}</h2>
            </div>
            {card.exampleSentence && (
              <div className="student-soft-panel space-y-1 p-3">
                <p className="student-label text-foreground">Ví dụ</p>
                <p className="student-body italic text-foreground">{card.exampleSentence}</p>
                {card.exampleMeaningVi && <p className="student-body text-muted-foreground">{card.exampleMeaningVi}</p>}
              </div>
            )}
            {groups.filter((group) => group.items.length > 0).map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className="student-label text-muted-foreground">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, index) => (
                    <span className="student-vocab-term" key={`${group.label}-${item.term}-${index}`}>
                      {item.term}{item.meaningVi ? ` · ${item.meaningVi}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-2 flex justify-center">
        <button type="button" onClick={onReveal}
          className="student-control student-control--secondary inline-flex items-center gap-2 px-5">
          <RotateCcw className="size-4" aria-hidden="true" />
          {revealed ? "Xem lại mặt trước" : "Lật thẻ · Xem nghĩa"}
        </button>
      </div>
    </PaperSurface>
  );
}
