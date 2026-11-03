"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { teacherStudentService } from "@/services/teacher/student.service";
import {
  SESSION_MODE_LABEL,
  SESSION_STATUS_LABEL,
  formatDateTime,
} from "@/types/teacher/student-learning";

export default function StudentActivitiesPage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const [mode, setMode] = useState<"all" | "LEARNING" | "TRY_HARD">("all");
  const [status, setStatus] = useState<"all" | string>("all");

  const query = useQuery({
    queryKey: ["teacher-student-sessions", studentId],
    queryFn: () => teacherStudentService.listActivitySessions(studentId),
    enabled: Number.isFinite(studentId),
  });
  const items = query.data?.data ?? [];
  const rows = useMemo(
    () =>
      items.filter((s) => {
        const modeOk = mode === "all" || s.mode === mode;
        const statusOk = status === "all" || s.status === status;
        return modeOk && statusOk;
      }),
    [items, mode, status],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold">Lịch sử luyện tập</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ActivitySession của học sinh (COMPLETED / GAME_OVER / ABANDONED / IN_PROGRESS).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-border bg-card px-2 text-xs font-semibold"
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            aria-label="Lọc chế độ"
          >
            <option value="all">Mọi chế độ</option>
            <option value="LEARNING">Learning</option>
            <option value="TRY_HARD">Try Hard</option>
          </select>
          <select
            className="h-9 rounded-md border border-border bg-card px-2 text-xs font-semibold"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Lọc trạng thái"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="GAME_OVER">Hết mạng sống</option>
            <option value="ABANDONED">Bỏ dở</option>
            <option value="IN_PROGRESS">Đang làm</option>
          </select>
        </div>
      </div>

      {query.isLoading && <p className="p-4 text-sm text-muted-foreground">Đang tải lịch sử…</p>}
      {query.isError && (
        <p role="alert" className="p-4 text-sm text-red-600">
          Không tải được lịch sử luyện tập.
        </p>
      )}
      {!query.isLoading && !query.isError && rows.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">Chưa có phiên luyện tập.</p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Hoạt động</th>
                <th className="px-4 py-3">Chế độ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Kết quả</th>
                <th className="px-4 py-3">Hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((s) => (
                <tr key={s.sessionId} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold">{s.activityName}</p>
                    <p className="text-muted-foreground">{s.unitLabel}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {SESSION_MODE_LABEL[s.mode] ?? s.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SessionPill status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.status === "ABANDONED"
                      ? "—"
                      : `${s.firstCorrectCount}/${s.totalQuestions} đúng lần đầu · ${s.hintUsedCount} gợi ý`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(s.completedAt ?? s.startedAt)}
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

function SessionPill({ status }: { status: string }) {
  const label = SESSION_STATUS_LABEL[status] ?? status;
  const color =
    status === "COMPLETED"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "GAME_OVER"
        ? "bg-amber-500/10 text-amber-600"
        : status === "ABANDONED"
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-primary";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{label}</span>;
}
