"use client";

import { useMemo, useState } from "react";
import { MOCK_QUESTIONS } from "../mock-data";
import { OutcomeBar, OutcomeLegend } from "../shared/outcome-bar";
import {
  QuestionDistributionPanel,
  type QuestionDistribution,
} from "./question-distribution";

type SortMode = "order" | "hardest" | "easiest";
type DiffFilter = "ALL" | "HARD" | "EASY";

/** Enrich mock rows with type-appropriate distribution for expand UI. */
function mockDistribution(q: (typeof MOCK_QUESTIONS)[number]): QuestionDistribution {
  const n = q.n;
  const type = q.typeLabel.toLowerCase();

  if (type.includes("single") || type.includes("true")) {
    const correctCount = Math.round((q.accuracyPercent / 100) * n);
    const blank = Math.round((q.blankPercent / 100) * n);
    const wrong = Math.max(0, n - correctCount - blank);
    return {
      kind: "OPTIONS",
      options: [
        { key: "A", label: "option A", count: Math.floor(wrong / 2), correct: false },
        { key: "B", label: "option B", count: correctCount, correct: true },
        { key: "C", label: "option C", count: Math.ceil(wrong / 2), correct: false },
        { key: "D", label: "option D", count: 0, correct: false },
      ],
      unansweredCount: blank,
      sampleSize: n,
    };
  }

  if (type.includes("multiple choice")) {
    return {
      kind: "OPTIONS",
      options: [
        { key: "A", label: "option A", count: Math.round(n * 0.7), correct: true },
        { key: "B", label: "option B", count: Math.round(n * 0.5), correct: true },
        { key: "C", label: "option C", count: Math.round(n * 0.3), correct: false },
        { key: "D", label: "option D", count: Math.round(n * 0.2), correct: false },
      ],
      unansweredCount: Math.round((q.blankPercent / 100) * n),
      sampleSize: n,
    };
  }

  if (type.includes("multiple blanks") || type.includes("cloze")) {
    return {
      kind: "CLOZE",
      blanks: [
        {
          blankKey: "1",
          blankLabel: "(1)",
          answers: [
            { key: "gets", label: "gets", count: 8, correct: true },
            { key: "get", label: "get", count: 7, correct: false },
            { key: "got", label: "got", count: 4, correct: false },
          ],
          blankCount: 2,
        },
        {
          blankKey: "2",
          blankLabel: "(2)",
          answers: [
            { key: "has", label: "has", count: 6, correct: true },
            { key: "have", label: "have", count: 9, correct: false },
          ],
          blankCount: 3,
        },
      ],
      unansweredCount: Math.round((q.blankPercent / 100) * n),
      sampleSize: n,
    };
  }

  if (type.includes("text") || type.includes("chấm")) {
    return {
      kind: "TEXT",
      textAnswers: [
        { key: "1", label: "My best friend is Lan.", count: 5, correct: true },
        { key: "2", label: "I like football.", count: 4, correct: false },
        { key: "3", label: "He is kind.", count: 3, correct: true },
      ],
      unansweredCount: Math.round((q.blankPercent / 100) * n),
      sampleSize: n,
    };
  }

  return {
    kind: "OPTIONS",
    options: [
      { key: "A", label: "…", count: Math.round(n * 0.4), correct: true },
      { key: "B", label: "…", count: Math.round(n * 0.3), correct: false },
    ],
    unansweredCount: Math.round((q.blankPercent / 100) * n),
    sampleSize: n,
  };
}

export function QuestionsPanel() {
  const [sort, setSort] = useState<SortMode>("order");
  const [diff, setDiff] = useState<DiffFilter>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  const rows = useMemo(() => {
    let list = [...MOCK_QUESTIONS];
    if (diff === "HARD") list = list.filter((q) => q.difficulty === "HARD");
    if (diff === "EASY") list = list.filter((q) => q.difficulty === "EASY");
    if (sort === "hardest") list.sort((a, b) => a.accuracyPercent - b.accuracyPercent);
    if (sort === "easiest") list.sort((a, b) => b.accuracyPercent - a.accuracyPercent);
    if (sort === "order") list.sort((a, b) => a.position - b.position);
    return list;
  }, [sort, diff]);

  const hardCount = MOCK_QUESTIONS.filter((q) => q.difficulty === "HARD").length;
  const easyCount = MOCK_QUESTIONS.filter((q) => q.difficulty === "EASY").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["order", "Thứ tự đề"],
              ["hardest", "Sai nhiều nhất"],
              ["easiest", "Đúng nhiều nhất"],
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
              ["ALL", `Tất cả (${MOCK_QUESTIONS.length})`],
              ["HARD", `Khó (${hardCount})`],
              ["EASY", `Quá dễ (${easyCount})`],
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

      <p className="text-xs text-muted-foreground">
        Tỉ lệ đúng = số em đúng / bài đã nộp (bỏ trống vẫn tính ở mẫu số). Dưới 40% gắn “Khó”, trên 90%
        gắn “Quá dễ”. Bấm vào một câu để xem các em chọn gì (theo loại câu).
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-3 py-2 font-medium">Câu</th>
              <th className="px-3 py-2 font-medium">Nội dung</th>
              <th className="px-3 py-2 font-medium">Loại</th>
              <th className="px-3 py-2 font-medium">Kết quả</th>
              <th className="px-3 py-2 font-medium">Đúng</th>
              <th className="px-3 py-2 font-medium">Bỏ trống</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const open = expanded === q.position;
              const dist = mockDistribution(q);
              return (
                <>
                  <tr
                    key={q.position}
                    className="border-t border-border/70 cursor-pointer hover:bg-muted/30"
                    onClick={() => setExpanded(open ? null : q.position)}
                  >
                    <td className="px-2 py-3 text-center text-muted-foreground">
                      {open ? "▾" : "▸"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{q.position}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{q.prompt}</p>
                      <p className="text-xs text-muted-foreground">{q.sectionTitle}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{q.typeLabel}</td>
                    <td className="min-w-[8rem] px-3 py-3">
                      <OutcomeBar outcome={q.outcome} />
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {q.accuracyPercent}%{" "}
                      <span className="text-xs text-muted-foreground">n={q.n}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {q.blankPercent}%
                    </td>
                    <td className="px-3 py-3">
                      {q.difficulty === "HARD" ? (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          KHÓ
                        </span>
                      ) : null}
                      {q.difficulty === "EASY" ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          QUÁ DỄ
                        </span>
                      ) : null}
                    </td>
                  </tr>
                  {open ? (
                    <tr key={`${q.position}-dist`} className="border-t border-border/40 bg-muted/20">
                      <td colSpan={8}>
                        <QuestionDistributionPanel
                          questionType={
                            q.typeLabel.toLowerCase().includes("multiple choice")
                              ? "MULTIPLE_CHOICE"
                              : q.typeLabel.toLowerCase().includes("multiple blanks")
                                ? "CLOZE"
                                : q.typeLabel.toLowerCase().includes("text")
                                  ? "TYPE_ANSWER"
                                  : "SINGLE_CHOICE"
                          }
                          distribution={dist}
                        />
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
