"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, ClipboardList, RefreshCw, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Pipo } from "@/components/ui/mascot";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { PolaroidFrame } from "@/components/student-ui/polaroid-frame";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentUnitService } from "@/services/student/student-unit.service";
import { StudentStreakOverview } from "@/features/student/gamification/student-streak-overview";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";

export function LearningHubHome() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.units,
    queryFn: studentUnitService.list,
  });

  const units = [...(data?.data ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="student-home mx-auto max-w-6xl space-y-10 pb-10">
      <header className="student-home-hero relative grid items-center gap-7 md:grid-cols-3">
        <span className="student-washi" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl space-y-4 md:col-span-2">
          <p className="student-meta inline-flex items-center gap-2 text-foreground">
            <Star className="h-4 w-4 text-primary" aria-hidden="true" />
            NHẬT KÝ HỌC TẬP / LEARNUP
          </p>
          <ScrapbookHeading as="h1" className="student-page-title text-foreground">
            Hôm nay mình học gì?
          </ScrapbookHeading>
          <p className="student-body max-w-xl text-foreground">
            Một trang mới trong sổ tay tiếng Anh của bạn. Chọn một Unit và khám phá điều thú vị tiếp theo nhé!
          </p>
          <div className="pt-1">
            <Link href="/student/units" className="student-ink-button">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Khám phá bài học
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="relative hidden md:block" aria-hidden="true">
          <PolaroidFrame caption="Keep learning, little by little">
            <Pipo mood="wave" color="primary" size={150} stage={2} />
          </PolaroidFrame>
        </div>
      </header>

      <StudentStreakOverview />

      <section aria-labelledby="learning-hub-units" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="student-meta text-muted-foreground">
              Chương 01
            </p>
            <ScrapbookHeading as="h2" id="learning-hub-units" className="student-section-title text-foreground">
              Bài học của bạn
            </ScrapbookHeading>
            <p className="student-body text-muted-foreground">
              Những Unit đang có sẵn để bạn khám phá.
            </p>
          </div>
          <Link
            href="/student/units"
            className="student-label inline-flex min-h-11 items-center gap-2 text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Xem tất cả Unit <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <PaperSurface variant="lined" tape className="overflow-visible">
          {isLoading ? (
            <div className="space-y-3 p-5" role="status" aria-label="Đang tải danh sách bài học">
              <SkeletonList />
            </div>
          ) : isError ? (
            <div className="p-5">
              <RegionState
                variant="error"
                title="Chưa thể tải bài học"
                description="Hãy thử tải lại danh sách Unit."
                action={
                  <Button type="button" variant="secondary" onClick={() => void refetch()}>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Thử lại
                  </Button>
                }
              />
            </div>
          ) : units.length === 0 ? (
            <div className="p-5">
              <RegionState
                variant="empty"
                title="Chưa có bài học nào"
                description="Khi giáo viên công bố Unit, các bài học sẽ xuất hiện tại đây."
              />
            </div>
          ) : (
            <div className="pt-2">
              {units.slice(0, 3).map((unit) => (
                <Link
                  key={unit.id}
                  href={`/student/units/${unit.id}`}
                  className="student-home-unit group focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="min-w-0 flex-1">
                    <span className="student-card-title block text-foreground group-hover:text-primary">
                      {unit.name}
                    </span>
                    <span className="student-body mt-1 block text-muted-foreground">
                      {unit.activityCount} hoạt động luyện tập
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </PaperSurface>
      </section>

      <PaperSurface
        as="section"
        variant="kraft"
        tape
        className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
        aria-labelledby="learning-hub-assignments"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-ink bg-card text-primary">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <ScrapbookHeading as="h2" id="learning-hub-assignments" className="student-section-title text-foreground">
              Bài giáo viên giao
            </ScrapbookHeading>
            <p className="student-body text-muted-foreground">
              Xem hạn nộp và làm bài trong khu vực riêng.
            </p>
          </div>
        </div>
        <Link href="/student/assignments" className="student-ink-button student-ink-button--outline shrink-0">
          Xem bài được giao <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </PaperSurface>
    </div>
  );
}
