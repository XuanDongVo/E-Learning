
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PracticeSettings } from "../../practice-setting";
import { SubmitConfirmDialog } from "../../submit-confirm-dialog";
import type { PracticeController } from "../controller/use-practice-controller";

const dialogContent =
  "z-[70] w-[calc(100%-2rem)] max-w-[440px] " +
  "rounded-[22px] border-2 border-practice-ink " +
  "bg-card-bg p-5 text-practice-ink " +
  "shadow-pop sm:p-6";

const quietButton =
  "student-control student-control--quiet " +
  "h-11 min-w-0 rounded-xl px-4 " +
  "font-semibold transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-practice-ink/30 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const dangerButton =
  "student-control h-11 min-w-0 rounded-xl " +
  "border-2 border-practice-ink " +
  "bg-practice-bad px-4 font-bold text-white " +
  "shadow-pop-sm transition-all " +
  "hover:-translate-y-0.5 hover:bg-practice-bad/90 " +
  "active:translate-y-0 active:shadow-none " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-practice-bad/40 " +
  "disabled:pointer-events-none disabled:opacity-50";

export function PracticeDialogs({
  controller,
}: {
  controller: PracticeController;
}) {
  const {
    answeredCount,
    background,
    confirmLeave,
    confirmOpen,
    confirmSubmit,
    finish,
    hasDraft,
    leaveDialogOpen,
    locked,
    questions,
    setBackground,
    setConfirmOpen,
    setLeaveDialogOpen,
    setSettings,
    settings,
    soundEnabled,
    setSoundEnabled,
  } = controller;

  return (
    <>
      <AlertDialog
        open={leaveDialogOpen}
        onOpenChange={(open) => {
          if (!finish.isPending) {
            setLeaveDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent className={dialogContent}>
          <AlertDialogHeader className="space-y-3 text-left">
            <AlertDialogTitle
              className="student-card-title text-foreground"
            >
              Rời khỏi hoạt động?
            </AlertDialogTitle>

            <AlertDialogDescription
              className="student-body text-muted-foreground"
            >
              Lượt luyện tập hiện tại sẽ không được lưu hoặc
              tiếp tục. Bạn có chắc chắn muốn rời khỏi
              hoạt động?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter
            className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          >
            <AlertDialogCancel
              disabled={finish.isPending}
              className={quietButton}
            >
              Tiếp tục làm bài
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={finish.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmLeave();
              }}
              className={dangerButton}
            >
              {finish.isPending
                ? "Đang thoát..."
                : "Xác nhận rời"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubmitConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        answered={answeredCount}
        total={questions.length}
        hasUncheckedDraft={!locked && hasDraft}
        pending={finish.isPending}
        onConfirm={confirmSubmit}
      />

      <PracticeSettings
        open={settings}
        onOpenChange={setSettings}
        background={background}
        onBackgroundChange={setBackground}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={setSoundEnabled}
      />
    </>
  );
}
