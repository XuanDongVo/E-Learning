"use client";

import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { PracticeResult } from "../../practice-result";
import { QuestionNavigator } from "../../question-navigator";
import { HintPanel, HintStatus } from "../../hint-panel";
import { GuidedStage } from "../guided-stage";
import { QuestionStageView } from "../question-stage-view";
import { AnswerResultFeedback } from "../question-stage/answer-result-feedback";
import { TYPE_LABEL, formatAnswer, isChoice, splitKeys } from "@/utils/practice-utils";
import mascot from "../../../../../../../public/assets/practice-mascot.png";
import type { PracticeController } from "../controller/use-practice-controller";

const quietButton = "student-control student-control--quiet";

export function PracticeWorkspace({
  unitId,
  controller,
}: {
  unitId: number;
  controller: PracticeController;
}) {
  const {
    tErrors, session, question, picks, locked, feedback, draft, over, hintOpen,
    questions, statuses, index, tryHard, goTo, deadlineExpired, complete,
    resultQuery, reviewQuery, retry, guidedHint,
    guidedReview, guidedFinalReview, dismissGuidedReview, dismissGuidedFinalReview,
    guidedStepAnswerMutation, guidedHintMutation, answering, setDraft,
    requestIds, submitGuidedStep, hinting, hintMutation, hintSlow, hintError, sendHint,
    hintText, setHintOpenFor, answerSlow, answerMutation, finish,
    timeoutNotice, timeoutPending, retryTimeout, timeoutError, submit,
  } = controller;
  if (!session || !question) return null;
  const upper = (keys: string[]) => keys.map((key) => key.toUpperCase());
  const submitted = picks[question.id] ?? [];
  const correctKeys = locked
    ? upper(
        question.finalCorrect ? submitted : splitKeys(feedback?.correctAnswer),
      )
    : [];
  const optionState = (key: string) => {
    if (locked) {
      if (correctKeys.includes(key.toUpperCase())) return "correct" as const;
      if (upper(submitted).includes(key.toUpperCase())) return "wrong" as const;
      return undefined;
    }
    return draft.includes(key) ? ("selected" as const) : undefined;
  };
  // One shared presentation for classic answers, guided steps and guided finals.
  const activeGuidedStep = guidedReview?.questionId === question.id ? guidedReview : undefined;
  const activeGuidedFinal = guidedFinalReview?.questionId === question.id ? guidedFinalReview : undefined;
  const activeFeedback = activeGuidedStep?.feedback ?? activeGuidedFinal?.feedback ?? (!question.guided ? feedback : undefined);
  const isGuidedStepFeedback = Boolean(activeGuidedStep);
  const displayAnswer = activeGuidedFinal?.feedback ?? (!question.guided ? feedback : undefined);
  const revealedAnswer =
    displayAnswer?.answerRevealed && displayAnswer.orderingAnswer
      ? displayAnswer.orderingAnswer.items.map((item) => item.content).join(" → ")
      : displayAnswer?.answerRevealed && displayAnswer.correctAnswer
        ? formatAnswer(
            question,
            isChoice(question) || question.type === "TRUE_FALSE"
              ? splitKeys(displayAnswer.correctAnswer)
              : [displayAnswer.correctAnswer],
          )
        : "";
  const resultFeedback = (
    <AnswerResultFeedback
      feedback={activeFeedback}
      isGuidedStep={isGuidedStepFeedback}
      revealedAnswer={revealedAnswer}
      answerRevealed={displayAnswer?.answerRevealed}
      explanation={displayAnswer?.explanation}
    />
  );
  const gameOver = session.status === "GAME_OVER";
  const finished = over && locked;
  const mascotText = finished
    ? gameOver
      ? "Bạn hết mạng rồi, nhưng đừng buồn! Cùng xem kết quả nhé!"
      : "Tuyệt vời! Bạn đã hoàn thành tất cả câu hỏi!"
    : activeFeedback
      ? activeFeedback.correct
        ? "Giỏi quá! Việt Cường tự hào về bạn!"
        : activeFeedback.retryAvailable
          ? "Chưa đúng, bạn còn một lần thử nữa nhé!"
          : "Không sao đâu, mình cùng xem đáp án nhé!"
      : hintOpen
        ? "Việt Cường vừa gợi ý rồi, xem trong khung câu hỏi nhé!"
        : "Thấy bạn suy nghĩ lâu Việt Cường cũng hồi hộp lây nè!";
  const navProps = {
    statuses,
    index,
    tryHard,
    isLocked: (i: number) => tryHard && questions[i]?.id !== question.id,
    onSelect: (i: number) => {
      const target = questions[i];
      if (target) goTo(target.id);
    },
  };
  return (
    <>
        {tryHard && deadlineExpired && !over && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-warning bg-card-bg p-3 text-sm font-bold"
          >
            <span>
              {timeoutError
                ? "Không thể đồng bộ hết giờ với máy chủ. Hãy thử lại."
                : "Hết giờ! Đang xác nhận kết quả với máy chủ…"}
            </span>
            {timeoutError && (
              <Button
                type="button"
                variant="outline"
                className={quietButton}
                disabled={timeoutPending}
                onClick={retryTimeout}
              >
                <RefreshCw size={15} /> Thử lại
              </Button>
            )}
          </div>
        )}
        {timeoutNotice && !deadlineExpired && !complete && (
          <p
            role="status"
            className="mt-3 rounded-xl bg-card-bg px-3 py-2 text-sm font-bold text-foreground"
          >
            {timeoutNotice}
          </p>
        )}
        <div
          className={
            complete
              ? "mt-6 flex flex-1 items-center justify-center py-4"
              : "mt-4 grid min-w-0 items-start gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_248px]"
          }
        >
          <div
            className={
              complete
                ? "w-full max-w-[760px]"
                : "grid min-w-0 items-start gap-5 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[140px_minmax(0,1fr)]"
            }
          >
            {!complete && (
              <aside className="hidden items-center gap-3 sm:mt-11 sm:flex sm:flex-col sm:gap-2">
                <div className="relative rounded-[18px] bg-card-bg px-3 py-3 text-center text-xs leading-5 shadow-pop">
                  {mascotText}
                </div>
                <Image
                  src={mascot}
                  alt="Việt Cường đang cổ vũ bạn"
                  width={816}
                  height={816}
                  className="size-24 object-contain lg:size-32"
                />
              </aside>
            )}
            <div className="min-w-0 rounded-[18px] bg-card-bg p-3 shadow-pop-sm sm:rounded-[24px] sm:p-5 sm:shadow-pop-lg">
               <div className="mb-3 flex flex-wrap gap-2">
                    <span className="student-chip">
                      Câu {index + 1}/{questions.length}
                    </span>
                    <span className="student-chip">
                      {TYPE_LABEL[question.type]}
                    </span>
                  </div>
              {complete ? (
                <PracticeResult
                  unitId={unitId}
                  session={session}
                  xpReward={resultQuery.data?.data?.xpReward}
                  xpRewardPending={resultQuery.isLoading}
                  xpRewardError={
                    resultQuery.isError
                      ? getAppErrorMessage(
                          resultQuery.error,
                          tErrors as (key: string) => string,
                        )
                      : undefined
                  }
                  onRetryXpReward={() => void resultQuery.refetch()}
                  review={reviewQuery.data?.data ?? undefined}
                  reviewPending={reviewQuery.isLoading}
                  reviewError={
                    reviewQuery.isError
                      ? getAppErrorMessage(
                          reviewQuery.error,
                          tErrors as (key: string) => string,
                        )
                      : undefined
                  }
                  onRetryReview={() => void reviewQuery.refetch()}
                  onRetry={retry}
                />
              ) : question.guided ? (
                <GuidedStage
                  question={question}
                  draft={draft}
                  review={guidedReview?.questionId === question.id ? guidedReview : undefined}
                  finalReview={guidedFinalReview?.questionId === question.id ? guidedFinalReview : undefined}
                  resultFeedback={resultFeedback}
                  onDismissReview={dismissGuidedReview}
                  onDismissFinalReview={dismissGuidedFinalReview}
                  stepHint={guidedHint}
                  stepError={
                    guidedStepAnswerMutation.isError || guidedHintMutation.isError
                      ? getAppErrorMessage(
                          guidedStepAnswerMutation.error ?? guidedHintMutation.error,
                          tErrors as (key: string) => string,
                        )
                      : undefined
                  }
                  finalHint={hintOpen ? hintText : undefined}
                  finalError={
                    answerMutation.isError
                      ? getAppErrorMessage(
                          answerMutation.error,
                          tErrors as (key: string) => string,
                        )
                      : hintError
                  }
                  pending={answering}
                  stepHintPending={guidedHintMutation.isPending}
                  finalHintPending={hinting}
                  onDraftChange={(next) => {
                    requestIds.clear(
                      question.guided?.currentStep
                        ? `step:${question.id}:${question.guided.currentStep.stepKey}`
                        : `final:${question.id}`,
                    );
                    setDraft(question.id, () => next);
                  }}
                  onSubmitStep={submitGuidedStep}
                  onUseStepHint={() => {
                    const step = question.guided?.currentStep;
                    if (!step) return;
                    guidedHintMutation.mutate({
                      questionId: question.id,
                      stepKey: step.stepKey,
                    });
                  }}
                  onUseFinalHint={() => sendHint({ questionId: question.id })}
                  onSubmitFinal={submit}
                />
              ) : (
                <>
                  <HintStatus
                    pending={
                      hinting &&
                      hintMutation.variables?.questionId === question.id
                    }
                    slow={hintSlow}
                    error={hintError}
                    onRetry={() => sendHint({ questionId: question.id })}
                  />
                  <HintPanel
                    open={hintOpen}
                    text={hintText ?? ""}
                    onClose={() => setHintOpenFor(null)}
                  />
                  <QuestionStageView
                    type={question.type}
                    prompt={question.content}
                    options={question.options}
                    ordering={question.ordering}
                    draft={question.type === "ORDERING" && locked ? submitted : draft}
                    disabled={locked || answering}
                    inputLabel="Đáp án của bạn"
                    inputPlaceholder="Nhập đáp án"
                    optionState={optionState}
                    feedback={resultFeedback}
                    onDraftChange={(next) => {
                      requestIds.clear(`final:${question.id}`);
                      setDraft(question.id, () => next);
                    }}
                  />
                  <div aria-live="polite">
                    {answering && answerSlow && (
                      <p role="status" className="mt-4 text-sm font-semibold">
                        Máy chủ phản hồi chậm, đáp án của bạn đang được kiểm
                        tra…
                      </p>
                    )}
                    {answerMutation.isError && !answering && (
                      <p
                        role="alert"
                        className="mt-4 text-sm font-bold text-destructive"
                      >
                        {getAppErrorMessage(
                          answerMutation.error,
                          tErrors as (key: string) => string,
                        )}{" "}
                        Đáp án của bạn vẫn được giữ, hãy bấm Kiểm tra để thử
                        lại.
                      </p>
                    )}
                    {finish.isError && (
                      <p
                        role="alert"
                        className="mt-4 text-sm font-bold text-destructive"
                      >
                        {getAppErrorMessage(
                          finish.error,
                          tErrors as (key: string) => string,
                        )}
                      </p>
                    )}
                    {finished && (
                      <div
                        role="status"
                        className="mt-4 rounded-2xl border-2 border-learning bg-learning-soft px-3.5 py-3 text-sm font-extrabold text-foreground"
                      >
                        {gameOver
                          ? "Bạn đã hết mạng. Bấm “Xem kết quả” để xem bài làm của mình."
                          : " Bạn đã hoàn thành bài luyện tập! Bấm “Hoàn thành” để xem kết quả."}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {!complete && <QuestionNavigator {...navProps} />}
        </div>
    </>  );
}
