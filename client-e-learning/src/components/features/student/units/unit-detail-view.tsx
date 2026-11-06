"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, ListTree, RotateCcw, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullPageState } from "@/components/feedback";
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
    return <FullPageState variant="loading" title="Đang tải dữ liệu bài học" />;
  }

  // ─── Error State ───
  if (isError || !unit) {
    return (
      <FullPageState
        variant="error"
        title="Không thể tải nội dung Unit này"
        description={error?.message || "Đã xảy ra lỗi trong quá trình kết nối."}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => void refetch()}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Thử lại
            </Button>
            <Link
              href="/student/units"
              className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Quay về danh sách
            </Link>
          </div>
        }
      />
    );
  }

  const label = unitLabel(unit.displayOrder);
  const topicCount = unit.sections.reduce((sum, s) => sum + s.topics.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <Link
        href="/student/units"
        className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Tất cả bài học</span>
      </Link>

      <section className="border-b border-border pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0 overflow-hidden rounded-xl border border-border sm:w-48">
            <UnitCover
              label={label}
              name={unit.name}
              coverUrl={unit.coverUrl}
              className="h-32 w-full object-cover sm:h-36"
            />
            <span className="absolute left-2.5 top-2.5 rounded-lg bg-card px-2.5 py-1 text-sm font-bold text-foreground">
              Unit {label}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2.5">
            <h1 className="text-3xl font-extrabold text-foreground">
              {unit.name}
            </h1>

            {unit.description ? (
              <p className="max-w-prose text-base text-muted-foreground">
                {unit.description}
              </p>
            ) : (
              <p className="text-base text-muted-foreground">
                Chọn phần học bên dưới để xem hoạt động luyện tập.
              </p>
            )}

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ListTree className="h-4 w-4" aria-hidden="true" />
                <span>{unit.sections.length} phần học</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" aria-hidden="true" />
                <span>{topicCount} chủ đề</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
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

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Chọn phần học</h2>

        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Sections">
          {/* Nút Overview */}
          <button
            type="button"
            aria-pressed={sectionId === "all"}
            onClick={() => pickSection("all")}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              sectionId === "all"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-foreground hover:border-primary"
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`rounded-full px-2 py-0.5 text-sm font-bold ${
                sectionId === "all"
                  ? "bg-card text-primary"
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
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isSelected
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                <span>{section.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-sm font-bold ${
                    isSelected
                      ? "bg-card text-primary"
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

      {selectedSection && selectedSection.topics.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl bg-secondary p-3"
          role="group"
          aria-label="Topics"
        >
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <Tag className="h-4 w-4" />
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
                className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  on
                    ? "border-primary bg-primary-soft text-primary"
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
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="h-8 w-8 text-learning" aria-hidden="true" />
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
