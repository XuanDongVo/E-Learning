"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { activitySessionService } from "@/services/student/student-activity-session.service";
import type {
  ActivitySession,
  ActivitySessionMode,
  ActivitySessionQuestion,
  GuidedStepAnswerFeedback,
  SelectionStrategy,
} from "@/types/student/activity-session";
import { isChoice, useSlow } from "@/utils/practice-utils";
import type { NavStatus } from "../../question-navigator";
import { useLogicalRequestId } from "../use-logical-request-id";
import { usePracticeQuestionCursor } from "../use-practice-question-cursor";
import { usePracticeKeyboard } from "./use-practice-keyboard";
import { usePracticeTimeoutEffects } from "./use-practice-timeout-effects";
import { playPracticeFeedback, unlockPracticeAudio } from "../practice-feedback-sound";

type Feedback = {
  correct: boolean;
  retryAvailable: boolean;
  answerRevealed: boolean;
  correctAnswer?: string;
  explanation?: string;
};

type GuidedStep = NonNullable<NonNullable<ActivitySessionQuestion["guided"]>["currentStep"]>;

type GuidedReview = {
  questionId: number;
  step: GuidedStep;
  answer: string;
  feedback: GuidedStepAnswerFeedback;
  receivedAt: number;
};

type GuidedFinalReview = {
  questionId: number;
  answer: string[];
  feedback: Feedback;
  receivedAt: number;
};

const answerFor = (
  question: ActivitySessionQuestion,
  draft: string[],
): string | string[] =>
  question.type === "MULTIPLE_CHOICE" ? draft : (draft[0] ?? "");

export function usePracticeController({
  unitId,
  activityId,
}: {
  unitId: number;
  activityId: number;
}) {  const tErrors = useTranslations("errors");
  const router = useRouter();
  const unitHref = `/student/units/${unitId}`;
  const [mode, setMode] = useState<ActivitySessionMode>();
  const [strategy, setStrategy] = useState<SelectionStrategy>("RANDOM");
  const [session, setSession] = useState<ActivitySession>();
  const [currentId, setCurrentId] = usePracticeQuestionCursor(session);
  const [showResult, setShowResult] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string[]>>({});
  const [picks, setPicks] = useState<Record<number, string[]>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, Feedback>>({});
  const [hints, setHints] = useState<Record<number, string>>({});
  const [hintOpenFor, setHintOpenFor] = useState<number | null>(null);
  const [guidedHint, setGuidedHint] = useState<string>();
  const [guidedReview, setGuidedReview] = useState<GuidedReview>();
  const [guidedFinalReview, setGuidedFinalReview] = useState<GuidedFinalReview>();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [background, setBackground] = useState("garden");
  const [now, setNow] = useState(() => Date.now());
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [timeoutNotice, setTimeoutNotice] = useState<string | null>(null);
  const lastTimeoutPollAt = useRef(0);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const requestIds = useLogicalRequestId();

  // The server is authoritative. Offset keeps countdown accurate even on
  // devices with an incorrect system clock; deadlineAt includes a time zone.
  const syncServerClock = useCallback((data: ActivitySession) => {
    if (!data.serverNow) return;
    const serverMs = Date.parse(data.serverNow);
    if (Number.isFinite(serverMs)) setClockOffsetMs(serverMs - Date.now());
  }, []);

  const options = useQuery({
    queryKey: ["activity-session-options", activityId],
    queryFn: () => activitySessionService.options(activityId),
  });
  const sessionOptions = options.data?.data ?? undefined;
  const effectiveMode =
    mode ??
    (sessionOptions?.activityMode !== "BOTH"
      ? sessionOptions?.activityMode
      : undefined);
  const effectiveStrategy = sessionOptions?.selectionStrategies.includes(
    strategy,
  )
    ? strategy
    : sessionOptions?.selectionStrategies[0];
  const start = useMutation({
    mutationFn: () =>
      activitySessionService.start(
        activityId,
        effectiveMode,
        effectiveStrategy,
      ),
    onSuccess: (result) => {
      const data = result.data;
      if (!data) return;
      syncServerClock(data);
      lastTimeoutPollAt.current = 0;
      setTimeoutNotice(null);
      setSession(data);
      setCurrentId(
        (data.questions.find((q) => !q.resolved) ?? data.questions[0])?.id,
      );
      setDrafts({});
      setPicks({});
      setFeedbacks({});
      setHints({});
      setHintOpenFor(null);
      setGuidedHint(undefined);
      setGuidedReview(undefined);
      setGuidedFinalReview(undefined);
      setShowResult(false);
    },
  });
  const answerMutation = useMutation({
    mutationFn: (v: {
      questionId: number;
      requestId: string;
      answer: string | string[];
      draft: string[];
    }) =>
      activitySessionService.answer(
        session!.id,
        v.questionId,
        v.requestId,
        v.answer,
      ),
    onSuccess: (result, v) => {
      const data = result.data;
      if (!data) return;
      syncServerClock(data.session);
      setTimeoutNotice(null);
      setSession(data.session);
      const answerFeedback: Feedback = {
        correct: data.correct,
        retryAvailable: data.retryAvailable,
        answerRevealed: data.answerRevealed,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      };
      setFeedbacks((f) => ({ ...f, [v.questionId]: answerFeedback }));
      if (soundEnabled) playPracticeFeedback(data.correct);
      setPicks((p) => ({ ...p, [v.questionId]: v.draft }));
      setDrafts((d) => ({ ...d, [v.questionId]: [] }));
      requestIds.clear(`final:${v.questionId}`);
      const answeredQuestion = data.session.questions.find(
        (question) => question.id === v.questionId,
      );
      // Guided final feedback must remain visible before advancing the cursor.
      if (answeredQuestion?.guided) {
        setGuidedFinalReview({
          questionId: v.questionId,
          answer: v.draft,
          feedback: answerFeedback,
          receivedAt: Date.now(),
        });
      } else if (
        data.session.status !== "IN_PROGRESS" &&
        data.session.questions.some((question) => question.guided)
      ) {
        setShowResult(true);
      }
    },
  });
  const { mutate: sendAnswer, isPending: answerPending } = answerMutation;
  const hintMutation = useMutation({
    mutationFn: (v: { questionId: number }) =>
      activitySessionService.hint(session!.id, v.questionId),
    onSuccess: (result, v) => {
      const data = result.data;
      if (!data) return;
      setHints((h) => ({ ...h, [v.questionId]: data.hint }));
      setHintOpenFor(v.questionId);
      setSession(
        (s) =>
          s && {
            ...s,
            hintUsedCount: data.session.hintUsedCount,
            questions: s.questions.map((q) =>
              q.id === v.questionId ? { ...q, hintUsed: true } : q,
            ),
          },
      );
    },
  });
  const { mutate: sendHint, isPending: hinting } = hintMutation;
  const guidedStepAnswerMutation = useMutation({
    mutationFn: (value: {
      questionId: number;
      stepKey: string;
      requestId: string;
      answer: string;
      reviewStep: GuidedStep;
    }) =>
      activitySessionService.answerGuidedStep(
        session!.id,
        value.questionId,
        value.stepKey,
        value.requestId,
        value.answer,
      ),
    onSuccess: (result, value) => {
      const data = result.data;
      if (!data) return;
      syncServerClock(data.session);
      setSession(data.session);
      setGuidedReview({
        questionId: value.questionId,
        step: value.reviewStep,
        answer: value.answer,
        feedback: data,
        receivedAt: Date.now(),
      });
      if (soundEnabled) playPracticeFeedback(data.correct);
      setGuidedHint(undefined);
      setDrafts((drafts) => ({ ...drafts, [value.questionId]: [] }));
      requestIds.clear(`step:${value.questionId}:${value.stepKey}`);
    },
  });
  const guidedHintMutation = useMutation({
    mutationFn: (value: { questionId: number; stepKey: string }) =>
      activitySessionService.hintGuidedStep(
        session!.id,
        value.questionId,
        value.stepKey,
      ),
    onSuccess: (result) => {
      const data = result.data;
      if (!data) return;
      syncServerClock(data.session);
      setSession(data.session);
      setGuidedHint(data.hint);
    },
  });
  const answering = answerPending || guidedStepAnswerMutation.isPending;
  const finish = useMutation({
    mutationFn: () => activitySessionService.finish(session!.id),
    onSuccess: (result) => {
      if (result.data) {
        syncServerClock(result.data);
        setSession(result.data);
      }
      setShowResult(true);
    },
  });
  const resultQuery = useQuery({
    queryKey: ["activity-session-result", session?.id],
    queryFn: () => activitySessionService.result(session!.id),
    enabled: showResult && !!session && session.status !== "IN_PROGRESS",
    staleTime: Number.POSITIVE_INFINITY,
  });
  const reviewQuery = useQuery({
    queryKey: ["activity-session-review", session?.id],
    queryFn: () => activitySessionService.review(session!.id),
    enabled: showResult && !!session && session.status !== "IN_PROGRESS",
    staleTime: Number.POSITIVE_INFINITY,
  });

  const timeoutMutation = useMutation({
    mutationFn: (v: { sessionId: number; questionId: number }) =>
      activitySessionService.timeout(v.sessionId, v.questionId),
    onSuccess: (result, v) => {
      const data = result.data;
      if (!data) return;
      syncServerClock(data);
      setSession((previous) => {
        if (previous?.id !== v.sessionId) return previous;
        // Don't roll back a newer answer response received while a timeout
        // synchronization request was in flight.
        const oldResolved = previous.questions.filter((q) => q.resolved).length;
        const freshResolved = data.questions.filter((q) => q.resolved).length;
        return freshResolved >= oldResolved ? data : previous;
      });
      if (
        data.questions.some(
          (q) => q.id === v.questionId && q.resolutionReason === "TIMEOUT",
        )
      ) {
        setTimeoutNotice("Câu vừa rồi hết giờ. Bạn không bị trừ mạng.");
        setDrafts((drafts) => ({ ...drafts, [v.questionId]: [] }));
        if (data.status === "IN_PROGRESS") {
          setCurrentId((currentId) =>
            currentId === v.questionId
              ? (data.questions.find((q) => !q.resolved)?.id ?? currentId)
              : currentId,
          );
        }
      }
    },
  });
  const { mutate: sendTimeout, isPending: timeoutPending } = timeoutMutation;
  const startSlow = useSlow(start.isPending),
    answerSlow = useSlow(answering),
    hintSlow = useSlow(hinting);
  const questions = useMemo(() => session?.questions ?? [], [session]);
  const index = Math.max(
    0,
    questions.findIndex((q) => q.id === currentId),
  );
  const question = questions[index];
  const tryHard = session?.mode === "TRY_HARD";
  const over = !!session && session.status !== "IN_PROGRESS";
  const complete = showResult;
  const draft = useMemo(
    () => (question && drafts[question.id]) || [],
    [question, drafts],
  );
  const feedback = question ? feedbacks[question.id] : undefined;
  const locked = !!question?.resolved;
  const deadlineExpired =
    !!tryHard &&
    !!question?.deadlineAt &&
    !locked &&
    Date.parse(question.deadlineAt) <= now + clockOffsetMs;
  const timeoutError =
    deadlineExpired &&
    timeoutMutation.isError &&
    timeoutMutation.variables?.sessionId === session?.id &&
    timeoutMutation.variables?.questionId === question?.id;
  const hasDraft = question
    ? isChoice(question) || question.type === "TRUE_FALSE"
      ? draft.length > 0
      : (draft[0] ?? "").trim().length > 0
    : false;
  const canSubmit =
    !!question &&
    !locked &&
    !over &&
    hasDraft &&
    !answering &&
    !deadlineExpired &&
    !timeoutPending;
  const hintAvailable =
    !!question &&
    !question.guided &&
    session?.mode === "LEARNING" &&
    question.hasHint &&
    !locked &&
    !over &&
    !complete;
  const hintText = question ? hints[question.id] : undefined;
  const hintOpen =
    !!question && !!hintText && hintOpenFor === question.id && !locked;
  const hintError =
    hintMutation.isError && hintMutation.variables?.questionId === question?.id
      ? getAppErrorMessage(
          hintMutation.error,
          tErrors as (key: string) => string,
        )
      : undefined;
  const nextOpen =
    questions.find((q, i) => i > index && !q.resolved) ??
    questions.find((q) => !q.resolved && q.id !== question?.id);
  const secondsLeft =
    question?.deadlineAt && !locked
      ? Math.max(
          0,
          Math.ceil(
            (Date.parse(question.deadlineAt) - now - clockOffsetMs) / 1000,
          ),
        )
      : undefined;
  const statuses: NavStatus[] = questions.map((q) =>
    q.resolved
      ? q.finalCorrect
        ? "correct"
        : "wrong"
      : (drafts[q.id]?.length ?? 0) > 0
        ? "picked"
        : "todo",
  );
  const goTo = useCallback(
    (id: number) => {
      setCurrentId(id);
      setGuidedHint(undefined);
      setGuidedReview(undefined);
      setGuidedFinalReview(undefined);
    },
    [setCurrentId],
  );
  const goNext = useCallback(() => {
    if (nextOpen) goTo(nextOpen.id);
  }, [nextOpen, goTo]);
  const goPrev = useCallback(() => {
    const prev = questions[index - 1];
    if (!tryHard && prev) goTo(prev.id);
  }, [questions, index, tryHard, goTo]);
  const setDraft = useCallback(
    (qid: number, update: (current: string[]) => string[]) =>
      setDrafts((d) => ({ ...d, [qid]: update(d[qid] ?? []) })),
    [],
  );
  const pick = useCallback(
    (key: string) => {
      if (!question || locked || answering || deadlineExpired || timeoutPending || guidedReview || guidedFinalReview)
        return;
      const effectiveType = question.guided?.currentStep?.type ?? question.type;
      setDraft(question.id, (cur) =>
        effectiveType === "MULTIPLE_CHOICE"
          ? cur.includes(key)
            ? cur.filter((k) => k !== key)
            : [...cur, key]
          : [key],
      );
      requestIds.clear(`final:${question.id}`);
    },
    [
      question,
      locked,
      answering,
      deadlineExpired,
      timeoutPending,
      guidedReview,
      guidedFinalReview,
      setDraft,
      requestIds,
    ],
  );
  const submit = useCallback(() => {
    if (!question || !canSubmit || guidedFinalReview) return;
    if (soundEnabled) unlockPracticeAudio();
    sendAnswer({
      questionId: question.id,
      requestId: requestIds.acquire(`final:${question.id}`),
      answer: answerFor(question, draft),
      draft,
    });
  }, [question, canSubmit, guidedFinalReview, soundEnabled, sendAnswer, draft, requestIds]);
  const submitGuidedStep = useCallback(() => {
    const step = question?.guided?.currentStep;
    if (!question || !step || !(draft[0] ?? "").trim() || answering || guidedReview) return;
    if (soundEnabled) unlockPracticeAudio();
    guidedStepAnswerMutation.mutate({
      questionId: question.id,
      stepKey: step.stepKey,
      requestId: requestIds.acquire(`step:${question.id}:${step.stepKey}`),
      answer: draft[0] ?? "",
      reviewStep: { ...step, options: [...step.options] },
    });
  }, [question, draft, answering, guidedReview, soundEnabled, guidedStepAnswerMutation, requestIds]);
  const dismissGuidedReview = useCallback(() => {
    setGuidedReview(undefined);
    setGuidedHint(undefined);
  }, []);
  const dismissGuidedFinalReview = useCallback(() => {
    if (!guidedFinalReview) return;
    setGuidedFinalReview(undefined);
    if (guidedFinalReview.feedback.retryAvailable) {
      setFeedbacks((current) => {
        const next = { ...current };
        delete next[guidedFinalReview.questionId];
        return next;
      });
    } else if (session?.status !== "IN_PROGRESS") {
      setShowResult(true);
    } else {
      const next = session?.questions.find((item) => !item.resolved);
      if (next) setCurrentId(next.id);
    }
  }, [guidedFinalReview, session, setCurrentId]);

  useEffect(() => {
    if (!guidedReview) return;
    const timer = window.setTimeout(
      dismissGuidedReview,
      guidedReview.feedback.retryAvailable ? 1400 : 1900,
    );
    return () => window.clearTimeout(timer);
  }, [guidedReview, dismissGuidedReview]);

  useEffect(() => {
    if (!guidedFinalReview) return;
    const timer = window.setTimeout(
      dismissGuidedFinalReview,
      guidedFinalReview.feedback.retryAvailable ? 1400 : 1900,
    );
    return () => window.clearTimeout(timer);
  }, [guidedFinalReview, dismissGuidedFinalReview]);

  const submitCurrent = useCallback(() => {
    if (guidedReview?.questionId === question?.id) {
      if (Date.now() - guidedReview.receivedAt >= 650) dismissGuidedReview();
      return;
    }
    if (guidedFinalReview?.questionId === question?.id) {
      if (Date.now() - guidedFinalReview.receivedAt >= 650) dismissGuidedFinalReview();
      return;
    }
    if (question?.guided?.currentStep) submitGuidedStep();
    else submit();
  }, [
    question, submit, submitGuidedStep, guidedReview, guidedFinalReview,
    dismissGuidedReview, dismissGuidedFinalReview,
  ]);
  const reset = useCallback(() => {
    if (!question || locked || answering || deadlineExpired) return;
    setDraft(question.id, () => []);
  }, [question, locked, answering, deadlineExpired, setDraft]);
  const requestHint = useCallback(() => {
    if (!question || !hintAvailable || hinting) return;
    if (hints[question.id]) {
      setHintOpenFor((id) => (id === question.id ? null : question.id));
      return;
    }
    sendHint({ questionId: question.id });
  }, [question, hintAvailable, hinting, hints, sendHint]);

  const leave = () => {
    if (!session || over || complete) {
      router.push(unitHref);
      return;
    }

    setLeaveDialogOpen(true);
  };

  const confirmLeave = () => {
    if (finish.isPending) return;

    finish.mutate(undefined, {
      onSuccess: () => {
        setLeaveDialogOpen(false);
        router.push(unitHref);
      },
    });
  };

  const answeredCount = questions.filter((q) => q.resolved).length;
  const submitEarly = () => {
    if (
      !session ||
      over ||
      complete ||
      answering ||
      finish.isPending ||
      deadlineExpired ||
      timeoutPending
    )
      return;
    setConfirmOpen(true);
  };
  const confirmSubmit = () => {
    setConfirmOpen(false);
    finish.mutate();
  };
  const retry = () => {
    setSession(undefined);
    setCurrentId(undefined);
    setShowResult(false);
    setDrafts({});
    setPicks({});
    setFeedbacks({});
    setHints({});
    setHintOpenFor(null);
    setGuidedHint(undefined);
    setGuidedReview(undefined);
    setGuidedFinalReview(undefined);
    setTimeoutNotice(null);
    requestIds.clearAll();
    lastTimeoutPollAt.current = 0;
    timeoutMutation.reset();
    start.reset();
    answerMutation.reset();
    hintMutation.reset();
    finish.reset();
  };
  const retryTimeout = usePracticeTimeoutEffects({
    answering,
    complete,
    lastPollAtRef: lastTimeoutPollAt,
    locked,
    now,
    over,
    question,
    secondsLeft,
    sendTimeout,
    session,
    setNow,
    setSession,
    syncServerClock,
    timeoutError: Boolean(timeoutError),
    timeoutPending,
    tryHard,
  });
  usePracticeKeyboard({
    blocked: !session || settings || complete || navOpen || confirmOpen || leaveDialogOpen || answering || deadlineExpired || timeoutPending,
    question,
    tryHard,
    locked,
    submit: submitCurrent,
    requestHint,
    goPrevious: goPrev,
    goNext,
    reset,
    pick,
  });
  return {
    tErrors, session, question, sessionOptions, options,
    effectiveMode, setMode, effectiveStrategy, setStrategy, start, startSlow,
    picks, locked, feedback, draft, over, hintOpen, questions, statuses, index,
    tryHard, goTo, goNext, deadlineExpired, hasDraft, canSubmit, background, leave,
    settings, setSettings, secondsLeft, complete, resultQuery, reviewQuery, feedbacks, retry,
    guidedHint, guidedReview, guidedFinalReview,
    dismissGuidedReview, dismissGuidedFinalReview,
    soundEnabled, setSoundEnabled, guidedStepAnswerMutation, guidedHintMutation,
    answering, setDraft, requestIds, submitGuidedStep,
    setGuidedHint, setFeedbacks, hinting, hintMutation, hintSlow,
    hintError, sendHint, hintText, setHintOpenFor, answerSlow, answerMutation,
    finish, timeoutNotice, hintAvailable, requestHint, navOpen, setNavOpen,
    goPrev, reset, timeoutPending, submitEarly, retryTimeout, timeoutError,
    submit, setShowResult, nextOpen, leaveDialogOpen, setLeaveDialogOpen,
    confirmLeave, confirmOpen, setConfirmOpen, answeredCount, confirmSubmit,
    setBackground,
  };
}

export type PracticeController = ReturnType<typeof usePracticeController>;
