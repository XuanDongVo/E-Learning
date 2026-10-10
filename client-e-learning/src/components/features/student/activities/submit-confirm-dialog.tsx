"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const paperBtn =
  "text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] hover:bg-practice-light hover:text-practice-ink";
const blueBtn =
  "text-practice-light bg-practice-blue shadow-[0_2px_0_var(--color-practice-blue-dark)] hover:text-practice-light hover:bg-practice-blue-dark";

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  answered,
  total,
  hasUncheckedDraft,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answered: number;
  total: number;
  /** Câu đang chọn nhưng chưa bấm "Kiểm tra" */
  hasUncheckedDraft: boolean;
  pending: boolean;
  onConfirm: () => void;
}) {
  const unanswered = total - answered;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-practice-overlay backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-practice-border bg-practice-paper p-5 text-practice-ink shadow-[0_18px_60px_var(--color-practice-overlay)] sm:p-6">
          <Dialog.Close asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={pending}
              className={`${paperBtn} absolute right-4 top-4 size-7 rounded-full`}
              aria-label="Đóng"
            >
              <X size={14} />
            </Button>
          </Dialog.Close>

          <span className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={20} />
          </span>

          <Dialog.Title className="mt-4 text-lg font-extrabold">
            Nộp bài ngay?
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm leading-6 text-practice-subtle">
            {unanswered > 0
              ? `Em còn ${unanswered} câu chưa trả lời. Các câu này sẽ được tính là bỏ qua khi nộp bài.`
              : "Em đã trả lời tất cả các câu. Nộp bài để xem kết quả nhé!"}
            {hasUncheckedDraft &&
              " Câu đang chọn chưa được kiểm tra sẽ không được tính."}
          </Dialog.Description>

          <div className="mt-4 grid grid-cols-2 divide-x divide-practice-border rounded-xl border-2 border-practice-border bg-practice-light py-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-practice-good">
                {answered}
              </p>
              <p className="text-[11px] text-practice-subtle">Đã trả lời</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-practice-bad">
                {unanswered}
              </p>
              <p className="text-[11px] text-practice-subtle">Chưa trả lời</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild>
              <Button
                variant="outline"
                disabled={pending}
                className={paperBtn}
              >
                <X size={14} />
                Tiếp tục làm bài
              </Button>
            </Dialog.Close>
            <Button className={blueBtn} disabled={pending} onClick={onConfirm}>
              <Send size={14} />
              {pending ? "Đang nộp…" : "Xác nhận nộp bài"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}