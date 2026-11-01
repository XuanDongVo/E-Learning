"use client";

import { MOCK_CLASS_ROWS } from "../mock-data";
import { OutcomeBar } from "../shared/outcome-bar";

export function ClassesPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Bài này đang giao cho 1 lớp (6A1), nên chưa có gì để so sánh. Khi giao nhiều lớp, mỗi lớp là
        một dòng. Bài đã làm luôn tính vào lớp lúc bắt đầu làm — em chuyển lớp sau đó vẫn ở lớp cũ.
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Lớp</th>
              <th className="px-3 py-2 font-medium">Được giao</th>
              <th className="px-3 py-2 font-medium">Tỉ lệ nộp</th>
              <th className="px-3 py-2 font-medium">Điểm TB</th>
              <th className="px-3 py-2 font-medium">Trung vị</th>
              <th className="px-3 py-2 font-medium">Tỉ lệ đúng tất cả câu</th>
              <th className="px-3 py-2 font-medium">% đúng</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CLASS_ROWS.map((r) => (
              <tr key={r.classId} className="border-t border-border/70">
                <td className="px-3 py-3 font-semibold">{r.className}</td>
                <td className="px-3 py-3 tabular-nums">{r.assigned}</td>
                <td className="px-3 py-3 tabular-nums">
                  {Math.round(r.submissionRate * 100)}% ({r.submitted})
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {r.averagePercent}% <span className="text-xs text-muted-foreground">n={r.submitted}</span>
                </td>
                <td className="px-3 py-3 tabular-nums">{r.medianPercent}%</td>
                <td className="min-w-[8rem] px-3 py-3">
                  <OutcomeBar outcome={r.outcome} />
                </td>
                <td className="px-3 py-3 tabular-nums">{r.accuracyPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
