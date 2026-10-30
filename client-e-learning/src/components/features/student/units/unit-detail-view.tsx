"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Lightbulb,
  ListTree,
  RotateCcw,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { studentUnitService } from "@/services/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { ActivityCard } from "./activity-card";
import { UnitCover, unitLabel } from "./unit-cover";

type Filter = number | "all";

export interface UnitDetailViewProps {
  unitId: number;
  mascotSlot?: React.ReactNode;
}

export function UnitDetailView({ unitId, mascotSlot }: UnitDetailViewProps) {
  const [sectionId, setSectionId] = useState<Filter>("all");
  const [topicId, setTopicId] = useState<Filter>("all");

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.unitDetail(String(unitId)),
    queryFn: () => studentUnitService.getUnitDetail(unitId),
  });
  const unit = response?.data;

  const topicName = useMemo(() => {
    const map = new Map<number, string>();
    unit?.sections.forEach((s) => s.topics.forEach((t) => map.set(t.id, t.name)));
    return map;
  }, [unit]);

  const activitiesIn = (ids: number[]) =>
    (unit?.activities ?? []).filter((a) => a.topicIds.some((id) => ids.includes(id)));

  const selectedSection = unit?.sections.find((s) => s.id === sectionId);

  const visible = useMemo(() => {
    if (!unit) return [];
    if (topicId !== "all") {
      return unit.activities.filter((a) => a.topicIds.includes(topicId));
    }
    if (selectedSection) {
      const ids = selectedSection.topics.map((t) => t.id);
      return unit.activities.filter((a) => a.topicIds.some((id) => ids.includes(id)));
    }
    return unit.activities;
  }, [unit, selectedSection, topicId]);

  const pickSection = (id: Filter) => {
    setSectionId(id);
    setTopicId("all");
  };

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Đang tải dữ liệu bài học"
      >
        <div className="h-44 animate-pulse rounded-3xl border-2 border-border bg-card shadow-pop" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border-2 border-border bg-card shadow-pop"
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (isError || !unit) {
    return (
      <div >
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-destructive bg-destructive-soft p-8 text-center shadow-pop"
        >
          <span className="text-4xl">⚠️</span>
          <div>
            <p className="text-base font-extrabold text-foreground">
              Không thể tải nội dung Unit này
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {error?.message || "Đã xảy ra lỗi trong quá trình kết nối."}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => refetch()}
              className="h-11 rounded-2xl border-2 border-ink bg-destructive font-extrabold text-destructive-foreground shadow-pop active:translate-y-0.5"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Thử lại
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-2xl border-2 border-border bg-card font-bold text-foreground shadow-pop-sm hover:border-primary"
            >
              <Link href="/student/units">Quay về danh sách</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const label = unitLabel(unit.displayOrder);
  const topicCount = unit.sections.reduce((sum, s) => sum + s.topics.length, 0);

  return (
    <div className=" space-y-6 p-4 pb-24 sm:p-5 lg:p-6 lg:pb-8">
      {/* ─── Back Action ─── */}
      <Link
        href="/student/units"
        className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3.5 py-2 text-xs font-extrabold text-foreground shadow-pop-sm transition-all hover:border-primary hover:text-primary active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Tất cả bài học</span>
      </Link>

      {/* ─── Hero Unit Detail Card ─── */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-border bg-card p-4 sm:p-6 shadow-pop">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Cover Unit */}
          <div className="relative shrink-0 overflow-hidden rounded-2xl border-2 border-border shadow-pop-sm sm:w-56">
            <UnitCover
              label={label}
              name={unit.name}
              coverUrl={unit.coverUrl}
              className="h-36 w-full object-cover sm:h-44"
            />
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-extrabold uppercase text-foreground shadow-pop-sm">
              <Sparkles className="h-3 w-3 text-warning" />
              Unit {label}
            </span>
          </div>

          {/* Description & Chips */}
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Chi tiết bài học
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {unit.name}
            </h1>

            {unit.description ? (
              <p className="line-clamp-2 text-sm font-semibold text-muted-foreground">
                {unit.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground/70">
                Luyện tập các kỹ năng và hoàn thành các hoạt động bên dưới để tích lũy kiến thức!
              </p>
            )}

            {/* Quick Stats Chips */}
            <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold text-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 shadow-pop-sm">
                <ListTree className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{unit.sections.length} phần học</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 shadow-pop-sm">
                <Tag className="h-4 w-4 text-teal" aria-hidden="true" />
                <span>{topicCount} chủ đề</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 shadow-pop-sm">
                <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
                <span>{unit.activities.length} hoạt động</span>
              </span>
            </div>
          </div>

          {/* Mascot Slot */}
          {mascotSlot && (
            <div className="hidden shrink-0 items-center justify-center lg:flex lg:h-28 lg:w-28">
              {mascotSlot}
            </div>
          )}
        </div>
      </section>

      {/* ─── Section Filter Pills (Tactile 3D Buttons) ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>Chọn phần học (Section)</span>
        </div>

        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Sections">
          {/* Nút Overview */}
          <button
            type="button"
            aria-pressed={sectionId === "all"}
            onClick={() => pickSection("all")}
            className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-extrabold transition-all ${
              sectionId === "all"
                ? "border-ink bg-primary text-primary-foreground shadow-pop translate-y-0.5"
                : "border-border bg-card text-foreground shadow-pop hover:border-primary active:translate-y-0.5 active:shadow-pop-sm"
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                sectionId === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {unit.activities.length}
            </span>
          </button>

          {/* Nút từng Section */}
          {unit.sections.map((section) => {
            const count = activitiesIn(section.topics.map((t) => t.id)).length;
            const isSelected = sectionId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => pickSection(section.id)}
                className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-extrabold transition-all ${
                  isSelected
                    ? "border-ink bg-primary text-primary-foreground shadow-pop translate-y-0.5"
                    : "border-border bg-card text-foreground shadow-pop hover:border-primary active:translate-y-0.5 active:shadow-pop-sm"
                }`}
              >
                <span>{section.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Topic Sub-filter Chips ─── */}
      {selectedSection && selectedSection.topics.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-secondary/50 p-3 shadow-pop-sm"
          role="group"
          aria-label="Topics"
        >
          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-muted-foreground">
            <Tag className="h-3.5 w-3.5 text-teal" />
            Chủ đề:
          </span>

          {(["all", ...selectedSection.topics] as const).map((t) => {
            const id: Filter = t === "all" ? "all" : t.id;
            const on = topicId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setTopicId(id)}
                className={`rounded-xl border px-3 py-1 text-xs font-bold transition-all active:scale-95 ${
                  on
                    ? "border-ink bg-primary text-primary-foreground shadow-pop-sm"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {t === "all" ? "Tất cả chủ đề" : t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Activity Cards Grid ─── */}
      <section aria-live="polite" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-extrabold text-foreground">
              {selectedSection ? `${selectedSection.name}` : "Tất cả hoạt động"}
            </h2>
            <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs font-extrabold text-muted-foreground">
              {visible.length} bài
            </span>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-border bg-card p-12 text-center shadow-pop">
            <span className="text-4xl">🎯</span>
            <p className="text-base font-extrabold text-foreground">
              Chưa có hoạt động nào trong phần này
            </p>
            <p className="max-w-md text-sm font-medium text-muted-foreground">
              Giáo viên chưa cập nhật hoạt động cho chủ đề đã chọn. Bạn hãy thử chọn chủ đề khác nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((activity) => (
              <ActivityCard
                key={activity.id}
                unitId={unit.id}
                activity={activity}
                topicNames={activity.topicIds
                  .map((id) => topicName.get(id))
                  .filter((n): n is string => !!n)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
