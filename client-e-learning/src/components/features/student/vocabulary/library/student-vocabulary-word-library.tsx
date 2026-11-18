"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
import { Link } from "@/i18n/navigation";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentVocabularyLibraryService } from "@/services/student/student-vocabulary-library.service";
import { studentVocabularyQueryKeys } from "@/services/student/student-vocabulary-query-keys";
import type {
  StudentVocabularyLibraryWord,
  VocabularyLibraryStatus,
} from "@/types/student-vocabulary-library";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 20;
const STATUSES: VocabularyLibraryStatus[] = ["learned", "due", "waiting"];

function WordRow({
  item,
  originLabel,
  reviewedLabel,
  dueLabel,
}: {
  item: StudentVocabularyLibraryWord;
  originLabel: string;
  reviewedLabel: string;
  dueLabel: string;
}) {
  const pronunciation = item.pronunciationUk ?? item.pronunciationUs;

  return (
    <PaperSurface as="article" className="space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="student-card-title text-foreground">{item.word}</h3>
            {item.partOfSpeech ? (
              <span className="student-meta text-muted-foreground">
                {item.partOfSpeech.toLowerCase().replaceAll("_", " ")}
              </span>
            ) : null}
          </div>
          {pronunciation ? (
            <p className="student-caption text-muted-foreground">{pronunciation}</p>
          ) : null}
          <p className="student-body text-foreground">{item.meaningVi}</p>
        </div>
        <span className="student-label rounded-full border border-dashed border-border px-3 py-1 text-primary">
          {originLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-3">
        <span className="student-caption text-muted-foreground">
          {reviewedLabel}
        </span>
        <span className={item.scheduleStatus === "DUE" ? "student-label text-primary" : "student-caption text-muted-foreground"}>
          {dueLabel}
        </span>
      </div>
    </PaperSurface>
  );
}

export function StudentVocabularyWordLibrary() {
  const t = useTranslations("student.vocabulary.library");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const [status, setStatus] = useState<VocabularyLibraryStatus>("learned");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const summaryQuery = useQuery({
    queryKey: studentVocabularyQueryKeys.summary,
    queryFn: studentVocabularyLibraryService.summary,
  });
  const listQuery = useQuery({
    queryKey: studentVocabularyQueryKeys.list(status, page, PAGE_SIZE, search),
    queryFn: () =>
      studentVocabularyLibraryService.list(status, {
        page,
        size: PAGE_SIZE,
        search,
      }),
    placeholderData: keepPreviousData,
  });

  const summary = summaryQuery.data?.data;
  const result = listQuery.data?.data;
  const counts: Record<VocabularyLibraryStatus, number> = {
    learned: summary?.learnedCount ?? 0,
    due: summary?.dueCount ?? 0,
    waiting: summary?.waitingCount ?? 0,
  };
  const changeStatus = (next: VocabularyLibraryStatus) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <main className="student-vocab mx-auto max-w-5xl space-y-6 pb-10">
      <Link
        href="/student/vocabulary"
        className="student-label inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("back")}
      </Link>

      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="space-y-4 p-5 sm:p-7">
        <div className="max-w-3xl space-y-2">
          <p className="student-meta text-primary">{t("kicker")}</p>
          <ScrapbookHeading as="h1" className="student-page-title text-foreground">
            {t("title")}
          </ScrapbookHeading>
          <p className="student-body text-muted-foreground">{t("subtitle")}</p>
        </div>
        {summary?.dueCount ? (
          <Link href="/student/vocabulary/review" className="student-control student-control--action inline-flex w-fit items-center gap-2 px-4">
            <CalendarClock className="size-4" aria-hidden="true" />
            {t("reviewAll", { count: summary.dueCount })}
          </Link>
        ) : (
          <button type="button" disabled className="student-control student-control--quiet inline-flex w-fit items-center gap-2 px-4">
            <CalendarClock className="size-4" aria-hidden="true" />
            {t("reviewAll", { count: 0 })}
          </button>
        )}
        {summaryQuery.isError ? (
          <div role="alert" className="flex flex-wrap items-center gap-2">
            <p className="student-caption text-destructive">
              {getAppErrorMessage(summaryQuery.error, tErrors as (key: string) => string)}
            </p>
            <button type="button" className="student-control student-control--quiet inline-flex items-center gap-2 px-3" onClick={() => void summaryQuery.refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t("retry")}
            </button>
          </div>
        ) : null}
      </PaperSurface>

      <PaperSurface as="section" className="space-y-5 p-4 sm:p-6">
        <div role="tablist" aria-label={t("tabsLabel")} className="flex flex-wrap gap-2 border-b border-dashed border-border pb-4">
          {STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={status === item}
              onClick={() => changeStatus(item)}
              className={`student-control px-4 ${status === item ? "student-filter-active" : "student-control--quiet"}`}
            >
              {t(`tabs.${item}`)} ({counts[item]})
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="student-body text-muted-foreground">{t(`descriptions.${status}`)}</p>
          <label htmlFor="vocabulary-library-search" className="student-label block">
            {t("searchLabel")}
          </label>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="vocabulary-library-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="student-field pl-10"
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        <div aria-live="polite" className="space-y-5">
          {listQuery.isPending ? <SkeletonList count={5} /> : null}
          {listQuery.isError ? (
            <RegionState
              variant="error"
              title={t("loadError")}
              description={getAppErrorMessage(listQuery.error, tErrors as (key: string) => string)}
              action={
                <button type="button" className="student-control student-control--quiet inline-flex items-center gap-2 px-4" onClick={() => void listQuery.refetch()}>
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {t("retry")}
                </button>
              }
            />
          ) : null}
          {listQuery.isSuccess && result ? (
            <div className="space-y-4">
              <p className="student-label text-foreground">{t("resultCount", { count: result.totalElements })}</p>
              {result.items.length === 0 ? (
                <RegionState
                  variant="empty"
                  title={t(search ? "filteredEmptyTitle" : "emptyTitle")}
                  description={t(search ? "filteredEmptyDescription" : `emptyDescriptions.${status}`)}
                  action={search ? (
                    <button type="button" className="student-control student-control--secondary px-4" onClick={() => setSearchInput("")}>
                      {t("clearSearch")}
                    </button>
                  ) : undefined}
                />
              ) : (
                <div className="space-y-3">
                  {result.items.map((item) => (
                    <WordRow
                      key={item.wordId}
                      item={item}
                      originLabel={t("originUnit", { name: item.origin.name })}
                      reviewedLabel={t("reviewed", { count: item.reviewCount })}
                      dueLabel={item.scheduleStatus === "DUE"
                        ? t("dueNow")
                        : t("nextReview", { date: formatDateTime(item.dueAt, locale) })}
                    />
                  ))}
                </div>
              )}
              {result.totalPages > 1 ? (
                <nav className="flex items-center justify-between gap-3" aria-label={t("page", { page: result.page, totalPages: result.totalPages })}>
                  <button type="button" disabled={result.isFirst || listQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="student-control student-control--quiet inline-flex items-center gap-2 px-3">
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{t("previousPage")}</span>
                  </button>
                  <span className="student-meta text-muted-foreground">{t("page", { page: result.page, totalPages: result.totalPages })}</span>
                  <button type="button" disabled={result.isLast || listQuery.isFetching} onClick={() => setPage((current) => current + 1)} className="student-control student-control--quiet inline-flex items-center gap-2 px-3">
                    <span className="hidden sm:inline">{t("nextPage")}</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </nav>
              ) : null}
            </div>
          ) : null}
        </div>
      </PaperSurface>
    </main>
  );
}
