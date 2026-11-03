"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { teacherStudentService } from "@/services/teacher/student.service";
import {
  ASSIGNMENT_STATUS_LABEL,
  formatDateTime,
  formatScorePercent,
  type StudentAssignmentStatus,
} from "@/types/teacher/student-learning";

const FILTERS: Array<"ALL" | StudentAssignmentStatus> = [
  "ALL",
  "SUBMITTED",
  "LATE",
  "TIMED_OUT",
  "IN_PROGRESS",
  "NOT_STARTED",
];

export default function StudentAssignmentsPage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const query = useQuery({
    queryKey: ["teacher-student-assignments", studentId],
    queryFn: () => teacherStudentService.listAssignments(studentId),
    enabled: Number.isFinite(studentId),
  });
  const items = query.data?.data ?? [];
  const rows = useMemo(
    () => (filter === "ALL" ? items : items.filter((a) => a.status === filter)),
    [filter, items],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold">Bài tập</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Assignment đã giao tới lớp của học sinh và attempt tương ứng (nếu có).
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
              {f === "ALL" ? "Tất cả" : ASSIGNMENT_STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading && <p className="p-4 text-sm text-muted-foreground">Đang tải bài tập…</p>}
      {query.isError && (
        <p role="alert" className="p-4 text-sm text-red-600">
          Không tải được danh sách bài tập.
        </p>
      )}
      {!query.isLoading && !query.isError && rows.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">Chưa có bài tập liên quan.</p>
      )}

      {rows.length > 0 && (
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
                  <td className="px-4 py-3 text-sm font-bold">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(a.dueAt)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(a.submittedAt)}</td>
                  <td className="px-4 py-3 text-right font-extrabold">
                    {formatScorePercent(a.scorePercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: StudentAssignmentStatus }) {
  const label = ASSIGNMENT_STATUS_LABEL[status] ?? status;
  const color =
    status === "SUBMITTED"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "LATE" || status === "TIMED_OUT"
        ? "bg-amber-500/10 text-amber-600"
        : status === "IN_PROGRESS"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{label}</span>;
}
