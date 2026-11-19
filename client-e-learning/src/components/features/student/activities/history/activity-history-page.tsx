"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentButton } from "@/components/student-ui/student-button";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";
import { StudentCollectionPanel } from "@/components/student-ui/patterns/student-collection-panel";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { StudentListPagination } from "@/components/student-ui/data-list/student-list-pagination";
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
    <div className="space-y-4 pb-8">
      <StudentBackLink href={`/student/units/${unitId}`}>{t("backToUnit")}</StudentBackLink>

      <PaperSurface as="section" className="p-5 sm:p-6">
        <StudentPageHeading
          eyebrow={activity?.name ?? t("activityFallback", { id: activityId })}
          title={t("pageTitle")}
          description={t("subtitle")}
          artwork={
            <div className="grid size-14 place-items-center rounded-xl border border-border bg-secondary/50">
              <History className="size-6 text-primary" aria-hidden="true" />
            </div>
          }
          artworkClassName="hidden sm:block"
        />
      </PaperSurface>

      <StudentCollectionPanel toolbar={
        <div className="space-y-3">
          <ActivityHistoryFilters
            period={period}
            mode={mode}
            status={status}
            onPeriodChange={(value) => changeFilter(() => setPeriod(value))}
            onModeChange={(value) => changeFilter(() => setMode(value))}
            onStatusChange={(value) => changeFilter(() => setStatus(value))}
            label={t}
          />
          {hasFilters && (
            <div className="flex justify-end">
              <StudentButton variant="quiet" onClick={clearFilters}>
                {t("clearFilters")}
              </StudentButton>
            </div>
          )}
        </div>
      }>
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
              <p className="student-label text-foreground" role="status">
                {t("resultCount", { count: history.totalElements })}
              </p>

              {history.items.length === 0 ? (
                <StudentCollectionEmptyState
                  illustration={hasFilters ? "illustration.no-results" : null}
                  title={t(hasFilters ? "filteredEmptyTitle" : "emptyTitle")}
                  description={t(hasFilters ? "filteredEmptyDescription" : "emptyDescription")}
                  action={hasFilters ? (
                    <button
                      type="button"
                      className="student-control student-control--secondary px-4"
                      onClick={clearFilters}
                    >
                      {t("clearFilters")}
                    </button>
                  ) : undefined}
                  minHeight={220}
                />
              ) : (
                <ActivityHistoryList items={history.items} label={t} />
              )}

              <StudentListPagination
                page={history.page}
                totalPages={history.totalPages}
                pageLabel={t("page", { page: history.page, totalPages: history.totalPages })}
                previousLabel={t("previousPage")}
                nextLabel={t("nextPage")}
                onPageChange={setPage}
                disabled={historyQuery.isFetching}
              />
            </div>
          )}
      </StudentCollectionPanel>
    </div>
  );
}
