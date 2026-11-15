"use client";

import Image from "next/image";
import { Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { PracticeResult } from "../../practice-result";
import { QuestionNavigator } from "../../question-navigator";
import { HintPanel, HintStatus } from "../../hint-panel";
import { GuidedStage } from "../guided-stage";
import { QuestionStageView } from "../question-stage-view";
import { TYPE_LABEL, formatAnswer, isChoice, splitKeys } from "@/utils/practice-utils";
import mascot from "../../../../../../../public/assets/practice-mascot.png";
import type { PracticeController } from "../controller/use-practice-controller";

const quietButton = "student-control student-control--quiet";
const card = "student-paper";

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
    resultQuery, feedbacks, retry, guidedFeedback, guidedHint,
    guidedReview, guidedFinalReview, dismissGuidedReview, dismissGuidedFinalReview,
    guidedStepAnswerMutation, guidedHintMutation, answering, setDraft,
    requestIds, submitGuidedStep, setGuidedFeedback, setGuidedHint,
    setFeedbacks, hinting, hintMutation, hintSlow, hintError, sendHint,
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
  const revealedText =
    feedback?.answerRevealed && feedback.correctAnswer
      ? formatAnswer(
          question,
          isChoice(question) || question.type === "TRUE_FALSE"
            ? splitKeys(feedback.correctAnswer)
            : [feedback.correctAnswer],
        )
      : "";
  const gameOver = session.status === "GAME_OVER";
  const finished = over && locked;
  const mascotText = finished
    ? gameOver
      ? "Bạn hết mạng rồi, nhưng đừng buồn! Cùng xem kết quả nhé!"
      : "Tuyệt vời! Bạn đã hoàn thành tất cả câu hỏi!"
    : feedback
      ? feedback.correct
        ? "Giỏi quá! Việt Cường tự hào về bạn!"
        : feedback.retryAvailable
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
              : "mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_248px]"
          }
        >
          <div
            className={
              complete
                ? "w-full max-w-[760px]"
                : "grid items-start gap-5 sm:grid-cols-[140px_minmax(0,1fr)]"
            }
          >
            {!complete && (
              <aside className="flex items-center gap-3 max-sm:order-2 max-sm:justify-center sm:mt-11 sm:flex-col sm:gap-2">
                <div className="relative rounded-[18px] bg-card-bg px-3 py-3 text-center text-xs leading-5 shadow-pop">
                  {mascotText}
                </div>
                <Image
                  src={mascot}
                  alt="Việt Cường đang cổ vũ bạn"
                  width={816}
                  height={816}
                  className="size-20 object-contain sm:size-32"
                />
              </aside>
            )}
            <div className={`${card} rounded-[24px] p-[18px] sm:p-5`}>
               <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                      Câu {index + 1}/{questions.length}
                    </span>
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
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
                  picks={picks}
                  revealed={Object.fromEntries(
                    Object.entries(feedbacks).map(([id, f]) => [
                      id,
                      f.answerRevealed
                        ? {
                            correctAnswer: f.correctAnswer,
                            explanation: f.explanation,
                          }
                        : {},
                    ]),
                  )}
                  onRetry={retry}
                />
              ) : question.guided ? (
                <GuidedStage
                  question={question}
                  draft={draft}
                  feedback={guidedFeedback}
                  review={guidedReview?.questionId === question.id ? guidedReview : undefined}
                  finalReview={guidedFinalReview?.questionId === question.id ? guidedFinalReview : undefined}
                  onDismissReview={dismissGuidedReview}
                  onDismissFinalReview={dismissGuidedFinalReview}
                  finalFeedback={feedback}
                  hint={guidedHint}
                  error={
                    guidedStepAnswerMutation.isError || guidedHintMutation.isError
                      ? getAppErrorMessage(
                          guidedStepAnswerMutation.error ?? guidedHintMutation.error,
                          tErrors as (key: string) => string,
                        )
                      : undefined
                  }
                  pending={answering}
                  hintPending={guidedHintMutation.isPending}
                  onDraftChange={(next) => {
                    requestIds.clear(
                      question.guided?.currentStep
                        ? `step:${question.id}:${question.guided.currentStep.stepKey}`
                        : `final:${question.id}`,
                    );
                    setDraft(question.id, () => next);
                  }}
                  onSubmitStep={submitGuidedStep}
                  onUseHint={() => {
                    const step = question.guided?.currentStep;
                    if (!step) return;
                    guidedHintMutation.mutate({
                      questionId: question.id,
                      stepKey: step.stepKey,
                    });
                  }}
                  onContinue={() => {
                    setGuidedFeedback(undefined);
                    setGuidedHint(undefined);
                  }}
                  onRetryStep={() => {
                    setGuidedFeedback(undefined);
                    setGuidedHint(undefined);
                  }}
                  onRetryFinal={() => {
                    setFeedbacks((current) => {
                      const next = { ...current };
                      delete next[question.id];
                      return next;
                    });
                  }}
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
                    draft={draft}
                    disabled={locked || answering}
                    inputLabel="Đáp án của bạn"
                    inputPlaceholder="Nhập đáp án"
                    optionState={optionState}
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
                    {feedback && (
                      <div
                        role="status"
                        aria-live="polite"
                        className={cn(
                          "mt-4 flex items-start gap-3 rounded-2xl border-2 p-3.5",
                          feedback.correct && "border-success bg-success-soft",
                          !feedback.correct &&
                            feedback.retryAvailable &&
                            "border-warning bg-warning-soft",
                          !feedback.correct &&
                            !feedback.retryAvailable &&
                            "border-destructive bg-destructive-soft",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-full",
                            feedback.correct &&
                              "bg-success text-primary-foreground",
                            !feedback.correct &&
                              feedback.retryAvailable &&
                              "bg-warning text-accent-foreground",
                            !feedback.correct &&
                              !feedback.retryAvailable &&
                              "bg-destructive text-destructive-foreground",
                          )}
                        >
                          {feedback.correct ? (
                            <Check size={18} />
                          ) : feedback.retryAvailable ? (
                            <RefreshCw size={18} />
                          ) : (
                            <X size={18} />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-extrabold",
                              feedback.correct && "text-success",
                              !feedback.correct &&
                                feedback.retryAvailable &&
                                "text-warning",
                              !feedback.correct &&
                                !feedback.retryAvailable &&
                                "text-destructive",
                            )}
                          >
                            {feedback.correct
                              ? "Chính xác!"
                              : feedback.retryAvailable
                                ? "Thử lại nhé!"
                                : "Chưa chính xác"}
                          </p>

                          <p className="mt-0.5 text-sm font-semibold leading-6 text-foreground">
                            {feedback.correct
                              ? "Bạn làm tốt lắm. Tiếp tục phát huy nhé!"
                              : feedback.retryAvailable
                                ? "Bạn còn một lần thử lại."
                                : revealedText
                                  ? `Đáp án đúng: ${revealedText}`
                                  : "Hãy xem lại đáp án và ghi nhớ nhé."}
                          </p>

                          {feedback.answerRevealed && feedback.explanation && (
                            <div className="mt-2 border-t border-current/15 pt-2">
                              <p className="text-xs font-extrabold text-muted-foreground">
                                GIẢI THÍCH
                              </p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {feedback.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
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
