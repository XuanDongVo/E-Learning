"use client";

import { useMemo, useState } from "react";
import { MOCK_STUDENTS, type MockStudent } from "../mock-data";

type StatusFilter =
  | "ALL"
  | "SUBMITTED"
  | "LATE"
  | "TIMED_OUT"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "OVERDUE";

const STATUS_LABEL: Record<MockStudent["status"], string> = {
  SUBMITTED: "Đã nộp",
  LATE: "Nộp trễ",
  TIMED_OUT: "Hết giờ",
  IN_PROGRESS: "Đang làm",
  NOT_STARTED: "Chưa làm",
  OVERDUE: "Quá hạn",
};

const STATUS_DOT: Record<MockStudent["status"], string> = {
  SUBMITTED: "bg-emerald-500",
  LATE: "bg-amber-500",
  TIMED_OUT: "bg-amber-400",
  IN_PROGRESS: "bg-blue-500",
  NOT_STARTED: "bg-slate-300",
  OVERDUE: "bg-rose-500",
};

export function StudentsPanel({ onViewAttempt }: { onViewAttempt: (studentId: number) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: MOCK_STUDENTS.length };
    for (const s of MOCK_STUDENTS) {
      c[s.status] = (c[s.status] ?? 0) + 1;
    }
    return c;
  }, []);

  const rows = useMemo(() => {
    return MOCK_STUDENTS.filter((s) => {
      if (status !== "ALL" && s.status !== status) return false;
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status]);

  const chips: { id: StatusFilter; label: string }[] = [
    { id: "ALL", label: `Tất cả (${counts.ALL ?? 0})` },
    { id: "SUBMITTED", label: `Đã nộp (${counts.SUBMITTED ?? 0})` },
    { id: "LATE", label: `Nộp trễ (${counts.LATE ?? 0})` },
    { id: "TIMED_OUT", label: `Hết giờ (${counts.TIMED_OUT ?? 0})` },
    { id: "IN_PROGRESS", label: `Đang làm (${counts.IN_PROGRESS ?? 0})` },
    { id: "NOT_STARTED", label: `Chưa làm (${counts.NOT_STARTED ?? 0})` },
    { id: "OVERDUE", label: `Quá hạn (${counts.OVERDUE ?? 0})` },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm học sinh…"
          className="h-9 rounded-full border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setStatus(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === c.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">Theo tên</div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Học sinh</th>
              <th className="px-3 py-2 font-medium">Lớp</th>
              <th className="px-3 py-2 font-medium">Trạng thái</th>
              <th className="px-3 py-2 font-medium">Điểm</th>
              <th className="px-3 py-2 font-medium">%</th>
              <th className="px-3 py-2 font-medium">So với TB</th>
              <th className="px-3 py-2 font-medium">Thời gian</th>
              <th className="px-3 py-2 font-medium">Bỏ trống</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.studentId} className="border-t border-border/70">
                <td className="px-3 py-3 font-medium">{s.name}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {s.className}
                  {s.classNote ? (
                    <span className="text-xs"> ({s.classNote})</span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className={`size-2 rounded-full ${STATUS_DOT[s.status]}`} />
                    {STATUS_LABEL[s.status]}
                  </span>
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {s.earned != null ? `${s.earned}/${s.possible}` : "—"}
                </td>
                <td
                  className={`px-3 py-3 tabular-nums font-semibold ${
                    s.percent != null && s.percent < 50 ? "text-rose-600" : ""
                  }`}
                >
                  {s.percent != null ? `${s.percent}%` : "—"}
                </td>
                <td
                  className={`px-3 py-3 tabular-nums ${
                    s.deltaVsAvg == null
                      ? ""
                      : s.deltaVsAvg < 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                  }`}
                >
                  {s.deltaVsAvg == null
                    ? "—"
                    : s.deltaVsAvg > 0
                      ? `+${s.deltaVsAvg}`
                      : s.deltaVsAvg}
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">
                  {s.durationMinutes != null ? `${s.durationMinutes} ph` : "—"}
                </td>
                <td className="px-3 py-3 tabular-nums">{s.blankCount ?? "—"}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onViewAttempt(s.studentId)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  >
                    Xem bài
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
