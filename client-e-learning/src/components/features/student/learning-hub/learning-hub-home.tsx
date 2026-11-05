"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, ClipboardList, RefreshCw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Pipo } from "@/components/ui/mascot";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentUnitService } from "@/services/student/student-unit.service";
import { unitLabel } from "@/components/features/student/units/unit-cover";

export function LearningHubHome() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.units,
    queryFn: studentUnitService.list,
  });

  const units = [...(data?.data ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <header className="flex flex-col-reverse items-start gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">
            Góc học tập của bạn
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Hôm nay mình học gì?
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Chọn một Unit để khám phá bài học và luyện tập tiếng Anh theo cách của bạn.
          </p>
          <Link
            href="/student/units"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            Khám phá bài học
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="shrink-0 self-end sm:self-auto" aria-hidden="true">
          <Pipo mood="wave" color="primary" size={112} stage={2} />
        </div>
      </header>

      <section aria-labelledby="learning-hub-units" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="learning-hub-units" className="text-xl font-bold text-foreground">
              Bài học của bạn
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn nội dung bạn muốn học tiếp hôm nay.
            </p>
          </div>
          <Link
            href="/student/units"
            className="inline-flex min-h-10 items-center gap-1 text-base font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Xem tất cả Unit <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="Đang tải danh sách bài học">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
            <span className="sr-only">Đang tải danh sách bài học</span>
          </div>
        ) : isError ? (
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
        ) : units.length === 0 ? (
          <RegionState
            variant="empty"
            title="Chưa có bài học nào"
            description="Khi giáo viên công bố Unit, các bài học sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {units.slice(0, 3).map((unit) => (
              <Link
                key={unit.id}
                href={`/student/units/${unit.id}`}
                className="group flex min-h-24 items-center gap-4 px-4 py-4 transition-colors hover:bg-primary-soft/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-learning-soft text-base font-extrabold text-learning">
                  {unitLabel(unit.code)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-foreground group-hover:text-primary">
                    {unit.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {unit.activityCount} hoạt động luyện tập
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="learning-hub-assignments" className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="learning-hub-assignments" className="text-base font-bold text-foreground">
              Bài giáo viên giao
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Xem hạn nộp và làm bài trong khu vực riêng.
            </p>
          </div>
        </div>
        <Link
          href="/student/assignments"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 text-base font-semibold text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Xem bài được giao <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
