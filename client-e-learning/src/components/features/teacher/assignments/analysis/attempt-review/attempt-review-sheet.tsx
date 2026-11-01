"use client";

import { MOCK_REVIEW } from "../mock-data";

const OUTCOME_STYLE = {
  CORRECT: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  INCORRECT: "bg-rose-50 text-rose-700",
  UNANSWERED: "bg-muted text-muted-foreground",
} as const;

const OUTCOME_LABEL = {
  CORRECT: "Đúng",
  PARTIAL: "Một phần",
  INCORRECT: "Sai",
  UNANSWERED: "Bỏ trống",
} as const;

export function AttemptReviewSheet({
  open,
  onOpenChange,
  studentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
}) {
  if (!open || studentId == null) return null;

  const r = MOCK_REVIEW;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Đóng"
        onClick={() => onOpenChange(false)}
      />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-background shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-background px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">{r.name}</h2>
            <p className="text-xs text-muted-foreground">Chế độ chỉ đọc · chỉ giáo viên xem được</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Điểm</p>
              <p className="font-semibold">
                {r.earned}/{r.possible} · {r.percent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">So với TB lớp</p>
              <p className={`font-semibold ${r.deltaVsAvg < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {r.deltaVsAvg} (TB {r.classAvg}%)
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thời gian</p>
              <p className="font-semibold">{r.durationMinutes} phút</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lớp lúc làm</p>
              <p className="font-semibold">{r.className}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bắt đầu</p>
              <p>{r.startedAt}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nộp lúc</p>
              <p>{r.finishedAt}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Theo phần của đề
            </h3>
            <ul className="space-y-2">
              {r.sections.map((s) => {
                const pct = s.possible ? (s.earned / s.possible) * 100 : 0;
                return (
                  <li key={s.title} className="text-sm">
                    <div className="mb-1 flex justify-between gap-2">
                      <span className="truncate">{s.title}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {s.earned}/{s.possible} · lớp {s.classRate}%
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-0.5 bg-foreground/40"
                        style={{ left: `${Math.min(100, s.classRate)}%` }}
                        title="TB lớp"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 text-[11px] text-muted-foreground">Vạch dọc = trung bình lớp.</p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Từng câu
            </h3>
            <div className="space-y-3">
              {r.questions.map((q) => (
                <div key={q.position} className="rounded-xl border border-border p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      Câu {q.position}. {q.prompt}
                    </p>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        OUTCOME_STYLE[q.outcome]
                      }`}
                    >
                      {OUTCOME_LABEL[q.outcome]} {q.earnedLabel}
                    </span>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Em trả lời:</p>
                      <p className="font-medium">{q.studentAnswer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Đáp án đúng:</p>
                      <p className="font-medium text-emerald-700">{q.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
