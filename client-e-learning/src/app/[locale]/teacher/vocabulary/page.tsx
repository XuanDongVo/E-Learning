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

export default function TeacherVocabularyPage() {
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // 1. Fetch Grades
  const { data: grades = [], isLoading: isLoadingGrades } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => (await gradeService.list()).data ?? [],
  });

  const activeGradeId = selectedGradeId ?? grades[0]?.id;

  // 2. Fetch Units for selected Grade
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: QUERY_KEYS.contentUnits(activeGradeId ?? 0),
    queryFn: async () => {
      if (!activeGradeId) return [];
      return (await contentService.listUnits(activeGradeId)).data ?? [];
    },
    enabled: Boolean(activeGradeId),
  });

  const activeUnit =
    units.find((u) => u.id === selectedUnitId) ?? units[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BookA className="h-5 w-5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Vocabulary Hub
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground">
            Quản lý Từ vựng theo Unit
          </h1>
          <p className="text-sm text-muted-foreground">
            Thêm, chỉnh sửa và cấu hình từ vựng tiếng Anh theo từng bài học để học sinh ôn luyện qua mini-game.
          </p>
        </div>

        {/* Link to Student Game Hub */}
        <Link
          href="/student/game"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition shadow-sm self-start sm:self-auto"
        >
          <Gamepad2 className="h-4 w-4" />
          <span>Xem Đấu trường Game Học sinh</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>

      {/* Sync Explanation Banner */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5 shadow-sm text-sky-950">
        <div className="flex items-start gap-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-500 text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <p className="font-bold text-sky-900">
              🎮 Cơ chế kết nối tự động với Mini-Game Học sinh:
            </p>
            <p className="text-sky-800">
              Mọi từ vựng bạn thêm hoặc kích hoạt (*Active*) ở đây sẽ <strong>tự động đồng bộ ngay lập tức</strong> vào hai trò chơi:{" "}
              <strong>Chiến hạm Bắn từ (Bubble Pop)</strong> và <strong>Cơn mưa Từ vựng (Word Rain)</strong>. Học sinh chỉ cần chọn đúng Unit để bắt đầu chơi và ôn tập các từ này!
            </p>
          </div>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Bước 1: Chọn Khối lớp
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {isLoadingGrades ? (
            <div className="text-xs text-muted-foreground">Đang tải khối lớp...</div>
          ) : (
            grades.map((grade) => {
              const isSelected = activeGradeId === grade.id;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => {
                    setSelectedGradeId(grade.id);
                    setSelectedUnitId(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    isSelected
                      ? "bg-primary text-white shadow-md scale-105"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {grade.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Unit Selector Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Bước 2: Chọn Bài học (Unit) để xem và nhập từ vựng
          </p>
          {activeUnit && (
            <Link
              href={`/teacher/content/units/${activeUnit.id}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Xem toàn bộ chi tiết Unit này</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {isLoadingUnits ? (
          <div className="text-xs text-muted-foreground py-2">Đang tải danh sách bài học...</div>
        ) : units.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Chưa có bài học nào trong khối lớp này. Hãy vào mục <strong>Khám phá nội dung</strong> để tạo Unit trước.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {units.map((unit) => {
              const isSelected = activeUnit?.id === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left transition border ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:bg-muted/60"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-primary truncate">
                      {unit.code}
                    </p>
                    <p className="text-xs font-bold text-foreground truncate">
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
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
            <span>Đang quản lý từ vựng cho:</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">
              {activeUnit.code} · {activeUnit.name}
            </span>
          </div>

          <UnitVocabularySection unitId={activeUnit.id} />
        </div>
      ) : null}
    </div>
  );
}

