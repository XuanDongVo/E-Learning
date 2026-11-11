"use client";

import type { VocabularyFsrsRating } from "@/types/student-vocabulary-review";

export function VocabularyRatingPanel({ onRate, onBack, busy, scheduleUnavailable = false, times }: {
  onRate: (rating: VocabularyFsrsRating) => void;
  onBack: () => void;
  busy: boolean;
  scheduleUnavailable?: boolean;
  times?: Partial<Record<VocabularyFsrsRating, string>>;
}) {
  const options = [
    { rating: "AGAIN", label: "Học lại", time: "Trong buổi" },
    { rating: "HARD", label: "Khó", time: times?.HARD ?? "Theo FSRS" },
    { rating: "GOOD", label: "Tốt", time: times?.GOOD ?? "Theo FSRS" },
    { rating: "EASY", label: "Dễ", time: times?.EASY ?? "Theo FSRS" },
  ] as const;
  return (
    <section className="student-vocab-rating-panel space-y-3" aria-label="Đánh giá ghi nhớ">
      <h3 className="student-card-title text-center text-foreground">Bạn nhớ từ này ở mức nào?</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => <button key={option.rating} type="button" disabled={busy || (scheduleUnavailable && option.rating !== "AGAIN")}
          className="student-vocab-option student-vocab-rating-option flex-col items-center justify-center gap-1"
          onClick={() => onRate(option.rating)}>
          <span>{option.label}</span><span className="student-caption text-muted-foreground">{option.time}</span>
        </button>)}
      </div>
      <p className="student-caption text-center text-muted-foreground">Học lại: chuyển từ khác và giữ từ này trong hàng đợi.</p>
      <button type="button" disabled={busy} onClick={onBack} className="student-control student-control--quiet w-full">Quay lại cách học</button>
    </section>
  );
}
