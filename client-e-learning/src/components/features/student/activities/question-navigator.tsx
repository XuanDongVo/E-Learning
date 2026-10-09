"use client";

import { List, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** Trạng thái hiển thị của một câu, suy ra từ dữ liệu session do server trả về. */
export type NavStatus = "correct" | "wrong" | "picked" | "todo";

export type NavigatorProps = {
  statuses: readonly NavStatus[];
  index: number;
  tryHard: boolean;
  isLocked: (i: number) => boolean;
  onSelect: (i: number) => void;
};

const card = "bg-practice-paper shadow-[0_6px_0_var(--color-practice-shadow)]";
const stateCorrect =
  "bg-practice-good-soft border-practice-good shadow-[0_3px_0_var(--color-practice-good)]";
const stateWrong =
  "bg-practice-bad-soft border-practice-bad shadow-[0_3px_0_var(--color-practice-bad)]";
const stateCurrent =
  "bg-practice-hint border-practice-blue shadow-[0_3px_0_var(--color-practice-blue-dark)]";
const statePicked = "bg-practice-hint border-practice-blue";

const STATUS_LABEL: Record<NavStatus, string> = {
  correct: "đúng",
  wrong: "sai",
  picked: "đã chọn",
  todo: "chưa làm",
};

/* Lưới số câu: cuộn dọc nên 20, 50 hay 200 câu đều ổn */
function Grid(p: NavigatorProps & { onPick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current
      ?.querySelector('[aria-current="step"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [p.index]);

  return (
    <div
      ref={ref}
      className="grid max-h-[min(55svh,420px)] grid-cols-4 gap-2 overflow-y-auto p-1"
    >
      {p.statuses.map((status, i) => {
        const locked = p.isLocked(i) && i !== p.index;
        const cls =
          status === "correct"
            ? stateCorrect
            : status === "wrong"
              ? stateWrong
              : i === p.index
                ? stateCurrent
                : status === "picked"
                  ? statePicked
                  : "";
        return (
          <Button
            key={i}
            variant="outline"
            size="icon"
            disabled={locked}
            aria-current={i === p.index ? "step" : undefined}
            aria-label={`Câu ${i + 1}, ${STATUS_LABEL[status]}${locked ? ", đang khoá" : ""}`}
            className={`relative h-11 w-full rounded-xl font-extrabold ${cls} ${i === p.index ? "outline-2 outline-offset-2 outline-practice-blue" : ""}`}
            onClick={() => {
              p.onSelect(i);
              p.onPick?.();
            }}
          >
            {locked && i > p.index ? <Lock size={14} /> : i + 1}
          </Button>
        );
      })}
    </div>
  );
}

function Legend() {
  const dot = "inline-block size-3 rounded-[4px] border-2";
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-semibold">
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-practice-blue bg-practice-hint`} />
        Hiện tại
      </li>
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-practice-good bg-practice-good-soft`} />
        Đúng
      </li>
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-practice-bad bg-practice-bad-soft`} />
        Sai
      </li>
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-practice-border bg-practice-light`} />
        Chưa làm
      </li>
    </ul>
  );
}

function Panel(p: NavigatorProps & { onPick?: () => void }) {
  const total = p.statuses.length;
  const done = p.statuses.filter((s) => s === "correct" || s === "wrong").length;
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-extrabold">
          {p.tryHard ? "Try Hard" : "Chọn câu hỏi"}
        </span>
        <span className="text-xs font-semibold" aria-live="polite">
          Đã làm {done}/{total}
        </span>
      </div>
      <Grid {...p} />
      <Legend />
      {p.tryHard && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <Lock size={12} />
          Làm lần lượt, không quay lại hay nhảy câu
        </p>
      )}
    </>
  );
}

/* Desktop (lg+): cột bên phải, dính khi cuộn */
export function QuestionNavigator(p: NavigatorProps) {
  return (
    <aside
      className={`${card} hidden rounded-[20px] p-4 lg:sticky lg:top-6 lg:block`}
      aria-label="Danh sách câu hỏi"
    >
      <Panel {...p} />
    </aside>
  );
}

/* Mobile/tablet: nút trong footer mở bottom sheet. Cần `onOpenChange` để trang chặn phím tắt khi sheet mở. */
export function QuestionNavigatorSheet(
  p: NavigatorProps & { onOpenChange?: (open: boolean) => void },
) {
  const [open, setOpen] = useState(false);
  const set = (v: boolean) => {
    setOpen(v);
    p.onOpenChange?.(v);
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") set(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <div className="lg:hidden">
      <Button
        variant="outline"
        className="text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] px-3"
        aria-haspopup="dialog"
        onClick={() => set(true)}
      >
        <List size={16} />
        Câu {p.index + 1}/{p.statuses.length}
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label="Danh sách câu hỏi"
        >
          <button
            className="absolute inset-0 bg-practice-ink/50"
            aria-label="Đóng"
            onClick={() => set(false)}
          />
          <div className={`${card} relative w-full rounded-t-[24px] p-4 pb-6`}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 size-9"
              aria-label="Đóng"
              onClick={() => set(false)}
            >
              <X size={18} />
            </Button>
            <Panel {...p} onPick={() => set(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
