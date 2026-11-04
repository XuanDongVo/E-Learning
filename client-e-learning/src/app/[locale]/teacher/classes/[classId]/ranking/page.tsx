"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Crown,
  Flame,
  Minus,
  Trophy,
} from "lucide-react";
import { mockRanking } from "@/mock/mock-teacher-classes";
import { Button } from "@/components/ui/button";

export default function ClassRankingPage() {
  const [period, setPeriod] = useState<"all" | "month" | "week">("all");
  const rankData = mockRanking[period];

  const first = rankData[0];
  const second = rankData[1];
  const third = rankData[2];

  return (
    <div className="space-y-6">
      {/* Header & Filter thời gian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-extrabold">Bảng xếp hạng XP (Leaderboard)</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Theo dõi điểm kinh nghiệm (XP) từ các phiên luyện tập từ vựng và bài tập của học sinh.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            size="sm"
            variant={period === "all" ? "default" : "ghost"}
            onClick={() => setPeriod("all")}
            className="h-8 text-xs font-bold"
          >
            Tất cả
          </Button>
          <Button
            size="sm"
            variant={period === "month" ? "default" : "ghost"}
            onClick={() => setPeriod("month")}
            className="h-8 text-xs font-bold"
          >
            Tháng này
          </Button>
          <Button
            size="sm"
            variant={period === "week" ? "default" : "ghost"}
            onClick={() => setPeriod("week")}
            className="h-8 text-xs font-bold"
          >
            Tuần này
          </Button>
        </div>
      </div>

      {/* Top 3 Podium (Bục vinh danh) */}
      <section className="rounded-lg border border-border bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm">
        <h3 className="text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-6">
          Top 3 Học sinh xuất sắc nhất
        </h3>

        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 max-w-2xl mx-auto">
          {/* Hạng 2: Silver */}
          {second && (
            <div className="flex flex-1 flex-col items-center">
              <span className="grid size-12 place-items-center rounded-full bg-slate-200 border-2 border-slate-300 font-extrabold text-slate-700 shadow-sm text-sm">
                2
              </span>
              <p className="mt-2 text-center font-extrabold text-xs sm:text-sm line-clamp-1">
                {second.fullName}
              </p>
              <span className="mt-0.5 text-xs font-bold text-slate-500">
                {second.xp.toLocaleString()} XP
              </span>

              {/* Bục */}
              <div className="mt-3 w-full h-24 rounded-t-lg bg-slate-200/80 border-t-2 border-slate-300 flex items-center justify-center font-extrabold text-slate-600 text-lg shadow-inner">
                #2
              </div>
            </div>
          )}

          {/* Hạng 1: Gold (Cao nhất) */}
          {first && (
            <div className="flex flex-1 flex-col items-center">
              <Crown className="size-6 text-amber-500 animate-bounce mb-1" />
              <span className="grid size-14 place-items-center rounded-full bg-amber-400 border-2 border-amber-500 font-extrabold text-amber-950 shadow-md text-base">
                1
              </span>
              <p className="mt-2 text-center font-extrabold text-sm sm:text-base text-amber-600 line-clamp-1">
                {first.fullName}
              </p>
              <span className="mt-0.5 text-xs sm:text-sm font-extrabold text-amber-700">
                {first.xp.toLocaleString()} XP
              </span>

              {/* Bục */}
              <div className="mt-3 w-full h-32 rounded-t-lg bg-amber-400/90 border-t-2 border-amber-500 flex items-center justify-center font-extrabold text-amber-950 text-2xl shadow-inner">
                #1
              </div>
            </div>
          )}

          {/* Hạng 3: Bronze */}
          {third && (
            <div className="flex flex-1 flex-col items-center">
              <span className="grid size-12 place-items-center rounded-full bg-amber-700/20 border-2 border-amber-700/40 font-extrabold text-amber-900 shadow-sm text-sm">
                3
              </span>
              <p className="mt-2 text-center font-extrabold text-xs sm:text-sm line-clamp-1">
                {third.fullName}
              </p>
              <span className="mt-0.5 text-xs font-bold text-amber-800">
                {third.xp.toLocaleString()} XP
              </span>

              {/* Bục */}
              <div className="mt-3 w-full h-16 rounded-t-lg bg-amber-700/20 border-t-2 border-amber-700/40 flex items-center justify-center font-extrabold text-amber-900 text-lg shadow-inner">
                #3
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ranking Table */}
      <section className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border p-4">
          <h3 className="font-extrabold text-sm">Bảng điểm xếp hạng đầy đủ</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 uppercase font-bold text-muted-foreground">
              <tr>
                <th className="p-3 pl-4 w-16 text-center">Thứ hạng</th>
                <th className="p-3">Học sinh</th>
                <th className="p-3">Biến động</th>
                <th className="p-3 pr-4 text-right">Tổng XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rankData.map((item) => (
                <tr key={item.studentId} className="hover:bg-muted/30 transition-colors">
                  {/* Rank */}
                  <td className="p-3 pl-4 text-center">
                    <span
                      className={`inline-grid size-7 place-items-center rounded-full font-extrabold text-xs ${
                        item.rank === 1
                          ? "bg-amber-400 text-amber-950"
                          : item.rank === 2
                          ? "bg-slate-200 text-slate-800"
                          : item.rank === 3
                          ? "bg-amber-700/20 text-amber-900"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>

                  {/* Student */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <p className="font-extrabold text-sm text-foreground">{item.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{item.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Change indicator */}
                  <td className="p-3">
                    {item.change === "up" && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                        <ArrowUp className="size-3" /> +{item.changeValue ?? 1}
                      </span>
                    )}
                    {item.change === "down" && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500">
                        <ArrowDown className="size-3" /> -{item.changeValue ?? 1}
                      </span>
                    )}
                    {item.change === "same" && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground font-semibold">
                        <Minus className="size-3" /> Giữ nguyên
                      </span>
                    )}
                  </td>

                  {/* XP */}
                  <td className="p-3 pr-4 text-right">
                    <span className="inline-flex items-center gap-1 font-extrabold text-sm text-primary">
                      <Flame className="size-4 text-amber-500 fill-amber-500" />
                      {item.xp.toLocaleString()} XP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
