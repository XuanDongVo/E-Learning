"use client";

import { Lightbulb, X } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = { open: boolean; text: string; onClose: () => void };

/* Gợi ý hiển thị ngay trong thẻ câu hỏi (ngay dưới tiêu đề) để người dùng thấy ngay,
   thay vì chỉ nằm trong bong bóng nhỏ của mascot. */
export function HintPanel({ open, text, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Đảm bảo gợi ý nằm trong vùng nhìn thấy (không cuộn mượt nếu người dùng giảm chuyển động)
  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [open, text]);

  return (
    <div aria-live="polite">
      {open && (
        <div
          ref={ref}
          className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-practice-blue bg-practice-hint p-3.5 shadow-[0_3px_0_var(--color-practice-blue-dark)]"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-practice-blue text-practice-light">
            <Lightbulb size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-practice-blue">Gợi ý từ Việt Cường</p>
            <p className="mt-0.5 text-sm font-semibold leading-6 text-practice-ink">{text}</p>
          </div>
          <button
            type="button"
            aria-label="Đóng gợi ý"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full text-practice-subtle transition-colors hover:bg-practice-light hover:text-practice-ink"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}