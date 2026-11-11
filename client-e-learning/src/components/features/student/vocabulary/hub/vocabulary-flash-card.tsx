"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  Star,
  Shuffle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  Hash,
  BookOpen,
} from "lucide-react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";

interface FlashcardSettings {
  autoSpeak: boolean;
  showExample: boolean;
  showPhrases: boolean;
  showSynonyms: boolean;
  showPartOfSpeech: boolean;
  voice: "US" | "UK";
}

interface VocabularyFlashcardProps {
  cards: StudentVocabularyStudyCard[];
  mode?: "browse" | "study";
  onReveal?: () => void;
  onToggleFavorite?: (wordId: number) => void;
  isFavorite?: (wordId: number) => boolean;
}

export function VocabularyFlashcard({
  cards = [],
  mode = "browse",
  onReveal,
  onToggleFavorite,
  isFavorite,
}: VocabularyFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"US" | "UK" | null>(null);

  const [settings, setSettings] = useState<FlashcardSettings>({
    autoSpeak: true,
    showExample: true,
    showPhrases: true,
    showSynonyms: true,
    showPartOfSpeech: true,
    voice: "US",
  });

  const settingsRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Đóng popover cài đặt khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đảm bảo index luôn hợp lệ khi danh sách cards thay đổi
  useEffect(() => {
    if (currentIndex >= cards.length) {
      setCurrentIndex(Math.max(0, cards.length - 1));
    }
  }, [cards.length, currentIndex]);

  const currentCard = cards[currentIndex];

  // Phát âm theo từ và giọng
  const playAudio = useCallback(
    (type?: "US" | "UK") => {
      if (!currentCard?.word) return;
      const targetVoice = type || settings.voice;
      setActiveVoice(targetVoice);
      speakVocabulary(currentCard.word, targetVoice);
      setTimeout(() => setActiveVoice(null), 1000);
    },
    [currentCard?.word, settings.voice],
  );

  // Tự động phát âm khi lật trở lại mặt trước (isFlipped = false)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!isFlipped && settings.autoSpeak && currentCard?.word) {
      const timer = setTimeout(() => {
        playAudio();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isFlipped, settings.autoSpeak, currentCard?.word, playAudio]);

  // Chuyển thẻ
  const goToCard = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= cards.length) return;
      setCurrentIndex(newIndex);
      setIsFlipped(false);
      setShowHint(false);

      if (settings.autoSpeak && cards[newIndex]?.word) {
        setTimeout(() => {
          speakVocabulary(cards[newIndex].word, settings.voice);
        }, 150);
      }
    },
    [cards, settings.autoSpeak, settings.voice],
  );

  const handleNext = useCallback(() => {
    goToCard((currentIndex + 1) % cards.length);
  }, [currentIndex, cards.length, goToCard]);

  const handlePrev = useCallback(() => {
    goToCard((currentIndex - 1 + cards.length) % cards.length);
  }, [currentIndex, cards.length, goToCard]);

  // Phím tắt bàn phím
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        onReveal?.();
        setIsFlipped((prev) => !prev);
      } else if (mode === "browse" && e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (mode === "browse" && e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, mode, onReveal]);

  // Xáo trộn
  const handleShuffle = () => {
    if (cards.length <= 1) return;
    let randomIndex = Math.floor(Math.random() * cards.length);
    if (randomIndex === currentIndex) {
      randomIndex = (currentIndex + 1) % cards.length;
    }
    goToCard(randomIndex);
  };

  if (!currentCard) {
    return null;
  }

  const uk = currentCard.pronunciationUk?.trim();
  const us = currentCard.pronunciationUs?.trim() || uk || "";
  const posFormatted = currentCard.partOfSpeech
    ? currentCard.partOfSpeech.toLowerCase().replace(/_/g, " ")
    : "";

  const related = currentCard.relatedTerms;
  const synonyms = related?.synonyms || [];
  const wordFamilies = related?.wordFamilies || [];
  //   const favoriteActive = isFavorite?.(currentCard.wordId) ?? false;

  return (
    <div className="mx-auto w-full space-y-4 select-none">
      {/* Viewport 3D Flip (Lật trên/dưới) */}
      <div className="student-flashcard-viewport w-full">
        <div
          className={`student-flashcard-flipper ${isFlipped ? "is-flipped" : ""}`}
        >
          {/* MẶT TRƯỚC (Front - Tiếng Anh) */}
          <div
            onClick={() => { setIsFlipped(true); onReveal?.(); }}
            className={`w-full min-h-[380px] cursor-pointer rounded-2xl border-2 border-border/75 bg-card p-6 shadow-sm sm:p-8 flex flex-col justify-between transition-colors hover:border-primary/40 ${
              isFlipped
                ? "student-flashcard-face pointer-events-none absolute inset-0"
                : "relative"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`Thẻ từ: ${currentCard.word}. Nhấn để lật xem nghĩa.`}
          >
            {/* Thanh công cụ mặt trước */}
            <div
              className="flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="student-typewriter rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                  #{currentIndex + 1}
                </span>
              </div>

              <div
                className="relative flex items-center gap-1 text-muted-foreground"
                ref={settingsRef}
              >
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(currentCard.wordId)}
                  className={`rounded-lg p-2 transition-colors hover:bg-muted `}
                  title="Gắn sao từ này"
                >
                  <Star className="size-4" />
                </button>

                {mode === "browse" && <button
                  type="button"
                  onClick={handleShuffle}
                  className="rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground"
                  title="Xáo trộn ngẫu nhiên"
                >
                  <Shuffle className="size-4" />
                </button>}

                <button
                  type="button"
                  onClick={() => setShowSettings((prev) => !prev)}
                  className={`rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground ${
                    showSettings ? "bg-muted text-foreground" : ""
                  }`}
                  title="Cài đặt flashcard"
                >
                  <Settings className="size-4" />
                </button>

                {/* Popover Cài đặt chuẩn theme Student */}
                {showSettings && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border-2 border-border bg-popover p-4 text-sm shadow-md space-y-3.5">
                    <h4 className="student-card-title text-foreground text-sm">
                      Cài đặt thẻ
                    </h4>

                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-foreground student-body text-xs">
                          <Volume2 className="size-3.5 text-muted-foreground" />
                          Tự động phát âm
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.autoSpeak}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              autoSpeak: e.target.checked,
                            }))
                          }
                          className="size-4 cursor-pointer rounded accent-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-foreground student-body text-xs">
                          <Eye className="size-3.5 text-muted-foreground" />
                          Hiện ví dụ
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showExample}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              showExample: e.target.checked,
                            }))
                          }
                          className="size-4 cursor-pointer rounded accent-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-foreground student-body text-xs">
                          <MessageSquare className="size-3.5 text-muted-foreground" />
                          Hiện họ từ
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showPhrases}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              showPhrases: e.target.checked,
                            }))
                          }
                          className="size-4 cursor-pointer rounded accent-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-foreground student-body text-xs">
                          <Hash className="size-3.5 text-muted-foreground" />
                          Hiện từ đồng nghĩa
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showSynonyms}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              showSynonyms: e.target.checked,
                            }))
                          }
                          className="size-4 cursor-pointer rounded accent-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-foreground student-body text-xs">
                          <BookOpen className="size-3.5 text-muted-foreground" />
                          Hiển thị loại từ
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showPartOfSpeech}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              showPartOfSpeech: e.target.checked,
                            }))
                          }
                          className="size-4 cursor-pointer rounded accent-primary"
                        />
                      </label>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="student-body text-xs font-semibold text-foreground">
                        Giọng đọc
                      </span>
                      <div className="inline-flex rounded-lg bg-muted p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((s) => ({ ...s, voice: "US" }))
                          }
                          className={`rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                            settings.voice === "US"
                              ? "bg-card text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          US
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((s) => ({ ...s, voice: "UK" }))
                          }
                          className={`rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                            settings.voice === "UK"
                              ? "bg-card text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          UK
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nội dung trung tâm: Từ vựng & Phát âm */}
            <div className="my-auto py-6 flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="student-vocab-word text-foreground inline-flex flex-wrap items-center justify-center gap-2.5 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                <span>{currentCard.word}</span>
                {settings.showPartOfSpeech && posFormatted && (
                  <span className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-sm font-medium text-muted-foreground tracking-normal">
                    {posFormatted}
                  </span>
                )}
              </h2>

              <div
                className="flex flex-wrap items-center justify-center gap-3 text-sm student-typewriter text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                {uk && (
                  <button
                    type="button"
                    onClick={() => playAudio("UK")}
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-foreground"
                    title="Nghe phát âm UK"
                  >
                    <Volume2
                      className={`size-4 text-primary ${
                        activeVoice === "UK" ? "animate-pulse" : ""
                      }`}
                    />
                    <span>UK {uk}</span>
                  </button>
                )}

                {us && (
                  <button
                    type="button"
                    onClick={() => playAudio("US")}
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-foreground"
                    title="Nghe phát âm US"
                  >
                    <Volume2
                      className={`size-4 text-primary ${
                        activeVoice === "US" ? "animate-pulse" : ""
                      }`}
                    />
                    <span>US {us}</span>
                  </button>
                )}
              </div>

              {showHint && currentCard.exampleSentence && (
                <div className="mt-2 max-w-lg rounded-xl border border-accent/40 bg-accent/15 px-4 py-2 text-sm student-body text-foreground">
                  Gợi ý ngữ cảnh: &quot;{currentCard.exampleSentence}&quot;
                </div>
              )}
            </div>

            {/* Hướng dẫn lật bên dưới */}
            <div className="text-center">
              <span className="student-typewriter text-xs text-muted-foreground">
                Nhấn hoặc bấm phím Space để lật thẻ
              </span>
            </div>
          </div>

          {/* MẶT SAU (Back - Tiếng Việt & Ngữ cảnh) */}
          <div
            onClick={() => setIsFlipped(false)}
            className={`w-full min-h-[380px] cursor-pointer rounded-2xl border-2 border-border/75 bg-card p-6 shadow-sm sm:p-8 flex flex-col justify-between transition-colors hover:border-primary/40 student-flashcard-back ${
              !isFlipped
                ? "student-flashcard-face pointer-events-none absolute inset-0"
                : "relative"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`Mặt sau thẻ ${currentCard.word}. Nhấn để lật lại mặt trước.`}
          >
            {/* Header mặt sau */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="student-card-title text-foreground">
                  {currentCard.word}
                </span>
                {posFormatted && (
                  <span className="student-typewriter text-xs text-muted-foreground">
                    ({posFormatted})
                  </span>
                )}
              </div>
              <span className="student-typewriter text-xs text-muted-foreground">
                Mặt sau · Nhấn để lật lại
              </span>
            </div>

            {/* Nội dung chi tiết mặt sau */}
            <div className="my-auto py-4 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start text-left">
              {currentCard.imageUrl && (
                <div className="md:col-span-5">
                  <div className="overflow-hidden rounded-xl border border-border bg-background aspect-4/3 flex items-center justify-center">
                    <img
                      src={currentCard.imageUrl}
                      alt={`Minh họa cho từ ${currentCard.word}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div
                className={`${
                  currentCard.imageUrl
                    ? "md:col-span-7"
                    : "md:col-span-12 max-w-2xl mx-auto w-full text-center"
                } space-y-4`}
              >
                <div>
                  <h3 className="student-vocab-meaning text-foreground">
                    {currentCard.meaningVi}
                  </h3>
                </div>

                {settings.showExample && currentCard.exampleSentence && (
                  <div className="rounded-xl border border-border/60 bg-muted/60 p-3.5 space-y-1 text-left">
                    <p className="student-body text-foreground font-semibold italic text-base">
                      &ldquo;{currentCard.exampleSentence}&rdquo;
                    </p>
                    {currentCard.exampleMeaningVi && (
                      <p className="student-body text-muted-foreground text-sm">
                        ({currentCard.exampleMeaningVi})
                      </p>
                    )}
                  </div>
                )}

                {settings.showPhrases && wordFamilies.length > 0 && (
                  <div className="space-y-1 text-sm text-foreground text-left">
                    <span className="student-typewriter text-xs font-bold text-muted-foreground">
                      HỌ TỪ (WORD FAMILY):
                    </span>
                    {wordFamilies.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 student-body"
                      >
                        <span className="text-primary font-bold">•</span>
                        <span>
                          <strong>{item.term}</strong>{" "}
                          {item.meaningVi ? `– ${item.meaningVi}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {settings.showSynonyms && synonyms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-left pt-1">
                    <span className="student-typewriter text-xs font-bold text-muted-foreground mr-1">
                      ĐỒNG NGHĨA:
                    </span>
                    {synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
                      >
                        {syn.term} {syn.meaningVi ? `(${syn.meaningVi})` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hướng dẫn dưới mặt sau */}
            <div className="text-center pt-2 border-t border-border/50">
              <span className="student-typewriter text-xs text-muted-foreground">
                Nhấn thẻ để lật lại mặt trên (tự động phát âm)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Điều hướng từ trước/sau */}
      {mode === "browse" && <div className="flex flex-col items-center gap-1.5 text-muted-foreground pt-1">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-muted active:scale-95"
            aria-label="Từ trước đó"
          >
            <ChevronLeft className="size-5" />
          </button>

          <span className="student-typewriter text-sm font-bold text-foreground">
            {currentIndex + 1} / {cards.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-muted active:scale-95"
            aria-label="Từ tiếp theo"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <p className="student-typewriter text-[11px] text-muted-foreground">
          ← → chuyển từ · Space lật thẻ
        </p>
      </div>}
    </div>
  );
}
