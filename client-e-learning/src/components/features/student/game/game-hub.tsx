"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentGameService } from "@/services/student/student-game.service";
import type { GameUnitSummary } from "@/types/vocabulary-game";
import { GameUnitCard } from "./game-unit-card";
import { GameSelectModal } from "./game-select-modal";
import { Pipo } from "@/components/ui/mascot";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Gamepad2 } from "lucide-react";

export function GameHub() {
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [activeUnitForModal, setActiveUnitForModal] = useState<GameUnitSummary | null>(null);

  // 1. Fetch Grades
  const { data: gradesResponse, isLoading: isLoadingGrades } = useQuery({
    queryKey: QUERY_KEYS.gameGrades,
    queryFn: studentGameService.getGrades,
  });

  const grades = gradesResponse?.data ?? [];

  // Default to Grade 6 if available
  useEffect(() => {
    if (grades.length > 0 && selectedGradeId === null) {
      setSelectedGradeId(grades[0].id);
    }
  }, [grades, selectedGradeId]);

  // 2. Fetch Units for selected Grade
  const { data: unitsResponse, isLoading: isLoadingUnits } = useQuery({
    queryKey: selectedGradeId ? QUERY_KEYS.gameUnits(selectedGradeId) : ["none"],
    queryFn: () => (selectedGradeId ? studentGameService.getUnitsByGrade(selectedGradeId) : Promise.resolve({ success: true, code: "OK", message: "", data: [] })),
    enabled: selectedGradeId !== null,
  });

  const units = unitsResponse?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header Banner */}
      <header className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6 sm:p-8">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-sm font-bold text-primary">
            <Gamepad2 className="h-4 w-4" />
            Vừa chơi vừa học từ vựng
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Đấu trường Từ vựng Tiếng Anh
          </h1>
          <p className="text-base text-muted-foreground">
            Chọn khối lớp và bài học bạn muốn chinh phục. Thử tài phản xạ với <strong className="text-foreground">Bubble Pop</strong> và tư duy chính tả cùng <strong className="text-foreground">Mưa từ</strong>!
          </p>
        </div>
        <div className="hidden sm:block shrink-0">
          <Pipo mood="happy" size={96} color="primary" stage={2} />
        </div>
      </header>

      {/* Grade Selector Tabs */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Chọn khối lớp của bạn
        </h2>
        {isLoadingGrades ? (
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-2xl" />
            <Skeleton className="h-11 w-32 rounded-2xl" />
            <Skeleton className="h-11 w-32 rounded-2xl" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {grades.map((grade) => {
              const isSelected = grade.id === selectedGradeId;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setSelectedGradeId(grade.id)}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                      : "bg-card text-muted-foreground border-2 border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <Sparkles className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                  {grade.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Units Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground">
            Danh sách bài học
          </h2>
          <span className="text-sm font-semibold text-muted-foreground">
            {units.length} Unit khả dụng
          </span>
        </div>

        {isLoadingUnits ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : units.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card/50">
            <Pipo mood="think" size={80} color="primary" />
            <h3 className="mt-4 text-lg font-bold text-foreground">Chưa có bài học nào trong khối này</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Vui lòng chọn khối lớp khác hoặc quay lại sau khi giáo viên công bố nội dung nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <GameUnitCard
                key={unit.id}
                unit={unit}
                onSelectUnit={(u) => setActiveUnitForModal(u)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Chọn Game */}
      <GameSelectModal
        unit={activeUnitForModal}
        isOpen={activeUnitForModal !== null}
        onClose={() => setActiveUnitForModal(null)}
      />
    </div>
  );
}
