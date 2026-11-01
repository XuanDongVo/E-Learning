"use client";

import { useMemo, useState } from "react";
import { MOCK_QUESTIONS } from "../mock-data";
import { OutcomeBar, OutcomeLegend } from "../shared/outcome-bar";

type SortMode = "order" | "hardest" | "easiest";
type DiffFilter = "ALL" | "HARD" | "EASY";

export function QuestionsPanel() {
  const [sort, setSort] = useState<SortMode>("order");
  const [diff, setDiff] = useState<DiffFilter>("ALL");

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
        Tỉ lệ đúng = số em đúng / 21 bài đã nộp (bỏ trống vẫn tính ở mẫu số). Dưới 40% gắn “Khó”, trên
        90% gắn “Quá dễ”. Chỉ số phân biệt chỉ hiện khi có từ 30 bài (hiện 21).
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
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
            {rows.map((q) => (
              <tr key={q.position} className="border-t border-border/70">
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{q.position}</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{q.prompt}</p>
                  <p className="text-xs text-muted-foreground">{q.sectionTitle}</p>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{q.typeLabel}</td>
                <td className="px-3 py-3 min-w-[8rem]">
                  <OutcomeBar outcome={q.outcome} />
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {q.accuracyPercent}% <span className="text-xs text-muted-foreground">n={q.n}</span>
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{q.blankPercent}%</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
