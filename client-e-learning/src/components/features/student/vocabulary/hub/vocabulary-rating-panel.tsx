"use client";

import type { VocabularyFsrsRating } from "@/types/student-vocabulary-review";

export function VocabularyRatingPanel({
  onRate,
  onBack,
  busy,
  scheduleUnavailable = false,
  allowAgainWithoutPreview = true,
  againIsLocal = true,
  times,
}: {
  onRate: (rating: VocabularyFsrsRating) => void;
  onBack?: () => void;
  busy: boolean;
  scheduleUnavailable?: boolean;
  allowAgainWithoutPreview?: boolean;
  /** Learn's AGAIN puts a word into its local retry queue; Review's AGAIN is an FSRS rating. */
  againIsLocal?: boolean;
  times?: Partial<Record<VocabularyFsrsRating, string>>;
}) {
  const options = [
    { rating: "AGAIN", label: "Học lại", time: againIsLocal ? "Trong lượt này" : "Học từ đầu" },
    { rating: "HARD", label: "Khó", time: times?.HARD ?? "Theo FSRS" },
    { rating: "GOOD", label: "Tốt", time: times?.GOOD ?? "Theo FSRS" },
    { rating: "EASY", label: "Dễ", time: times?.EASY ?? "Theo FSRS" },
  ] as const;
  return (
    <section className="student-vocab-rating-panel space-y-3" aria-label="Đánh giá ghi nhớ">
      <h3 className="student-card-title text-center text-foreground">
        Bạn nhớ từ này ở mức nào?
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.rating}
            type="button"
            disabled={busy || (scheduleUnavailable && (!allowAgainWithoutPreview || option.rating !== "AGAIN"))}
            className="student-vocab-option student-vocab-rating-option flex-col items-center justify-center gap-1"
            onClick={() => onRate(option.rating)}
          >
            <span>{option.label}</span>
            <span className="student-caption text-muted-foreground">{option.time}</span>
          </button>
        ))}
      </div>
      <p className="student-caption text-center text-muted-foreground">
        {againIsLocal
          ? "Học lại: giữ từ trong hàng đợi học của lượt này, không ghi FSRS."
          : "Học lại: đưa từ về Học từ mới, bắt đầu lại lịch ghi nhớ. Lịch sử ôn vẫn được giữ."}
      </p>
      {onBack && (
        <button
          type="button"
          disabled={busy}
          onClick={onBack}
          className="student-control student-control--quiet w-full"
        >
          Quay lại cách học
        </button>
      )}
    </section>
  );
}
