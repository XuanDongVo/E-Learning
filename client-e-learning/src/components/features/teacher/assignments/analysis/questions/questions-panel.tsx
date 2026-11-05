"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";

import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import type { QuestionAnalysisRow } from "@/types/assignment-analysis";
import { OutcomeBar, OutcomeLegend } from "../shared/outcome-bar";
import { QuestionDistributionPanel } from "./question-distribution";

type SortMode = "order" | "hardest" | "easiest";
type DiffFilter = "ALL" | "HARD" | "EASY";

function outcomeOf(q: QuestionAnalysisRow) {
  const n = Math.max(q.attemptCount, 1);
  return {
    correct: Math.round((100 * q.correctCount) / n),
    partial: Math.round((100 * q.partialCount) / n),
    incorrect: Math.round((100 * q.incorrectCount) / n),
    blank: Math.round((100 * q.unansweredCount) / n),
  };
}

export function QuestionsPanel({ assignmentId }: { assignmentId: number }) {
  const t = useTranslations("teacher.analytics");
  const [sort, setSort] = useState<SortMode>("order");
  const [diff, setDiff] = useState<DiffFilter>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["teacher-analysis-questions", assignmentId],
    queryFn: () => assignmentAnalysisService.getQuestions(assignmentId),
  });

  const all = query.data?.items ?? [];
  const hardCount = all.filter((q) => q.difficulty === "HARD").length;
  const easyCount = all.filter((q) => q.difficulty === "EASY").length;

  const rows = useMemo(() => {
    let list = [...all];
    if (diff === "HARD") list = list.filter((q) => q.difficulty === "HARD");
    if (diff === "EASY") list = list.filter((q) => q.difficulty === "EASY");
    if (sort === "hardest")
      list.sort((a, b) => (a.accuracyPercent ?? 0) - (b.accuracyPercent ?? 0));
    if (sort === "easiest")
      list.sort((a, b) => (b.accuracyPercent ?? 0) - (a.accuracyPercent ?? 0));
    if (sort === "order") list.sort((a, b) => a.position - b.position);
    return list;
  }, [all, sort, diff]);

  const toggleRow = (pos: number) => {
    setExpanded((prev) => (prev === pos ? null : pos));
  };

  if (query.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>{t("empty") || "Đang tải dữ liệu phân tích..."}</span>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">
        <AlertCircle className="size-5 text-destructive" />
        <p className="font-semibold text-destructive">{t("loadError") || "Không thể tải dữ liệu"}</p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          onClick={() => query.refetch()}
        >
          <RefreshCw className="size-3.5" />
          {t("retry") || "Thử lại"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. THANH TOOLBAR RESPONSIVE */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Nhóm Bộ lọc & Sắp xếp */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nhóm Sắp xếp */}
          <div className="flex items-center gap-1">
            {(
              [
                ["order", t("questions.sortOrder")],
                ["hardest", t("questions.sortHardest")],
                ["easiest", t("questions.sortEasiest")],
              ] as const
            ).map(([id, label]) => {
              const active = sort === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSort(id)}
                  className={`h-8 rounded-lg px-2.5 text-xs font-semibold transition-all sm:text-sm ${
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* Nhóm Độ khó */}
          <div className="flex items-center gap-1">
            {(
              [
                ["ALL", t("questions.filterAll", { count: all.length })],
                ["HARD", t("questions.filterHard", { count: hardCount })],
                ["EASY", t("questions.filterEasy", { count: easyCount })],
              ] as const
            ).map(([id, label]) => {
              const active = diff === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDiff(id)}
                  className={`h-8 rounded-lg px-2.5 text-xs font-semibold transition-all sm:text-sm ${
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chú thích màu sắc kết quả (OutcomeLegend) */}
        <div className="flex items-center justify-between border-t border-border pt-2 md:border-0 md:pt-0">
          <OutcomeLegend />
        </div>
      </div>

      <p className="text-xs text-muted-foreground sm:text-sm">
        {t("questions.footnote")}
      </p>

      {/* 2. GIAO DIỆN MOBILE: Dạng Danh Sách Thẻ (Hiển thị khi < md) */}
      <div className="space-y-3 md:hidden">
        {rows.map((q) => {
          const open = expanded === q.position;
          const blankPct =
            q.attemptCount > 0
              ? Math.round((100 * q.unansweredCount) / q.attemptCount)
              : 0;

          return (
            <div
              key={`mob-${q.position}`}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all"
            >
              {/* Header của thẻ trên mobile */}
              <button
                type="button"
                onClick={() => toggleRow(q.position)}
                className="w-full p-3.5 text-left transition-colors hover:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-md bg-muted text-xs font-bold text-foreground">
                      #{q.position}
                    </span>
                    {q.difficulty === "HARD" && (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        {t("questions.hard") || "Khó"}
                      </span>
                    )}
                    {q.difficulty === "EASY" && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {t("questions.easy") || "Dễ"}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {q.questionType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    {open ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </div>
                </div>

                {/* Nội dung câu hỏi */}
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
                  {q.promptPreview}
                </p>
                {q.sectionTitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {q.sectionTitle}
                  </p>
                )}

                {/* Thanh kết quả OutcomeBar */}
                <div className="mt-3">
                  <OutcomeBar outcome={outcomeOf(q)} />
                </div>

                {/* Chỉ số nhanh */}
                <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Tỷ lệ đúng: </span>
                    <strong className="text-foreground">
                      {q.accuracyPercent ?? 0}%
                    </strong>
                    <span className="text-muted-foreground"> (n={q.attemptCount})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bỏ trống: </span>
                    <span className="tabular-nums font-medium text-foreground">
                      {blankPct}%
                    </span>
                  </div>
                </div>
              </button>

              {/* Chi tiết phân bố khi mở rộng trên mobile */}
              {open && (
                <div className="border-t border-border bg-muted/20 p-3">
                  <QuestionDistributionPanel
                    questionType={q.questionType}
                    distribution={q.distribution}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. GIAO DIỆN DESKTOP: Dạng Bảng Phân Tích (Hiển thị khi >= md) */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-xs md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="px-3 py-3">{t("questions.col.position")}</th>
                <th className="min-w-[14rem] px-3 py-3">
                  {t("questions.col.content")}
                </th>
                <th className="px-3 py-3">{t("questions.col.type")}</th>
                <th className="min-w-[10rem] px-3 py-3">
                  {t("questions.col.result")}
                </th>
                <th className="px-3 py-3">{t("questions.col.correct")}</th>
                <th className="px-3 py-3">{t("questions.col.blank")}</th>
                <th className="px-3 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((q) => {
                const open = expanded === q.position;
                const blankPct =
                  q.attemptCount > 0
                    ? Math.round((100 * q.unansweredCount) / q.attemptCount)
                    : 0;

                return (
                  <Fragment key={q.position}>
                    <tr
                      className="group cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => toggleRow(q.position)}
                    >
                      <td className="px-3 py-3.5 text-center text-muted-foreground">
                        {open ? (
                          <ChevronDown className="mx-auto size-4 text-foreground" />
                        ) : (
                          <ChevronRight className="mx-auto size-4 group-hover:text-foreground" />
                        )}
                      </td>
                      <td className="px-3 py-3.5 font-mono text-xs font-bold text-muted-foreground">
                        #{q.position}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="line-clamp-2 font-medium text-foreground">
                          {q.promptPreview}
                        </p>
                        {q.sectionTitle && (
                          <p className="text-xs text-muted-foreground">
                            {q.sectionTitle}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-muted-foreground">
                        {q.questionType}
                      </td>
                      <td className="px-3 py-3.5">
                        <OutcomeBar outcome={outcomeOf(q)} />
                      </td>
                      <td className="px-3 py-3.5 tabular-nums">
                        <span className="font-bold text-foreground">
                          {q.accuracyPercent ?? 0}%
                        </span>{" "}
                        <span className="text-xs text-muted-foreground">
                          (n={q.attemptCount})
                        </span>
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-muted-foreground">
                        {blankPct}%
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        {q.difficulty === "HARD" && (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            {t("questions.hard")}
                          </span>
                        )}
                        {q.difficulty === "EASY" && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {t("questions.easy")}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Mở rộng chi tiết dạng hàng con */}
                    {open && (
                      <tr className="bg-muted/15">
                        <td colSpan={8} className="p-4">
                          <div className="rounded-lg border border-border/70 bg-card p-4 shadow-2xs">
                            <QuestionDistributionPanel
                              questionType={q.questionType}
                              distribution={q.distribution}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
