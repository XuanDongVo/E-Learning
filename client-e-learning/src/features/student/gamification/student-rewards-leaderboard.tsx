"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Flame, RefreshCw, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentLeaderboardPodium } from "@/components/student-ui/student-leaderboard-podium";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { StudentAvatar } from "@/components/student-ui/student-avatar";
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
  LeaderboardRanking,
} from "@/types/gamification";

const INITIAL_VISIBLE_RANKINGS = 10;

const PERIODS: { key: LeaderboardPeriod; text: string }[] = [
  { key: "TODAY", text: "Hôm nay" },
  { key: "WEEK", text: "Tuần này" },
  { key: "MONTH", text: "Tháng này" },
  { key: "ALL", text: "Tất cả" },
];

function RankingValue({ entry, metric }: { entry: LeaderboardRanking; metric: LeaderboardMetric }) {
  return (
    <span className="student-label tabular-nums text-foreground">
      {entry.value.toLocaleString("vi-VN")} {metric === "XP" ? "XP" : "ngày"}
    </span>
  );
}

function RankRow({ entry, metric }: { entry: LeaderboardRanking; metric: LeaderboardMetric }) {
  return (
    <div
      role="row"
      aria-label={entry.currentStudent ? `Vị trí ${entry.rank} của bạn` : undefined}
      className={cn("student-ranking-row", entry.currentStudent && "student-ranking-row--current")}
    >
      <span role="cell" className="student-meta tabular-nums text-muted-foreground">
        #{entry.rank}
      </span>
      <span role="cell" className="flex min-w-0 items-center gap-2">
        <StudentAvatar className="student-ranking-avatar" fullName={entry.fullName} avatarKey={entry.avatarKey} />
        <span className="min-w-0">
          <span className="student-label block truncate text-foreground">{entry.fullName}</span>
          {entry.currentStudent && <span className="student-meta text-primary">Bạn</span>}
        </span>
      </span>
      <span role="cell" className="student-meta hidden text-muted-foreground sm:block">
        Level {entry.level}
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
  unit: string;
  icon: typeof Trophy;
}) {
  return (
    <PaperSurface className="student-honor-card flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <StudentAvatar className="student-ranking-avatar" fullName={entry.fullName} avatarKey={entry.avatarKey} />
        <div className="min-w-0">
          <p className="student-meta text-primary">{title}</p>
          <p className="student-label truncate text-foreground">{entry.fullName}</p>
          <p className="student-meta text-muted-foreground">
            {entry.value.toLocaleString("vi-VN")} {unit}
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
        <div className="space-y-2">
          <p className="student-meta text-primary">Cộng đồng học tập</p>
          <ScrapbookHeading as="h1" id="leaderboard-page-title" className="student-page-title text-foreground">
            Bảng xếp hạng
          </ScrapbookHeading>
          <p className="student-body max-w-2xl text-muted-foreground">
            Top 50 học viên từ XP và Streak được ghi nhận bởi hệ thống học tập.
          </p>
        </div>
        <Trophy className="hidden h-12 w-12 shrink-0 text-accent sm:block" aria-hidden="true" />
      </PaperSurface>

      <div className="student-rewards-layout">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div role="group" aria-label="Loại xếp hạng" className="student-filter-group">
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
                  {value === "XP" ? "XP" : "Streak"}
                </button>
              ))}
            </div>
            {metric === "XP" && (
              <div role="group" aria-label="Khoảng thời gian XP" className="student-period-group">
                {PERIODS.map(({ key, text }) => (
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
                <button type="button" onClick={() => void ranking.refetch()} className="student-control student-control--action">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" /> Thử lại
                </button>
              }
            />
          ) : data.top.length === 0 ? (
            <RegionState variant="empty" title="Chưa có học viên nào được xếp hạng" />
          ) : (
            <>
              <PaperSurface as="section" variant="lined" className="overflow-hidden">
                <div className="student-podium-wrap">
                  <StudentLeaderboardPodium entries={data.top.slice(0, 3)} metric={metric} />
                </div>
                <h2 className="student-card-title border-t-2 border-ink px-4 py-3 text-foreground">
                  Danh sách Top {showAllRankings ? totalRankings : visibleRankings.length}
                </h2>
                <div role="table" aria-label="Bảng xếp hạng học viên">
                  <div role="row" className="student-ranking-row student-ranking-header">
                    <span role="columnheader">Hạng</span>
                    <span role="columnheader">Học viên</span>
                    <span role="columnheader" className="hidden sm:block">Level</span>
                    <span role="columnheader" className="text-right">{metric === "XP" ? "XP" : "Streak"}</span>
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
                      ? "Thu gọn về Top 10"
                      : `Hiển thị thêm ${hiddenRankingsCount} người`}
                  </button>
                )}
              </PaperSurface>

              {selfOutside && (
                <PaperSurface as="section" tape className="p-4" aria-label="Vị trí riêng của bạn">
                  <p className="student-meta mb-2 text-primary">Vị trí của bạn · Ngoài Top 50</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="student-label text-foreground">#{selfOutside.rank} · {selfOutside.fullName}</p>
                      <p className="student-meta text-muted-foreground">Level {selfOutside.level}</p>
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
              <Trophy className="h-6 w-6 text-accent" aria-hidden="true" /> Đại sảnh danh vọng
            </ScrapbookHeading>
            {honors.isPending ? (
              <RegionState variant="loading" title="Đang tải danh hiệu" />
            ) : honors.isError ? (
              <RegionState
                variant="error"
                title="Chưa thể tải danh hiệu"
                action={<button type="button" onClick={() => void honors.refetch()} className="student-control student-control--quiet">Thử lại</button>}
              />
            ) : !honorData?.xpChampion && !honorData?.streakChampion ? (
              <RegionState variant="empty" title="Chưa có danh hiệu" />
            ) : (
              <>
                {honorData.xpChampion && <HonorCard title="Bậc thầy tri thức" entry={honorData.xpChampion} unit="XP" icon={Trophy} />}
                {honorData.streakChampion && <HonorCard title="Huyền thoại không nghỉ" entry={honorData.streakChampion} unit="ngày" icon={Flame} />}
              </>
            )}
          </section>

          <PaperSurface as="section" aria-labelledby="recent-activity-heading" className="p-4">
            <h2 id="recent-activity-heading" className="student-card-title mb-3 flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-learning" aria-hidden="true" /> Hoạt động học tập gần đây
            </h2>
            {recent.isPending ? (
              <RegionState variant="loading" title="Đang tải hoạt động" />
            ) : recent.isError ? (
              <RegionState
                variant="error"
                title="Chưa thể tải hoạt động"
                action={<button type="button" onClick={() => void recent.refetch()} className="student-control student-control--quiet">Thử lại</button>}
              />
            ) : activities.length === 0 ? (
              <p className="student-body text-muted-foreground">Chưa có ActivitySession hoàn thành.</p>
            ) : (
              <ul className="divide-y divide-border">
                {activities.map((item) => (
                  <li key={item.sessionId} className="flex gap-2 py-3">
                    <Zap className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <p className="student-body min-w-0 flex-1 text-foreground">
                      <span className="font-bold">{item.fullName}</span>{" "}
                      {item.status === "COMPLETED" ? "vừa hoàn thành" : "vừa kết thúc thử thách"}{" "}
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
