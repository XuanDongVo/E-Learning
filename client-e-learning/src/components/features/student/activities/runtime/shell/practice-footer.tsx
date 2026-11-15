"use client";

import { ArrowLeft, ArrowRight, Check, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionNavigatorSheet } from "../../question-navigator";
import type { PracticeController } from "../controller/use-practice-controller";

const quietButton = "student-control student-control--quiet";
const accentButton = "student-control student-control--accent";

export function PracticeFooter({
  controller,
}: {
  controller: PracticeController;
}) {
  const {
    answering,
    canSubmit,
    complete,
    deadlineExpired,
    draft,
    feedback,
    finish,
    goNext,
    goPrev,
    hasDraft,
    index,
    locked,
    nextOpen,
    over,
    question,
    questions,
    reset,
    retryTimeout,
    setNavOpen,
    setShowResult,
    statuses,
    submit,
    submitEarly,
    timeoutError,
    timeoutPending,
    tryHard,
  } = controller;
  if (!question) return null;

  const navigator = {
    statuses,
    index,
    tryHard,
    isLocked: (position: number) =>
      tryHard && questions[position]?.id !== question.id,
    onSelect: (position: number) => {
      const target = questions[position];
      if (target) controller.goTo(target.id);
    },
  };
  const showCheck = !locked && !over && hasDraft && !deadlineExpired;
  const retryLabel = feedback?.retryAvailable ? "Thử lại" : "Kiểm tra";
  const gameOver = controller.session?.status === "GAME_OVER";

  return (
    <footer className="mt-auto flex items-center justify-between gap-3">
      {!complete ? (
        <QuestionNavigatorSheet {...navigator} onOpenChange={setNavOpen} />
      ) : null}
      {!complete && !question.guided ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className={`${quietButton} px-3`}
            disabled={index === 0 || tryHard}
            onClick={goPrev}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Câu trước</span>
          </Button>
          <Button
            variant="outline"
            className={`${quietButton} px-3`}
            disabled={locked || answering || deadlineExpired || draft.length === 0}
            onClick={reset}
          >
            Làm lại
          </Button>
          {!over ? (
            <Button
              variant="outline"
              className={`${quietButton} px-3`}
              disabled={
                answering ||
                finish.isPending ||
                deadlineExpired ||
                timeoutPending
              }
              onClick={submitEarly}
            >
              <Send size={14} />
              {finish.isPending ? "Đang nộp…" : "Nộp bài"}
            </Button>
          ) : null}
          {deadlineExpired && !over ? (
            <Button
              className={accentButton}
              type="button"
              disabled={!timeoutError || timeoutPending}
              onClick={retryTimeout}
            >
              {timeoutError ? "Thử lại" : "Đang xử lý hết giờ…"}
              <RefreshCw size={16} />
            </Button>
          ) : showCheck ? (
            <Button
              className={accentButton}
              disabled={!canSubmit}
              onClick={submit}
            >
              {answering ? "Đang kiểm tra…" : retryLabel}
              <Check size={16} />
            </Button>
          ) : over && locked ? (
            <Button className={accentButton} onClick={() => setShowResult(true)}>
              {gameOver ? "Xem kết quả" : "Hoàn thành"}
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              className={accentButton}
              disabled={(tryHard && !locked) || !nextOpen}
              onClick={goNext}
            >
              Câu tiếp
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      ) : null}
    </footer>
  );
}
