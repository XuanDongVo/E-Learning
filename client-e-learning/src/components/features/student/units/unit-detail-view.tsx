"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, BookOpen, BookMarked, ChevronRight, ListTree, RotateCcw, Sparkles, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullPageState } from "@/components/feedback";
import { studentUnitService } from "@/services/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { ActivityCard } from "./activity-card";
import { UnitCover, unitLabel } from "./unit-cover";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";
import { StudentTopicKnowledge } from "@/components/features/student/knowledge/student-topic-knowledge";

type Filter = number | "all";

export interface UnitDetailViewProps {
  unitId: number;
}

export function UnitDetailView({ unitId }: UnitDetailViewProps) {
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
              className="student-control student-control--quiet inline-flex items-center px-4"
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
    <div className="student-unit-detail space-y-6 pb-8">
      <StudentBackLink href="/student/units">Tất cả bài học</StudentBackLink>

      <PaperSurface as="section" variant="kraft" emphasis="feature" tape tapePosition="right"
        className="student-unit-detail-hero student-unit-detail-hero--editorial relative overflow-hidden">
        <div className="student-unit-detail-hero__content relative z-10 grid w-full min-w-0 gap-6 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-center lg:gap-9">
          <div className="student-unit-detail-hero__cover relative w-full max-w-[28rem] sm:max-w-none">
            <div className="student-unit-cover-frame relative overflow-hidden">
              <UnitCover
                label={label}
                name={unit.name}
                coverUrl={unit.coverUrl}
                variant="hero"
                className="h-44 w-full sm:h-52 lg:h-56"
              />
              <span className="student-chip absolute left-3 top-3 border-2 border-ink bg-card text-foreground">
                UNIT {label}
              </span>
            </div>
            <span aria-hidden="true" className="student-unit-detail-hero__stamp">
              <Sparkles className="size-4" />
              LET'S LEARN
            </span>
          </div>

          <div className="min-w-0 space-y-4">
            <p className="student-meta flex items-center gap-2 font-extrabold tracking-wide text-primary">
              <span aria-hidden="true" className="student-unit-detail-hero__eyebrow-dot" />
              KHÁM PHÁ BÀI HỌC · UNIT {label}
            </p>

            <div className="space-y-2.5">
              <ScrapbookHeading as="h1" className="student-page-title max-w-2xl text-foreground">
                {unit.name}
              </ScrapbookHeading>
              <p className="student-body max-w-2xl text-muted-foreground">
                {unit.description?.trim() || "Từng phần học nhỏ sẽ giúp bạn làm quen kiến thức và luyện tập theo nhịp của mình."}
              </p>
            </div>

            <div className="student-unit-detail-hero__facts flex flex-wrap gap-2" aria-label="Nội dung Unit">
              <span className="student-unit-detail-hero__fact">
                <ListTree className="size-4" aria-hidden="true" />
                <strong>{unit.sections.length}</strong> phần học
              </span>
              <span className="student-unit-detail-hero__fact">
                <Tag className="size-4" aria-hidden="true" />
                <strong>{topicCount}</strong> chủ đề
              </span>
              <span className="student-unit-detail-hero__fact">
                <BookOpen className="size-4" aria-hidden="true" />
                <strong>{unit.activities.length}</strong> hoạt động
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#unit-activities"
                className="student-control student-control--action inline-flex items-center gap-2 px-4 no-underline">
                Xem hoạt động <ArrowDownRight className="size-4" aria-hidden="true" />
              </a>
              <Link href={`/student/vocabulary/units/${unit.id}`}
                className="student-control student-control--quiet inline-flex items-center gap-2 px-4 no-underline">
                Sổ từ vựng <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </PaperSurface>

      <div className="student-soft-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="student-card-title flex items-center gap-2 text-foreground">
              <BookMarked className="h-5 w-5 text-primary" aria-hidden="true" />
              Bộ từ vựng Unit {label}
            </h2>
            <p className="student-body text-muted-foreground">
              Xem và luyện bộ từ này trong Sổ tay từ vựng riêng.
            </p>
          </div>
        </div>
        <Link href={`/student/vocabulary/units/${unit.id}`}
          className="student-control student-control--secondary inline-flex shrink-0 items-center justify-center gap-2 px-5">
          Mở bộ từ <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-3">
        <ScrapbookHeading as="h2" className="student-section-title text-foreground">
          Chọn phần học
        </ScrapbookHeading>

        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Sections">
          {/* Nút Overview */}
          <button
            type="button"
            aria-pressed={sectionId === "all"}
            onClick={() => pickSection("all")}
            className={`student-control inline-flex items-center gap-2 px-4 ${
              sectionId === "all"
                ? "student-filter-active"
                : "student-control--quiet"
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`student-filter-count ${
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
                className={`student-control inline-flex items-center gap-2 px-4 ${
                  isSelected
                    ? "student-filter-active"
                    : "student-control--quiet"
                }`}
              >
                <span>{section.name}</span>
                <span
                  className={`student-filter-count ${
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
          className="student-soft-panel flex flex-wrap items-center gap-2 p-3"
          role="group"
          aria-label="Topics"
        >
          <span className="student-label inline-flex items-center gap-1 text-muted-foreground">
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
                className={`student-control px-3 ${
                  on
                    ? "student-filter-active"
                    : "student-control--quiet"
                }`}
              >
                {t === "all" ? "Tất cả chủ đề" : t.name}
              </button>
            );
          })}
        </div>
      )}

      {topicId !== "all" && (
        <StudentTopicKnowledge key={topicId} topicId={topicId} />
      )}

      {/* ─── Activity Cards Grid ─── */}
      <section id="unit-activities" aria-live="polite" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            <h2 className="student-card-title text-foreground">
              {selectedSection ? `${selectedSection.name}` : "Tất cả hoạt động"}
            </h2>
            <span className="student-chip text-muted-foreground">
              {visible.length} bài
            </span>
          </div>
        </div>

        {visible.length === 0 ? (
          <PaperSurface className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <BookOpen className="h-8 w-8 text-learning" aria-hidden="true" />
            <p className="student-card-title text-foreground">
              Chưa có hoạt động nào trong phần này
            </p>
            <p className="student-body max-w-md text-muted-foreground">
              Giáo viên chưa cập nhật hoạt động cho chủ đề đã chọn. Bạn hãy thử chọn chủ đề khác nhé!
            </p>
          </PaperSurface>
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
