"use client";

import { useTranslations } from "next-intl";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Layers3,
  TrendingUp,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { StudentTextField } from "@/components/student-ui/student-text-field";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import {
  UnitCover,
  unitLabel,
} from "@/components/features/student/units/unit-cover";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";

const overviewKey = ["student", "vocabulary", "overview"] as const;

export function StudentVocabularyLibrary() {
  const t = useTranslations("student.vocabulary.unitIndex");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "due">("all");
  const overview = useQuery({
    queryKey: overviewKey,
    queryFn: studentVocabularyReviewService.listOverview,
    refetchInterval: 60_000,
  });
  const units = overview.data?.data ?? [];
  const totalWords = units.reduce((count, unit) => count + unit.totalCount, 0);
  const totalDue = units.reduce((count, unit) => count + unit.dueCount, 0);
  const totalNew = units.reduce((count, unit) => count + unit.newCount, 0);
  const hasActiveFilters = search.trim().length > 0 || filter !== "all";
  const clearFilters = () => {
    setSearch("");
    setFilter("all");
  };
  const visible = useMemo(
    () =>
      units.filter(
        (unit) =>
          (filter === "all" || unit.dueCount > 0) &&
          `${unit.code} ${unit.name}`
            .toLocaleLowerCase("vi")
            .includes(search.trim().toLocaleLowerCase("vi")),
      ),
    [units, filter, search],
  );

  return (
    <main className="student-vocab student-vocab-library mx-auto max-w-6xl space-y-6 pb-10">
      <PaperSurface
        as="section"
        variant="kraft"
        emphasis="feature"
        tape
        tapePosition="right"
        className="student-vocab-library-hero space-y-3 p-5 sm:p-7"
      >
        <StudentPageHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          artwork={<StudentIllustration id="scene.open-notebook" decorative className="w-28 lg:w-36" />}
          artworkClassName="hidden sm:block"
          actions={
            <>
              <Link
                href="/student/vocabulary/words"
                className="student-control student-control--action inline-flex w-full items-center justify-center gap-2 px-4 sm:w-auto"
              >
                <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                {t("openWordLibrary")}
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="/student/vocabulary/progress"
                className="student-control student-control--secondary inline-flex w-full items-center justify-center gap-2 px-4 sm:w-auto"
              >
                <TrendingUp className="size-4 shrink-0" aria-hidden="true" />
                {t("viewProgress")}
              </Link>
            </>
          }
        />
        {overview.isSuccess && units.length > 0 && (
          <p className="student-meta border-t border-dashed border-border pt-3 text-muted-foreground">
            {t("totals", { words: totalWords, newWords: totalNew, due: totalDue })}
          </p>
        )}
      </PaperSurface>

      {overview.isLoading && (
        <PaperSurface className="p-6 student-body" role="status">
          {t("loading")}
        </PaperSurface>
      )}
      {overview.isError && (
        <PaperSurface as="section" className="space-y-3 p-6" role="alert">
          <h2 className="student-card-title">
            {t("loadError")}
          </h2>
          <p className="student-body text-destructive">
            {overview.error instanceof Error
              ? overview.error.message
              : t("connectionError")}
          </p>
          <button
            type="button"
            onClick={() => void overview.refetch()}
            className="student-control student-control--action inline-flex items-center gap-2 px-4"
          >
            <RefreshCw className="size-4" /> {t("retry")}
          </button>
        </PaperSurface>
      )}
      {overview.isSuccess && units.length === 0 && (
        <StudentCollectionEmptyState
          illustration="illustration.no-lessons"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
      {overview.isSuccess && units.length > 0 && (
        <section className="space-y-4" aria-labelledby="vocab-library-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <ScrapbookHeading
                as="h2"
                id="vocab-library-title"
                className="student-section-title"
              >
                {t("sectionTitle")}
              </ScrapbookHeading>
              <p className="student-body text-muted-foreground">
                {t("sectionDescription")}
              </p>
            </div>
            <div
              role="group"
              aria-label={t("filtersLabel")}
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
                className={`student-control px-4 ${filter === "all" ? "student-filter-active" : "student-control--quiet"}`}
              >
                {t("all")}
              </button>
              <button
                type="button"
                aria-pressed={filter === "due"}
                onClick={() => setFilter("due")}
                className={`student-control px-4 ${filter === "due" ? "student-filter-active" : "student-control--quiet"}`}
              >
                {t("dueFilter", { count: totalDue })}
              </button>
            </div>
          </div>
          <StudentTextField
            id="student-vocab-search"
            type="search"
            label={t("searchLabel")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leading={<Search className="size-4" />}
            placeholder={t("searchPlaceholder")}
            containerClassName="max-w-lg"
          />
          <p className="student-meta text-muted-foreground" role="status">
            {hasActiveFilters
              ? t("filteredCount", { visible: visible.length, total: units.length })
              : t("totalCount", { count: units.length })}
          </p>
          {visible.length === 0 && (
            <StudentCollectionEmptyState
              title={t("noMatches")}
              description={t("noMatchesDescription")}
              action={
                <button type="button" className="student-control student-control--secondary px-4" onClick={clearFilters}>
                  {t("clearFilters")}
                </button>
              }
            />
          )}
          {visible.length > 0 && (
          <div className="student-vocab-library-grid">
            {visible.map((unit) => (
              <PaperSurface
                as="article"
                key={unit.unitId}
                className="student-vocab-collection overflow-hidden"
              >
                <UnitCover
                  label={unitLabel(unit.displayOrder)}
                  name={unit.name}
                  coverUrl={unit.coverUrl}
                  className="student-vocab-collection-cover h-36 w-full object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
                  <div>
                    {/* <span className="student-meta text-primary">{unit.code}</span> */}
                    <h3 className="student-card-title text-foreground">
                      {unit.name}
                    </h3>
                  </div>
                  <div className="student-meta flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Layers3 className="size-4 shrink-0" aria-hidden="true" />
                      {t("totalWords", { count: unit.totalCount })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                      {t("newWords", { count: unit.newCount })}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 ${unit.dueCount > 0 ? "font-semibold text-primary" : ""}`}>
                      <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                      {t("dueWords", { count: unit.dueCount })}
                    </span>
                  </div>
                  {unit.totalCount > 0 ? (
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Link
                        href={`/student/vocabulary/units/${unit.unitId}?mode=learn`}
                        className="student-control student-control--action inline-flex items-center gap-1.5 px-4"
                      >
                        {t("learn")} <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                      {unit.dueCount > 0 && (
                        <Link
                          href={`/student/vocabulary/units/${unit.unitId}?mode=review`}
                          className="student-control student-control--secondary inline-flex items-center gap-1.5 px-4"
                        >
                          {t("reviewNow")}
                        </Link>
                      )}
                      <Link
                        href={`/student/vocabulary/units/${unit.unitId}`}
                        className="student-control student-control--quiet inline-flex items-center gap-1.5 px-4"
                      >
                        {t("browse")}
                      </Link>
                    </div>
                  ) : (
                    <p className="student-caption text-muted-foreground">
                      {t("emptyUnit")}
                    </p>
                  )}
                </div>
              </PaperSurface>
            ))}
          </div>
          )}
        </section>
      )}
    </main>
  );
}
