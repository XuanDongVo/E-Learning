"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
    if (sort === "hardest") list.sort((a, b) => (a.accuracyPercent ?? 0) - (b.accuracyPercent ?? 0));
    if (sort === "easiest") list.sort((a, b) => (b.accuracyPercent ?? 0) - (a.accuracyPercent ?? 0));
    if (sort === "order") list.sort((a, b) => a.position - b.position);
    return list;
  }, [all, sort, diff]);

  if (query.isLoading) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t("empty")}</div>;
  }
  if (query.isError) {
    return (
      <div className="rounded-xl border border-destructive/30 p-4 text-sm">
        {t("loadError")}{" "}
        <button type="button" className="text-primary" onClick={() => query.refetch()}>
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["order", t("questions.sortOrder")],
              ["hardest", t("questions.sortHardest")],
              ["easiest", t("questions.sortEasiest")],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSort(id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                sort === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-border" />
          {(
            [
              ["ALL", t("questions.filterAll", { count: all.length })],
              ["HARD", t("questions.filterHard", { count: hardCount })],
              ["EASY", t("questions.filterEasy", { count: easyCount })],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDiff(id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                diff === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <OutcomeLegend />
      </div>

      <p className="text-xs text-muted-foreground">{t("questions.footnote")}</p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-3 py-2 font-medium">{t("questions.col.position")}</th>
              <th className="px-3 py-2 font-medium">{t("questions.col.content")}</th>
              <th className="px-3 py-2 font-medium">{t("questions.col.type")}</th>
              <th className="px-3 py-2 font-medium">{t("questions.col.result")}</th>
              <th className="px-3 py-2 font-medium">{t("questions.col.correct")}</th>
              <th className="px-3 py-2 font-medium">{t("questions.col.blank")}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const open = expanded === q.position;
              const blankPct =
                q.attemptCount > 0 ? Math.round((100 * q.unansweredCount) / q.attemptCount) : 0;
              return (
                <Fragment key={q.position}>
                  <tr
                    className="cursor-pointer border-t border-border/70 hover:bg-muted/30"
                    onClick={() => setExpanded(open ? null : q.position)}
                  >
                    <td className="px-2 py-3 text-center text-muted-foreground">{open ? "▾" : "▸"}</td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{q.position}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{q.promptPreview}</p>
                      <p className="text-xs text-muted-foreground">{q.sectionTitle}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{q.questionType}</td>
                    <td className="min-w-[8rem] px-3 py-3">
                      <OutcomeBar outcome={outcomeOf(q)} />
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {q.accuracyPercent ?? 0}%{" "}
                      <span className="text-xs text-muted-foreground">n={q.attemptCount}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{blankPct}%</td>
                    <td className="px-3 py-3">
                      {q.difficulty === "HARD" ? (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          {t("questions.hard")}
                        </span>
                      ) : null}
                      {q.difficulty === "EASY" ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {t("questions.easy")}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                  {open ? (
                    <tr className="border-t border-border/40 bg-muted/20">
                      <td colSpan={8}>
                        <QuestionDistributionPanel
                          questionType={q.questionType}
                          distribution={q.distribution}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
