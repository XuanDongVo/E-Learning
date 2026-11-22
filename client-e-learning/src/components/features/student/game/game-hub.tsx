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
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";
import { PolaroidFrame } from "@/components/student-ui/polaroid-frame";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";

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
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 pb-12">
      {/* Header Banner - Scrapbook Indie Illustrated */}
      <PaperSurface
        as="section"
        variant="lined"
        className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden p-6 sm:p-8 border-2 border-ink/20 shadow-pop"
      >
        {/* Decorative Star Sticker */}
        <div className="pointer-events-none absolute right-4 top-4 hidden sm:block rotate-12 opacity-90">
          <StudentDoodle id="doodle.star-sticker" className="w-12 h-12" />
        </div>

        <div className="space-y-3 max-w-xl z-10">
          <div className="student-pill inline-flex items-center gap-2 text-xs font-black text-primary bg-primary/10 border border-primary/25">
            <Gamepad2 className="h-3.5 w-3.5" />
            VỪA CHƠI VỪA HỌC TỪ VỰNG
          </div>

          <div className="space-y-1">
            <ScrapbookHeading as="h1" className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Đấu trường Từ vựng Tiếng Anh
            </ScrapbookHeading>
            <StudentDoodle id="doodle.underline" className="w-36 sm:w-48 h-3 text-primary opacity-80" />
          </div>

          <p className="student-body text-sm sm:text-base text-muted-foreground leading-relaxed">
            Chọn khối lớp và bài học bạn muốn chinh phục. Thử tài phản xạ với <strong className="text-foreground">Bubble Pop</strong> và tư duy chính tả cùng <strong className="text-foreground">Word Rain</strong>!
          </p>

          {/* Mobile Mascot Inline Accent */}
          <div className="flex sm:hidden items-center gap-3 pt-1">
            <div className="shrink-0 rounded-2xl border-2 border-ink/20 bg-background/80 p-1.5 shadow-xs">
              <Pipo mood="happy" size={44} color="primary" stage={2} />
            </div>
            <p className="text-xs font-bold text-muted-foreground">
              &quot;Học từ vựng qua trò chơi giúp nhớ sâu gấp 2 lần đó bạn ơi!&quot;
            </p>
          </div>
        </div>

        {/* Desktop Mascot Polaroid Frame */}
        <div className="hidden sm:block shrink-0 z-10">
          <PolaroidFrame caption="Pipo · Học mà vui!" className="rotate-2 shadow-pop hover:rotate-0 transition-transform">
            <div className="flex items-center justify-center p-3 bg-paper-lined/60">
              <Pipo mood="happy" size={96} color="primary" stage={2} />
            </div>
          </PolaroidFrame>
        </div>
      </PaperSurface>

      {/* Grade Selector Tabs */}
      <div className="space-y-3">
        <h2 className="student-meta text-xs font-black uppercase tracking-wider text-muted-foreground">
          Chọn khối lớp của bạn
        </h2>
        {isLoadingGrades ? (
          <div className="flex flex-wrap gap-2.5">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {grades.map((grade) => {
              const isSelected = grade.id === selectedGradeId;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setSelectedGradeId(grade.id)}
                  className={`student-control min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2 font-black text-sm transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? "student-filter-active shadow-xs scale-102"
                      : "student-control--quiet"
                  }`}
                >
                  <Sparkles className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  {grade.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Units Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-ink/10 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            Danh sách bài học
          </h2>
          <span className="student-pill text-xs font-bold text-muted-foreground bg-muted/60">
            {units.length} Unit khả dụng
          </span>
        </div>

        {isLoadingUnits ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <Skeleton className="h-72 rounded-2xl border-2 border-border/40" />
            <Skeleton className="h-72 rounded-2xl border-2 border-border/40" />
            <Skeleton className="h-72 rounded-2xl border-2 border-border/40" />
          </div>
        ) : units.length === 0 ? (
          <StudentCollectionEmptyState
            title="Chưa có bài học nào trong khối này"
            description="Vui lòng chọn khối lớp khác hoặc quay lại sau khi giáo viên công bố nội dung nhé!"
            illustration="illustration.no-lessons"
            className="p-8 bg-card/60 rounded-2xl border-2 border-dashed border-ink/20"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
