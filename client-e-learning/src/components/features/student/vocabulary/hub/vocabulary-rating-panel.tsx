"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("student.vocabulary.rating");
  const options = [
    { rating: "AGAIN", label: t("again"), time: againIsLocal ? t("againLocalTime") : t("againReviewTime") },
    { rating: "HARD", label: t("hard"), time: times?.HARD ?? t("fsrs") },
    { rating: "GOOD", label: t("good"), time: times?.GOOD ?? t("fsrs") },
    { rating: "EASY", label: t("easy"), time: times?.EASY ?? t("fsrs") },
  ] as const;
  return (
    <section className="student-vocab-rating-panel space-y-3" aria-label={t("label")}>
      <h3 className="student-card-title text-center text-foreground">
        {t("question")}
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
          ? t("againLocalExplanation")
          : t("againReviewExplanation")}
      </p>
      {onBack && (
        <button
          type="button"
          disabled={busy}
          onClick={onBack}
          className="student-control student-control--quiet w-full"
        >
          {t("back")}
        </button>
      )}
    </section>
  );
}
