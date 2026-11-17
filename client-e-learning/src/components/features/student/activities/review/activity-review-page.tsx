"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { Link } from "@/i18n/navigation";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { activitySessionService } from "@/services/student/student-activity-session.service";
import { ActivityReviewDetails } from "./activity-review-details";

export function ActivityReviewPage({ sessionId }: { sessionId: number }) {
  const t = useTranslations("student.activities.review");
  const tErrors = useTranslations("errors");
  const query = useQuery({
    queryKey: ["activity-session-review", sessionId],
    queryFn: () => activitySessionService.review(sessionId),
  });
  const review = query.data?.data;

  if (query.isLoading) {
    return <RegionState variant="loading" description={t("loading")} minHeight={320} />;
  }
  if (query.isError || !review) {
    return (
      <RegionState
        variant="error"
        description={query.isError
          ? getAppErrorMessage(query.error, tErrors as (key: string) => string)
          : t("error")}
        action={
          <Button className="student-control student-control--quiet" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" /> {t("retryLoad")}
          </Button>
        }
        minHeight={320}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <ScrapbookHeading as="h1">{t("pageTitle")}</ScrapbookHeading>
          <p className="student-body mt-2 text-muted-foreground">
            {review.activityName} · {review.unitLabel}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/student/units/${review.unitId}`} />}
          variant="outline"
          className="student-control student-control--quiet"
        >
          <ArrowLeft className="size-4" /> {t("backToUnit")}
        </Button>
      </header>
      <ActivityReviewDetails review={review} />
    </div>
  );
}
