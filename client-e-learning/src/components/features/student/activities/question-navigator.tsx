"use client";

import { useTranslations } from "next-intl";

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

const card = "bg-card-bg shadow-pop-lg";
const stateCorrect =
  "border-success bg-success-soft shadow-pop-sm";
const stateWrong =
  "border-destructive bg-destructive-soft shadow-pop-sm";
const stateCurrent =
  "border-learning bg-learning-soft shadow-pop-sm";
const statePicked = "border-learning bg-learning-soft";


/* Lưới số câu: cuộn dọc nên 20, 50 hay 200 câu đều ổn */
function Grid(p: NavigatorProps & { onPick?: () => void }) {
  const t = useTranslations("student.activities.runtime.navigator");
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
            aria-label={t("questionAria", { number: i + 1, status: t(`statuses.${status}`), lock: locked ? t("lockedSuffix") : "" })}
            className={`relative h-11 w-full rounded-xl font-extrabold ${cls} ${i === p.index ? "outline-2 outline-offset-2 outline-learning" : ""}`}
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
  const t = useTranslations("student.activities.runtime.navigator");
  const dot = "inline-block size-3 rounded-[4px] border-2";
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-semibold">
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-learning bg-learning-soft`} />
        {t("current")}
      </li>
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-success bg-success-soft`} />
        {t("correct")}
      </li>
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-destructive bg-destructive-soft`} />
        {t("wrong")}
      </li>
      <li className="flex items-center gap-1.5">
        <span className={`${dot} border-border bg-background`} />
        {t("todo")}
      </li>
    </ul>
  );
}

function Panel(p: NavigatorProps & { onPick?: () => void }) {
  const t = useTranslations("student.activities.runtime.navigator");
  const total = p.statuses.length;
  const done = p.statuses.filter((s) => s === "correct" || s === "wrong").length;
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-extrabold">
          {p.tryHard ? "Try Hard" : t("select")}
        </span>
        <span className="text-xs font-semibold" aria-live="polite">
          {t("done", { done, total })}
        </span>
      </div>
      <Grid {...p} />
      <Legend />
      {p.tryHard && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <Lock size={12} />
          {t("sequential")}
        </p>
      )}
    </>
  );
}

/* Desktop (lg+): cột bên phải, dính khi cuộn */
export function QuestionNavigator(p: NavigatorProps) {
  const t = useTranslations("student.activities.runtime.navigator");
  return (
    <aside
      className={`${card} hidden rounded-[20px] p-4 lg:sticky lg:top-6 lg:block`}
      aria-label={t("list")}
    >
      <Panel {...p} />
    </aside>
  );
}

/* Mobile/tablet: nút trong footer mở bottom sheet. Cần `onOpenChange` để trang chặn phím tắt khi sheet mở. */
export function QuestionNavigatorSheet(
  p: NavigatorProps & { onOpenChange?: (open: boolean) => void },
) {
  const t = useTranslations("student.activities.runtime.navigator");
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
        className="border-2 border-border bg-card-bg px-3 text-foreground shadow-pop-sm"
        aria-haspopup="dialog"
        onClick={() => set(true)}
      >
        <List size={16} />
        {t("counter", { current: p.index + 1, total: p.statuses.length })}
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label={t("list")}
        >
          <button
            className="absolute inset-0 bg-foreground/50"
            aria-label={t("close")}
            onClick={() => set(false)}
          />
          <div className={`${card} relative w-full rounded-t-[24px] p-4 pb-6`}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 size-9"
              aria-label={t("close")}
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
