"use client";

import { MOCK_OVERVIEW } from "../mock-data";

function KpiCard({
  label,
  value,
  hint,
  footer,
}: {
  label: string;
  value: string;
  hint: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {footer}
    </div>
  );
}

export function OverviewPanel({ onGoStudents }: { onGoStudents?: () => void }) {
  const o = MOCK_OVERVIEW;
  const progressTotal =
    o.progress.submitted +
    o.progress.late +
    o.progress.timedOut +
    o.progress.inProgress +
    o.progress.notStarted +
    o.progress.overdue;
  const seg = (n: number) => `${(n / Math.max(progressTotal, 1)) * 100}%`;
  const maxBar = Math.max(...o.distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tỉ lệ nộp"
          value={`${Math.round(o.submissionRate * 100)}%`}
          hint={`${o.submittedCount}/${o.assignedCount} học sinh được giao"`}
        />
        <KpiCard
          label="Điểm trung bình"
          value={`${o.averagePercent}%`}
          hint={`Trung vị ${o.medianPercent}% · tính trên ${o.submittedCount} bài đã nộp"`}
        />
        <KpiCard
          label="Thấp nhất – cao nhất"
          value={`${o.lowestPercent}% – ${o.highestPercent}%`}
          hint="Kể cả bài hết giờ"
        />
        <KpiCard
          label="Thời gian làm trung bình"
          value={`${o.avgDurationMinutes} phút"`}
          hint={`giới hạn ${o.timeLimitMinutes} phút"`}
          footer={
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (o.avgDurationMinutes / o.timeLimitMinutes) * 100)}%`,
                }}
              />
            </div>
          }
        />
      </div>

      {/* Fix accidental quotes in hints - rewrite cleaner without typos */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tiến độ</h3>
          <button type="button" className="text-xs font-medium text-primary" onClick={onGoStudents}>
            Xem danh sách học sinh
          </button>
        </div>
        <div className="mb-4 flex h-3 overflow-hidden rounded-full">
          <div className="bg-emerald-500" style={{ width: seg(o.progress.submitted) }} />
          <div className="bg-amber-500" style={{ width: seg(o.progress.late) }} />
          <div className="bg-amber-400" style={{ width: seg(o.progress.timedOut) }} />
          <div className="bg-blue-500" style={{ width: seg(o.progress.inProgress) }} />
          <div className="bg-slate-300" style={{ width: seg(o.progress.notStarted) }} />
          <div className="bg-rose-500" style={{ width: seg(o.progress.overdue) }} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Đã nộp", color: "bg-emerald-500", n: o.progress.submitted },
            { label: "Nộp trễ", color: "bg-amber-500", n: o.progress.late },
            { label: "Hết giờ", color: "bg-amber-400", n: o.progress.timedOut },
            { label: "Đang làm", color: "bg-blue-500", n: o.progress.inProgress },
            { label: "Chưa làm", color: "bg-slate-300", n: o.progress.notStarted },
            { label: "Quá hạn", color: "bg-rose-500", n: o.progress.overdue },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/70 px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`size-2 rounded-full ${item.color}`} />
                {item.label}
              </p>
              <p className="mt-1 text-xl font-bold">{item.n}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Hạn nộp 21:00 22-10 đã qua nên em chưa mở bài được tính là “Quá hạn”. Bài “Đang làm” chưa
          tính vào bất kỳ chỉ số nào.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Phân bố điểm</h3>
            <span className="text-xs text-muted-foreground">n={o.submittedCount} bài đã nộp</span>
          </div>
          <div className="flex h-40 items-end gap-1.5 px-1">
            {o.distribution.map((b) => {
              const h = (b.count / maxBar) * 100;
              const isLow = b.to <= 50;
              return (
                <div key={b.from} className="flex flex-1 flex-col items-center gap-1">
                  {b.count > 0 ? (
                    <span className="text-[10px] font-medium text-muted-foreground">{b.count}</span>
                  ) : (
                    <span className="text-[10px] opacity-0">0</span>
                  )}
                  <div
                    className={`w-full rounded-t-md ${isLow ? "bg-rose-400" : "bg-indigo-400"}`}
                    style={{ height: `${Math.max(h, b.count ? 8 : 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>90–100</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Cột đỏ: dưới 50%. Trung bình {o.averagePercent}%, trung vị {o.medianPercent}%.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Câu cần chú ý</h3>
          <p className="mb-2 text-xs font-medium text-rose-600">Đúng dưới 40% — nên xem lại ({o.hardQuestions.length})</p>
          <ul className="space-y-2">
            {o.hardQuestions.map((q) => (
              <li key={q.position} className="flex items-start justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold text-primary">Câu {q.position}</span>{" "}
                  <span className="text-muted-foreground">{q.prompt}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{q.accuracy}%</span>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">
            Đúng trên 90% — có thể quá dễ ({o.easyQuestions.length})
          </p>
          <ul className="space-y-2">
            {o.easyQuestions.map((q) => (
              <li key={q.position} className="flex items-start justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold text-primary">Câu {q.position}</span>{" "}
                  <span className="text-muted-foreground">{q.prompt}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{q.accuracy}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
