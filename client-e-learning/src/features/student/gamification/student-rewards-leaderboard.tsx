"use client";

import {
  Clock3,
  Flame,
  Megaphone,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
import { LeaderboardRankings } from "@/components/ui/leaderboard-rankings";
import { cn } from "@/lib/utils";
import {
  avatarUrlFromKey,
  mockHallOfFame,
  mockRecentActivities,
  mockStreakLeaderboard,
} from "@/mock/gamification";
import type { HallOfFameItem, LeaderboardTab } from "@/types/gamification";

const TABS: {
  id: LeaderboardTab;
  label: string;
  available: boolean;
}[] = [
  { id: "xp", label: "XP", available: false },
  { id: "time", label: "Thời gian", available: false },
  { id: "streak", label: "Chuỗi ngày", available: true },
  { id: "share", label: "Lan tỏa", available: false },
];

const HALL_OF_FAME_ICON: Record<HallOfFameItem["icon"], typeof Trophy> = {
  trophy: Trophy,
  fire: Flame,
  megaphone: Megaphone,
};

const HALL_OF_FAME_ICON_STYLE: Record<HallOfFameItem["icon"], string> = {
  trophy: "bg-warning-soft text-warning",
  fire: "bg-primary-soft text-primary",
  megaphone: "bg-info-soft text-info",
};

function toTrophyRanking(entry: (typeof mockStreakLeaderboard)[number]) {
  return {
    userId: entry.studentId,
    userName: entry.fullName,
    rank: entry.rank,
    value: entry.value,
    avatarUrl: avatarUrlFromKey(entry.avatarKey),
    byline: entry.valueLabel,
    displayed: true,
  };
}

export function StudentRewardsLeaderboard() {
  const podiumRankings = mockStreakLeaderboard.slice(0, 3).map(toTrophyRanking);
  const rankings = mockStreakLeaderboard.map(toTrophyRanking);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Khu vực thi đua
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Bảng xếp hạng
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Bản xem trước · Dữ liệu xếp hạng và thành tích cộng đồng bên dưới chỉ để minh họa.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <section aria-labelledby="ranking-filter-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2
                  id="ranking-filter-heading"
                  className="font-bold text-foreground"
                >
                  Xếp hạng theo
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Các tiêu chí khác sẽ xuất hiện khi có dữ liệu.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                Top {rankings.length}
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Tiêu chí xếp hạng"
              className="grid grid-cols-2 gap-2 rounded-xl border-2 border-ink bg-card p-2 shadow-pop sm:grid-cols-4"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`${tab.id}-ranking-tab`}
                  type="button"
                  role="tab"
                  aria-selected={tab.available}
                  aria-controls={tab.available ? "streak-leaderboard" : undefined}
                  disabled={!tab.available}
                  title={tab.available ? undefined : "Sắp ra mắt"}
                  className={cn(
                    "min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tab.available
                      ? "bg-primary text-primary-foreground shadow-pop-sm"
                      : "cursor-not-allowed text-muted-foreground opacity-60",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          <section
            id="streak-leaderboard"
            role="tabpanel"
            aria-labelledby="streak-ranking-tab"
            className="overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-pop"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2
                  id="streak-ranking-heading"
                  className="font-extrabold text-foreground"
                >
                  Chuỗi học tập dài nhất
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Số ngày học liên tiếp của các học viên.
                </p>
              </div>
              <Flame
                className="h-6 w-6 shrink-0 text-primary"
                aria-hidden="true"
              />
            </div>

            <div className="bg-secondary/40 px-3 pb-0 pt-8 sm:px-6 sm:pt-10">
              <LeaderboardPodium
                rankings={podiumRankings}
                spacing="normal"
                size="default"
                valueUnit="ngày"
              />
            </div>

            <div className="border-t border-border px-4 py-3 sm:px-5">
              <h3 className="text-sm font-bold text-foreground">
                Toàn bộ thứ hạng
              </h3>
            </div>
            <LeaderboardRankings
              rankings={rankings}
              showPagination={false}
              className="rounded-none border-0"
            />
          </section>
        </div>

        <aside className="space-y-5">
          <section
            aria-labelledby="hall-of-fame-heading"
            className="rounded-2xl border-2 border-ink bg-card p-4 shadow-pop"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="hall-of-fame-heading"
                  className="font-extrabold text-foreground"
                >
                  Dấu ấn nổi bật
                </h2>
                <p className="text-xs text-muted-foreground">
                  Thành tích đáng nhớ của cộng đồng
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {mockHallOfFame.map((item) => {
                const Icon = HALL_OF_FAME_ICON[item.icon];

                return (
                  <li key={item.title} className="flex items-center gap-3 py-3">
                    <Avatar className="h-10 w-10 shrink-0 border border-border">
                      <AvatarImage
                        src={avatarUrlFromKey(item.avatarKey)}
                        alt={`Ảnh đại diện của ${item.studentName}`}
                      />
                      <AvatarFallback>
                        {item.studentName.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="truncate text-sm font-bold text-foreground">
                        {item.studentName}
                      </p>
                      <p className="text-sm font-extrabold tabular-nums text-primary">
                        {item.valueLabel}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        HALL_OF_FAME_ICON_STYLE[item.icon],
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            aria-labelledby="recent-activity-heading"
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-soft text-info">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="recent-activity-heading"
                  className="font-extrabold text-foreground"
                >
                  Nhịp học gần đây
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cập nhật mới từ các học viên
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {mockRecentActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-foreground">
                      <span className="font-bold">{activity.actorName}</span>{" "}
                      {activity.message}
                      {activity.badgeLabel ? (
                        <span className="ml-1 inline-flex rounded-md bg-primary-soft px-1.5 py-0.5 text-xs font-bold text-primary">
                          {activity.badgeLabel}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.minutesAgo} phút trước
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <p className="rounded-xl border border-dashed border-border px-4 py-3 text-xs leading-5 text-muted-foreground">
            Đây là bản xem trước bằng dữ liệu trình bày. Thành tích thực sẽ
            được cập nhật khi dịch vụ xếp hạng được kết nối.
          </p>
        </aside>
      </div>
    </div>
  );
}
