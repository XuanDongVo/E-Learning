"use client";

import { useState } from "react";
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
import { vocabularyProgressMock } from "./vocabulary-progress.mock";
import type {
  MemoryTreeMilestone,
  VocabularyProgressDashboard,
} from "@/types/student-vocabulary-progress";
import "./vocabulary-progress.css";

type Today = VocabularyProgressDashboard["today"];
type Tree = VocabularyProgressDashboard["tree"];

const STAGE_LABELS: Record<MemoryTreeMilestone, string> = {
  0: "Hạt giống",
  3: "Mầm mai",
  7: "Mai non",
  14: "Ra nụ",
  30: "Mai cổ thụ",
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value + "T12:00:00Z"));
}

function weekdayLabel(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
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

function TodayPanel({ today }: { today: Today }) {
  const target = Math.max(1, today.dailyTarget);
  const remaining = Math.max(0, target - today.completedDistinctWords);
  const progress = Math.min(100, (today.completedDistinctWords / target) * 100);

  return (
    <div className="vprogress-hero-today">
      <span className="student-meta text-primary">01 / HÔM NAY</span>
      <h2 className="vprogress-hero-title">Một chút mỗi ngày</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Học hoặc ôn 5 từ khác nhau để chăm cây.
      </p>
      <div className="vprogress-today-total">
        <span className="vprogress-today-number tabular-nums">
          {today.completedDistinctWords}
        </span>
        <span className="vprogress-today-denominator">/ {target} từ</span>
      </div>
      <div
        className="vprogress-track"
        role="progressbar"
        aria-label="Từ đủ điều kiện hôm nay"
        aria-valuenow={Math.min(today.completedDistinctWords, target)}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <span style={{ width: progress + "%" }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">
        {today.qualifiedToday
          ? "Hôm nay bạn đã chăm sóc cây tri thức."
          : "Còn " + remaining + " từ để ghi nhận ngày học hợp lệ."}
      </p>
      <div className="vprogress-today-due">
        <Clock3 className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong>{today.dueNow}</strong> từ đang đến hạn ôn tập
        </span>
      </div>
      <Link
        href="/student/vocabulary"
        className="student-control student-control--action vprogress-main-action"
      >
        Đến thư viện để ôn <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function TreePanel({ tree }: { tree: Tree }) {
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
            <span className="student-meta text-primary">02 / CÂY TRI THỨC</span>

            <h2 className="vprogress-hero-title">Cây tri thức của bạn</h2>
          </div>

          <span className="vprogress-badge">
            Mốc {tree.highestUnlockedMilestone} ngày
          </span>
        </div>

        <div className="vprogress-tree-details">
          <div className="vprogress-tree-stat">
            <span>Chuỗi hiện tại</span>
            <strong>
              {tree.currentStreak} <small>ngày</small>
            </strong>
          </div>

          <div className="vprogress-tree-stat">
            <span>Chuỗi dài nhất</span>
            <strong>
              {tree.longestStreak} <small>ngày</small>
            </strong>
          </div>
        </div>

        <div
          className="vprogress-milestone-track"
          aria-label="Các mốc phát triển của cây"
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

              <small>{milestone} ngày</small>
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
          Xem hành trình phát triển
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="vprogress-journey-dialog w-[calc(100%-1.25rem)] max-w-[700px] border-2 border-border bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="student-section-title">
              Hành trình của cây mai
            </DialogTitle>
            <DialogDescription>
              Chọn mốc để xem cây phát triển. Mốc chưa đạt chỉ được xem thử
              trong bản mock.
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
            aria-label="Xem các mốc cây mai"
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
                  {STAGE_LABELS[milestone]}
                </span>
                {milestone <= tree.highestUnlockedMilestone && (
                  <Check className="mx-auto size-3" aria-label="Đã mở khóa" />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="student-control student-control--quiet mx-auto inline-flex items-center gap-2 px-4"
            onClick={() => setReplayKey((value) => value + 1)}
          >
            <Sparkles className="size-4" aria-hidden="true" /> Phát lại hiệu ứng
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ContentProgressItem = {
  key: string;
  title: string;
  subtitle: string;
  learned: number;
  total: number;
  href: string;
};

function ContentProgressRow({ item }: { item: ContentProgressItem }) {
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
  const { overview } = data;
  const percentage = overview.totalWords
    ? Math.round((overview.learnedWords / overview.totalWords) * 100)
    : 0;
  const items: ContentProgressItem[] = data.units.slice(0, 4).map((unit) => ({
    key: "unit-" + unit.unitId,
    title: unit.name,
    subtitle: unit.dueCount + " từ đến hạn · " + unit.newCount + " từ chưa học",
    learned: unit.learnedCount,
    total: unit.totalCount,
    href: "/student/vocabulary/units/" + unit.unitId,
  }));

  return (
    <PaperSurface as="section" className="vprogress-learning-panel">
      <MaiBlossomAccent className="vprogress-content-flower" />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionHeading
          eyebrow="03 / TIẾN ĐỘ"
          title="Nội dung đang học"
          hint="Tổng quan nhanh, không thay thế thư viện từ vựng."
        />
        <span className="vprogress-badge">Theo Unit</span>
      </div>
      <div className="vprogress-learning-overview">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <strong className="vprogress-learning-number tabular-nums">
              {overview.learnedWords}
            </strong>
            <span className="text-sm text-muted-foreground">
              / {overview.totalWords} từ đã học
            </span>
          </div>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {percentage}%
          </span>
        </div>
        <div
          className="vprogress-track"
          role="progressbar"
          aria-label="Từ đã bắt đầu học"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: percentage + "%" }} />
        </div>
        <p className="text-xs text-muted-foreground">
          {overview.newWords} từ chưa học · “Đã học” là từ đã có lịch FSRS, chưa
          đồng nghĩa đã thuộc vững.
        </p>
      </div>
      <div className="vprogress-content-list">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Bộ từ đang học</h3>
          <span className="text-xs text-muted-foreground">
            Đã hiển thị {items.length} Unit
          </span>
        </div>
        {items.length > 0 ? (
          items.map((item) => <ContentProgressRow key={item.key} item={item} />)
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có bộ từ nào.</p>
        )}
      </div>
      <Link href="/student/vocabulary" className="vprogress-text-link">
        Xem tất cả trong thư viện{" "}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}

function LearningActivity({ data }: { data: VocabularyProgressDashboard }) {
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
          eyebrow="04 / NHỊP HỌC TẬP"
          title="Lịch ôn & hoạt động"
        />
        <CalendarDays
          className="size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
      </div>
      <div className="vprogress-activity-section">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="vprogress-subheading">7 ngày ôn tập</h3>
          <span className="text-xs text-muted-foreground">
            Dự kiến theo FSRS
          </span>
        </div>
        <div
          className="vprogress-schedule"
          role="group"
          aria-label="Chọn ngày xem lịch ôn"
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
                {weekdayLabel(day.date)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {dateLabel(day.date)}
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
            ? dateLabel(selectedReview.date) +
              ": dự kiến " +
              selectedReview.dueCount +
              " từ đến hạn."
            : "Chưa có lịch ôn tập."}
          <span className="ml-1 text-muted-foreground">
            Lịch có thể thay đổi sau khi ôn.
          </span>
        </p>
      </div>
      <div className="vprogress-activity-section vprogress-activity-section--heatmap">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="vprogress-subheading">12 tuần hoạt động</h3>
          <span className="text-xs font-semibold text-muted-foreground">
            {qualifiedDays} ngày đạt mục tiêu (mẫu)
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Mỗi ô là một ngày · Đủ 5 từ khác nhau được đánh giá HARD / GOOD / EASY
          là ngày hợp lệ.
        </p>
        <div
          className="vprogress-heatmap-wrap"
          aria-label="Lịch hoạt động 12 tuần"
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
                  aria-label={
                    dateLabel(day.date) +
                    ": " +
                    (count ?? "chưa có dữ liệu") +
                    " từ, " +
                    (day.qualifiedDay ? "đạt mục tiêu" : "chưa đạt mục tiêu")
                  }
                  title={dateLabel(day.date) + ": " + (count ?? "-") + " từ"}
                />
              );
            })}
          </div>
        </div>
        <div className="vprogress-heatmap-footer">
          <p className="text-xs text-muted-foreground">
            {selectedActivity
              ? dateLabel(selectedActivity.date) +
                ": " +
                (selectedActivity.qualifiedWordCount ?? 0) +
                " từ · " +
                (selectedActivity.qualifiedDay
                  ? "Đạt mục tiêu"
                  : "Chưa đạt mục tiêu")
              : "Chọn một ngày để xem chi tiết."}
          </p>
          <div className="vprogress-heat-legend">
            <span>Ít</span>
            <i className="vprogress-heat-key vprogress-heat-cell--empty" />
            <i className="vprogress-heat-key vprogress-heat-cell--low" />
            <i className="vprogress-heat-key vprogress-heat-cell--medium" />
            <i className="vprogress-heat-key vprogress-heat-cell--high" />
            <span>Nhiều</span>
          </div>
        </div>
      </div>
    </PaperSurface>
  );
}

function AttentionWords({ data }: { data: VocabularyProgressDashboard }) {
  const [expandedWord, setExpandedWord] = useState<number | null>(null);
  return (
    <PaperSurface as="section" className="vprogress-attention">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeading
          eyebrow="05 / CỦNG CỐ"
          title="Những từ cần chú ý"
          hint="Gợi ý các từ thường được đánh giá AGAIN hoặc HARD trong dữ liệu mẫu."
        />
        <Link href="/student/vocabulary" className="vprogress-text-link">
          Đến thư viện <ArrowRight className="size-4" aria-hidden="true" />
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
                Các lượt đánh giá này chỉ là dữ liệu minh họa, chưa có thuật
                toán xếp hạng từ khó.
              </p>
            )}
          </div>
        ))}
      </div>
    </PaperSurface>
  );
}

export function StudentVocabularyProgressPage({
  data = vocabularyProgressMock,
}: {
  data?: VocabularyProgressDashboard;
}) {
  return (
    <main className="student-vocab vprogress mx-auto max-w-[1200px] space-y-5 pb-12 sm:space-y-6">
      <header className="vprogress-page-header">
        <div className="vprogress-page-title">
          <span className="student-meta text-primary">
            SỔ TAY TỪ VỰNG / TIẾN ĐỘ
          </span>
          <div className="vprogress-heading-line">
            <ScrapbookHeading as="h1" className="student-page-title">
              Hành trình từ vựng
            </ScrapbookHeading>
            <MaiBlossomAccent className="vprogress-header-flower" />
          </div>
          <p className="student-body text-muted-foreground">
            Mỗi ngày học một chút, cây tri thức lớn thêm một phần.
          </p>
          <span className="vprogress-mock-notice">
            Bản xem trước · Dữ liệu minh họa, chưa kết nối tài khoản
          </span>
        </div>
        <Link
          href="/student/vocabulary"
          className="student-control student-control--quiet inline-flex items-center gap-2 px-4"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <LibraryBig className="size-4" aria-hidden="true" />
          Thư viện từ
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
      <p className="text-center text-xs text-muted-foreground">
        Mock UI · Chưa tính streak, lịch FSRS hay danh sách từ khó từ dữ liệu
        thực.
      </p>
    </main>
  );
}
