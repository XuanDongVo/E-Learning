"use client";

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
          eyebrow="SỔ TAY TỪ VỰNG"
          title="Sổ tay từ vựng"
          description="Tìm bộ từ theo Unit, bắt đầu học hoặc ôn những từ đến hạn."
          artwork={<StudentIllustration id="scene.open-notebook" decorative className="w-28 lg:w-36" />}
          artworkClassName="hidden sm:block"
          actions={
            <>
              <Link
                href="/student/vocabulary/words"
                className="student-control student-control--action inline-flex w-full items-center justify-center gap-2 px-4 sm:w-auto"
              >
                <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                Mở kho từ
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="/student/vocabulary/progress"
                className="student-control student-control--secondary inline-flex w-full items-center justify-center gap-2 px-4 sm:w-auto"
              >
                <TrendingUp className="size-4 shrink-0" aria-hidden="true" />
                Xem hành trình từ vựng
              </Link>
            </>
          }
        />
        {overview.isSuccess && units.length > 0 && (
          <p className="student-meta border-t border-dashed border-border pt-3 text-muted-foreground">
            {totalWords} từ trong thư viện · {totalNew} từ mới · {totalDue} từ đến hạn ôn
          </p>
        )}
      </PaperSurface>

      {overview.isLoading && (
        <PaperSurface className="p-6 student-body" role="status">
          Đang tải các bộ từ vựng...
        </PaperSurface>
      )}
      {overview.isError && (
        <PaperSurface as="section" className="space-y-3 p-6" role="alert">
          <h2 className="student-card-title">
            Không tải được thư viện từ vựng
          </h2>
          <p className="student-body text-destructive">
            {overview.error instanceof Error
              ? overview.error.message
              : "Có lỗi kết nối, hãy thử lại."}
          </p>
          <button
            type="button"
            onClick={() => void overview.refetch()}
            className="student-control student-control--action inline-flex items-center gap-2 px-4"
          >
            <RefreshCw className="size-4" /> Thử lại
          </button>
        </PaperSurface>
      )}
      {overview.isSuccess && units.length === 0 && (
        <StudentCollectionEmptyState
          illustration="illustration.no-lessons"
          title="Chưa có bộ từ vựng nào"
          description="Các Unit được công bố sẽ xuất hiện tại đây."
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
                Bộ từ của bạn
              </ScrapbookHeading>
              <p className="student-body text-muted-foreground">
                Chọn một bộ từ để xem, học, ôn hoặc chơi.
              </p>
            </div>
            <div
              role="group"
              aria-label="Lọc bộ từ"
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
                className={`student-control px-4 ${filter === "all" ? "student-filter-active" : "student-control--quiet"}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                aria-pressed={filter === "due"}
                onClick={() => setFilter("due")}
                className={`student-control px-4 ${filter === "due" ? "student-filter-active" : "student-control--quiet"}`}
              >
                Cần ôn ({totalDue})
              </button>
            </div>
          </div>
          <StudentTextField
            id="student-vocab-search"
            type="search"
            label="Tìm bộ từ"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leading={<Search className="size-4" />}
            placeholder="Nhập tên hoặc mã Unit..."
            containerClassName="max-w-lg"
          />
          <p className="student-meta text-muted-foreground" role="status">
            {hasActiveFilters
              ? `Hiển thị ${visible.length}/${units.length} bộ từ phù hợp`
              : `${units.length} bộ từ hiện có`}
          </p>
          {visible.length === 0 && (
            <StudentCollectionEmptyState
              title="Không tìm thấy bộ từ phù hợp"
              description="Thử một từ khóa khác hoặc quay lại tất cả các bộ từ."
              action={
                <button type="button" className="student-control student-control--secondary px-4" onClick={clearFilters}>
                  Xóa bộ lọc
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
                      {unit.totalCount} từ
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                      {unit.newCount} mới
                    </span>
                    <span className={`inline-flex items-center gap-1.5 ${unit.dueCount > 0 ? "font-semibold text-primary" : ""}`}>
                      <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                      {unit.dueCount} đến hạn
                    </span>
                  </div>
                  {unit.totalCount > 0 ? (
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Link
                        href={`/student/vocabulary/units/${unit.unitId}?mode=learn`}
                        className="student-control student-control--action inline-flex items-center gap-1.5 px-4"
                      >
                        Học <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                      {unit.dueCount > 0 && (
                        <Link
                          href={`/student/vocabulary/units/${unit.unitId}?mode=review`}
                          className="student-control student-control--secondary inline-flex items-center gap-1.5 px-4"
                        >
                          Ôn ngay
                        </Link>
                      )}
                      <Link
                        href={`/student/vocabulary/units/${unit.unitId}`}
                        className="student-control student-control--quiet inline-flex items-center gap-1.5 px-4"
                      >
                        Xem từ
                      </Link>
                    </div>
                  ) : (
                    <p className="student-caption text-muted-foreground">
                      Chưa có từ vựng đang dùng.
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
