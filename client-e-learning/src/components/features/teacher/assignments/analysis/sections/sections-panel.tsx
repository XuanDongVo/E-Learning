"use client";

import { MOCK_SECTIONS } from "../mock-data";
import { OutcomeBar, OutcomeLegend } from "../shared/outcome-bar";

export function SectionsPanel() {
  const weakest = [...MOCK_SECTIONS].sort((a, b) => a.accuracyPercent - b.accuracyPercent)[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          % đúng = số câu đúng hoàn toàn / (số câu × số bài). % điểm tính cả điểm một phần. Yếu nhất:{" "}
          <span className="font-medium text-foreground">
            {weakest?.title} ({weakest?.accuracyPercent}%).
          </span>
        </p>
        <OutcomeLegend />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Phần</th>
              <th className="px-3 py-2 font-medium">Số câu</th>
              <th className="px-3 py-2 font-medium">Kết quả</th>
              <th className="px-3 py-2 font-medium">% đúng</th>
              <th className="px-3 py-2 font-medium">% điểm</th>
              <th className="px-3 py-2 font-medium">Bỏ trống</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SECTIONS.map((s) => {
              const weak = s.accuracyPercent < 40;
              return (
                <tr
                  key={s.title}
                  className={`border-t border-border/70 ${weak ? "bg-rose-50/50" : ""}`}
                >
                  <td className="px-3 py-3 font-medium">{s.title}</td>
                  <td className="px-3 py-3 tabular-nums">{s.questionCount}</td>
                  <td className="min-w-[10rem] px-3 py-3">
                    <OutcomeBar outcome={s.outcome} />
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {s.accuracyPercent}%{" "}
                    <span className="text-xs text-muted-foreground">n={s.n}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{s.scoreRatePercent}%</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{s.blankPercent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
