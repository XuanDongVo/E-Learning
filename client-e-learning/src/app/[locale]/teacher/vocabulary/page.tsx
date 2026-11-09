"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gradeService } from "@/services/grade.service";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { UnitVocabularySection } from "@/components/features/teacher/content/components/unit-vocabulary-section";
import {
  BookA,
  Gamepad2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RegionState } from "@/components/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TeacherVocabularyPage() {
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // 1. Fetch Grades
  const {
    data: grades = [],
    isLoading: isLoadingGrades,
    isError: isGradesError,
    refetch: refetchGrades,
  } = useQuery({
    queryKey: ["teacher", "vocabulary", "grades"],
    queryFn: async () => {
      const response = await gradeService.list();

      if (!Array.isArray(response.data)) {
        console.error("Invalid grades response:", response);
        throw new Error("INVALID_GRADES_RESPONSE");
      }

      return response.data;
    },
  });

  const activeGradeId = selectedGradeId ?? grades[0]?.id ?? null;

  const {
    data: units = [],
    isLoading: isLoadingUnits,
    isError: isUnitsError,
    refetch: refetchUnits,
  } = useQuery({
    queryKey: QUERY_KEYS.contentUnits(activeGradeId ?? 0),
    queryFn: async () => {
      if (activeGradeId === null) return [];

      const response = await contentService.listUnits(activeGradeId);

      if (!Array.isArray(response.data)) {
        throw new Error("INVALID_UNITS_RESPONSE");
      }

      return response.data;
    },
    enabled: activeGradeId !== null,
  });

  const activeUnit =
    units.find((unit) => unit.id === selectedUnitId) ?? units[0];

  return (
    <div className="space-y-6 overflow-x-clip">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-lg border border-primary/20 bg-primary-soft text-primary">
              <BookA className="h-5 w-5" />
            </span>
            <p className="text-label font-semibold text-primary">
              Vocabulary Hub
            </p>
          </div>
          <h1 className="mt-2 text-page-title font-bold text-foreground">
            Quản lý Từ vựng theo Unit
          </h1>
          <p className="mt-1 max-w-3xl text-body-sm text-muted-foreground">
            Thêm, chỉnh sửa và cấu hình từ vựng tiếng Anh theo từng bài học để
            học sinh ôn luyện qua mini-game.
          </p>
        </div>

        {/* Link to Student Game Hub */}
        <Link
          href="/student/game"
          target="_blank"
          className="inline-flex min-h-10 items-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 text-body-sm font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:shrink-0"
        >
          <Gamepad2 className="h-4 w-4" />
          <span>Xem Đấu trường Game Học sinh</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>

      {/* Sync Explanation Banner */}
      <div className="border-y border-border bg-muted/40 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="space-y-1 text-body-sm leading-relaxed">
            <p className="font-bold text-foreground">
              🎮 Cơ chế kết nối tự động với Mini-Game Học sinh:
            </p>
            <p className="text-muted-foreground">
              Mọi từ vựng bạn thêm hoặc kích hoạt (*Active*) ở đây sẽ{" "}
              <strong>tự động đồng bộ ngay lập tức</strong> vào hai trò chơi:{" "}
              <strong>Chiến hạm Bắn từ (Bubble Pop)</strong> và{" "}
              <strong>Cơn mưa Từ vựng (Word Rain)</strong>. Học sinh chỉ cần
              chọn đúng Unit để bắt đầu chơi và ôn tập các từ này!
            </p>
          </div>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="space-y-2">
        <p className="text-label font-semibold text-muted-foreground">
          Bước 1: Chọn Khối lớp
        </p>

        {isLoadingGrades ? (
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
        ) : isGradesError ? (
          <RegionState
            variant="error"
            title="Không thể tải khối lớp"
            description="Đã xảy ra lỗi khi lấy danh sách khối lớp."
            minHeight={120}
            action={
              <button
                type="button"
                onClick={() => void refetchGrades()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Thử lại
              </button>
            }
          />
        ) : grades.length === 0 ? (
          <RegionState
            variant="empty"
            title="Chưa có khối lớp"
            description="Hãy tạo khối lớp trước khi quản lý từ vựng."
            minHeight={120}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {grades.map((grade) => {
              const isSelected = activeGradeId === grade.id;

              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => {
                    setSelectedGradeId(grade.id);
                    setSelectedUnitId(null);
                  }}
                  className={cn(
                    "min-h-10 rounded-lg border px-4 py-2 text-body-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {grade.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Unit Selector Pills */}
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label font-semibold text-muted-foreground">
            Bước 2: Chọn Bài học (Unit) để xem và nhập từ vựng
          </p>
          {activeUnit && (
            <Link
              href={`/teacher/content/units/${activeUnit.id}`}
              className="flex min-h-10 items-center gap-1 self-start rounded-lg px-2 text-body-sm font-semibold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Xem toàn bộ chi tiết Unit này</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {!activeGradeId ? (
          <RegionState
            variant="empty"
            title="Vui lòng chọn khối lớp"
            description="Chọn một khối lớp để xem danh sách Unit."
            minHeight={120}
          />
        ) : isLoadingUnits ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border border-border bg-card p-3"
              >
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isUnitsError ? (
          <RegionState
            variant="error"
            title="Không thể tải danh sách Unit"
            description="Đã xảy ra lỗi khi lấy danh sách bài học. Vui lòng thử lại."
            minHeight={120}
            action={
              <button
                type="button"
                onClick={() => void refetchUnits()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Thử lại
              </button>
            }
          />
        ) : units.length === 0 ? (
          <RegionState
            variant="empty"
            title="Chưa có bài học nào"
            description="Khối lớp này chưa có Unit. Hãy vào mục Khám phá nội dung để tạo Unit trước."
            minHeight={120}
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {units.map((unit) => {
              const isSelected = activeUnit?.id === unit.id;

              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={cn(
                    "flex min-h-16 items-center gap-3 border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-card hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg text-label font-bold",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-bold text-primary">
                      {unit.code}
                    </p>

                    <p className="truncate text-body-sm font-bold text-foreground">
                      {unit.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Vocabulary Management Section */}
      {activeUnit ? (
        <div className="pt-2">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-body-sm font-bold text-foreground">
            <span>Đang quản lý từ vựng cho:</span>
            <span className="rounded-lg bg-primary-soft px-2 py-1 text-primary">
              {activeUnit.code} · {activeUnit.name}
            </span>
          </div>

          <UnitVocabularySection unitId={activeUnit.id} />
        </div>
      ) : null}
    </div>
  );
}
