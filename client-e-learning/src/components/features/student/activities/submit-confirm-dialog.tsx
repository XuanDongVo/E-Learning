"use client";

import { useTranslations } from "next-intl";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const paperBtn =
  "border-2 border-border bg-card-bg text-foreground shadow-pop-sm hover:bg-secondary hover:text-foreground";
const blueBtn =
  "bg-learning text-primary-foreground shadow-pop-sm hover:bg-learning/90 hover:text-primary-foreground";

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
  const t = useTranslations("student.activities.runtime.submitDialog");
  const unanswered = total - answered;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-border bg-card-bg p-5 text-foreground shadow-pop-lg sm:p-6">
          <Dialog.Close asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={pending}
              className={`${paperBtn} absolute right-4 top-4 size-7 rounded-full`}
              aria-label={t("close")}
            >
              <X size={14} />
            </Button>
          </Dialog.Close>

          <span className="grid size-10 place-items-center rounded-full bg-warning-soft text-warning">
            <AlertTriangle size={20} />
          </span>

          <Dialog.Title className="mt-4 text-lg font-extrabold">
            {t("title")}
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {unanswered > 0
              ? t("unanswered", { count: unanswered })
              : t("allAnswered")}
            {hasUncheckedDraft &&
              t("unchecked")}
          </Dialog.Description>

          <div className="mt-4 grid grid-cols-2 divide-x divide-border rounded-xl border-2 border-border bg-background py-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-success">
                {answered}
              </p>
              <p className="text-[11px] text-muted-foreground">{t("answered")}</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-destructive">
                {unanswered}
              </p>
              <p className="text-[11px] text-muted-foreground">{t("notAnswered")}</p>
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
                {t("continue")}
              </Button>
            </Dialog.Close>
            <Button className={blueBtn} disabled={pending} onClick={onConfirm}>
              <Send size={14} />
              {pending ? t("pending") : t("confirm")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
