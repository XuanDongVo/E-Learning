"use client";

import { useState } from "react";
import { Volume2, Star, CheckCircle2 } from "lucide-react";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

interface VocabularyWordRowProps {
  card: StudentVocabularyStudyCard;
  onSelectWord?: (card: StudentVocabularyStudyCard) => void;
  onToggleFavorite?: (wordId: number) => void;
  onToggleMastered?: (wordId: number) => void;
  isFavorite?: boolean;
  isMastered?: boolean;
}

function formatPartOfSpeech(pos?: string | null): string {
  if (!pos) return "";
  const map: Record<string, string> = {
    VERB: "v",
    NOUN: "n",
    ADJECTIVE: "adj",
    ADVERB: "adv",
    PREPOSITION: "prep",
    CONJUNCTION: "conj",
    PHRASAL_VERB: "phr v",
    IDIOM: "idiom",
  };
  return map[pos.toUpperCase()] || pos.toLowerCase();
}

export function VocabularyWordRow({
  card,
  onToggleFavorite,
  onToggleMastered,
  isFavorite = false,
  isMastered = false,
}: VocabularyWordRowProps) {
  const [imageError, setImageError] = useState(false);
  const [activeAudio, setActiveAudio] = useState<"UK" | "US" | null>(null);

  const hasImage = Boolean(card.imageUrl && !imageError);
  const posFormatted = formatPartOfSpeech(card.partOfSpeech);

  const handleSpeak = (type: "UK" | "US") => {
    setActiveAudio(type);
    speakVocabulary(card.word, type);
    setTimeout(() => setActiveAudio(null), 1200);
  };

  const uk = card.pronunciationUk?.trim();
  const us = card.pronunciationUs?.trim();

  // Xác định cách hiển thị: nếu không có UK hoặc UK giống US thì lấy mặc định US
  const hasBothDistinct = Boolean(uk && us && uk !== us);
  const defaultUsPhonetic = us || uk || "";

  return (
    <article
      className="group relative rounded-xl border-2 border-border/75 bg-card p-5 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        {/* CỘT 1: TỪ VỰNG & PHIÊN ÂM */}
        <div className="md:w-56 md:shrink-0 lg:w-64">
          <div className="flex items-baseline gap-2">
            <h3 className="student-card-title text-foreground group-hover:text-primary transition-colors text-lg">
              {card.word}
            </h3>
            {posFormatted && (
              <span className="student-typewriter text-xs text-muted-foreground">
                ({posFormatted})
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground student-typewriter">
            {hasBothDistinct ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak("UK");
                  }}
                  className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors hover:bg-muted hover:text-foreground"
                  title="Nghe phát âm UK"
                >
                  <span className="text-[11px] font-semibold text-muted-foreground">UK:</span>
                  <span>{uk}</span>
                  <Volume2
                    className={`size-3.5 shrink-0 ${
                      activeAudio === "UK" ? "text-primary animate-pulse" : "text-muted-foreground"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak("US");
                  }}
                  className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors hover:bg-muted hover:text-foreground"
                  title="Nghe phát âm US"
                >
                  <span className="text-[11px] font-semibold text-muted-foreground">US:</span>
                  <span>{us}</span>
                  <Volume2
                    className={`size-3.5 shrink-0 ${
                      activeAudio === "US" ? "text-primary animate-pulse" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak("US");
                }}
                className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors hover:bg-muted hover:text-foreground"
                title="Nghe phát âm (US)"
              >
                {defaultUsPhonetic ? (
                  <span>{defaultUsPhonetic}</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Phát âm US</span>
                )}
                <Volume2
                  className={`size-3.5 shrink-0 ${
                    activeAudio === "US" ? "text-primary animate-pulse" : "text-muted-foreground"
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* CỘT 2: NGHĨA & CÂU VÍ DỤ SONG NGỮ */}
        <div className="flex-1 space-y-1.5">
          <p className="student-body font-bold text-foreground md:text-base leading-snug">
            {card.meaningVi}
          </p>

          {card.exampleSentence && (
            <p className="student-body text-sm text-foreground/80 leading-relaxed italic">
              &ldquo;{card.exampleSentence}&rdquo;
            </p>
          )}

          {card.exampleMeaningVi && (
            <p className="student-body text-xs text-muted-foreground leading-relaxed">
              ({card.exampleMeaningVi})
            </p>
          )}
        </div>

        {/* CỘT 3: ẢNH MINH HỌA & ACTION (NẾU CÓ) */}
        {(hasImage || onToggleFavorite || onToggleMastered) && (
          <div className="flex flex-row items-center justify-between gap-3 pt-2 border-t border-border/50 md:flex-col md:items-end md:justify-start md:border-none md:pt-0 md:w-32 md:shrink-0">
            {hasImage && (
              <div className="h-20 w-24 overflow-hidden rounded-xl bg-background border border-border shadow-2xs">
                <img
                  src={card.imageUrl!}
                  alt={`Minh họa từ: ${card.word}`}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}

            <div className="flex items-center gap-1 text-muted-foreground">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(card.wordId);
                  }}
                  className={`rounded-md p-1.5 transition-colors hover:bg-muted ${
                    isFavorite ? "text-accent fill-accent" : "hover:text-foreground"
                  }`}
                  title="Đánh dấu từ yêu thích"
                >
                  <Star className="size-4" />
                </button>
              )}

              {onToggleMastered && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMastered(card.wordId);
                  }}
                  className={`rounded-md p-1.5 transition-colors hover:bg-muted ${
                    isMastered ? "text-success" : "hover:text-foreground"
                  }`}
                  title="Đánh dấu đã thuộc"
                >
                  <CheckCircle2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
