"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  RefreshCw,
  Search,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentDataList } from "@/components/student-ui/data-list/student-data-list";
import { StudentDataListItem } from "@/components/student-ui/data-list/student-data-list-item";
import { StudentListPagination } from "@/components/student-ui/data-list/student-list-pagination";
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
  const isDue = item.scheduleStatus === "DUE";

  return (
    <StudentDataListItem
      content={
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-sm font-bold text-foreground">{item.word}</h3>
          {item.partOfSpeech && (
            <span className="text-xs italic text-muted-foreground">{item.partOfSpeech.toLowerCase().replaceAll("_", " ")}</span>
          )}
          {pronunciation && <span className="text-xs text-muted-foreground">{pronunciation}</span>}
        </div>
      }
      metadata={
        <div className="space-y-0.5">
          <p className="line-clamp-2 text-sm text-foreground/80">{item.meaningVi}</p>
          <p className="truncate text-xs text-muted-foreground" title={originLabel}>{originLabel} · {reviewedLabel}</p>
        </div>
      }
      trailing={
        <span className={isDue
          ? "inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
          : "inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
        }>
          {dueLabel}
        </span>
      }
    />
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
    <main className="student-vocab mx-auto max-w-5xl space-y-4 pb-10">
      <Link
        href="/student/vocabulary"
        className="student-label inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("back")}
      </Link>

      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="space-y-3 p-4 sm:p-6">
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

      <PaperSurface as="section" className="space-y-4 p-4 sm:p-5">
        <div role="tablist" aria-label={t("tabsLabel")} className="flex flex-wrap gap-2 border-b border-dashed border-border pb-3">
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

        <div aria-live="polite" className="space-y-3">
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
                <StudentDataList density="compact">
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
                </StudentDataList>
              )}
              <StudentListPagination
                page={result.page}
                totalPages={result.totalPages}
                pageLabel={t("page", { page: result.page, totalPages: result.totalPages })}
                previousLabel={t("previousPage")}
                nextLabel={t("nextPage")}
                onPageChange={setPage}
                disabled={listQuery.isFetching}
              />
            </div>
          ) : null}
        </div>
      </PaperSurface>
    </main>
  );
}
