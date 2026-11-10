"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CalendarClock, CheckCircle2, ChevronRight, Gamepad2, Layers3, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FullPageState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { SketchProgress } from "@/components/student-ui/sketch-progress";
import { studentUnitService } from "@/services/student/student-unit.service";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { RecordVocabularyReviewRequest, StudentVocabularyStudyCard, VocabularyFsrsRating } from "@/types/student-vocabulary-review";
import { VocabularyFlashcard } from "./vocabulary-flashcard";
import { VocabularyPractice } from "./vocabulary-practice";
import { VocabularyGamesPanel } from "./vocabulary-games-panel";

type Tab = "browse" | "learn" | "review" | "games";
type StudyStep = "front" | "back" | "remembered" | "practice";

const tabItems = [
  { key: "browse", label: "Xem từ", icon: BookOpen },
  { key: "learn", label: "Học", icon: Layers3 },
  { key: "review", label: "Ôn tập", icon: CalendarClock },
  { key: "games", label: "Chơi", icon: Gamepad2 },
] as const;
const vocabularyKey = (unitId: number) => ["student", "vocabulary", "units", unitId, "cards"] as const;

function dueLabel(card: StudentVocabularyStudyCard) {
  if (card.state === "NEW") return "Từ mới";
  if (card.due) return "Đến hạn ôn";
  if (!card.dueAt) return "Đã học";
  return `Ôn tiếp ${new Date(card.dueAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}`;
}

/** Only due/new words can change FSRS. Free practice and mini-games never call this endpoint. */
function VocabularyStudySession({
  unitId,
  card,
  allCards,
  onRecorded,
}: {
  unitId: number;
  card: StudentVocabularyStudyCard;
  allCards: StudentVocabularyStudyCard[];
  onRecorded: (dueAt: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState<StudyStep>("front");
  const [pendingAttempt, setPendingAttempt] = useState<RecordVocabularyReviewRequest | null>(null);
  const canRate = card.state === "NEW" || card.due;

  const review = useMutation({
    mutationFn: (payload: RecordVocabularyReviewRequest) =>
      studentVocabularyReviewService.recordReview(card.wordId, payload),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: vocabularyKey(unitId) });
      onRecorded(result.data?.dueAt ?? null);
    },
  });

  const record = (rating: VocabularyFsrsRating) => {
    if (!canRate || review.isPending || pendingAttempt) return;
    const payload = { requestId: crypto.randomUUID(), rating };
    setPendingAttempt(payload);
    review.mutate(payload);
  };

  return (
    <div className="space-y-4">
      {step !== "practice" && (
        <VocabularyFlashcard card={card} revealed={revealed}
          onReveal={() => { setRevealed((value) => !value); setStep("back"); }} />
      )}
      {!revealed ? (
        <p className="student-body text-center text-muted-foreground">Lật thẻ để xem nghĩa, ví dụ và tự đánh giá khả năng nhớ.</p>
      ) : (
        <div className="space-y-3">
          {step !== "practice" && step !== "remembered" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setStep("remembered")}
                className="student-control student-control--secondary inline-flex min-h-12 items-center justify-center gap-2 px-4">
                <CheckCircle2 className="size-5" aria-hidden="true" /> Đã nhớ
              </button>
              <button type="button" onClick={() => setStep("practice")}
                className="student-control student-control--action inline-flex min-h-12 items-center justify-center gap-2 px-4">
                <RotateCcw className="size-5" aria-hidden="true" /> Chưa nhớ · Luyện thêm
              </button>
            </div>
          )}
          {step === "practice" && (
            <VocabularyPractice card={card} unitCards={allCards} />
          )}
          {step === "remembered" && (
            <PaperSurface as="section" className="space-y-3 p-4">
              <h3 className="student-card-title text-foreground">Bạn nhớ từ này ở mức nào?</h3>
              <p className="student-body text-muted-foreground">FSRS sẽ tự tính lịch ôn tiếp theo; bạn không cần chọn số ngày.</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  { rating: "HARD", label: "Khó", detail: "Nhớ nhưng chật vật" },
                  { rating: "GOOD", label: "Tốt", detail: "Nhớ sau khi nghĩ" },
                  { rating: "EASY", label: "Dễ", detail: "Nhớ ngay" },
                ] as const).map(({ rating, label, detail }) => (
                  <button type="button" key={rating} disabled={!canRate || review.isPending || pendingAttempt !== null}
                    className="student-vocab-option flex-col items-start gap-1" onClick={() => record(rating)}>
                    <span>{label}</span><span className="student-caption text-muted-foreground">{detail}</span>
                  </button>
                ))}
              </div>
            </PaperSurface>
          )}
          {step === "practice" && canRate && (
            <button type="button" disabled={review.isPending || pendingAttempt !== null}
              onClick={() => record("AGAIN")}
              className="student-control student-control--secondary inline-flex min-h-12 w-full items-center justify-center gap-2 px-4">
              Ghi nhận chưa nhớ · FSRS sẽ nhắc lại
            </button>
          )}
          {step !== "back" && <button type="button" className="student-label min-h-11 text-primary underline"
            onClick={() => setStep("back")}>Quay lại lựa chọn</button>}
          {!canRate && (
            <p className="student-body text-muted-foreground">{dueLabel(card)}. Bạn vẫn được xem từ và luyện thêm nhưng chưa cập nhật lịch ôn trước hạn.</p>
          )}
        </div>
      )}
      {review.isPending && <p className="student-body text-center text-muted-foreground" role="status">Đang lưu lịch ôn...</p>}
      {review.isError && (
        <PaperSurface as="section" className="space-y-2 p-4" role="alert">
          <p className="student-body text-destructive">{review.error instanceof Error ? review.error.message : "Không lưu được lần ôn này."}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!pendingAttempt || review.isPending} className="student-control student-control--action px-4"
              onClick={() => pendingAttempt && review.mutate(pendingAttempt)}>Thử gửi lại</button>
            <button type="button" className="student-control student-control--quiet px-4"
              onClick={() => { setPendingAttempt(null); review.reset(); }}>Bỏ đánh giá này</button>
          </div>
        </PaperSurface>
      )}
    </div>
  );
}

export function StudentVocabularyHub({ unitId }: { unitId: number }) {
  const [tab, setTab] = useState<Tab>("browse");
  const [focusWordId, setFocusWordId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const validUnitId = Number.isSafeInteger(unitId) && unitId > 0;
  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.unitDetail(String(unitId)),
    queryFn: () => studentUnitService.getUnitDetail(unitId),
    enabled: validUnitId,
  });
  const cardsQuery = useQuery({
    queryKey: vocabularyKey(unitId),
    queryFn: () => studentVocabularyReviewService.listUnitCards(unitId),
    enabled: validUnitId,
    refetchInterval: 30_000,
  });
  const unit = unitQuery.data?.data;
  const cards = cardsQuery.data?.data ?? [];
  const newCards = cards.filter((card) => card.state === "NEW");
  const dueCards = cards.filter((card) => card.state !== "NEW" && card.due);
  const learnedCount = cards.length - newCards.length;
  const learnQueue = [...dueCards, ...newCards];
  const queue = tab === "review" ? dueCards : learnQueue;
  const focusedCard = focusWordId !== null ? cards.find((item) => item.wordId === focusWordId) : undefined;
  const currentCard = focusedCard ?? queue[0];

  const pickTab = (next: Tab) => { setTab(next); setFocusWordId(null); setNotice(""); };
  const selectWord = (card: StudentVocabularyStudyCard) => {
    setTab("learn"); setFocusWordId(card.wordId); setNotice("");
  };

  if (!validUnitId) return <FullPageState variant="error" title="Unit không hợp lệ" />;
  if (cardsQuery.isLoading || unitQuery.isLoading) return <FullPageState variant="loading" title="Đang mở sổ từ vựng" />;
  if (cardsQuery.isError || unitQuery.isError || !unit) {
    const error = cardsQuery.error ?? unitQuery.error;
    return (
      <PaperSurface as="section" className="space-y-3 p-6">
        <h1 className="student-card-title text-foreground">Không mở được sổ từ vựng</h1>
        <p role="alert" className="student-body text-destructive">{error instanceof Error ? error.message : "Vui lòng thử lại sau."}</p>
        <button type="button" className="student-control student-control--action px-4"
          onClick={() => { void cardsQuery.refetch(); void unitQuery.refetch(); }}>Thử lại</button>
      </PaperSurface>
    );
  }

  return (
    <main className="student-vocab space-y-6 pb-10">
      <Link href={`/student/units/${unitId}`}
        className="student-label inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" /> Về Unit {unit.code}
      </Link>
      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="space-y-3 p-5 sm:p-7">
        <p className="student-meta text-primary">{unit.code} · VOCABULARY NOTEBOOK</p>
        <ScrapbookHeading as="h1" className="student-page-title text-foreground">{unit.name}</ScrapbookHeading>
        <p className="student-body text-muted-foreground">Học theo gợi ý hoặc tự chọn từ. Lịch ôn được FSRS sắp xếp sau mỗi lần bạn tự đánh giá.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Tất cả", count: cards.length, hint: "từ trong Unit" },
            { label: "Từ mới", count: newCards.length, hint: "chưa đánh giá" },
            { label: "Đến hạn", count: dueCards.length, hint: "cần ôn lại" },
          ].map((item) => (
            <div key={item.label} className="student-soft-panel p-3">
              <p className="student-label text-muted-foreground">{item.label}</p>
              <p className="student-stat text-foreground">{item.count}</p>
              <p className="student-caption text-muted-foreground">{item.hint}</p>
            </div>
          ))}
        </div>
        {cards.length > 0 && (
          <div className="space-y-1">
            <div className="student-meta flex justify-between text-muted-foreground"><span>Đã bắt đầu học</span><span>{learnedCount}/{cards.length}</span></div>
            <SketchProgress value={learnedCount} max={cards.length} label="Số từ đã có tiến độ FSRS" tone="sage" />
          </div>
        )}
      </PaperSurface>

      <div role="group" aria-label="Chế độ học từ vựng" className="flex flex-wrap gap-2">
        {tabItems.map(({ key, label, icon: Icon }) => (
          <button type="button" key={key} aria-pressed={tab === key}
            onClick={() => pickTab(key)}
            className={`student-control inline-flex items-center gap-2 px-4 ${tab === key ? "student-filter-active" : "student-control--quiet"}`}>
            <Icon className="size-4" aria-hidden="true" /> {label}
            {key === "review" && dueCards.length > 0 && <span className="student-chip">{dueCards.length}</span>}
          </button>
        ))}
      </div>

      {notice && <p role="status" className="student-soft-panel student-body flex items-center gap-2 p-3 text-success"><CheckCircle2 className="size-4" />{notice}</p>}
      {cards.length === 0 && tab !== "games" && (
        <PaperSurface className="space-y-2 p-8 text-center">
          <BookOpen className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="student-card-title text-foreground">Unit này chưa có từ vựng đang dùng</h2>
          <p className="student-body text-muted-foreground">Hãy quay lại khi giáo viên cập nhật bộ từ nhé.</p>
        </PaperSurface>
      )}

      {cards.length > 0 && tab === "browse" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="student-section-title text-foreground">Danh sách từ</h2>
            <button type="button" onClick={() => pickTab("learn")}
              className="student-control student-control--action inline-flex items-center gap-2 px-4">
              <Sparkles className="size-4" aria-hidden="true" /> Học theo gợi ý <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((card) => (
              <PaperSurface key={card.wordId} as="article" className="flex flex-col justify-between gap-3 p-4">
                <div className="space-y-1">
                  <span className="student-meta text-primary">{dueLabel(card)}</span>
                  <h3 className="student-card-title text-foreground">{card.word}</h3>
                  <p className="student-body text-muted-foreground">{card.meaningVi}</p>
                </div>
                <button type="button" className="student-control student-control--secondary inline-flex items-center justify-center gap-2 px-4"
                  onClick={() => selectWord(card)}>
                  {card.due || card.state === "NEW" ? "Học từ này" : "Xem & luyện thêm"} <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </PaperSurface>
            ))}
          </div>
        </section>
      )}

      {(tab === "learn" || tab === "review") && cards.length > 0 && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="student-section-title text-foreground">{tab === "review" ? "Ôn tập đến hạn" : "Học và ghi nhớ"}</h2>
            <p className="student-body text-muted-foreground">
              {tab === "review" ? "Chỉ những từ đã học và đến hạn mới có trong lượt ôn này." : "Gợi ý ưu tiên từ đến hạn, sau đó đến từ mới. Bạn cũng có thể chọn một từ bất kỳ bên dưới."}
            </p>
          </div>
          {queue.length === 0 && !focusedCard ? (
            <PaperSurface className="space-y-3 p-7 text-center">
              <CheckCircle2 className="mx-auto size-8 text-success" aria-hidden="true" />
              <p className="student-card-title text-foreground">{tab === "review" ? "Bạn đã ôn hết từ đến hạn!" : "Không còn từ mới hoặc đến hạn"}</p>
              <p className="student-body text-muted-foreground">Khi đến lịch tiếp theo, từ sẽ xuất hiện ở đây.</p>
              <button type="button" onClick={() => pickTab("browse")} className="student-control student-control--secondary px-5">Xem toàn bộ từ</button>
            </PaperSurface>
          ) : currentCard ? (
            <>
              <div className="student-soft-panel flex flex-wrap items-center justify-between gap-3 p-3">
                <span className="student-label text-foreground">{dueLabel(currentCard)}</span>
                {focusedCard && (
                  <button type="button" className="student-label min-h-11 text-primary underline" onClick={() => setFocusWordId(null)}>
                    Quay lại lộ trình gợi ý
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn từ đang học">
                {queue.slice(0, 20).map((item) => (
                  <button key={item.wordId} type="button" aria-pressed={currentCard.wordId === item.wordId}
                    className={`student-control px-3 ${currentCard.wordId === item.wordId ? "student-filter-active" : "student-control--quiet"}`}
                    onClick={() => { setFocusWordId(item.wordId); setNotice(""); }}>
                    {item.word}
                  </button>
                ))}
              </div>
              <VocabularyStudySession key={`${tab}-${currentCard.wordId}`} unitId={unitId} card={currentCard} allCards={cards}
                onRecorded={(dueAt) => {
                  setFocusWordId(null);
                  setNotice(`Đã lưu “${currentCard.word}”. ${dueAt ? `Lịch ôn tiếp theo: ${new Date(dueAt).toLocaleString("vi-VN")}.` : ""}`);
                }} />
            </>
          ) : null}
        </section>
      )}

      {tab === "games" && <VocabularyGamesPanel unitId={unitId} wordCount={cards.length} />}
    </main>
  );
}
