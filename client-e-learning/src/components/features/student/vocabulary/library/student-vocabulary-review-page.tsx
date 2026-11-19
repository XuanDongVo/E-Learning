"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarClock, CheckCircle2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { VocabularyFlashcard } from "@/components/features/student/vocabulary/hub/vocabulary-flash-card";
import { VocabularyReviewSession } from "@/components/features/student/vocabulary/hub/vocabulary-review-session";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";
import { Link } from "@/i18n/navigation";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentVocabularyLibraryService } from "@/services/student/student-vocabulary-library.service";
import { studentVocabularyQueryKeys } from "@/services/student/student-vocabulary-query-keys";

type ReviewView = "browse" | "review";

export function StudentVocabularyReviewPage() {
  const t = useTranslations("student.vocabulary.review");
  const tErrors = useTranslations("errors");
  const [view, setView] = useState<ReviewView>("browse");
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [skippedIds, setSkippedIds] = useState<number[]>([]);
  const queueQuery = useQuery({
    queryKey: studentVocabularyQueryKeys.reviewQueue,
    queryFn: studentVocabularyLibraryService.reviewQueue,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const queue = queueQuery.data?.data;
  const handledIds = new Set([...completedIds, ...skippedIds]);
  const currentCard = queue?.items.find((item) => !handledIds.has(item.wordId));
  const handledCount = handledIds.size;
  const isComplete = Boolean(queue?.items.length && !currentCard);

  return (
    <main className="student-vocab mx-auto max-w-4xl space-y-6 pb-10">
      <StudentBackLink href="/student/vocabulary/words">{t("back")}</StudentBackLink>

      <PaperSurface as="section" variant="kraft" emphasis="feature" tape tapePosition="right" className="space-y-2 p-5 sm:p-7">
        <p className="student-meta text-primary">{t("kicker")}</p>
        <ScrapbookHeading as="h1" className="student-page-title text-foreground">
          {t("title")}
        </ScrapbookHeading>
        <p className="student-body max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      </PaperSurface>

      {queueQuery.isPending ? (
        <RegionState variant="loading" description={t("loading")} minHeight={320} />
      ) : null}
      {queueQuery.isError ? (
        <RegionState
          variant="error"
          title={t("loadError")}
          description={getAppErrorMessage(queueQuery.error, tErrors as (key: string) => string)}
          action={
            <button type="button" className="student-control student-control--quiet inline-flex items-center gap-2 px-4" onClick={() => void queueQuery.refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t("retry")}
            </button>
          }
          minHeight={320}
        />
      ) : null}
      {queueQuery.isSuccess && queue && queue.items.length === 0 ? (
        <RegionState
          variant="empty"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={<Link href="/student/vocabulary/words" className="student-control student-control--secondary px-4">{t("backToLibrary")}</Link>}
          minHeight={320}
        />
      ) : null}

      {queueQuery.isSuccess && queue && queue.items.length > 0 ? (
        <div className="space-y-5">
          <PaperSurface as="section" className="space-y-4 p-4 sm:p-5">
            <div role="tablist" aria-label={t("viewsLabel")} className="flex flex-wrap gap-2">
              <button type="button" role="tab" aria-selected={view === "browse"} onClick={() => setView("browse")} className={`student-control inline-flex items-center gap-2 px-4 ${view === "browse" ? "student-filter-active" : "student-control--quiet"}`}>
                <BookOpen className="size-4" aria-hidden="true" />
                {t("browseTab")}
              </button>
              <button type="button" role="tab" aria-selected={view === "review"} onClick={() => setView("review")} className={`student-control inline-flex items-center gap-2 px-4 ${view === "review" ? "student-filter-active" : "student-control--quiet"}`}>
                <CalendarClock className="size-4" aria-hidden="true" />
                {t("reviewTab")}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="student-label text-foreground">
                  {t("progress", { current: Math.min(handledCount + 1, queue.totalDue), total: queue.totalDue })}
                </span>
                <span className="student-meta text-muted-foreground">{handledCount}/{queue.totalDue}</span>
              </div>
              <progress className="h-2 w-full accent-primary" aria-label={t("progressLabel")} value={handledCount} max={queue.totalDue} />
            </div>
          </PaperSurface>

          {isComplete ? (
            <PaperSurface as="section" tape tapePosition="center" className="space-y-4 p-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-primary" aria-hidden="true" />
              <ScrapbookHeading as="h2" className="student-section-title text-foreground">{t("completedTitle")}</ScrapbookHeading>
              <p className="student-body text-muted-foreground">
                {t("completedDescription", { completed: completedIds.length, total: queue.totalDue, skipped: skippedIds.length })}
              </p>
              <Link href="/student/vocabulary/words" className="student-control student-control--action inline-flex px-4">{t("backToLibrary")}</Link>
            </PaperSurface>
          ) : view === "browse" ? (
            <div className="space-y-3">
              <VocabularyFlashcard cards={queue.items} mode="browse" />
              <p className="student-caption text-center text-muted-foreground">{t("browseHint")}</p>
              <div className="text-center">
                <button type="button" className="student-control student-control--action inline-flex items-center gap-2 px-5" onClick={() => setView("review")}>
                  <CalendarClock className="size-4" aria-hidden="true" />
                  {t("startReview", { count: queue.totalDue })}
                </button>
              </div>
            </div>
          ) : currentCard ? (
            <VocabularyReviewSession
              key={currentCard.wordId}
              card={currentCard}
              onRecorded={() => setCompletedIds((current) => [...current, currentCard.wordId])}
              onSkip={() => setSkippedIds((current) => [...current, currentCard.wordId])}
            />
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
