"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Clock3, Gamepad2, History, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentActivityService } from "@/services/student/student-activity.service";
import type { Activity } from "@/types/student/activity";
import { RegionState } from "@/components/feedback";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

export function ActivityHub({ unitId }: { unitId?: number }) {
  const t = useTranslations("student.activities.hub");
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
        {t("back")}
      </Link>

      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-units-hero">
        <div className="max-w-2xl space-y-2">
          <p className="student-meta text-primary">{t("eyebrow")}</p>
          <ScrapbookHeading as="h1" className="student-page-title text-foreground">
            {t("title")}
          </ScrapbookHeading>
          <p className="student-body text-muted-foreground">
            {t("description")}
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
          {t("available")}
        </ScrapbookHeading>

        {!unitId && (
          <RegionState
            variant="empty"
            title={t("selectUnit")}
            description={t("selectUnitDesc")}
            action={
              <Link href="/student/units" className="student-control student-control--action">
                {t("viewUnits")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        )}
        {activities.isLoading && <SkeletonGrid count={4} />}
        {activities.isError && (
          <RegionState
            variant="error"
            title={t("loadError")}
            description={getAppErrorMessage(
              activities.error,
              tErrors as (key: string) => string,
            )}
          />
        )}
        {unitId && activities.isSuccess && published.length === 0 && (
          <RegionState
            variant="empty"
            title={t("empty")}
            description={t("emptyDesc")}
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
  const t = useTranslations("student.activities.hub");
  const tHistory = useTranslations("student.activities.history");
  const supportsPractice = activity.mode === "LEARNING" || activity.mode === "BOTH";
  const supportsTryHard = activity.mode === "TRY_HARD" || activity.mode === "BOTH";

  return (
    <PaperSurface as="article" interactive className="student-activity-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-5">
        <span className="student-activity-card__icon">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="student-meta text-muted-foreground">
          {t("questions", { count: activity.totalQuestions })}
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
          {t(`difficulty.${activity.questionDifficulty}`)}
        </span>
        <span>{activity.unitName}</span>
        {supportsPractice && <span className="student-chip">{t("practice")}</span>}
        {supportsTryHard && <span className="student-chip">{t("challenge")}</span>}
        {supportsTryHard && activity.timeLimitSeconds && (
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {t("secondsPerQuestion", { count: activity.timeLimitSeconds })}
          </span>
        )}
      </div>
      <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
        <Link
          href={`/student/units/${unitId}/activities/${activity.id}`}
          className="student-control student-control--action w-full"
        >
          {t("begin")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={`/student/units/${unitId}/activities/${activity.id}/history`}
          aria-label={`${tHistory("openHistory")}: ${activity.name}`}
          className="student-control student-control--quiet inline-flex items-center justify-center gap-2 px-4"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{tHistory("openHistory")}</span>
        </Link>
      </div>
    </PaperSurface>
  );
}
