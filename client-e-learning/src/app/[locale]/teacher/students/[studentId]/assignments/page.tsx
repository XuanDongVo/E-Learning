"use client";

import { useState } from "react";
import { mockAssignments } from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";

const filters = ["Tất cả", "Đã nộp", "Nộp muộn", "Đang làm", "Chưa làm"] as const;

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tất cả");

  const rows = mockAssignments.filter((a) => filter === "Tất cả" || a.status === filter);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border p-4">
        <div>
          <h2 className="font-extrabold text-base">Danh sách bài tập</h2>
          <p className="text-xs text-muted-foreground">Theo dõi tiến độ nộp bài và điểm số của học sinh</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="h-8 text-xs font-bold"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Bảng bài tập */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 uppercase font-bold text-muted-foreground">
            <tr>
              <th className="p-3 pl-4">Bài tập</th>
              <th className="p-3">Hạn nộp</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thời gian nộp</th>
              <th className="p-3 pr-4 text-right">Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.assignmentId} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 pl-4 font-bold text-sm">{r.title}</td>
                <td className="p-3 text-muted-foreground">{r.due}</td>
                <td className="p-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 font-bold text-[11px] ${
                    r.status === "Đã nộp" ? "bg-emerald-500/10 text-emerald-600" :
                    r.status === "Nộp muộn" ? "bg-amber-500/10 text-amber-600" :
                    r.status === "Đang làm" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{r.submittedAt ?? "—"}</td>
                <td className="p-3 pr-4 text-right font-extrabold text-sm">{r.score ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
