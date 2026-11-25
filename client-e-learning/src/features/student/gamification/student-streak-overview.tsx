"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Check, Flame, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { cn } from "@/lib/utils";
import { SketchProgress } from "@/components/student-ui/sketch-progress";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
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
  const t = useTranslations("student.progress.streak");
  const locale = useLocale();
  const numberLocale = locale === "en" ? "en-US" : "vi-VN";
  const profile = useQuery({
    queryKey: QUERY_KEYS.studentGamificationProfile,
    queryFn: studentGamificationService.profile,
  });
  const streak = useQuery({
    queryKey: QUERY_KEYS.studentStreak,
    queryFn: studentGamificationService.streak,
  });

  if (profile.isPending || streak.isPending) {
    return <RegionState variant="loading" title={t("loading")} />;
  }
  if (profile.isError || streak.isError || !profile.data?.data || !streak.data?.data) {
    return (
      <RegionState
        variant="error"
        title={t("error")}
        description={t("errorDescription")}
        action={
          <Button type="button" variant="secondary" onClick={() => {
            void profile.refetch();
            void streak.refetch();
          }}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("retry")}
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
    label: t(`weekdays.${WEEKDAY_KEYS[index]}`),
  }));
  const weeklyCount = days.filter((day) => earnedDays.has(day.date)).length;
  const totalForLevel = level.nextLevelRequiredXp - level.currentLevelStartXp;
  const progress = totalForLevel > 0
    ? Math.min(100, Math.max(0, level.xpIntoCurrentLevel / totalForLevel * 100))
    : 0;
  const upcoming = run.milestones.find((milestone) => !milestone.awarded);

  return (
    <section aria-label={t("aria")} className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="student-paper student-streak-card min-w-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
            {t("title")}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {run.qualifiedToday ? t("qualifiedToday") : t("notQualifiedToday")}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
            <Flame className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-3xl font-extrabold tabular-nums text-foreground">
              <span className="text-base">{t("days", { count: run.currentStreak })}</span>
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {t("longest", { count: run.longestStreak })}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2" aria-label={t("calendarAria")}>
          {days.map((day) => {
            const done = earnedDays.has(day.date);
            const today = day.date === run.todayDate;
            return (
              <div key={day.date} className="flex min-w-0 flex-col items-center gap-2">
                <span className={cn("text-xs font-semibold", today ? "text-primary" : "text-muted-foreground")}>
                  {day.label}
                </span>
                <span
                  title={t("dayTooltip", { date: day.date, status: done ? t("dayDone") : t("dayNotDone") })}
                  aria-label={`${t("dayTooltip", { date: day.date, status: done ? t("dayLearned") : t("dayNotLearned") })}${today ? t("todaySuffix") : ""}`}
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
          <span className="font-bold text-foreground">{t("week", { count: weeklyCount })}</span>
          <span className="text-muted-foreground">
            {run.qualifiedToday ? t("seeTomorrow") : t("completeToday")}
          </span>
        </div>
        <div className="mt-2">
          <SketchProgress value={weeklyCount} max={7} label={t("weekProgress")} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("howToStreak")}
          {upcoming ? t("nextMilestone", { days: upcoming.days, xp: upcoming.xp }) : ""}
        </p>
      </div>

      <div className="student-paper student-streak-card min-w-0 p-4 sm:p-5">
        <div className="student-streak-heading flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-foreground">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          {t("levelTitle")}
        </div>
        <div className="mt-5">
          <span className="inline-flex rounded-xl border-2 border-ink bg-secondary px-4 py-2 text-2xl font-extrabold text-foreground">
            {t("level", { level: level.currentLevel })}
          </span>
          <p className="mt-4 text-sm font-bold text-foreground">
            {t("lifetimeXp", { xp: level.lifetimeXp.toLocaleString(numberLocale) })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("nextLevel", { level: level.currentLevel + 1 })}
          </p>
        </div>
        <div className="mt-5">
          <SketchProgress value={Math.round(progress)} max={100} label={t("xpProgress")} tone="denim" />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
          <span>{level.xpIntoCurrentLevel.toLocaleString(numberLocale)} / {totalForLevel.toLocaleString(numberLocale)} XP</span>
          <span>{t("xpRemaining", { xp: level.xpToNextLevel.toLocaleString(numberLocale) })}</span>
        </div>
      </div>
    </section>
  );
}
