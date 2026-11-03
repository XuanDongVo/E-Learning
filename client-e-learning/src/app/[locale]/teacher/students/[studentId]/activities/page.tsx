"use client";

import { useMemo, useState } from "react";
import { mockSessions, type SessionMode, type SessionStatus } from "@/mock/mock-student-data";

export default function StudentActivitiesPage() {
  const [mode, setMode] = useState<"all" | SessionMode>("all");
  const [status, setStatus] = useState<"all" | SessionStatus>("all");

  const rows = useMemo(
    () =>
      mockSessions.filter(
        (s) => (mode === "all" || s.mode === mode) && (status === "all" || s.status === status),
      ),
    [mode, status],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold">Lịch sử luyện tập</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mỗi dòng là một ActivitySession (COMPLETED / GAME_OVER / ABANDONED). Dữ liệu mẫu đến khi
            có API teacher theo học sinh.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-border bg-card px-2 text-xs font-semibold"
            value={mode}
            onChange={(e) => setMode(e.target.value as "all" | SessionMode)}
            aria-label="Lọc chế độ"
          >
            <option value="all">Mọi chế độ</option>
            <option value="Learning">Learning</option>
            <option value="Try Hard">Try Hard</option>
          </select>
          <select
            className="h-9 rounded-md border border-border bg-card px-2 text-xs font-semibold"
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | SessionStatus)}
            aria-label="Lọc trạng thái"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Hết mạng sống">Hết mạng sống</option>
            <option value="Bỏ dở">Bỏ dở</option>
            <option value="Đang làm">Đang làm</option>
          </select>
        </div>
      </div>

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
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="text-sm font-bold">{s.activity}</p>
                  <p className="text-muted-foreground">{s.unit}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {s.mode}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <SessionPill status={s.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.status === "Bỏ dở"
                    ? "—"
                    : `${s.firstCorrect}/${s.total} đúng lần đầu${s.hints != null ? ` · ${s.hints} gợi ý` : ""}`}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.completedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SessionPill({ status }: { status: string }) {
  const color =
    status === "Hoàn thành"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "Hết mạng sống"
        ? "bg-amber-500/10 text-amber-600"
        : status === "Bỏ dở"
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-primary";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{status}</span>;
}
