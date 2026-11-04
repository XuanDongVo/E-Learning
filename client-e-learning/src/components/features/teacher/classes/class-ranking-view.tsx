"use client";

import { Trophy } from "lucide-react";
import { RegionState } from "@/components/feedback";

/**
 * XP / leaderboard API is not available on the server yet.
 * UI shell only — no mock data.
 */
export function ClassRankingView({ classId }: { classId: number }) {
  void classId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-extrabold">
              Bảng xếp hạng XP (Leaderboard)
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Theo dõi điểm kinh nghiệm (XP) từ luyện tập và bài tập của học sinh.
          </p>
        </div>
      </div>

      <RegionState
        variant="empty"
        title="Chưa có API xếp hạng XP"
        description="Backend chưa cung cấp endpoint leaderboard / XP theo lớp. Khi API sẵn sàng (ví dụ GET /v1/classes/{id}/ranking), màn này sẽ hiển thị dữ liệu thật — không dùng mock."
      />
    </div>
  );
}
