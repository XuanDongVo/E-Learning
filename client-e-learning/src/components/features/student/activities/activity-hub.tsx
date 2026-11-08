"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Clock3, Gamepad2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentActivityService } from "@/services/student/student-activity.service";
import type { Activity } from "@/types/student/activity";
import { ACTIVITY_DIFFICULTY_LABELS } from "@/types/activity";
import { RegionState } from "@/components/feedback";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

export function ActivityHub({ unitId }: { unitId?: number }) {
  const tErrors = useTranslations("errors");
  const activities = useQuery({
    queryKey: ["student-activities", unitId],
    queryFn: () => studentActivityService.list(unitId!),
    enabled: !!unitId,
  });
  const published =
    activities.data?.data?.filter((activity) => activity.status === "PUBLISHED") ?? [];

  return (
    <div className="student-activity-hub space-y-6 pb-8">
      <Link
        href={unitId ? `/student/units/${unitId}` : "/student/units"}
        className="student-label inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại Unit
      </Link>

      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-units-hero">
        <div className="max-w-2xl space-y-2">
          <p className="student-meta text-primary">Activities</p>
          <ScrapbookHeading as="h1" className="student-page-title text-foreground">
            Luyện tập tiếng Anh
          </ScrapbookHeading>
          <p className="student-body text-muted-foreground">
            Chọn một hoạt động đã được giáo viên công bố để luyện từ vựng, ngữ pháp và phản xạ.
          </p>
        </div>
        <Gamepad2 className="hidden h-12 w-12 shrink-0 text-primary sm:block" aria-hidden="true" />
      </PaperSurface>

      <section className="space-y-4" aria-labelledby="available-activities-title">
        <ScrapbookHeading
          as="h2"
          id="available-activities-title"
          className="student-section-title text-foreground"
        >
          Hoạt động có thể học
        </ScrapbookHeading>

        {!unitId && (
          <RegionState
            variant="empty"
            title="Hãy chọn một Unit trước"
            description="Đường dẫn hiện tại chưa xác định Unit cần học."
            action={
              <Link href="/student/units" className="student-control student-control--action">
                Xem danh sách Unit <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        )}
        {activities.isLoading && <SkeletonGrid count={4} />}
        {activities.isError && (
          <RegionState
            variant="error"
            title="Không thể tải hoạt động"
            description={getAppErrorMessage(
              activities.error,
              tErrors as (key: string) => string,
            )}
          />
        )}
        {unitId && activities.isSuccess && published.length === 0 && (
          <RegionState
            variant="empty"
            title="Chưa có hoạt động được công bố"
            description="Giáo viên chưa công bố hoạt động nào cho Unit này."
          />
        )}
        {published.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {published.map((activity) => (
              <HubActivityCard key={activity.id} unitId={unitId!} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HubActivityCard({ unitId, activity }: { unitId: number; activity: Activity }) {
  const supportsPractice = activity.mode === "LEARNING" || activity.mode === "BOTH";
  const supportsTryHard = activity.mode === "TRY_HARD" || activity.mode === "BOTH";

  return (
    <PaperSurface as="article" interactive className="student-activity-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-5">
        <span className="student-activity-card__icon">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="student-meta text-muted-foreground">
          {activity.totalQuestions} câu hỏi
        </span>
      </div>
      <div>
        <h3 className="student-card-title text-foreground">{activity.name}</h3>
        {activity.description && (
          <p className="student-body mt-2 line-clamp-2 text-muted-foreground">
            {activity.description}
          </p>
        )}
      </div>
      <div className="student-meta flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
        <span className="font-bold text-foreground">
          {ACTIVITY_DIFFICULTY_LABELS[activity.questionDifficulty]}
        </span>
        <span>{activity.unitName}</span>
        {supportsPractice && <span className="student-chip">Luyện tập</span>}
        {supportsTryHard && <span className="student-chip">Thử thách</span>}
        {supportsTryHard && activity.timeLimitSeconds && (
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {activity.timeLimitSeconds}s / câu
          </span>
        )}
      </div>
      <Link
        href={`/student/units/${unitId}/activities/${activity.id}`}
        className="student-control student-control--action mt-auto w-full"
      >
        Bắt đầu hoạt động <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}
