import { Award, Crown, Medal, Sparkles } from "lucide-react";
import type { LeaderboardMetric, LeaderboardRanking } from "@/types/gamification";
import { cn } from "@/lib/utils";

export function StudentLeaderboardPodium({
  entries,
  metric,
}: {
  entries: LeaderboardRanking[];
  metric: LeaderboardMetric;
}) {
  const order = [2, 1, 3]
    .map((rank) => entries.find((entry) => entry.rank === rank))
    .filter((entry): entry is LeaderboardRanking => Boolean(entry));

  if (order.length === 0) return null;

  return (
    <ol className="student-podium" aria-label="Ba vị trí dẫn đầu">
      {order.map((entry) => {
        const isFirst = entry.rank === 1;
        const initial = entry.fullName.trim().charAt(0).toUpperCase() || "?";

        return (
          <li
            key={entry.studentId}
            className={cn(
              "student-podium__place",
              `student-podium__place--rank-${entry.rank}`,
            )}
          >
            {/* Washi tape dán thẻ Hạng 1 */}
            {isFirst && <span className="student-washi student-washi--center" aria-hidden="true" />}

            {/* Cụm Avatar + Icon Sticker + Ring + Rank Badge */}
            <div className={cn("student-podium__avatar-wrap", `student-podium__avatar-wrap--rank-${entry.rank}`)}>
              
              {/* --- STICKER ICON THEO TỪNG HẠNG --- */}
              {entry.rank === 1 && (
                <div className="student-podium__icon-sticker student-podium__icon-sticker--gold" aria-hidden="true">
                  <Crown className="w-6 h-6 text-amber-500 fill-amber-400 stroke-[2.2]" />
                  <Sparkles className="w-4.5 h-4.5 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
                </div>
              )}

              {entry.rank === 2 && (
                <div className="student-podium__icon-sticker student-podium__icon-sticker--silver" aria-hidden="true">
                  <Medal className="w-5 h-5 text-slate-600 fill-slate-200 stroke-[2.2]" />
                </div>
              )}

              {entry.rank === 3 && (
                <div className="student-podium__icon-sticker student-podium__icon-sticker--bronze" aria-hidden="true">
                  <Award className="w-5 h-5 text-amber-800 fill-amber-600/30 stroke-[2.2]" />
                </div>
              )}

              {/* Vòng Ring bao quanh Avatar */}
              <div className="student-podium__ring">
                <span className="student-podium__portrait" aria-hidden="true">
                  {initial}
                </span>
              </div>

              {/* Huy hiệu số thứ hạng ở góc dưới */}
              <span
                className={cn("student-podium__rank-badge", `student-podium__rank-badge--rank-${entry.rank}`)}
                aria-label={`Hạng ${entry.rank}`}
              >
                {entry.rank}
              </span>
            </div>

            {/* Tên học sinh */}
            <span
              className={cn(
                "student-label w-full truncate text-center px-1 font-bold",
                isFirst ? "text-base" : "text-sm",
              )}
              title={entry.fullName}
            >
              {entry.fullName}
            </span>

            {/* Con dấu XP */}
            <span className={cn("student-podium__xp-pill", isFirst && "student-podium__xp-pill--first")}>
              {entry.value.toLocaleString("vi-VN")} {metric === "XP" ? "XP" : "ngày"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
