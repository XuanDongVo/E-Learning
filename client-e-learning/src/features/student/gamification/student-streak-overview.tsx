"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentGamificationService } from "@/services/student/student-gamification.service";

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
    return <RegionState variant="loading" title="Đang tải thành tích của bạn" />;
  }
  if (profile.isError || streak.isError || !profile.data?.data || !streak.data?.data) {
    return (
      <RegionState
        variant="error"
        title="Chưa thể tải Streak và Level"
        description="Thành tích chưa được cập nhật trên màn hình. Hãy thử lại."
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

  const current = profile.data.data;
  const run = streak.data.data;
  const levelSpan = current.nextLevelRequiredXp - current.currentLevelStartXp;
  const progress = levelSpan > 0 ? Math.min(100, Math.max(0, current.xpIntoCurrentLevel / levelSpan * 100)) : 0;
  const next = run.milestones.find((milestone) => !milestone.awarded);

  return (
    <section aria-labelledby="student-streak-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-accent">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Thành tích thực của bạn
          </p>
          <h2 id="student-streak-heading" className="mt-1 text-xl font-extrabold text-foreground">
            Chuỗi học tập và cấp độ
          </h2>
        </div>
        <Link href="/student/units" className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">
          Luyện tập hôm nay
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-pop-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Streak hiện tại</p>
              <p className="text-3xl font-extrabold tabular-nums text-foreground">{run.currentStreak} ngày</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {run.qualifiedToday
              ? "Bạn đã hoàn thành Activity hôm nay. Tiếp tục vào ngày mai nhé!"
              : run.currentStreak > 0
                ? "Hoàn thành ít nhất một Activity hôm nay để giữ chuỗi."
                : "Hoàn thành một Activity để bắt đầu chuỗi ngày học mới."}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-accent" aria-hidden="true" />
            Chuỗi dài nhất: {run.longestStreak} ngày
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Các mốc thưởng Streak">
            {run.milestones.map((milestone) => (
              <div key={milestone.days} className="rounded-xl bg-secondary px-2 py-3 text-center">
                <p className="text-sm font-extrabold text-foreground">{milestone.days} ngày</p>
                <p className="mt-1 text-xs font-semibold text-accent">+{milestone.xp} XP</p>
                <p className="mt-1 text-xs text-muted-foreground">{milestone.awarded ? "Đã nhận" : "Chưa đạt"}</p>
              </div>
            ))}
          </div>
          {next ? <p className="mt-3 text-xs text-muted-foreground">Mốc thưởng tiếp theo: {next.days} ngày (+{next.xp} XP).</p> : null}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-pop-sm">
          <p className="text-sm font-semibold text-muted-foreground">Cấp độ hiện tại</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">Level {current.currentLevel}</p>
          <p className="mt-2 text-sm font-semibold text-accent">{current.lifetimeXp.toLocaleString("vi-VN")} Lifetime XP</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Tiến độ lên Level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <div className="h-full rounded-full bg-learning" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>{current.xpIntoCurrentLevel.toLocaleString("vi-VN")} / {levelSpan.toLocaleString("vi-VN")} XP trong Level</span>
            <span>Còn {current.xpToNextLevel.toLocaleString("vi-VN")} XP đến Level {current.currentLevel + 1}</span>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            XP từ Activity và mốc Streak đều đóng góp vào Level. Không có thưởng XP riêng khi lên cấp.
          </p>
        </div>
      </div>
    </section>
  );
}
