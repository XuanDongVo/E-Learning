"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("student.activities.runtime.footer");
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
  const retryLabel = feedback?.retryAvailable ? t("retry") : t("check");
  const gameOver = controller.session?.status === "GAME_OVER";

  return (
    <footer className="sticky bottom-0 z-30 -mx-3 mt-auto grid grid-cols-[auto_minmax(0,1fr)] items-end gap-2 border-t border-border bg-card-bg/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-pop-sm backdrop-blur-sm sm:mx-0 sm:flex sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:shadow-none sm:backdrop-blur-none">
      {!complete ? (
        <QuestionNavigatorSheet {...navigator} onOpenChange={setNavOpen} />
      ) : null}
      {!complete && !question.guided ? (
        <div className="grid w-full min-w-0 grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <Button
            variant="outline"
            className={`${quietButton} min-w-0 px-2 sm:px-3`}
            disabled={index === 0 || tryHard}
            onClick={goPrev}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">{t("previous")}</span>
          </Button>
          <Button
            variant="outline"
            className={`${quietButton} min-w-0 px-2 sm:px-3`}
            disabled={locked || answering || deadlineExpired || draft.length === 0}
            onClick={reset}
          >
            {t("reset")}
          </Button>
          {!over ? (
            <Button
              variant="outline"
              className={`${quietButton} min-w-0 px-2 sm:px-3`}
              disabled={
                answering ||
                finish.isPending ||
                deadlineExpired ||
                timeoutPending
              }
              onClick={submitEarly}
            >
              <Send size={14} className="max-sm:hidden" />
              {finish.isPending ? t("submitting") : t("submit")}
            </Button>
          ) : null}
          {deadlineExpired && !over ? (
            <Button
              className={`${accentButton} col-span-3 w-full sm:w-auto`}
              type="button"
              disabled={!timeoutError || timeoutPending}
              onClick={retryTimeout}
            >
              {timeoutError ? t("retry") : t("timeoutPending")}
              <RefreshCw size={16} />
            </Button>
          ) : showCheck ? (
            <Button
              className={`${accentButton} col-span-3 w-full sm:w-auto`}
              disabled={!canSubmit}
              onClick={submit}
            >
              {answering ? t("checking") : retryLabel}
              <Check size={16} />
            </Button>
          ) : over && locked ? (
            <Button
              className={`${accentButton} col-span-3 w-full sm:w-auto`}
              onClick={() => setShowResult(true)}
            >
              {gameOver ? t("results") : t("complete")}
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              className={`${accentButton} col-span-3 w-full sm:w-auto`}
              disabled={(tryHard && !locked) || !nextOpen}
              onClick={goNext}
            >
              {t("next")}
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      ) : null}
    </footer>
  );
}
