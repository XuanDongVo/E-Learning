"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  RefreshCw,
  Search,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentTextField } from "@/components/student-ui/student-text-field";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentCollectionPanel } from "@/components/student-ui/patterns/student-collection-panel";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { StudentDataList } from "@/components/student-ui/data-list/student-data-list";
import { StudentDataListItem } from "@/components/student-ui/data-list/student-data-list-item";
import { StudentListPagination } from "@/components/student-ui/data-list/student-list-pagination";
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

function WordRow({ item, originLabel, reviewedLabel, dueLabel }: {
  item: StudentVocabularyLibraryWord;
  originLabel: string;
  reviewedLabel: string;
  dueLabel: string;
}) {
  const pronunciation = item.pronunciationUk ?? item.pronunciationUs;
  return (
    <StudentDataListItem
      content={
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-base font-bold leading-snug text-foreground">{item.word}</h3>
          {item.partOfSpeech && <span className="text-xs italic text-muted-foreground">{item.partOfSpeech.toLowerCase().replaceAll("_", " ")}</span>}
          {pronunciation && <span className="text-xs text-muted-foreground">{pronunciation}</span>}
          <span className="w-full text-sm text-foreground/85">{item.meaningVi}</span>
        </div>
      }
      metadata={
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="truncate" title={originLabel}>{originLabel}</span>
          <span>{reviewedLabel}</span>
        </div>
      }
      trailing={
        <span className={item.scheduleStatus === "DUE"
          ? "inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
          : "inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"}>
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
      <StudentBackLink href="/student/vocabulary">{t("back")}</StudentBackLink>

      <PaperSurface as="section" variant="kraft" emphasis="feature" tape tapePosition="right" className="space-y-3 p-4 sm:p-6">
        <StudentPageHeading
          eyebrow={t("kicker")}
          title={t("title")}
          description={t("subtitle")}
          artwork={<StudentIllustration id="illustration.word-collection" decorative className="w-28 lg:w-36" />}
          artworkClassName="hidden sm:block"
        />
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

      <StudentCollectionPanel separator={false} toolbar={
        <>
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
          <StudentTextField
            id="vocabulary-library-search"
            type="search"
            label={t("searchLabel")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("searchPlaceholder")}
            leading={<Search className="size-4" />}
            containerClassName="max-w-xl"
          />
        </div>

        </>
      }>
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
                <StudentCollectionEmptyState
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
      </StudentCollectionPanel>
    </main>
  );
}
