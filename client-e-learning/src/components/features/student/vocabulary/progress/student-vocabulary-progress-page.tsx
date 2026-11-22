"use client";

import { useLocale, useTranslations } from "next-intl";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  History,
  LibraryBig,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MemoryMaiTree,
  MEMORY_MAI_STAGES,
} from "../memory-tree/memory-mai-tree";
import {
  MaiBlossomAccent,
  MaiBranchAccent,
} from "./vocabulary-progress-botanicals";
import { QUERY_KEYS } from "@/services/query-keys";
import { studentVocabularyProgressService } from "@/services/student/student-vocabulary-progress.service";
import type {
  MemoryTreeMilestone,
  VocabularyProgressDashboard,
  VocabularyProgressContentItem,
  VocabularyProgressToday,
  VocabularyProgressTree,
} from "@/types/student-vocabulary-progress";


function dateLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value + "T12:00:00Z"));
}

function weekdayLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(value + "T12:00:00Z"));
}

function SectionHeading({
  eyebrow,
  title,
  hint,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      {eyebrow && <span className="student-meta text-primary">{eyebrow}</span>}
      <ScrapbookHeading
        as="h2"
        className="student-section-title text-foreground"
      >
        {title}
      </ScrapbookHeading>
      {hint && <p className="student-caption text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TodayPanel({ today }: { today: VocabularyProgressToday }) {
  const t = useTranslations("student.vocabulary.progressPage.today");
  const target = Math.max(1, today.dailyTarget);
  const remaining = Math.max(0, target - today.completedDistinctWords);
  const progress = Math.min(100, (today.completedDistinctWords / target) * 100);

  return (
    <div className="vprogress-hero-today">
      <span className="student-meta text-primary">{t("eyebrow")}</span>
      <h2 className="vprogress-hero-title">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("description", { count: target })}
      </p>
      <div className="vprogress-today-total">
        <span className="vprogress-today-number tabular-nums">
          {today.completedDistinctWords}
        </span>
        <span className="vprogress-today-denominator">/ {t("wordCount", { count: target })}</span>
      </div>
      <div
        className="vprogress-track"
        role="progressbar"
        aria-label={t("aria")}
        aria-valuenow={Math.min(today.completedDistinctWords, target)}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <span style={{ width: progress + "%" }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">
        {today.qualifiedToday
          ? t("qualified")
          : t("remaining", { count: remaining })}
      </p>
      <div className="vprogress-today-due">
        <Clock3 className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          {t("due", { count: today.dueNow })}
        </span>
      </div>
      <Link
        href="/student/vocabulary"
        className="student-control student-control--action vprogress-main-action"
      >
        {t("review")} <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function TreePanel({ tree }: { tree: VocabularyProgressTree }) {
  const t = useTranslations("student.vocabulary.progressPage.tree");
  const tStages = useTranslations("student.vocabulary.progressPage.stages");
  const [open, setOpen] = useState(false);
  const [previewStage, setPreviewStage] = useState<MemoryTreeMilestone>(
    tree.highestUnlockedMilestone,
  );
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="vprogress-hero-tree">
      <MaiBranchAccent className="vprogress-tree-sprig" />

      {/* Cột trái desktop: cây mai */}
      <div className="vprogress-tree-art">
        <MemoryMaiTree
          stage={tree.highestUnlockedMilestone}
          animate
          showFallingPetals
        />
      </div>

      {/* Cột phải desktop: toàn bộ thông tin */}
      <div className="vprogress-tree-content">
        <div className="vprogress-tree-heading">
          <div>
            <span className="student-meta text-primary">{t("eyebrow")}</span>

            <h2 className="vprogress-hero-title">{t("title")}</h2>
          </div>

          <span className="vprogress-badge">
            {t("milestone", { count: tree.highestUnlockedMilestone })}
          </span>
        </div>

        <div className="vprogress-tree-details">
          <div className="vprogress-tree-stat">
            <span>{t("current")}</span>
            <strong>
              <small>{t("days", { count: tree.currentStreak })}</small>
            </strong>
          </div>

          <div className="vprogress-tree-stat">
            <span>{t("longest")}</span>
            <strong>
              <small>{t("days", { count: tree.longestStreak })}</small>
            </strong>
          </div>
        </div>

        <div
          className="vprogress-milestone-track"
          aria-label={t("track")}
        >
          {[3, 7, 14, 30].map((milestone) => (
            <div key={milestone} className="vprogress-milestone-marker">
              <span
                className={
                  milestone <= tree.highestUnlockedMilestone
                    ? "is-unlocked"
                    : ""
                }
              >
                {milestone <= tree.highestUnlockedMilestone && (
                  <Check className="size-3" aria-hidden="true" />
                )}
              </span>

              <small>{t("days", { count: milestone })}</small>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setPreviewStage(tree.highestUnlockedMilestone);
            setOpen(true);
          }}
          className="student-control student-control--secondary vprogress-tree-action"
        >
          <History className="size-4" aria-hidden="true" />
          {t("journeyButton")}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="vprogress-journey-dialog w-[calc(100%-1.25rem)] sm:max-w-[700px] border-2 border-border bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="student-section-title">
              {t("journeyTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("journeyDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="mx-auto w-full max-w-[350px]">
            <MemoryMaiTree
              key={previewStage + "-" + replayKey}
              stage={previewStage}
            />
          </div>
          <div
            className="grid grid-cols-5 gap-1.5 sm:gap-2"
            role="group"
            aria-label={t("stagesAria")}
          >
            {MEMORY_MAI_STAGES.map((milestone) => (
              <button
                key={milestone}
                type="button"
                aria-pressed={previewStage === milestone}
                onClick={() => {
                  setPreviewStage(milestone);
                  setReplayKey((value) => value + 1);
                }}
                className={
                  "vprogress-milestone " +
                  (previewStage === milestone ? "is-selected" : "")
                }
              >
                <span className="font-bold">{milestone}</span>
                <span className="text-[10px] sm:text-xs">
                  {tStages(String(milestone) as "0" | "3" | "7" | "14" | "30")}
                </span>
                {milestone <= tree.highestUnlockedMilestone && (
                  <Check className="mx-auto size-3" aria-label={t("unlocked")} />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="student-control student-control--quiet mx-auto inline-flex items-center gap-2 px-4"
            onClick={() => setReplayKey((value) => value + 1)}
          >
            <Sparkles className="size-4" aria-hidden="true" /> {t("replay")}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContentProgressRow({ item }: { item: VocabularyProgressContentItem }) {
  const progress =
    item.total > 0 ? Math.round((item.learned / item.total) * 100) : 0;
  return (
    <Link href={item.href} className="vprogress-content-row">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <strong className="min-w-0 truncate text-sm">{item.title}</strong>
          <span className="shrink-0 text-xs font-semibold tabular-nums">
            {item.learned}/{item.total}
          </span>
        </div>
        <div className="vprogress-track vprogress-track--small">
          <span style={{ width: progress + "%" }} />
        </div>
        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}

function ContentProgress({ data }: { data: VocabularyProgressDashboard }) {
  const t = useTranslations("student.vocabulary.progressPage.content");
  const { overview } = data;
  const percentage = overview.totalWords
    ? Math.round((overview.learnedWords / overview.totalWords) * 100)
    : 0;
  const items: VocabularyProgressContentItem[] = data.units
    .slice(0, 4)
    .map((unit) => ({
    key: "unit-" + unit.unitId,
    title: unit.name,
    subtitle: t("unitSubtitle", { due: unit.dueCount, newWords: unit.newCount }),
    learned: unit.learnedCount,
    total: unit.totalCount,
    href: "/student/vocabulary/units/" + unit.unitId,
  }));

  return (
    <PaperSurface as="section" className="vprogress-learning-panel">
      <MaiBlossomAccent className="vprogress-content-flower" />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          hint={t("hint")}
        />
        <span className="vprogress-badge">{t("byUnit")}</span>
      </div>
      <div className="vprogress-learning-overview">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <strong className="vprogress-learning-number tabular-nums">
              {overview.learnedWords}
            </strong>
            <span className="text-sm text-muted-foreground">
              {t("learnedTotal", { count: overview.totalWords })}
            </span>
          </div>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {percentage}%
          </span>
        </div>
        <div
          className="vprogress-track"
          role="progressbar"
          aria-label={t("progressAria")}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: percentage + "%" }} />
        </div>
        <p className="text-xs text-muted-foreground">
          {t("newWordHint", { count: overview.newWords })}
        </p>
      </div>
      <div className="vprogress-content-list">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">{t("wordSets")}</h3>
          <span className="text-xs text-muted-foreground">
            {t("visibleUnits", { count: items.length })}
          </span>
        </div>
        {items.length > 0 ? (
          items.map((item) => <ContentProgressRow key={item.key} item={item} />)
        ) : (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
      </div>
      <Link href="/student/vocabulary" className="vprogress-text-link">
        {t("viewAll")}{" "}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}

function LearningActivity({ data }: { data: VocabularyProgressDashboard }) {
  const t = useTranslations("student.vocabulary.progressPage.activity");
  const locale = useLocale();
  const [selectedReviewDate, setSelectedReviewDate] = useState(
    data.upcomingReviews[0]?.date ?? "",
  );
  const [selectedActivityDate, setSelectedActivityDate] = useState(
    data.activityDays.at(-1)?.date ?? "",
  );
  const maxDue = Math.max(
    1,
    ...data.upcomingReviews.map((day) => day.dueCount),
  );
  const selectedReview = data.upcomingReviews.find(
    (day) => day.date === selectedReviewDate,
  );
  const selectedActivity = data.activityDays.find(
    (day) => day.date === selectedActivityDate,
  );
  const qualifiedDays = data.activityDays.filter(
    (day) => day.qualifiedDay,
  ).length;

  return (
    <PaperSurface as="section" className="vprogress-activity-panel">
      <div className="flex items-center justify-between gap-2">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
        />
        <CalendarDays
          className="size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
      </div>
      <div className="vprogress-activity-section">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="vprogress-subheading">{t("weekTitle")}</h3>
          <span className="text-xs text-muted-foreground">
            {t("fsrs")}
          </span>
        </div>
        <div
          className="vprogress-schedule"
          role="group"
          aria-label={t("chooseDay")}
        >
          {data.upcomingReviews.map((day) => (
            <button
              key={day.date}
              type="button"
              aria-pressed={selectedReviewDate === day.date}
              onClick={() => setSelectedReviewDate(day.date)}
              className={
                "vprogress-schedule-day " +
                (selectedReviewDate === day.date ? "is-selected" : "")
              }
            >
              <span className="text-xs font-bold">
                {weekdayLabel(day.date, locale)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {dateLabel(day.date, locale)}
              </span>
              <span className="vprogress-bar-holder">
                <span
                  className="vprogress-bar"
                  style={{
                    height: Math.max(7, (day.dueCount / maxDue) * 100) + "%",
                  }}
                />
              </span>
              <span className="text-xs font-extrabold tabular-nums">
                {day.dueCount}
              </span>
            </button>
          ))}
        </div>
        <p className="vprogress-activity-note">
          <Clock3
            className="size-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          {selectedReview
            ? t("reviewSelected", { date: dateLabel(selectedReview.date, locale), count: selectedReview.dueCount })
            : t("reviewEmpty")}
          <span className="ml-1 text-muted-foreground">
            {t("scheduleNote")}
          </span>
        </p>
      </div>
      <div className="vprogress-activity-section vprogress-activity-section--heatmap">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="vprogress-subheading">{t("weeksTitle")}</h3>
          <span className="text-xs font-semibold text-muted-foreground">
            {t("qualifiedDays", { count: qualifiedDays })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("heatmapHint")}
        </p>
        <div
          className="vprogress-heatmap-wrap"
          aria-label={t("heatmapAria")}
        >
          <div className="vprogress-heatmap">
            {data.activityDays.map((day) => {
              const count = day.qualifiedWordCount;
              const level =
                count === null
                  ? "future"
                  : count === 0
                    ? "empty"
                    : count < 5
                      ? "low"
                      : count < 9
                        ? "medium"
                        : "high";
              return (
                <button
                  key={day.date}
                  type="button"
                  aria-pressed={selectedActivityDate === day.date}
                  onClick={() => setSelectedActivityDate(day.date)}
                  className={
                    "vprogress-heat-cell vprogress-heat-cell--" +
                    level +
                    (selectedActivityDate === day.date ? " is-selected" : "")
                  }
                  aria-label={t("heatmapDay", { date: dateLabel(day.date, locale), count: count ?? t("noData"), status: day.qualifiedDay ? t("qualified") : t("notQualified") })}
                  title={t("heatmapTitle", { date: dateLabel(day.date, locale), count: count ?? "-" })}
                />
              );
            })}
          </div>
        </div>
        <div className="vprogress-heatmap-footer">
          <p className="text-xs text-muted-foreground">
            {selectedActivity
              ? t("selectedActivity", { date: dateLabel(selectedActivity.date, locale), count: selectedActivity.qualifiedWordCount ?? 0, status: selectedActivity.qualifiedDay ? t("qualified") : t("notQualified") })
              : t("selectDay")}
          </p>
          <div className="vprogress-heat-legend">
            <span>{t("low")}</span>
            <i className="vprogress-heat-key vprogress-heat-cell--empty" />
            <i className="vprogress-heat-key vprogress-heat-cell--low" />
            <i className="vprogress-heat-key vprogress-heat-cell--medium" />
            <i className="vprogress-heat-key vprogress-heat-cell--high" />
            <span>{t("high")}</span>
          </div>
        </div>
      </div>
    </PaperSurface>
  );
}

function AttentionWords({ data }: { data: VocabularyProgressDashboard }) {
  const t = useTranslations("student.vocabulary.progressPage.attention");
  const [expandedWord, setExpandedWord] = useState<number | null>(null);
  return (
    <PaperSurface as="section" className="vprogress-attention">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          hint={t("hint")}
        />
        <Link href="/student/vocabulary" className="vprogress-text-link">
          {t("toLibrary")} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="vprogress-word-grid">
        {data.attentionWords.slice(0, 3).map((word) => (
          <div key={word.wordId} className="vprogress-word">
            <button
              type="button"
              className="vprogress-word-toggle"
              aria-expanded={expandedWord === word.wordId}
              onClick={() =>
                setExpandedWord((current) =>
                  current === word.wordId ? null : word.wordId,
                )
              }
            >
              <span className="vprogress-word-icon" aria-hidden="true">
                <BookOpen className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm">{word.word}</strong>
                <span className="block truncate text-xs text-muted-foreground">
                  {word.meaningVi} · {word.unitName}
                </span>
              </span>
              <ChevronRight
                className={
                  "size-4 shrink-0 transition-transform " +
                  (expandedWord === word.wordId ? "rotate-90" : "")
                }
                aria-hidden="true"
              />
            </button>
            <div className="vprogress-word-tags">
              <span>AGAIN × {word.againCount}</span>
              <span>HARD × {word.hardCount}</span>
            </div>
            {expandedWord === word.wordId && (
              <p className="vprogress-word-detail">
                {t("sample")}
              </p>
            )}
          </div>
        ))}
      </div>
    </PaperSurface>
  );
}

export function StudentVocabularyProgressPage() {
  const t = useTranslations("student.vocabulary.progressPage.page");
  const dashboard = useQuery({
    queryKey: QUERY_KEYS.studentVocabularyProgress,
    queryFn: studentVocabularyProgressService.getDashboard,
  });
  const data = dashboard.data?.data;

  if (dashboard.isLoading) {
    return (
      <main className="student-vocab vprogress mx-auto max-w-[1200px] pb-12">
        <PaperSurface className="p-6" role="status">
          {t("loading")}
        </PaperSurface>
      </main>
    );
  }

  if (dashboard.isError) {
    return (
      <main className="student-vocab vprogress mx-auto max-w-[1200px] pb-12">
        <PaperSurface as="section" className="space-y-3 p-6" role="alert">
          <h1 className="student-section-title">{t("error")}</h1>
          <p className="student-body text-destructive">
            {dashboard.error instanceof Error
              ? dashboard.error.message
              : t("connectionError")}
          </p>
          <button
            type="button"
            onClick={() => void dashboard.refetch()}
            className="student-control student-control--action inline-flex items-center gap-2 px-4"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t("retry")}
          </button>
        </PaperSurface>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="student-vocab vprogress mx-auto max-w-[1200px] space-y-5 pb-12 sm:space-y-6">
      <header className="vprogress-page-header">
        <div className="vprogress-page-title">
          <span className="student-meta text-primary">
            {t("eyebrow")}
          </span>
          <div className="vprogress-heading-line">
            <ScrapbookHeading as="h1" className="student-page-title">
              {t("title")}
            </ScrapbookHeading>
            <MaiBlossomAccent className="vprogress-header-flower" />
          </div>
          <p className="student-body text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/student/vocabulary"
          className="student-control student-control--quiet inline-flex items-center gap-2 px-4"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <LibraryBig className="size-4" aria-hidden="true" />
          {t("library")}
        </Link>
      </header>
      <PaperSurface as="section" className="vprogress-hero">
        <TodayPanel today={data.today} />
        <TreePanel tree={data.tree} />
      </PaperSurface>
      <div className="vprogress-body-grid">
        <ContentProgress data={data} />
        <LearningActivity data={data} />
      </div>
      <AttentionWords data={data} />
    </main>
  );
}
