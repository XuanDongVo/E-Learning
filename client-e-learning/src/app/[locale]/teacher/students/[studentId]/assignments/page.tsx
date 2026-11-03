"use client";

import { useMemo, useState } from "react";
import { mockAssignments, type AttemptStatus } from "@/mock/mock-student-data";

const FILTERS: Array<"Tất cả" | AttemptStatus> = [
  "Tất cả",
  "Đã nộp",
  "Nộp muộn",
  "Hết giờ",
  "Đang làm",
  "Chưa làm",
];

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tất cả");
  const rows = useMemo(
    () => (filter === "Tất cả" ? mockAssignments : mockAssignments.filter((a) => a.status === filter)),
    [filter],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold">Bài tập</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Trạng thái attempt: Chưa làm · Đang làm · Đã nộp · Nộp muộn · Hết giờ. Dữ liệu mẫu đến khi
            có API theo học sinh.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-card"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Bài tập</th>
              <th className="px-4 py-3">Hạn nộp</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Nộp lúc</th>
              <th className="px-4 py-3 text-right">Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((a) => (
              <tr key={a.assignmentId} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-bold text-sm">{a.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.due}</td>
                <td className="px-4 py-3">
                  <StatusPill status={a.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{a.submittedAt ?? "—"}</td>
                <td className="px-4 py-3 text-right font-extrabold">{a.score ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "Đã nộp"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "Nộp muộn" || status === "Hết giờ"
        ? "bg-amber-500/10 text-amber-600"
        : status === "Đang làm"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{status}</span>;
}
