"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, History, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { Link } from "@/i18n/navigation";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { QUERY_KEYS } from "@/services/query-keys";
import { activitySessionService } from "@/services/student/student-activity-session.service";
import { studentUnitService } from "@/services/student-unit.service";
import type {
  ActivityHistoryPeriod,
  ActivitySessionMode,
  ActivitySessionStatus,
} from "@/types/student/activity-session";
import { ActivityHistoryFilters } from "./activity-history-filters";
import { ActivityHistoryList } from "./activity-history-list";

type TerminalStatus = Exclude<ActivitySessionStatus, "IN_PROGRESS">;

export function ActivityHistoryPage({
  unitId,
  activityId,
}: {
  unitId: number;
  activityId: number;
}) {
  const t = useTranslations("student.activities.history");
  const tErrors = useTranslations("errors");
  const [period, setPeriod] = useState<ActivityHistoryPeriod>("ALL");
  const [mode, setMode] = useState<ActivitySessionMode>();
  const [status, setStatus] = useState<TerminalStatus>();
  const [page, setPage] = useState(1);

  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.unitDetail(String(unitId)),
    queryFn: () => studentUnitService.getUnitDetail(unitId),
  });
  const historyQuery = useQuery({
    queryKey: ["activity-session-history", activityId, { page, period, mode, status }],
    queryFn: () => activitySessionService.history(activityId, { page, period, mode, status }),
  });

  const history = historyQuery.data?.data;
  const activity = unitQuery.data?.data?.activities.find((item) => item.id === activityId);
  const hasFilters = period !== "ALL" || mode != null || status != null;
  const changeFilter = (change: () => void) => {
    setPage(1);
    change();
  };
  const clearFilters = () => {
    setPeriod("ALL");
    setMode(undefined);
    setStatus(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-8">
      <Link
        href={`/student/units/${unitId}`}
        className="student-label inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("backToUnit")}
      </Link>

      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-units-hero">
        <div className="max-w-2xl space-y-2">
          <p className="student-meta text-primary">
            {activity?.name ?? t("activityFallback", { id: activityId })}
          </p>
          <ScrapbookHeading as="h1" className="student-page-title text-foreground">
            {t("pageTitle")}
          </ScrapbookHeading>
          <p className="student-body text-muted-foreground">{t("subtitle")}</p>
        </div>
        <History className="hidden size-12 shrink-0 text-primary sm:block" aria-hidden="true" />
      </PaperSurface>

      <PaperSurface as="section" className="space-y-5 p-4 sm:p-6">
        <ActivityHistoryFilters
          period={period}
          mode={mode}
          status={status}
          onPeriodChange={(value) => changeFilter(() => setPeriod(value))}
          onModeChange={(value) => changeFilter(() => setMode(value))}
          onStatusChange={(value) => changeFilter(() => setStatus(value))}
          label={t}
        />

        <div className="border-t border-dashed border-border pt-5" aria-live="polite">
          {historyQuery.isLoading && (
            <RegionState variant="loading" description={t("loading")} minHeight={220} />
          )}
          {historyQuery.isError && (
            <RegionState
              variant="error"
              title={t("loadError")}
              description={getAppErrorMessage(
                historyQuery.error,
                tErrors as (key: string) => string,
              )}
              action={
                <button
                  type="button"
                  className="student-control student-control--quiet inline-flex items-center gap-2 px-4"
                  onClick={() => void historyQuery.refetch()}
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {t("retry")}
                </button>
              }
              minHeight={220}
            />
          )}
          {historyQuery.isSuccess && history && (
            <div className="space-y-5">
              <p className="student-label text-foreground">
                {t("resultCount", { count: history.totalElements })}
              </p>

              {history.items.length === 0 ? (
                <RegionState
                  variant="empty"
                  title={t(hasFilters ? "filteredEmptyTitle" : "emptyTitle")}
                  description={t(
                    hasFilters ? "filteredEmptyDescription" : "emptyDescription",
                  )}
                  action={
                    hasFilters ? (
                      <button
                        type="button"
                        className="student-control student-control--secondary px-4"
                        onClick={clearFilters}
                      >
                        {t("clearFilters")}
                      </button>
                    ) : undefined
                  }
                  minHeight={220}
                />
              ) : (
                <ActivityHistoryList items={history.items} label={t} />
              )}

              {history.totalPages > 1 && (
                <nav className="flex items-center justify-between gap-3" aria-label={t("page", {
                  page: history.page,
                  totalPages: history.totalPages,
                })}>
                  <button
                    type="button"
                    disabled={history.isFirst || historyQuery.isFetching}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="student-control student-control--quiet inline-flex items-center gap-2 px-3"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{t("previousPage")}</span>
                  </button>
                  <span className="student-meta text-muted-foreground">
                    {t("page", { page: history.page, totalPages: history.totalPages })}
                  </span>
                  <button
                    type="button"
                    disabled={history.isLast || historyQuery.isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    className="student-control student-control--quiet inline-flex items-center gap-2 px-3"
                  >
                    <span className="hidden sm:inline">{t("nextPage")}</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </PaperSurface>
    </div>
  );
}
