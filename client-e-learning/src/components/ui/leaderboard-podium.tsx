"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Hợp đồng dữ liệu xếp hạng
export interface LeaderboardRanking {
  userId: string;
  userName: string | null;
  rank: number; // 1, 2, 3...
  value: number; // Điểm / XP / Số câu đúng
  avatarUrl?: string | null;
}

// Cấu hình podium cho từng hạng (Vàng / Bạc / Đồng)
const PODIUM_CONFIG = {
  1: {
    icon: Crown,
    // Màu chữ & icon
    color: "text-amber-500",
    // Nền bục đứng
    bg: "bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-t-2 border-amber-400",
    badgeBg: "bg-amber-500 text-white shadow-amber-500/30",
    // Vòng ring quanh avatar
    ring: "ring-4 ring-amber-400 ring-offset-2 ring-offset-background shadow-lg shadow-amber-500/20",
    // Chiều cao bục đứng
    height: "h-36 sm:h-40",
    heightSm: "h-24 sm:h-28",
    heightLg: "h-44 sm:h-48",
    avatarScale: "scale-110 sm:scale-115",
  },
  2: {
    icon: Crown,
    color: "text-slate-400",
    bg: "bg-gradient-to-b from-slate-300/25 to-slate-400/10 border-t-2 border-slate-300",
    badgeBg: "bg-slate-400 text-white shadow-slate-400/30",
    ring: "ring-2 ring-slate-300 ring-offset-2 ring-offset-background",
    height: "h-26 sm:h-28",
    heightSm: "h-18 sm:h-20",
    heightLg: "h-32 sm:h-36",
    avatarScale: "scale-100",
  },
  3: {
    icon: Crown,
    color: "text-orange-500",
    bg: "bg-gradient-to-b from-orange-400/25 to-orange-500/10 border-t-2 border-orange-400",
    badgeBg: "bg-orange-500 text-white shadow-orange-500/30",
    ring: "ring-2 ring-orange-400/80 ring-offset-2 ring-offset-background",
    height: "h-20 sm:h-22",
    heightSm: "h-14 sm:h-16",
    heightLg: "h-24 sm:h-28",
    avatarScale: "scale-100",
  },
} as const;

// Variants độ giãn cách và kích thước
const podiumVariants = cva("flex items-end justify-center", {
  variants: {
    spacing: {
      tight: "gap-2 sm:gap-3",
      normal: "gap-3 sm:gap-6",
      wide: "gap-5 sm:gap-10",
    },
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    spacing: "normal",
    size: "default",
  },
});

export interface LeaderboardPodiumProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof podiumVariants> {
  /** Danh sách xếp hạng (tối thiểu 1, thường là top 3) */
  rankings: LeaderboardRanking[];
  /** Hiển thị điểm số / XP dưới tên */
  showValue?: boolean;
  /** Đơn vị hiển thị sau số (ví dụ "XP", "pts", "điểm") */
  valueUnit?: string;
  /** Hiển thị ảnh đại diện */
  showAvatar?: boolean;
  /** Tùy chọn bọc toàn bộ bục vào một Thẻ Card */
  asCard?: boolean;
  /** Tiêu đề thẻ (chỉ dùng khi asCard = true) */
  cardTitle?: string;
}

export const LeaderboardPodium = React.forwardRef<
  HTMLDivElement,
  LeaderboardPodiumProps
>(
  (
    {
      className,
      size = "default",
      spacing = "normal",
      rankings,
      showValue = true,
      valueUnit = "XP",
      showAvatar = true,
      asCard = false,
      cardTitle,
      ...props
    },
    ref
  ) => {
    // Lấy top 3 và xếp thứ tự bục vinh danh: 2nd (Trái) - 1st (Giữa) - 3rd (Phải)
    const top3 = rankings.slice(0, 3);
    const podiumOrder = [
      top3.find((r) => r.rank === 2),
      top3.find((r) => r.rank === 1),
      top3.find((r) => r.rank === 3),
    ].filter(Boolean) as LeaderboardRanking[];

    if (podiumOrder.length === 0) {
      return null;
    }

    const avatarSize = {
      sm: "h-10 w-10 text-xs",
      default: "h-14 w-14 sm:h-16 sm:w-16 text-sm",
      lg: "h-18 w-18 sm:h-22 sm:w-22 text-base",
    }[size ?? "default"];

    const content = (
      <div
        ref={ref}
        className={cn(podiumVariants({ size, spacing }), className)}
        role="list"
        aria-label="Top 3 rankings"
        {...props}
      >
        {podiumOrder.map((ranking) => {
          const rank = ranking.rank as 1 | 2 | 3;
          const config = PODIUM_CONFIG[rank];
          if (!config) return null;

          const isFirst = rank === 1;
          const displayName =
            ranking.userName || `User ${ranking.userId.slice(0, 6)}`;
          const avatarSrc =
            ranking.avatarUrl ??
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
              ranking.userId
            )}`;

          const podiumHeight = {
            sm: config.heightSm,
            default: config.height,
            lg: config.heightLg,
          }[size ?? "default"];

          return (
            <div
              key={ranking.userId}
              role="listitem"
              className={cn(
                "flex flex-col items-center flex-1 max-w-[120px] sm:max-w-[150px] transition-transform",
                isFirst && "z-10"
              )}
            >
              {/* VÙNG AVATAR VÀ RING VÒNG TRÒN */}
              <div
                className={cn(
                  "relative mb-2.5 transition-all duration-300",
                  config.avatarScale
                )}
                aria-hidden="true"
              >
                {/* Vương miện trên đỉnh đầu cho Top 1 */}
                {isFirst && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center animate-bounce">
                    <Crown className="h-6 w-6 text-amber-500 fill-amber-400 drop-shadow-sm" />
                  </div>
                )}

                {/* Avatar có vòng tròn (Ring) */}
                {showAvatar ? (
                  <div className="relative inline-block">
                    <img
                      src={avatarSrc}
                      alt={`${displayName} avatar`}
                      className={cn(
                        "rounded-full object-cover bg-muted transition-all",
                        avatarSize,
                        config.ring // <-- Áp dụng Ring viền tròn màu theo Rank tại đây
                      )}
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full font-bold",
                      avatarSize,
                      config.ring,
                      config.bg
                    )}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Badge số thứ hạng đính góc chân avatar */}
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full font-black shadow-sm ring-2 ring-background",
                    config.badgeBg,
                    size === "sm"
                      ? "h-5 w-5 text-[10px]"
                      : size === "lg"
                        ? "h-7 w-7 text-xs"
                        : "h-6 w-6 text-xs"
                  )}
                >
                  {rank}
                </div>
              </div>

              {/* TÊN HỌC SINH */}
              <span
                className="w-full truncate text-center font-bold text-foreground tracking-tight text-xs sm:text-sm px-1"
                title={displayName}
              >
                {displayName}
              </span>

              {/* GIÁ TRỊ XP / ĐIỂM */}
              {showValue && (
                <div className="flex items-center gap-1 text-muted-foreground font-semibold text-[11px] sm:text-xs tabular-nums mt-0.5 mb-2">
                  {isFirst && <Sparkles className="h-3 w-3 text-amber-500" />}
                  <span>{ranking.value.toLocaleString()}</span>
                  {valueUnit && (
                    <span className="text-[10px] font-normal uppercase opacity-80">
                      {valueUnit}
                    </span>
                  )}
                </div>
              )}

              {/* BỤC ĐỨNG VINH DANH (PODIUM BLOCK) */}
              <div
                aria-hidden="true"
                className={cn(
                  "w-full rounded-t-2xl flex flex-col items-center justify-between pt-2.5 pb-2 transition-all shadow-sm",
                  podiumHeight,
                  config.bg
                )}
              >
                {/* Số La Mã hoặc số hạng lớn in chìm trên bục */}
                <div
                  className={cn(
                    "font-black text-lg sm:text-2xl tracking-tighter opacity-70",
                    config.color
                  )}
                >
                  {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                </div>
                <div className="w-6 h-1 rounded-full bg-current opacity-20" />
              </div>
            </div>
          );
        })}
      </div>
    );

    // Nếu chọn bọc trong Card
    if (asCard) {
      return (
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
          {cardTitle && (
            <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                {cardTitle}
              </h3>
            </div>
          )}
          {content}
        </section>
      );
    }

    return content;
  }
);

LeaderboardPodium.displayName = "LeaderboardPodium";
