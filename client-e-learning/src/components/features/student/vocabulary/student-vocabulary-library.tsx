"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarClock, Layers3, RefreshCw, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { UnitCover, unitLabel } from "@/components/features/student/units/unit-cover";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";

const overviewKey = ["student", "vocabulary", "overview"] as const;

export function StudentVocabularyLibrary() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "due">("all");
  const overview = useQuery({ queryKey: overviewKey, queryFn: studentVocabularyReviewService.listOverview });
  const units = overview.data?.data ?? [];
  const totalWords = units.reduce((count, unit) => count + unit.totalCount, 0);
  const totalDue = units.reduce((count, unit) => count + unit.dueCount, 0);
  const totalNew = units.reduce((count, unit) => count + unit.newCount, 0);
  const visible = useMemo(() => units.filter((unit) =>
    (filter === "all" || unit.dueCount > 0) &&
    `${unit.code} ${unit.name}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")),
  ), [units, filter, search]);

  return (
    <main className="student-vocab student-vocab-library mx-auto max-w-6xl space-y-6 pb-10">
      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-vocab-library-hero space-y-3 p-5 sm:p-7">
        <p className="student-meta text-primary">MY VOCABULARY NOTEBOOK</p>
        <ScrapbookHeading as="h1" className="student-page-title text-foreground">Sổ tay từ vựng</ScrapbookHeading>
        <p className="student-body max-w-2xl text-muted-foreground">
          Khám phá bộ từ theo từng Unit, tự chọn từ để học hoặc ôn lại đúng lịch FSRS.
          Phần này độc lập với Activity và Game Hub.
        </p>
        {!overview.isLoading && !overview.isError && (
          <div className="student-vocab-library-stats" aria-label="Tổng quan từ vựng">
            <div><span className="student-stat">{totalWords}</span><span className="student-label">Từ trong thư viện</span></div>
            <div><span className="student-stat">{totalNew}</span><span className="student-label">Từ mới</span></div>
            <div><span className="student-stat">{totalDue}</span><span className="student-label">Đến hạn ôn</span></div>
          </div>
        )}
      </PaperSurface>

      {overview.isLoading && <PaperSurface className="p-6 student-body" role="status">Đang tải các bộ từ vựng...</PaperSurface>}
      {overview.isError && (
        <PaperSurface as="section" className="space-y-3 p-6" role="alert">
          <h2 className="student-card-title">Không tải được thư viện từ vựng</h2>
          <p className="student-body text-destructive">{overview.error instanceof Error ? overview.error.message : "Có lỗi kết nối, hãy thử lại."}</p>
          <button type="button" onClick={() => void overview.refetch()} className="student-control student-control--action inline-flex items-center gap-2 px-4">
            <RefreshCw className="size-4" /> Thử lại
          </button>
        </PaperSurface>
      )}
      {!overview.isLoading && !overview.isError && units.length === 0 && (
        <PaperSurface className="space-y-2 p-8 text-center">
          <BookOpen className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="student-card-title">Chưa có bộ từ vựng nào</h2>
          <p className="student-body text-muted-foreground">Các Unit được công bố sẽ xuất hiện tại đây.</p>
        </PaperSurface>
      )}
      {!overview.isLoading && !overview.isError && units.length > 0 && (
        <section className="space-y-4" aria-labelledby="vocab-library-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <ScrapbookHeading as="h2" id="vocab-library-title" className="student-section-title">Bộ từ của bạn</ScrapbookHeading>
              <p className="student-body text-muted-foreground">Chọn một bộ từ để xem, học, ôn hoặc chơi.</p>
            </div>
            <div role="group" aria-label="Lọc bộ từ" className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}
                className={`student-control px-4 ${filter === "all" ? "student-filter-active" : "student-control--quiet"}`}>Tất cả</button>
              <button type="button" aria-pressed={filter === "due"} onClick={() => setFilter("due")}
                className={`student-control px-4 ${filter === "due" ? "student-filter-active" : "student-control--quiet"}`}>Cần ôn ({totalDue})</button>
            </div>
          </div>
          <div className="relative max-w-lg">
            <label htmlFor="student-vocab-search" className="student-label mb-2 block">Tìm bộ từ</label>
            <Search className="absolute bottom-3.5 left-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input id="student-vocab-search" className="student-field pl-10" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Nhập tên hoặc mã Unit..." />
          </div>
          {visible.length === 0 && <PaperSurface className="p-6 text-center student-body text-muted-foreground">Không tìm thấy bộ từ phù hợp.</PaperSurface>}
          <div className="student-vocab-library-grid">
            {visible.map((unit) => (
              <PaperSurface as="article" key={unit.unitId} className="student-vocab-collection overflow-hidden">
                <UnitCover label={unitLabel(unit.displayOrder)} name={unit.name} coverUrl={unit.coverUrl} className="student-vocab-collection-cover" />
                <div className="min-w-0 flex-1 space-y-3 p-4">
                  <div>
                    <span className="student-meta text-primary">{unit.code}</span>
                    <h3 className="student-card-title text-foreground">{unit.name}</h3>
                  </div>
                  <div className="student-vocab-collection-metrics student-label text-muted-foreground">
                    <span><Layers3 className="size-4" aria-hidden="true" /> {unit.totalCount} từ</span>
                    <span><BookOpen className="size-4" aria-hidden="true" /> {unit.newCount} mới</span>
                    <span className={unit.dueCount > 0 ? "text-primary" : ""}><CalendarClock className="size-4" aria-hidden="true" /> {unit.dueCount} đến hạn</span>
                  </div>
                  {unit.totalCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/student/vocabulary/units/${unit.unitId}`} className="student-control student-control--action inline-flex items-center gap-1.5 px-4">
                        Mở bộ từ <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                      {unit.dueCount > 0 && <Link href={`/student/vocabulary/units/${unit.unitId}?mode=review`}
                        className="student-control student-control--secondary inline-flex items-center gap-1.5 px-4">Ôn ngay</Link>}
                    </div>
                  ) : <p className="student-caption text-muted-foreground">Chưa có từ vựng đang dùng.</p>}
                </div>
              </PaperSurface>
            ))}
          </div>
          <p className="student-caption text-muted-foreground">Mỗi bộ hiện thuộc một Unit. Thư viện có trang riêng để sau này thêm bộ từ theo chủ đề mà không thay đổi cách học.</p>
        </section>
      )}
    </main>
  );
}
