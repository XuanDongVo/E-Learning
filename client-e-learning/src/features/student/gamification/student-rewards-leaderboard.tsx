"use client";

import { useLocale, useTranslations } from "next-intl";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Flame, RefreshCw, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { StudentLeaderboardPodium } from "@/components/student-ui/student-leaderboard-podium";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { StudentAvatar } from "@/components/student-ui/student-avatar";
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
  LeaderboardRanking,
} from "@/types/gamification";

const INITIAL_VISIBLE_RANKINGS = 10;

const PERIODS: LeaderboardPeriod[] = ["TODAY", "WEEK", "MONTH", "ALL"];

function RankingValue({ entry, metric }: { entry: LeaderboardRanking; metric: LeaderboardMetric }) {
  const t = useTranslations("student.leaderboard");
  const locale = useLocale();
  return (
    <span className="student-label tabular-nums text-foreground">
      {metric === "XP" ? `${entry.value.toLocaleString(locale)} XP` : t("days", { count: entry.value })}
    </span>
  );
}

function RankRow({ entry, metric }: { entry: LeaderboardRanking; metric: LeaderboardMetric }) {
  const t = useTranslations("student.leaderboard");
  return (
    <div
      role="row"
      aria-label={entry.currentStudent ? t("yourRankAria", { rank: entry.rank }) : undefined}
      className={cn("student-ranking-row", entry.currentStudent && "student-ranking-row--current")}
    >
      <span role="cell" className="student-meta tabular-nums text-muted-foreground">
        #{entry.rank}
      </span>
      <span role="cell" className="flex min-w-0 items-center gap-2">
        <StudentAvatar className="student-ranking-avatar" fullName={entry.fullName} avatarKey={entry.avatarKey} />
        <span className="min-w-0">
          <span className="student-label block truncate text-foreground">{entry.fullName}</span>
          {entry.currentStudent && <span className="student-meta text-primary">{t("you")}</span>}
        </span>
      </span>
      <span role="cell" className="student-meta hidden text-muted-foreground sm:block">
        {t("level", { level: entry.level })}
      </span>
      <span role="cell" className="text-right">
        <RankingValue entry={entry} metric={metric} />
      </span>
    </div>
  );
}

function HonorCard({
  title,
  entry,
  unit,
  icon: Icon,
}: {
  title: string;
  entry: LeaderboardRanking;
  unit: "XP" | "days";
  icon: typeof Trophy;
}) {
  const t = useTranslations("student.leaderboard");
  const locale = useLocale();
  return (
    <PaperSurface className="student-honor-card flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <StudentAvatar className="student-ranking-avatar" fullName={entry.fullName} avatarKey={entry.avatarKey} />
        <div className="min-w-0">
          <p className="student-meta text-primary">{title}</p>
          <p className="student-label truncate text-foreground">{entry.fullName}</p>
          <p className="student-meta text-muted-foreground">
            {unit === "XP" ? `${entry.value.toLocaleString(locale)} XP` : t("days", { count: entry.value })}
          </p>
        </div>
      </div>
      <span className="student-honor-card__mark">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </PaperSurface>
  );
}

export function StudentRewardsLeaderboard() {
  const t = useTranslations("student.leaderboard");
  const [metric, setMetric] = useState<LeaderboardMetric>("XP");
  const [period, setPeriod] = useState<LeaderboardPeriod>("TODAY");
  const [showAllRankings, setShowAllRankings] = useState(false);
  const effectivePeriod = metric === "XP" ? period : "ALL";

  const ranking = useQuery({
    queryKey: ["student", "leaderboard", metric, effectivePeriod],
    queryFn: () => studentGamificationService.leaderboard(metric, effectivePeriod),
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
  const selfOutside = data?.currentStudent && !data.currentStudentInTop ? data.currentStudent : null;
  const honorData = honors.data?.data;
  const activities = recent.data?.data?.items ?? [];
  const totalRankings = data?.top.length ?? 0;
  const hiddenRankingsCount = Math.max(0, totalRankings - INITIAL_VISIBLE_RANKINGS);
  const visibleRankings = showAllRankings
    ? (data?.top ?? [])
    : (data?.top.slice(0, INITIAL_VISIBLE_RANKINGS) ?? []);

  return (
    <section aria-labelledby="leaderboard-page-title" className="student-rewards space-y-6 pb-8">
      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-rewards-hero">
        <StudentPageHeading
          eyebrow={t("hero.eyebrow")}
          titleId="leaderboard-page-title"
          title={<>{t("hero.prefix")} <span className="student-highlight">{t("hero.highlight")}</span></>}
          description={t("hero.description")}
          artwork={<StudentIllustration id="illustration.leaderboard-podium" decorative className="w-36 lg:w-48" />}
          artworkClassName="hidden sm:block"
          className="w-full"
        />
      </PaperSurface>

      <div className="student-rewards-layout">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div role="group" aria-label={t("metricLabel")} className="student-filter-group">
              {(["XP", "STREAK"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={metric === value}
                  onClick={() => {
                    setMetric(value);
                    setShowAllRankings(false);
                  }}
                  className={cn("student-control px-5", metric === value ? "student-filter-active" : "student-control--quiet")}
                >
                  {value === "XP" ? "XP" : t("streak")}
                </button>
              ))}
            </div>
            {metric === "XP" && (
              <div role="group" aria-label={t("periodLabel")} className="student-period-group">
                {PERIODS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={period === key}
                    onClick={() => {
                      setPeriod(key);
                      setShowAllRankings(false);
                    }}
                    className={cn("student-control px-3", period === key ? "student-filter-active" : "student-control--quiet")}
                  >
                    {t(`periods.${key}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {ranking.isPending ? (
            <RegionState variant="loading" title={t("loading")} />
          ) : ranking.isError || !data ? (
            <RegionState
              variant="error"
              title={t("loadError")}
              description={t("tryAgain")}
              action={
                <button type="button" onClick={() => void ranking.refetch()} className="student-control student-control--action">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t("retry")}
                </button>
              }
            />
          ) : data.top.length === 0 ? (
            <RegionState variant="empty" title={t("empty")} />
          ) : (
            <>
              <PaperSurface as="section" variant="lined" className="overflow-hidden">
                <div className="student-podium-wrap">
                  <StudentLeaderboardPodium entries={data.top.slice(0, 3)} metric={metric} />
                </div>
                <h2 className="student-card-title border-t-2 border-ink px-4 py-3 text-foreground">
                  {t("topList", { count: showAllRankings ? totalRankings : visibleRankings.length })}
                </h2>
                <div role="table" aria-label={t("tableLabel")}>
                  <div role="row" className="student-ranking-row student-ranking-header">
                    <span role="columnheader">{t("rank")}</span>
                    <span role="columnheader">{t("student")}</span>
                    <span role="columnheader" className="hidden sm:block">{t("levelHeader")}</span>
                    <span role="columnheader" className="text-right">{metric === "XP" ? "XP" : t("streak")}</span>
                  </div>
                  {visibleRankings.map((entry) => (
                    <RankRow key={entry.studentId} entry={entry} metric={metric} />
                  ))}
                </div>
                {hiddenRankingsCount > 0 && (
                  <button
                    type="button"
                    aria-expanded={showAllRankings}
                    onClick={() => setShowAllRankings((current) => !current)}
                    className="student-control student-control--quiet flex min-h-11 w-full items-center justify-center border-t-2 border-ink px-4 py-3 text-center"
                  >
                    {showAllRankings
                      ? t("collapse")
                      : t("expand", { count: hiddenRankingsCount })}
                  </button>
                )}
              </PaperSurface>

              {selfOutside && (
                <PaperSurface as="section" tape className="p-4" aria-label={t("outsideLabel")}>
                  <p className="student-meta mb-2 text-primary">{t("outside")}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="student-label text-foreground">#{selfOutside.rank} · {selfOutside.fullName}</p>
                      <p className="student-meta text-muted-foreground">{t("level", { level: selfOutside.level })}</p>
                    </div>
                    <RankingValue entry={selfOutside} metric={metric} />
                  </div>
                </PaperSurface>
              )}
            </>
          )}
        </div>

        <aside className="min-w-0 space-y-5">
          <section aria-labelledby="hall-of-fame-heading" className="space-y-3">
            <ScrapbookHeading as="h2" id="hall-of-fame-heading" className="student-section-title flex items-center gap-2 text-foreground">
              <Trophy className="h-6 w-6 text-accent" aria-hidden="true" /> {t("honorsTitle")}
            </ScrapbookHeading>
            {honors.isPending ? (
              <RegionState variant="loading" title={t("honorsLoading")} />
            ) : honors.isError ? (
              <RegionState
                variant="error"
                title={t("honorsError")}
                action={<button type="button" onClick={() => void honors.refetch()} className="student-control student-control--quiet">{t("retry")}</button>}
              />
            ) : !honorData?.xpChampion && !honorData?.streakChampion ? (
              <RegionState variant="empty" title={t("honorsEmpty")} />
            ) : (
              <>
                {honorData.xpChampion && <HonorCard title={t("xpChampion")} entry={honorData.xpChampion} unit="XP" icon={Trophy} />}
                {honorData.streakChampion && <HonorCard title={t("streakChampion")} entry={honorData.streakChampion} unit="days" icon={Flame} />}
              </>
            )}
          </section>

          <PaperSurface as="section" aria-labelledby="recent-activity-heading" className="p-4">
            <h2 id="recent-activity-heading" className="student-card-title mb-3 flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-learning" aria-hidden="true" /> {t("recentTitle")}
            </h2>
            {recent.isPending ? (
              <RegionState variant="loading" title={t("recentLoading")} />
            ) : recent.isError ? (
              <RegionState
                variant="error"
                title={t("recentError")}
                action={<button type="button" onClick={() => void recent.refetch()} className="student-control student-control--quiet">{t("retry")}</button>}
              />
            ) : activities.length === 0 ? (
              <p className="student-body text-muted-foreground">{t("recentEmpty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {activities.map((item) => (
                  <li key={item.sessionId} className="flex gap-2 py-3">
                    <Zap className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <p className="student-body min-w-0 flex-1 text-foreground">
                      <span className="font-bold">{item.fullName}</span>{" "}
                      {item.status === "COMPLETED" ? t("recentCompleted") : t("recentEnded")}{" "}
                      <span className="font-semibold">{item.activityName}</span>.
                    </p>
                    {item.earnedXp != null && <span className="student-meta whitespace-nowrap text-primary">+{item.earnedXp} XP</span>}
                  </li>
                ))}
              </ul>
            )}
          </PaperSurface>
        </aside>
      </div>
    </section>
  );
}
