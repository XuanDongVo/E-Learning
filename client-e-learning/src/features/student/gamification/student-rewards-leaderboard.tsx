"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Award, Flame, RefreshCw, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
  LeaderboardRanking,
} from "@/types/gamification";

const PERIODS: { key: LeaderboardPeriod; text: string }[] = [
  { key: "TODAY", text: "Hôm nay" },
  { key: "WEEK", text: "Tuần này" },
  { key: "MONTH", text: "Tháng này" },
  { key: "ALL", text: "Tất cả" },
];

function Value({
  entry,
  metric,
}: {
  entry: LeaderboardRanking;
  metric: LeaderboardMetric;
}) {
  return (
    <span className="font-extrabold tabular-nums text-foreground">
      {entry.value.toLocaleString("vi-VN")}{" "}
      <span className="font-semibold text-muted-foreground">
        {metric === "XP" ? "XP" : "ngày"}
      </span>
    </span>
  );
}

function RankRow({
  entry,
  metric,
}: {
  entry: LeaderboardRanking;
  metric: LeaderboardMetric;
}) {
  return (
    <div
      role="row"
      aria-label={
        entry.currentStudent ? `Vị trí ${entry.rank} của bạn` : undefined
      }
      className={cn(
        "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-3 last:border-b-0 sm:grid-cols-[4rem_minmax(0,1fr)_5rem_8rem] sm:gap-3 sm:px-5",
        entry.currentStudent &&
          "bg-primary-soft ring-1 ring-inset ring-primary",
      )}
    >
      <span
        role="cell"
        className="text-sm font-bold tabular-nums text-muted-foreground"
      >
        #{entry.rank}
      </span>
      <span role="cell" className="flex min-w-0 items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink bg-secondary text-sm font-bold text-foreground">
          {entry.fullName.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">
            {entry.fullName}
          </span>
          {entry.currentStudent && (
            <span className="text-xs font-bold text-primary">Bạn</span>
          )}
        </span>
      </span>
      <span
        role="cell"
        className="hidden text-sm font-semibold text-muted-foreground sm:block"
      >
        Lv. {entry.level}
      </span>
      <span role="cell" className="text-right text-sm">
        <Value entry={entry} metric={metric} />
      </span>
    </div>
  );
}

export function StudentRewardsLeaderboard() {
  const [metric, setMetric] = useState<LeaderboardMetric>("XP");
  const [period, setPeriod] = useState<LeaderboardPeriod>("TODAY");

  const ranking = useQuery({
    queryKey: [
      "student",
      "leaderboard",
      metric,
      metric === "XP" ? period : "ALL",
    ],
    queryFn: () =>
      studentGamificationService.leaderboard(
        metric,
        metric === "XP" ? period : "ALL",
      ),
  });

  const honors = useQuery({
    queryKey: ["student", "leaderboard", "honors"],
    queryFn: studentGamificationService.honors,
  });
  const recent = useQuery({
    queryKey: ["student", "leaderboard", "recent-activity"],
    queryFn: studentGamificationService.recentActivity,
  });

  const data = ranking.data?.data;
  const podium = (data?.top ?? []).slice(0, 3).map((entry) => ({
    userId: String(entry.studentId),
    userName: entry.fullName,
    rank: entry.rank,
    value: entry.value,
    byline: metric === "XP" ? "XP" : "ngày",
    displayed: true,
  }));
  const selfOutside =
    data?.currentStudent && !data.currentStudentInTop
      ? data.currentStudent
      : null;
  const xpChampion = honors.data?.data?.xpChampion;
  const streakChampion = honors.data?.data?.streakChampion;
  const activities = recent.data?.data?.items ?? [];

  return (
    <section
      aria-labelledby="leaderboard-page-title"
      className="mx-auto max-w-6xl space-y-5 pb-8"
    >
      <header>
        <p className="text-sm font-bold text-primary">Cộng đồng học tập</p>
        <h1
          id="leaderboard-page-title"
          className="text-3xl font-extrabold tracking-tight text-foreground"
        >
          Bảng xếp hạng
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top 50 học viên. XP và Streak được tổng hợp từ dữ liệu học tập thật.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(18rem,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div
              role="group"
              aria-label="Loại xếp hạng"
              className="inline-flex w-fit rounded-xl border-2 border-ink bg-card p-1 shadow-pop"
            >
              {(
                [
                  ["XP", "XP"],
                  ["STREAK", "Streak"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={metric === value}
                  onClick={() => setMetric(value)}
                  className={cn(
                    "min-h-10 rounded-lg px-5 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    metric === value
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {metric === "XP" && (
              <div
                role="group"
                aria-label="Khoảng thời gian XP"
                className="grid grid-cols-4 rounded-xl border-2 border-ink shadow-pop bg-card p-1 sm:flex"
              >
                {PERIODS.map(({ key, text }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={period === key}
                    onClick={() => setPeriod(key)}
                    className={cn(
                      "min-h-10 rounded-lg px-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3",
                      period === key
                        ? "bg-learning text-white"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {ranking.isPending ? (
            <RegionState variant="loading" title="Đang tải bảng xếp hạng" />
          ) : ranking.isError || !data ? (
            <RegionState
              variant="error"
              title="Chưa thể tải bảng xếp hạng"
              description="Hãy thử lại."
              action={
                <Button
                  type="button"
                  onClick={() => void ranking.refetch()}
                  variant="secondary"
                >
                  <RefreshCw className="h-4 w-4" />
                  Thử lại
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-pop">
                {data.top.length ? (
                  <>
                    <div className="bg-secondary/50 px-3 pt-9 sm:px-6">
                      <LeaderboardPodium
                        rankings={podium}
                        spacing="normal"
                        size="default"
                        valueUnit={metric === "XP" ? "XP" : "ngày"}
                      />
                    </div>
                    <div className="border-t-2 border-ink px-4 py-3 text-sm font-extrabold text-foreground">
                      Danh sách Top {data.top.length}
                    </div>
                    <div role="table" aria-label="Bảng xếp hạng 50 học viên">
                      <div
                        role="row"
                        className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-2 border-y border-border bg-secondary/50 px-3 py-2 text-xs font-bold uppercase text-muted-foreground sm:grid-cols-[4rem_minmax(0,1fr)_5rem_8rem] sm:gap-3 sm:px-5"
                      >
                        <span role="columnheader">Hạng</span>
                        <span role="columnheader">Học viên</span>
                        <span role="columnheader" className="hidden sm:block">
                          Level
                        </span>
                        <span role="columnheader" className="text-right">
                          {metric === "XP" ? "XP" : "Streak"}
                        </span>
                      </div>
                      {data.top.map((entry) => (
                        <RankRow
                          key={entry.studentId}
                          entry={entry}
                          metric={metric}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">
                    Chưa có học viên nào được xếp hạng.
                  </div>
                )}
              </div>

              {selfOutside && (
                <div
                  className="rounded-xl border-2 border-ink bg-success-soft p-4 shadow-pop"
                  aria-label="Vị trí riêng của bạn"
                >
                  <p className="mb-2 text-xs font-extrabold uppercase text-foreground">
                    Vị trí của bạn · Ngoài Top 50
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">
                        #{selfOutside.rank} · {selfOutside.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Level {selfOutside.level}
                      </p>
                    </div>
                    <Value entry={selfOutside} metric={metric} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="min-w-0 space-y-5">
          {/* 1. ĐẠI SẢNH DANH VỌNG */}
          <section aria-labelledby="hall-of-fame-heading" className="space-y-3">
            <h2
              id="hall-of-fame-heading"
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
            >
              <Trophy className="h-6 w-6 text-amber-500 fill-amber-100" />
              Đại sảnh danh vọng
            </h2>

            {/* Thẻ Bậc thầy tri thức */}
            {xpChampion && (
              <div className="relative flex items-center justify-between rounded-2xl border-2 border-ink shadow-pop bg-gradient-to-r from-amber-50/70 to-orange-50/40 p-4 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:to-background">
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                    Bậc thầy tri thức
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://i.pravatar.cc/100?u=${encodeURIComponent(xpChampion.fullName)}`}
                      alt={xpChampion.fullName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-300 shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-extrabold text-foreground">
                        {xpChampion.fullName}
                      </p>
                      <p className="text-sm font-extrabold text-info dark:text-blue-400">
                        {typeof xpChampion.value === "number"
                          ? `${xpChampion.value.toLocaleString("vi-VN")} XP`
                          : xpChampion.value}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                  <Trophy className="h-5 w-5 fill-white" />
                </div>
              </div>
            )}

            {/* Thẻ Huyền thoại không nghỉ */}
            {streakChampion && (
              <div className="relative flex items-center justify-between rounded-2xl border-2 border-ink shadow-pop bg-gradient-to-r from-orange-50/70 to-amber-50/30 p-4 shadow-sm dark:border-orange-900/40 dark:from-orange-950/20 dark:to-background">
                <div className="space-y-1.5 ">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-orange-700 dark:text-orange-400">
                    Huyền thoại không nghỉ
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={`https://i.pravatar.cc/100?u=${encodeURIComponent(streakChampion.fullName)}`}
                        alt={streakChampion.fullName}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-foreground">
                        {streakChampion.fullName}
                      </p>
                      <p className="text-sm font-extrabold text-info dark:text-blue-400">
                        {typeof streakChampion.value === "number"
                          ? `${streakChampion.value.toLocaleString("vi-VN")} ngày`
                          : streakChampion.value}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
                  <Flame className="h-6 w-6 fill-white" />
                </div>
              </div>
            )}
          </section>

          <section
            aria-labelledby="recent-activity-heading"
            className="rounded-2xl border-2 border-ink bg-card p-4 shadow-pop"
          >
            <h2
              id="recent-activity-heading"
              className="mb-3 flex items-center gap-2 text-base font-extrabold text-foreground"
            >
              <Activity className="h-5 w-5 text-learning" /> Hoạt động học tập
              gần đây
            </h2>
            {recent.isPending ? (
              <RegionState variant="loading" title="Đang tải hoạt động" />
            ) : recent.isError ? (
              <RegionState
                variant="error"
                title="Chưa thể tải hoạt động"
                action={
                  <Button
                    variant="secondary"
                    onClick={() => void recent.refetch()}
                  >
                    Thử lại
                  </Button>
                }
              />
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có ActivitySession hoàn thành.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {activities.map((item) => (
                  <li key={item.sessionId} className="flex gap-2 py-3">
                    <Zap
                      className="mt-1 h-4 w-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-bold">{item.fullName}</span>{" "}
                        {item.status === "COMPLETED"
                          ? "vừa hoàn thành"
                          : "vừa kết thúc thử thách"}{" "}
                        <span className="font-semibold">
                          {item.activityName}
                        </span>
                        .
                      </p>
                      {/* <p className="mt-1 text-xs text-muted-foreground">
                        {item.completedAt.replace("T", " ").slice(0, 10)}
                      </p> */}
                    </div>
                    {item.earnedXp != null && (
                      <span className="whitespace-nowrap text-xs font-extrabold text-primary">
                        +{item.earnedXp} XP
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
