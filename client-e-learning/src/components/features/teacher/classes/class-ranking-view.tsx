"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { classService } from "@/services/class.service";
import type {
  ClassLeaderboardMetric,
  ClassLeaderboardPeriod,
} from "@/types/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toAppError } from "@/lib/errors/app-error";
import { getInitials } from "@/utils/format";
import { cn } from "@/lib/utils";

export function ClassRankingView({ classId }: { classId: number }) {
  const t = useTranslations("teacher.classes.ranking");
  const [metric, setMetric] = useState<ClassLeaderboardMetric>("XP");
  const [xpPeriod, setXpPeriod] = useState<ClassLeaderboardPeriod>("WEEK");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const leaderboardQuery = useQuery({
    queryKey: [
      "class-leaderboard",
      classId,
      metric,
      metric === "XP" ? xpPeriod : null,
      search,
      page,
      pageSize,
    ],
    queryFn: async () => {
      const res = await classService.getLeaderboard(classId, {
        metric,
        period: metric === "XP" ? xpPeriod : undefined,
        search: search || undefined,
        page,
        size: pageSize,
      });
      return res.data;
    },
    enabled: Number.isFinite(classId) && classId > 0,
  });

  const data = leaderboardQuery.data;
  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalStudents = data?.totalStudents ?? 0;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const appError = leaderboardQuery.error
    ? toAppError(leaderboardQuery.error)
    : null;
  const isForbidden =
    appError?.status === 403 || appError?.code === "FORBIDDEN";

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-amber-500/15 text-xs font-black text-amber-600 shadow-xs ring-1 ring-amber-500/30">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-700 shadow-xs ring-1 ring-slate-300">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-amber-700/15 text-xs font-black text-amber-800 shadow-xs ring-1 ring-amber-700/30">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex size-7 items-center justify-center text-xs font-bold text-muted-foreground">
        {rank}
      </span>
    );
  };

  const hasLoadedEmptyClass =
    !leaderboardQuery.isLoading &&
    !leaderboardQuery.isError &&
    totalStudents === 0;

  const hasLoadedEmptySearch =
    !leaderboardQuery.isLoading &&
    !leaderboardQuery.isError &&
    totalStudents > 0 &&
    totalElements === 0 &&
    Boolean(search);

  return (
    <div className="space-y-4">
      {/* 1. Header Card */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-foreground">
              {t("title")}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* 2. Controls Bar (XP / Streak Segmented Control + Period Chips + Search) */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Control XP / Streak */}
          <div
            role="group"
            aria-label="Chế độ xếp hạng"
            className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-1"
          >
            <button
              type="button"
              onClick={() => {
                if (metric !== "XP") {
                  setMetric("XP");
                  setPage(1);
                }
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-extrabold transition-all",
                metric === "XP"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("metricXp")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (metric !== "STREAK") {
                  setMetric("STREAK");
                  setPage(1);
                }
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-extrabold transition-all",
                metric === "STREAK"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("metricStreak")}
            </button>
          </div>

          {/* Period Chips (Only visible in XP mode, hidden completely in STREAK mode) */}
          {metric === "XP" && (
            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              {(
                [
                  { key: "TODAY", label: t("periodToday") },
                  { key: "WEEK", label: t("periodWeek") },
                  { key: "MONTH", label: t("periodMonth") },
                  { key: "ALL", label: t("periodAll") },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    if (xpPeriod !== p.key) {
                      setXpPeriod(p.key);
                      setPage(1);
                    }
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                    xpPeriod === p.key
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full bg-background pl-9 pr-8 text-xs font-medium"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("clearSearch")}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Content States */}
      {leaderboardQuery.isLoading && (
        <SkeletonTable rows={8} columns={6} />
      )}

      {leaderboardQuery.isError && (
        <RegionState
          variant="error"
          title={t("errorTitle")}
          description={isForbidden ? t("errorForbidden") : t("errorGeneric")}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void leaderboardQuery.refetch()}
            >
              {t("retry")}
            </Button>
          }
        />
      )}

      {hasLoadedEmptyClass && (
        <RegionState
          variant="empty"
          title={t("emptyClassTitle")}
          description={t("emptyClassDescription")}
          action={
            <Link
              href={`/teacher/classes/${classId}/students`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("goToStudents")}
            </Link>
          }
        />
      )}

      {hasLoadedEmptySearch && (
        <RegionState
          variant="empty"
          title={t("emptySearchTitle")}
          description={t("emptySearchDescription", { query: search })}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              {t("clearSearch")}
            </Button>
          }
        />
      )}

      {/* 4. Leaderboard Table */}
      {!leaderboardQuery.isLoading &&
        !leaderboardQuery.isError &&
        !hasLoadedEmptyClass &&
        !hasLoadedEmptySearch && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm" style={{ minWidth: "720px" }}>
              <thead className="border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground">
                <tr>
                  <th scope="col" className="w-20 px-4 py-3.5 text-center">
                    {t("colRank")}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {t("colStudent")}
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    {metric === "XP" ? t("colXpPeriod") : t("colXpAll")}
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    {metric === "XP" ? t("colCompletedPeriod") : t("colCompletedAll")}
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    <TooltipProvider delay={150}>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1 hover:text-foreground">
                          <span>{t("colStreak")}</span>
                          <Info className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {t("streakTooltip")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th scope="col" className="w-24 px-4 py-3.5 text-right">
                    {t("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr
                    key={item.studentId}
                    className="transition-colors hover:bg-muted/25"
                  >
                    {/* Rank */}
                    <td className="px-4 py-3.5 text-center">
                      {renderRankBadge(item.rank)}
                    </td>

                    {/* Student Avatar + Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                          {getInitials(item.fullName)}
                        </span>
                        <span className="font-extrabold text-foreground">
                          {item.fullName}
                        </span>
                      </div>
                    </td>

                    {/* XP */}
                    <td
                      className={cn(
                        "px-4 py-3.5 text-right font-extrabold",
                        metric === "XP"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.xp.toLocaleString("vi-VN")}
                    </td>

                    {/* Completed Sessions */}
                    <td className="px-4 py-3.5 text-right font-bold text-muted-foreground">
                      {item.completedSessions.toLocaleString("vi-VN")}
                    </td>

                    {/* Current Streak */}
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5",
                          metric === "STREAK" && item.currentStreak > 0
                            ? "bg-amber-500/10"
                            : ""
                        )}
                      >
                        <Flame
                          className={cn(
                            "size-4",
                            item.currentStreak > 0
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold",
                            item.currentStreak > 0
                              ? metric === "STREAK"
                                ? "font-extrabold text-amber-700"
                                : "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.currentStreak} {t("daysSuffix")}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/teacher/students/${item.studentId}`}
                        className="inline-flex items-center gap-0.5 rounded-md px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                      >
                        <span>{t("view")}</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground">
                <span>
                  {t("pageInfo", {
                    page,
                    totalPages,
                    total: totalElements,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 gap-1 px-2.5 text-xs font-bold"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>{t("previous")}</span>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          "size-8 rounded-md text-xs font-bold transition-colors",
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 gap-1 px-2.5 text-xs font-bold"
                  >
                    <span>{t("next")}</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
