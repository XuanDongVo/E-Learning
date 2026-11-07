"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Flame, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { cn } from "@/lib/utils";
import { SketchProgress } from "@/components/student-ui/sketch-progress";

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
// JavaScript UTC weekdays for a Monday-based, seven-day calendar.
function dayAt(start: string, offset: number) {
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return {
    date: date.toISOString().slice(0, 10),
    day: date.getUTCDate(),
  };
}

export function StudentStreakOverview() {
  const profile = useQuery({
    queryKey: QUERY_KEYS.studentGamificationProfile,
    queryFn: studentGamificationService.profile,
  });
  const streak = useQuery({
    queryKey: QUERY_KEYS.studentStreak,
    queryFn: studentGamificationService.streak,
  });

  if (profile.isPending || streak.isPending) {
    return <RegionState variant="loading" title="Đang tải chuỗi ngày học và Level" />;
  }
  if (profile.isError || streak.isError || !profile.data?.data || !streak.data?.data) {
    return (
      <RegionState
        variant="error"
        title="Chưa thể tải thành tích"
        description="Bạn vẫn có thể học bình thường. Hãy thử tải lại thành tích."
        action={
          <Button type="button" variant="secondary" onClick={() => {
            void profile.refetch();
            void streak.refetch();
          }}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Thử lại
          </Button>
        }
      />
    );
  }

  const level = profile.data.data;
  const run = streak.data.data;
  const earnedDays = new Set(run.qualifiedDates);
  const days = Array.from({ length: 7 }, (_, index) => ({
    ...dayAt(run.weekStartDate, index),
    label: index === 6 ? "CN" : WEEK_DAYS[index],
  }));
  const weeklyCount = days.filter((day) => earnedDays.has(day.date)).length;
  const totalForLevel = level.nextLevelRequiredXp - level.currentLevelStartXp;
  const progress = totalForLevel > 0
    ? Math.min(100, Math.max(0, level.xpIntoCurrentLevel / totalForLevel * 100))
    : 0;
  const upcoming = run.milestones.find((milestone) => !milestone.awarded);

  return (
    <section aria-label="Thành tích học tập của bạn" className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="student-paper student-streak-card min-w-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
            Chuỗi ngày học
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {run.qualifiedToday ? "Đã học hôm nay" : "Chưa học hôm nay"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
            <Flame className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-3xl font-extrabold tabular-nums text-foreground">
              {run.currentStreak} <span className="text-base">ngày</span>
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              Dài nhất {run.longestStreak} ngày
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2" aria-label="Lịch học từ thứ Hai đến Chủ nhật">
          {days.map((day) => {
            const done = earnedDays.has(day.date);
            const today = day.date === run.todayDate;
            return (
              <div key={day.date} className="flex min-w-0 flex-col items-center gap-2">
                <span className={cn("text-xs font-semibold", today ? "text-primary" : "text-muted-foreground")}>
                  {day.label}
                </span>
                <span
                  title={`${day.date}: ${done ? "đã hoàn thành Activity" : "chưa hoàn thành Activity"}`}
                  aria-label={`${day.date}: ${done ? "đã học" : "chưa học"}${today ? ", hôm nay" : ""}`}
                  className={cn(
                    "flex aspect-square w-full max-w-11 items-center justify-center rounded-full border-2 text-sm font-extrabold tabular-nums",
                    done ? "border-accent bg-accent/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground",
                    today && "ring-2 ring-learning ring-offset-2 ring-offset-card",
                  )}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : day.day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-bold text-foreground">Tuần này {weeklyCount}/7 ngày</span>
          <span className="text-muted-foreground">
            {run.qualifiedToday ? "Hẹn gặp bạn ngày mai!" : "Hoàn thành 1 Activity để ghi nhận hôm nay"}
          </span>
        </div>
        <div className="mt-2">
          <SketchProgress value={weeklyCount} max={7} label="Số ngày học trong tuần" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Mỗi ngày chỉ cần hoàn thành một Activity để giữ chuỗi.
          {upcoming ? ` Mốc tiếp theo: ${upcoming.days} ngày (+${upcoming.xp} XP).` : ""}
        </p>
      </div>

      <div className="student-paper student-streak-card min-w-0 p-4 sm:p-5">
        <div className="student-streak-heading flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-foreground">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          Cấp độ học tập
        </div>
        <div className="mt-5">
          <span className="inline-flex rounded-xl border-2 border-ink bg-secondary px-4 py-2 text-2xl font-extrabold text-foreground">
            Level {level.currentLevel}
          </span>
          <p className="mt-4 text-sm font-bold text-foreground">
            {level.lifetimeXp.toLocaleString("vi-VN")} XP đã tích lũy
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Đạt mốc XP tiếp theo để lên Level {level.currentLevel + 1}.
          </p>
        </div>
        <div className="mt-5">
          <SketchProgress value={Math.round(progress)} max={100} label="Tiến độ XP lên cấp" tone="denim" />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
          <span>{level.xpIntoCurrentLevel.toLocaleString("vi-VN")} / {totalForLevel.toLocaleString("vi-VN")} XP</span>
          <span>Còn {level.xpToNextLevel.toLocaleString("vi-VN")} XP</span>
        </div>
      </div>
    </section>
  );
}
