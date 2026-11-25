"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
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
import { getDefaultKnowledgeTopicId } from "./unit-knowledge-topic";

type Filter = number | "all";

export interface UnitDetailViewProps {
  unitId: number;
}

export function UnitDetailView({ unitId }: UnitDetailViewProps) {
  const tDetail = useTranslations("student.learning.detail");
  const [sectionId, setSectionId] = useState<Filter>("all");
  const [topicId, setTopicId] = useState<Filter>("all");
  const [knowledgeTopicId, setKnowledgeTopicId] = useState<number | null>(null);

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

  // Deep links from the Knowledge Note reader land on the right Topic.
  // Validate against published Unit data; never trust an arbitrary URL id.
  useEffect(() => {
    if (!unit) return;
    const raw = new URLSearchParams(window.location.search).getDetail("topicId");
    if (!raw || !/^[1-9]\d*$/.test(raw)) return;
    const selected = Number(raw);
    if (!Number.isSafeInteger(selected)) return;
    const section = unit.sections.find(entry =>
      entry.topics.some(item => item.id === selected));
    if (section) {
      setSectionId(section.id);
      setTopicId(selected);
      setKnowledgeTopicId(selected);
    }
  }, [unit]);

  const topicName = useMemo(() => {
    const map = new Map<number, string>();
    unit?.sections.forEach((s) => s.topics.forEach((t) => map.set(t.id, t.name)));
    return map;
  }, [unit]);

  const activitiesIn = (ids: number[]) =>
    (unit?.activities ?? []).filter((a) => a.topicIds.some((id) => ids.includes(id)));

  const selectedSection = unit?.sections.find((s) => s.id === sectionId);
  const availableKnowledgeTopics = unit?.sections.flatMap(section =>
    section.topics.map(topic => ({ ...topic, sectionName: section.name, sectionId: section.id }))) ?? [];
  const defaultKnowledgeTopicId = unit ? getDefaultKnowledgeTopicId(unit.sections) : null;
  const activeKnowledgeTopicId = availableKnowledgeTopics.some(topic => topic.id === knowledgeTopicId)
    ? knowledgeTopicId : defaultKnowledgeTopicId;

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
    if (id !== "all") {
      const firstTopic = unit?.sections.find(section => section.id === id)?.topics[0];
      if (firstTopic) setKnowledgeTopicId(firstTopic.id);
    }
  };

  const pickKnowledgeTopic = (nextId: number) => {
    setKnowledgeTopicId(nextId);
    const match = availableKnowledgeTopics.find(item => item.id === nextId);
    if (match) {
      setSectionId(match.sectionId);
      setTopicId(nextId);
    }
  };

  // ─── Loading State ───
  if (isLoading) {
    return <FullPageState variant="loading" title={tDetail("loading")} />;
  }

  // ─── Error State ───
  if (isError || !unit) {
    return (
      <FullPageState
        variant="error"
        title={tDetail("loadError")}
        description={error?.message || tDetail("connectionError")}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => void refetch()}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {tDetail("retry")}
            </Button>
            <Link
              href="/student/units"
              className="student-control student-control--quiet inline-flex items-center px-4"
            >
              {tDetail("backToList")}
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
      <StudentBackLink href="/student/units">{tDetail("allLessons")}</StudentBackLink>

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
              {tDetail("stamp")}
            </span>
          </div>

          <div className="min-w-0 space-y-4">
            <p className="student-meta flex items-center gap-2 font-extrabold tracking-wide text-primary">
              <span aria-hidden="true" className="student-unit-detail-hero__eyebrow-dot" />
              {tDetail("eyebrow", { label })}
            </p>

            <div className="space-y-2.5">
              <ScrapbookHeading as="h1" className="student-page-title max-w-2xl text-foreground">
                {unit.name}
              </ScrapbookHeading>
              <p className="student-body max-w-2xl text-muted-foreground">
                {unit.description?.trim() || tDetail("intro")}
              </p>
            </div>

            <div className="student-unit-detail-hero__facts flex flex-wrap gap-2" aria-label={tDetail("facts")}>
              <span className="student-unit-detail-hero__fact">
                <ListTree className="size-4" aria-hidden="true" />
                <strong>{unit.sections.length}</strong> {tDetail("sections")}
              </span>
              <span className="student-unit-detail-hero__fact">
                <Tag className="size-4" aria-hidden="true" />
                <strong>{topicCount}</strong> {tDetail("topics")}
              </span>
              <span className="student-unit-detail-hero__fact">
                <BookOpen className="size-4" aria-hidden="true" />
                <strong>{unit.activities.length}</strong> {tDetail("activities")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#unit-activities"
                className="student-control student-control--action inline-flex items-center gap-2 px-4 no-underline">
                {tDetail("viewActivities")} <ArrowDownRight className="size-4" aria-hidden="true" />
              </a>
              <Link href={`/student/vocabulary/units/${unit.id}`}
                className="student-control student-control--quiet inline-flex items-center gap-2 px-4 no-underline">
                {tDetail("vocabulary")} <ChevronRight className="size-4" aria-hidden="true" />
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
              {tDetail("vocabularyTitle", { label })}
            </h2>
            <p className="student-body text-muted-foreground">
              {tDetail("vocabularyIntro")}
            </p>
          </div>
        </div>
        <Link href={`/student/vocabulary/units/${unit.id}`}
          className="student-control student-control--secondary inline-flex shrink-0 items-center justify-center gap-2 px-5">
          {tDetail("openVocabulary")} <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Knowledge entry is always discoverable on the Unit overview.
          Activity selection is independent: don't hide all other activities until a Topic is chosen. */}
      <section id="unit-knowledge" aria-labelledby="unit-knowledge-heading" className="scroll-mt-24 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="student-meta text-primary">{tDetail("knowledgeEyebrow")}</p>
            <ScrapbookHeading as="h2" id="unit-knowledge-heading" className="student-section-title text-foreground">
              {tDetail("knowledgeTitle")}
            </ScrapbookHeading>
            <p className="student-body text-muted-foreground">
              {tDetail("knowledgeIntro")}
            </p>
          </div>
          <Link href="/student/knowledge"
            className="student-control student-control--quiet inline-flex min-h-11 items-center gap-2 px-4">
            {tDetail("openLibrary")} <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {availableKnowledgeTopics.length ? (
          <>
            <div className="flex flex-wrap gap-2" role="group" aria-label={tDetail("selectKnowledgeTopic")}>
              {availableKnowledgeTopics.map(item => (
                <button key={item.id} type="button"
                  aria-pressed={activeKnowledgeTopicId === item.id}
                  onClick={() => pickKnowledgeTopic(item.id)}
                  className={`student-control min-h-11 px-3 ${activeKnowledgeTopicId === item.id ? "student-filter-active" : "student-control--quiet"}`}>
                  {item.name}
                </button>
              ))}
            </div>
            {activeKnowledgeTopicId != null && (
              <StudentTopicKnowledge key={activeKnowledgeTopicId} topicId={activeKnowledgeTopicId} />
            )}
          </>
        ) : (
          <PaperSurface as="section" className="space-y-2 p-4 sm:p-5">
            <p className="student-body text-muted-foreground">
              {tDetail("noPublishedTopics")}
            </p>
            <Link href="/student/knowledge" className="student-label text-primary underline underline-offset-4">
              {tDetail("seeKnowledge")}
            </Link>
          </PaperSurface>
        )}
      </section>

      <div className="space-y-3">
        <ScrapbookHeading as="h2" className="student-section-title text-foreground">
          {tDetail("chooseSection")}
        </ScrapbookHeading>

        <div className="flex flex-wrap gap-2.5" role="group" aria-label={tDetail("sectionsGroup")}>
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
            <span>{tDetail("all")}</span>
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
          aria-label={tDetail("topicsGroup")}
        >
          <span className="student-label inline-flex items-center gap-1 text-muted-foreground">
            <Tag className="h-4 w-4" />
            {tDetail("topic")}
          </span>

          {(["all", ...selectedSection.topics] as const).map((t) => {
            const id: Filter = t === "all" ? "all" : t.id;
            const on = topicId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setTopicId(id);
                  if (id !== "all") setKnowledgeTopicId(id);
                }}
                className={`student-control px-3 ${
                  on
                    ? "student-filter-active"
                    : "student-control--quiet"
                }`}
              >
                {t === "all" ? tDetail("allTopics") : t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Activity Cards Grid ─── */}
      <section id="unit-activities" aria-live="polite" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            <h2 className="student-card-title text-foreground">
              {selectedSection ? `${selectedSection.name}` : tDetail("allActivities")}
            </h2>
            <span className="student-chip text-muted-foreground">
              {tDetail("activityCount", { count: visible.length })}
            </span>
          </div>
        </div>

        {visible.length === 0 ? (
          <PaperSurface className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <BookOpen className="h-8 w-8 text-learning" aria-hidden="true" />
            <p className="student-card-title text-foreground">
              {tDetail("noActivities")}
            </p>
            <p className="student-body max-w-md text-muted-foreground">
              {tDetail("noActivitiesIntro")}
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
