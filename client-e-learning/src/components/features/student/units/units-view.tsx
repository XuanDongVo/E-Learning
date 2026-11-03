"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Search,
  Sparkles,
  Trophy,
  RefreshCw,
  Compass,
} from "lucide-react";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentUnitService } from "@/services/student/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { Button } from "@/components/ui/button";
import { UnitCard } from "./unit-card";
import { Pipo } from "@/components/ui/mascot";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { RegionState } from "@/components/feedback";

export function UnitsView() {
  const tErrors = useTranslations("errors");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.units,
    queryFn: studentUnitService.list,
  });

  const units = response?.data ?? [];

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  const totalActivities = units.reduce(
    (sum, u) => sum + (u.activityCount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* ─── Hero Banner Gamification (Dùng tokens bg-card, border-border, shadow-pop) ─── */}
      <header className="relative overflow-hidden rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-pop">
        <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row md:items-center">
          <Pipo mood="cheer" size={115} color="pink" stage={3} />
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary shadow-pop-sm">
              <Sparkles className="h-3.5 w-3.5 text-warning" />
              Góc học tập của bạn
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Danh sách Unit bài học 📚
            </h1>

            <p className="max-w-xl text-sm font-semibold text-muted-foreground">
              Chọn một Unit để khám phá các bài giảng, từ vựng và thử thách bài
              tập hấp dẫn!
            </p>

            {/* Quick Stats Chips */}
            {units.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1 text-xs font-bold text-foreground shadow-pop-sm">
                  <Compass className="h-4 w-4 text-primary" />
                  {units.length} Unit bài học
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1 text-xs font-bold text-foreground shadow-pop-sm">
                  <Trophy className="h-4 w-4 text-warning" />
                  {totalActivities} hoạt động luyện tập
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Ô tìm kiếm bài học Tactile ─── */}
      {units.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm Unit bài học..."
            className="h-11 w-full rounded-2xl border-2 border-border bg-card pl-10 pr-4 text-sm font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground shadow-pop-sm focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {/* ─── Loading State (Skeleton) ─── */}
      {isLoading && <SkeletonGrid />}

      {/* ─── Error State (Dùng token destructive) ─── */}
      {isError && (
        <RegionState
          variant="error"
          title="Không thể tải danh sách bài học"
          description={getAppErrorMessage(error, tErrors as (key: string) => string)}
          action={
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Thử lại
            </Button>
          }
        />
      )}

      {/* ─── Empty State ─── */}
      {units.length === 0 && !isLoading && !isError && (
        <RegionState
          variant="empty"
          title="Chưa có bài học nào"
          description="Giáo viên của bạn chưa công bố Unit nào cho lớp học này. Hãy quay lại sau nhé!"
        />
      )}

      {/* ─── Không khớp tìm kiếm ─── */}
      {units.length > 0 && filteredUnits.length === 0 && (
        <RegionState
          variant="empty"
          title={`Không tìm thấy Unit phù hợp với từ khóa "${searchTerm}"`}
          action={
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Xóa tìm kiếm
            </button>
          }
        />
      )}

      {/* ─── Lưới Unit Cards ─── */}
      {filteredUnits.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredUnits.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
