"use client";

import { useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Star,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import { VocabularyWordRow } from "./vocabulary-word-row";
import { VocabularyFlashcard } from "./vocabulary-flash-card";

interface VocabularyBrowseTabProps {
  cards: StudentVocabularyStudyCard[];
  onGoLearn?: () => void;
}

export function VocabularyBrowseTab({
  cards = [],
  onGoLearn,
}: VocabularyBrowseTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [browseFilter, setBrowseFilter] = useState<"all" | "new" | "due">("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const handleToggleFavorite = (wordId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  };

  const handleToggleMastered = (wordId: number) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  };

  // Derived data
  const dueCards = useMemo(
    () => cards.filter((card) => card.due),
    [cards]
  );

  const masteredCount = mastered.size;

  // Filter cards
  const visibleBrowseCards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return cards.filter((card) => {
      const matchFilter =
        browseFilter === "all" ||
        (browseFilter === "new"
          ? !card.state || card.state === "NEW"
          : card.due);

      const matchSearch =
        !normalizedSearch ||
        `${card.word} ${card.meaningVi}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchFilter && matchSearch;
    });
  }, [cards, browseFilter, searchTerm]);

  return (
    <div className="space-y-6 ">
      {/* Flashcards (Ôn tập tập trung, lật 3D trên/dưới) */}
      {visibleBrowseCards.length > 0 && (
        <VocabularyFlashcard
          cards={visibleBrowseCards}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={(id) => favorites.has(id)}
        />
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-muted/70 p-1 text-xs font-semibold text-muted-foreground"
          role="group"
          aria-label="Lọc trạng thái từ"
        >
          <button
            type="button"
            onClick={() => setBrowseFilter("all")}
            className={`rounded-lg px-3 py-1.5 transition-all student-typewriter ${browseFilter === "all"
              ? "bg-card text-foreground shadow-2xs font-bold"
              : "hover:text-foreground"
              }`}
          >
            Tất cả ({cards.length})
          </button>

          <button
            type="button"
            onClick={() => setBrowseFilter("new")}
            className={`rounded-lg px-3 py-1.5 transition-all student-typewriter ${browseFilter === "new"
              ? "bg-card text-foreground shadow-2xs font-bold"
              : "hover:text-foreground"
              }`}
          >
            Từ mới
          </button>

          <button
            type="button"
            onClick={() => setBrowseFilter("due")}
            className={`rounded-lg px-3 py-1.5 transition-all student-typewriter ${browseFilter === "due"
              ? "bg-card text-foreground shadow-2xs font-bold"
              : "hover:text-foreground"
              }`}
          >
            Đến hạn ({dueCards.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm từ hoặc nghĩa..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 student-body"
          />
        </div>
      </div>

      {/* List header */}
      <div className="student-vocab-list-header flex flex-col gap-2 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <h3 className="student-card-title text-foreground text-sm">
          Thuật ngữ trong phần này ({visibleBrowseCards.length})
        </h3>

        <div className="student-vocab-list-legend flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 student-typewriter">
            <BookOpen className="size-3.5" />
            Chi tiết
          </span>


          <span className="flex items-center gap-1 student-typewriter">
            <CheckCircle2 className="size-3.5 text-success" />
            Đã thuộc ({masteredCount})
          </span>
        
        </div>
      </div>

      {/* Vocabulary list and progress */}
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Main column */}
        <div className="space-y-3 lg:col-span-8">
          {visibleBrowseCards.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-10 text-center">
              <p className="student-body text-sm text-muted-foreground">
                Không tìm thấy từ vựng nào phù hợp với bộ lọc hoặc từ khóa
                &quot;{searchTerm}&quot;.
              </p>
            </div>
          ) : (
            visibleBrowseCards.map((card) => (
              <VocabularyWordRow
                key={card.wordId}
                card={card}
                onToggleFavorite={handleToggleFavorite}
                onToggleMastered={handleToggleMastered}
                isFavorite={favorites.has(card.wordId)}
                isMastered={mastered.has(card.wordId)}
              />
            ))
          )}
        </div>

        {/* Progress sidebar */}
        {/* <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border-2 border-border/80 bg-card p-5 shadow-xs">
              <h4 className="flex items-center gap-2 student-card-title text-foreground text-sm">
                <Sparkles className="size-4 text-accent" />
                Tiến độ bộ từ
              </h4>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground student-typewriter">
                    <span>Đã ghi nhớ</span>
                    <span className="font-bold text-foreground">
                      {cards.length > 0
                        ? `${Math.round((masteredCount / cards.length) * 100)}%`
                        : "0%"}
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width:
                          cards.length > 0
                            ? `${(masteredCount / cards.length) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="rounded-xl border border-border/60 bg-muted/50 p-2.5">
                    <span className="block student-typewriter text-[11px] text-muted-foreground">
                      Tổng số từ
                    </span>
                    <span className="student-card-title text-base text-foreground">
                      {cards.length}
                    </span>
                  </div>

                  <div className="rounded-xl border border-accent/40 bg-accent/15 p-2.5">
                    <span className="block student-typewriter text-[11px] text-foreground font-semibold">
                      Cần ôn tập
                    </span>
                    <span className="student-card-title text-base text-foreground">
                      {dueCards.length}
                    </span>
                  </div>
                </div>
              </div>

              {onGoLearn && (
                <button
                  type="button"
                  onClick={onGoLearn}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:brightness-105 active:scale-[0.99] student-label"
                >
                  <BookOpen className="size-4" />
                  Bắt đầu học ngay
                </button>
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 text-xs leading-relaxed student-body text-muted-foreground">
              💡 <strong className="text-foreground">Mẹo:</strong> Bấm trực tiếp vào ký hiệu phát âm
              <span className="mx-1 rounded border border-border bg-muted px-1.5 py-0.5 student-typewriter font-bold text-foreground">
                UK
              </span>
              hoặc
              <span className="mx-1 rounded border border-border bg-muted px-1.5 py-0.5 student-typewriter font-bold text-foreground">
                US
              </span>
              trên từng thẻ để luyện nghe ngữ điệu chuẩn bản xứ.
            </div>
          </div>
        </aside> */}
      </div>
    </div>
  );
}
