"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, ChevronRight,
  Clock3, Flower2, History, Leaf, LibraryBig, Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MemoryMaiTree, MEMORY_MAI_STAGES } from "../memory-tree/memory-mai-tree";
import { vocabularyProgressMock } from "./vocabulary-progress.mock";
import type { MemoryTreeMilestone, VocabularyProgressDashboard } from "@/types/student-vocabulary-progress";
import "./vocabulary-progress.css";

const STAGE_LABELS: Record<MemoryTreeMilestone, string> = {
  0: "Hạt giống",
  3: "Mầm mai",
  7: "Mai non",
  14: "Ra nụ",
  30: "Mai cổ thụ",
};

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { timeZone: "UTC", day: "2-digit", month: "2-digit" })
    .format(new Date(value + "T12:00:00Z"));

const weekdayLabel = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { timeZone: "UTC", weekday: "short" })
    .format(new Date(value + "T12:00:00Z"));

function SectionHeading({ eyebrow, title, hint }: { eyebrow: string; title: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <span className="student-meta text-primary">{eyebrow}</span>
      <ScrapbookHeading as="h2" className="student-section-title text-foreground">{title}</ScrapbookHeading>
      {hint && <p className="student-caption text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TodayCard({ data }: { data: VocabularyProgressDashboard }) {
  const { today } = data;
  const remaining = Math.max(0, today.dailyTarget - today.completedDistinctWords);
  return (
    <PaperSurface as="section" variant="lined" className="vprogress-today relative overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <SectionHeading eyebrow="01 / HÔM NAY" title="Một chút mỗi ngày" hint="Hoàn thành 5 từ khác nhau để chăm cây." />
        <span className="vprogress-stamp" aria-hidden="true"><Leaf className="size-5" /></span>
      </div>
      <div className="flex items-end gap-2">
        <span className="vprogress-today-number tabular-nums">{Math.min(today.completedDistinctWords, today.dailyTarget)}</span>
        <span className="pb-2 text-xl font-bold text-muted-foreground">/ {today.dailyTarget} từ</span>
      </div>
      <div className="vprogress-track mt-2" role="progressbar" aria-label="Từ đủ điều kiện hôm nay" aria-valuenow={Math.min(today.completedDistinctWords,today.dailyTarget)} aria-valuemin={0} aria-valuemax={today.dailyTarget}>
        <span style={{ width: `${Math.min(100, today.completedDistinctWords / today.dailyTarget * 100)}%` }} />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        {today.qualifiedToday ? "Hôm nay cây đã được chăm sóc!" : `Còn ${remaining} từ để ghi nhận một ngày học.`}
      </p>
      <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-sm">
        <Clock3 className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="flex-1"><strong>{today.dueNow}</strong> từ đang đến hạn ôn</span>
      </div>
      <Link href="/student/vocabulary" className="student-control student-control--action mt-4 flex w-full items-center justify-center gap-2 px-4">
        Đến thư viện để ôn tập <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}

function TreeCard({ data }: { data: VocabularyProgressDashboard }) {
  const [open, setOpen] = useState(false);
  const [previewStage, setPreviewStage] = useState<MemoryTreeMilestone>(data.tree.highestUnlockedMilestone);
  const [replayKey, setReplayKey] = useState(0);
  const tree = data.tree;
  return (
    <>
      <PaperSurface as="section" className="vprogress-tree relative flex min-w-0 flex-col overflow-hidden p-4 sm:p-6">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <SectionHeading eyebrow="02 / CÂY TRI THỨC" title="Cây mai của bạn" />
          <span className="vprogress-stage-label"><Flower2 className="size-3.5" /> Mốc {tree.highestUnlockedMilestone} ngày</span>
        </div>
        <div className="vprogress-tree-art mx-auto w-full max-w-[430px] flex-1">
          <MemoryMaiTree stage={tree.highestUnlockedMilestone} />
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-border pt-3">
          <div><p className="student-caption text-muted-foreground">Chuỗi hiện tại</p><p className="text-xl font-bold text-foreground tabular-nums">{tree.currentStreak} <span className="text-sm font-medium">ngày</span></p></div>
          <div><p className="student-caption text-muted-foreground">Chuỗi dài nhất</p><p className="text-xl font-bold text-foreground tabular-nums">{tree.longestStreak} <span className="text-sm font-medium">ngày</span></p></div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Cây giữ mốc đã mở khóa, kể cả khi chuỗi học bị ngắt.</p>
        <button type="button" onClick={() => { setPreviewStage(tree.highestUnlockedMilestone); setOpen(true); }} className="student-control student-control--secondary mt-3 inline-flex w-full items-center justify-center gap-2 px-4">
          <History className="size-4" aria-hidden="true" /> Xem hành trình phát triển
        </button>
      </PaperSurface>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="vprogress-journey-dialog w-[calc(100%-1.25rem)] max-w-[700px] border-2 border-border bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="student-section-title">Hành trình của cây mai</DialogTitle>
            <DialogDescription>Chọn mốc để xem cây phát triển. Các mốc chưa đạt chỉ được xem thử trong bản mock.</DialogDescription>
          </DialogHeader>
          <div className="mx-auto w-full max-w-[360px]">
            <MemoryMaiTree key={replayKey + "-" + previewStage} stage={previewStage} />
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label="Xem các mốc cây mai">
            {MEMORY_MAI_STAGES.map((milestone) => (
              <button key={milestone} type="button" aria-pressed={previewStage === milestone} onClick={() => { setPreviewStage(milestone); setReplayKey((value) => value + 1); }}
                className={"vprogress-milestone " + (previewStage === milestone ? "is-selected" : "")}>
                <span className="font-bold">{milestone === 0 ? "0" : milestone}</span>
                <span className="text-[10px] sm:text-xs">{STAGE_LABELS[milestone]}</span>
                {milestone <= tree.highestUnlockedMilestone && <Check className="mx-auto size-3" aria-label="Đã mở khóa" />}
              </button>
            ))}
          </div>
          <button type="button" className="student-control student-control--quiet mx-auto inline-flex items-center gap-2 px-4" onClick={() => setReplayKey((value) => value + 1)}>
            <Sparkles className="size-4" /> Phát lại hiệu ứng
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OverviewCard({ data }: { data: VocabularyProgressDashboard }) {
  const { overview } = data;
  const percent = overview.totalWords > 0 ? Math.round(overview.learnedWords / overview.totalWords * 100) : 0;
  return (
    <PaperSurface as="section" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionHeading eyebrow="03 / THƯ VIỆN" title="Từ vựng của bạn" hint="Đã học là từ đã có lịch FSRS, không đồng nghĩa đã thuộc vững." />
        <span className="vprogress-badge">{percent}% đã bắt đầu học</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Tổng số từ", value: overview.totalWords, tone: "all" },
          { label: "Đã học", value: overview.learnedWords, tone: "learned" },
          { label: "Chưa học", value: overview.newWords, tone: "new" },
        ].map((item) => (
          <div className={"vprogress-number vprogress-number--" + item.tone} key={item.label}>
            <span className="block text-2xl font-extrabold tabular-nums sm:text-3xl">{item.value}</span>
            <span className="mt-1 block text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="vprogress-track mt-4" role="progressbar" aria-label="Tỷ lệ từ đã học" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: percent + "%" }} /></div>
    </PaperSurface>
  );
}

function ReviewSchedule({ data }: { data: VocabularyProgressDashboard }) {
  const [selected, setSelected] = useState(data.upcomingReviews[0]?.date ?? "");
  const max = Math.max(1, ...data.upcomingReviews.map((day) => day.dueCount));
  const selectedDay = data.upcomingReviews.find((day) => day.date === selected);
  return (
    <PaperSurface as="section" className="p-5 sm:p-6">
      <SectionHeading eyebrow="04 / LỊCH DỰ KIẾN" title="7 ngày ôn tập sắp tới" hint="Số từ đến hạn có thể thay đổi sau mỗi lần ôn theo FSRS." />
      <div className="vprogress-schedule mt-5" role="group" aria-label="Chọn ngày xem lịch ôn">
        {data.upcomingReviews.map((day) => (
          <button key={day.date} type="button" aria-pressed={selected === day.date} onClick={() => setSelected(day.date)} className={"vprogress-schedule-day " + (selected === day.date ? "is-selected" : "")}>
            <span className="text-xs font-semibold">{weekdayLabel(day.date)}</span>
            <span className="text-[11px] text-muted-foreground">{dateLabel(day.date)}</span>
            <span className="vprogress-bar-holder"><span className="vprogress-bar" style={{ height: Math.max(7, day.dueCount / max * 82) + "%" }} /></span>
            <span className="text-sm font-extrabold tabular-nums">{day.dueCount}</span>
          </button>
        ))}
      </div>
      {selectedDay && <p className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm text-foreground"><CalendarDays className="mr-2 inline size-4 text-primary" aria-hidden="true" /><strong>{dateLabel(selectedDay.date)}:</strong> dự kiến {selectedDay.dueCount} từ đến hạn ôn.</p>}
    </PaperSurface>
  );
}

function ActivityHeatmap({ data }: { data: VocabularyProgressDashboard }) {
  const [selected, setSelected] = useState(data.activityDays.at(-1)?.date ?? "");
  const chosen = data.activityDays.find((day) => day.date === selected);
  const qualified = data.activityDays.filter((d) => d.qualifiedDay).length;
  return (
    <PaperSurface as="section" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeading eyebrow="05 / THÓI QUEN" title="12 tuần học từ vựng" hint="Mỗi ô là một ngày. Từ 5 từ khác nhau được đánh giá HARD/GOOD/EASY là ngày hợp lệ." />
        <span className="vprogress-badge">{qualified} ngày đạt mục tiêu trong mẫu</span>
      </div>
      <div className="mt-5 overflow-x-auto pb-2" aria-label="Lịch hoạt động 12 tuần, có thể cuộn ngang">
        <div className="vprogress-heatmap">
          {data.activityDays.map((day) => {
            const count = day.qualifiedWordCount;
            const level = count === null ? "future" : count === 0 ? "empty" : count < 5 ? "low" : count < 9 ? "medium" : "high";
            return (
              <button key={day.date} type="button" className={"vprogress-heat-cell vprogress-heat-cell--" + level + (selected === day.date ? " is-selected" : "")}
                aria-label={`${dateLabel(day.date)}: ${count ?? "chưa có dữ liệu"} từ, ${day.qualifiedDay ? "đạt mục tiêu" : "chưa đạt mục tiêu"}`}
                aria-pressed={selected === day.date} title={`${dateLabel(day.date)}: ${count ?? "-"} từ`} onClick={() => setSelected(day.date)} />
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{chosen ? `${dateLabel(chosen.date)}: ${chosen.qualifiedWordCount ?? 0} từ · ${chosen.qualifiedDay ? "Đã đạt mục tiêu" : "Chưa đạt mục tiêu"}` : "Chọn một ngày để xem số từ."}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>Ít</span><i className="vprogress-heat-key vprogress-heat-cell--empty" /><i className="vprogress-heat-key vprogress-heat-cell--low" /><i className="vprogress-heat-key vprogress-heat-cell--medium" /><i className="vprogress-heat-key vprogress-heat-cell--high" /><span>Nhiều</span></div>
      </div>
    </PaperSurface>
  );
}

function UnitProgress({ data }: { data: VocabularyProgressDashboard }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? data.units : data.units.slice(0, 4);
  return (
    <PaperSurface as="section" className="p-5 sm:p-6">
      <SectionHeading eyebrow="06 / THEO UNIT" title="Các bộ từ đang học" hint="Tiến độ theo số từ đã có FSRS card." />
      <div className="mt-5 space-y-4">
        {shown.map((unit) => {
          const percent = unit.totalCount ? Math.round(unit.learnedCount / unit.totalCount * 100) : 0;
          return <div key={unit.unitId} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-bold text-foreground">{unit.name}</p>
              <span className="shrink-0 text-xs font-bold tabular-nums">{unit.learnedCount}/{unit.totalCount}</span>
            </div>
            <div className="vprogress-track" role="progressbar" aria-label={`Đã học ${unit.name}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: percent + "%" }} /></div>
            <p className="text-xs text-muted-foreground">{unit.dueCount} từ cần ôn · {unit.newCount} từ chưa học</p>
          </div>;
        })}
      </div>
      {data.units.length > 4 && <button type="button" onClick={() => setExpanded((value) => !value)} className="student-control student-control--quiet mt-5 flex w-full items-center justify-center gap-1 px-4">
        {expanded ? "Thu gọn" : `Xem thêm ${data.units.length - 4} Unit`} <ChevronRight className={"size-4 transition-transform " + (expanded ? "-rotate-90" : "rotate-90")} />
      </button>}
      <Link href="/student/vocabulary" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
        Đến thư viện từ vựng <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}

function AttentionWords({ data }: { data: VocabularyProgressDashboard }) {
  const [openWord, setOpenWord] = useState<number | null>(null);
  return (
    <PaperSurface as="section" className="p-5 sm:p-6">
      <SectionHeading eyebrow="07 / CỦNG CỐ" title="Những từ cần chú ý" hint="Ví dụ minh họa theo số lần đánh giá AGAIN và HARD gần đây, chưa phải xếp hạng thật." />
      <div className="mt-4 divide-y divide-border">
        {data.attentionWords.map((word) => (
          <div key={word.wordId} className="py-3">
            <button type="button" aria-expanded={openWord === word.wordId} onClick={() => setOpenWord((value) => value === word.wordId ? null : word.wordId)} className="flex w-full items-center gap-3 text-left">
              <div className="vprogress-word-index"><BookOpen className="size-4" aria-hidden="true" /></div>
              <span className="min-w-0 flex-1"><strong className="block text-sm text-foreground">{word.word}</strong><span className="block text-xs text-muted-foreground">{word.meaningVi} · {word.unitName}</span></span>
              <ChevronRight className={"size-4 shrink-0 text-muted-foreground transition-transform " + (openWord === word.wordId ? "rotate-90" : "")} aria-hidden="true" />
            </button>
            {openWord === word.wordId && <div className="ml-12 mt-2 rounded-lg bg-secondary/50 p-3 text-xs text-foreground">
              Lần đánh giá Khó: {word.hardCount} · Chưa nhớ: {word.againCount}. Đây chỉ là dữ liệu mẫu.
            </div>}
          </div>
        ))}
      </div>
      <Link href="/student/vocabulary" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
        Mở thư viện để luyện tập <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}

export function StudentVocabularyProgressPage({ data = vocabularyProgressMock }: { data?: VocabularyProgressDashboard }) {
  return (
    <main className="student-vocab vprogress mx-auto max-w-[1180px] space-y-5 pb-12 sm:space-y-6">
      <header className="vprogress-page-header flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="student-meta text-primary">SỔ TAY TỪ VỰNG / TIẾN ĐỘ</p>
          <ScrapbookHeading as="h1" className="student-page-title">Hành trình từ vựng</ScrapbookHeading>
          <p className="student-body text-muted-foreground">Mỗi ngày học một chút, cây tri thức lớn thêm một phần.</p>
          <p className="vprogress-mock-notice">Bản xem trước · Dữ liệu minh họa, chưa kết nối tài khoản</p>
        </div>
        <Link href="/student/vocabulary" className="student-control student-control--quiet inline-flex items-center gap-2 px-4">
          <ArrowLeft className="size-4" aria-hidden="true" /> <LibraryBig className="size-4" aria-hidden="true" /> Thư viện từ
        </Link>
      </header>
      <div className="vprogress-hero-grid">
        <TodayCard data={data} />
        <TreeCard data={data} />
      </div>
      <OverviewCard data={data} />
      <ReviewSchedule data={data} />
      <ActivityHeatmap data={data} />
      <div className="vprogress-bottom-grid">
        <UnitProgress data={data} />
        <AttentionWords data={data} />
      </div>
      <p className="text-center text-xs text-muted-foreground">Mock UI · Chưa tính streak, lịch FSRS hoặc thống kê từ dữ liệu thật.</p>
    </main>
  );
}
