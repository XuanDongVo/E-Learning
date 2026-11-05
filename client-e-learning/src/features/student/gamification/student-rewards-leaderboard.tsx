"use client";

import { useMemo, useState } from "react";
import { Flame, Megaphone, Trophy, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
import { LeaderboardRankings } from "@/components/ui/leaderboard-rankings";
import {
  avatarUrlFromKey,
  mockCurrentGamificationProfile,
  mockHallOfFame,
  mockRecentActivities,
  mockStreakLeaderboard,
} from "@/mock/gamification";
import type { LeaderboardTab } from "@/types/gamification";

const TABS: { id: LeaderboardTab; label: string }[] = [
  { id: "xp", label: "XP" },
  { id: "time", label: "Time" },
  { id: "streak", label: "Streak" },
  { id: "share", label: "Chia sẻ" },
];

/** Map mock data → shape của Trophy UI */
function toTrophyRanking(entry: (typeof mockStreakLeaderboard)[number]) {
  // valueLabel thường dạng "15 ngày" → lấy số ngày
  const numericValue =
    typeof (entry as any).value === "number"
      ? (entry as any).value
      : parseInt(String(entry.valueLabel).replace(/\D/g, ""), 10) || 0;

  return {
    userId: entry.studentId,
    userName: entry.fullName,
    rank: entry.rank,
    value: numericValue,
    avatarUrl: avatarUrlFromKey(entry.avatarKey),
    byline: entry.valueLabel, // hiển thị "15 ngày" dưới tên
    displayed: true,
  };
}

export function StudentRewardsLeaderboard() {
  const [tab, setTab] = useState<LeaderboardTab>("streak");

  // Hiện tại mock chỉ có streak → sau này có thể switch theo tab
  const allEntries = mockStreakLeaderboard;

  const podiumRankings = useMemo(
    () => allEntries.slice(0, 3).map(toTrophyRanking),
    [allEntries],
  );

  const rankings = useMemo(() => allEntries.map(toTrophyRanking), [allEntries]);

  const currentUserId =
    allEntries.find((e) => e.isCurrentUser)?.studentId ?? undefined;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Hall of Fame
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-dark sm:text-3xl">
            Bảng xếp hạng
          </h1>
          <p className="mt-1 text-sm text-neutral-muted">
            Vinh danh học viên kiên trì, chăm chỉ và lan tỏa tri thức mỗi ngày.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Trophy className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 rounded-full bg-background-app p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  tab === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-neutral-muted hover:text-neutral-dark",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Podium – Trophy UI */}
          <div className="rounded-2xl border border-border-color bg-card-bg p-4 sm:p-6">
            <LeaderboardPodium
              rankings={podiumRankings}
              spacing="normal" 
              size="default" 
              valueUnit="XP"
            />
          </div>

          {/* Rankings list – Trophy UI */}
          <div className="overflow-hidden rounded-2xl border border-border-color bg-card-bg">
            <LeaderboardRankings
              rankings={rankings}
              currentUserId={currentUserId}
              showPagination={false}
              // Có thể bật pagination sau:
              // showPagination
              // defaultPageSize={10}
            />
          </div>
        </div>

        {/* Side column – giữ nguyên brand */}
        <div className="space-y-4">
          {/* Hall of Fame */}
          <div className="rounded-2xl border border-border-color bg-card-bg p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-dark">
              <Trophy className="h-4 w-4 text-amber-500" />
              Đại sảnh danh vọng
            </h2>
            <ul className="space-y-3">
              {mockHallOfFame.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center gap-3 rounded-xl border border-border-color bg-background-app/50 p-3"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={avatarUrlFromKey(item.avatarKey)}
                      alt={item.studentName}
                    />
                    <AvatarFallback>
                      {item.studentName.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted">
                      {item.title}
                    </p>
                    <p className="truncate text-sm font-bold text-neutral-dark">
                      {item.studentName}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {item.valueLabel}
                    </p>
                  </div>
                  {item.icon === "trophy" && (
                    <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                  {item.icon === "fire" && (
                    <Flame className="h-5 w-5 shrink-0 text-orange-500" />
                  )}
                  {item.icon === "megaphone" && (
                    <Megaphone className="h-5 w-5 shrink-0 text-sky-500" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-border-color bg-card-bg p-4">
            <h2 className="mb-3 text-sm font-bold text-neutral-dark">
              Hoạt động học tập gần đây
            </h2>
            <ul className="space-y-2">
              {mockRecentActivities.map((act) => (
                <li
                  key={act.id}
                  className="rounded-xl border border-border-color bg-background-app/40 px-3 py-2"
                >
                  <p className="text-sm text-neutral-dark">
                    <span className="font-semibold">{act.actorName}</span>{" "}
                    {act.message}
                    {act.badgeLabel && (
                      <span className="ml-1 inline-flex rounded-md bg-primary-light px-1.5 py-0.5 text-xs font-bold text-primary">
                        {act.badgeLabel}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-muted">
                    {act.minutesAgo} phút trước
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Current user summary */}
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary-light/30 p-4 text-sm">
            <p className="font-semibold text-primary">
              Dữ liệu mẫu (presentation)
            </p>
            <p className="mt-1 text-neutral-muted">
              Level {mockCurrentGamificationProfile.currentLevel} ·{" "}
              {mockCurrentGamificationProfile.lifetimeXp.toLocaleString(
                "vi-VN",
              )}{" "}
              XP · Streak {mockCurrentGamificationProfile.currentStreak} ngày
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
