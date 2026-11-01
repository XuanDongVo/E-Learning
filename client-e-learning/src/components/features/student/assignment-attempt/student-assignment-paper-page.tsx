"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Lock,
  Maximize,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  BusyButton,
  FullPageState,
  InlineStatus,
} from "@/components/feedback";
import { useAuth } from "@/components/auth/auth-provider";
import {
  useAttemptRuntime,
  createInitialAttemptAnswers,
} from "./hooks/use-attempt-runtime";
import { useAttemptAutosave } from "./hooks/use-attempt-autosave";
import { StudentPaper } from "./student-paper";
import { useAttemptFullscreen } from "./hooks/use-attempt-fullscreen";
import { getOrCreateAttemptSessionCredential } from "@/services/student/assessment-attempt-session-store";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import type { AttemptAnswerPayload } from "@/types/student/assignment-attempt";
import { toAppError } from "@/lib/errors/app-error";

export function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulAnswer);
  if (typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>);
    return values.length > 0 && values.some(hasMeaningfulAnswer);
  }
  return false;
}

function isPositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function useServerCountdown(
  deadlineAt?: string | null,
  serverNow?: string | null,
  onTimeUp?: () => void,
) {
  const serverOffsetRef = useRef<number>(0);

  useEffect(() => {
    if (serverNow) {
      const serverTime = new Date(serverNow).getTime();
      if (!Number.isNaN(serverTime)) {
        serverOffsetRef.current = serverTime - Date.now();
      }
    }
  }, [serverNow]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => {
    if (!deadlineAt) return null;
    const deadlineTime = new Date(deadlineAt).getTime();
    if (Number.isNaN(deadlineTime)) return null;
    const currentServerTime = Date.now() + serverOffsetRef.current;
    return Math.max(0, Math.floor((deadlineTime - currentServerTime) / 1000));
  });

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!deadlineAt) {
      setRemainingSeconds(null);
      return;
    }
    const deadlineTime = new Date(deadlineAt).getTime();
    if (Number.isNaN(deadlineTime)) return;
    const tick = () => {
      const currentServerTime = Date.now() + serverOffsetRef.current;
      const secondsLeft = Math.max(0, Math.floor((deadlineTime - currentServerTime) / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) onTimeUpRef.current?.();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  const formattedTime = useMemo(() => {
    if (remainingSeconds === null) return null;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [remainingSeconds]);

  const isUrgent = remainingSeconds !== null && remainingSeconds > 0 && remainingSeconds < 300;
  return { remainingSeconds, formattedTime, isUrgent };
}

export function StudentAssignmentPaperPage({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("student.assignmentAttempt");
  const tf = useTranslations("feedback");
  const parsedAssignmentId = Number(assignmentId);
  const validAssignmentId = isPositiveInteger(parsedAssignmentId);

  const runtimeState = useAttemptRuntime(
    user?.id ?? null,
    parsedAssignmentId,
    user?.role === "STUDENT" && validAssignmentId,
  );

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);

  const runtime = runtimeState.runtime;
  const isExamActive = runtimeState.status === "ACTIVE";
  const attemptIdNum = runtime ? Number(runtime.attemptId) : 0;

  useEffect(() => {
    if (!isExamActive || !user || user.role !== "STUDENT" || !validAssignmentId) return;
    let cancelled = false;
    void (async () => {
      try {
        const id = await getOrCreateAttemptSessionCredential(user.id, parsedAssignmentId);
        if (!cancelled) {
          setActiveSessionId(id);
          setSessionLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setSessionLoadError("ASSESSMENT_ATTEMPT_SESSION_LOST");
          setActiveSessionId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isExamActive, user, validAssignmentId, parsedAssignmentId]);

  const initialAnswers = useMemo(() => {
    if (!runtime) return {} as Record<number, Record<string, unknown>>;
    return createInitialAttemptAnswers(runtime);
  }, [runtime]);

  const initialRevisions = useMemo(() => {
    if (!runtime) return {} as Record<number, number>;
    const map: Record<number, number> = {};
    for (const q of runtime.questions) {
      const id = Number(q.attemptQuestionId);
      if (Number.isFinite(id)) {
        map[id] = typeof q.answerRevision === "number" ? q.answerRevision : 0;
      }
    }
    return map;
  }, [runtime]);

  const saveApi = useCallback(
    async (
      attemptId: number,
      attemptQuestionId: number,
      body: {
        activeSessionId: string;
        requestId: string;
        expectedRevision: number;
        answerPayload: Record<string, unknown>;
      },
    ) => {
      const response = await studentAssignmentAttemptService.saveAnswer(
        attemptId,
        attemptQuestionId,
        body,
      );
      if (!response.data) throw new Error("ASSESSMENT_ATTEMPT_SAVE_FAILED");
      return response.data;
    },
    [],
  );

  const {
    answers: autosaveAnswers,
    setAnswer,
    flushAllPending,
    saveStatus,
    fatalSessionCode,
  } = useAttemptAutosave({
    attemptId: attemptIdNum,
    activeSessionId,
    enabled: isExamActive && Boolean(activeSessionId) && attemptIdNum > 0,
    initialAnswers,
    initialRevisions,
    saveApi,
  });

  const answers = useMemo(() => {
    const mapped: Record<string, AttemptAnswerPayload> = {};
    for (const [k, v] of Object.entries(autosaveAnswers)) {
      mapped[String(k)] = v;
    }
    return mapped;
  }, [autosaveAnswers]);

  const setServerLeaveCountRef = useRef<(count: number) => void>(() => {});

  const handleLeaveSignal = useCallback(
    (payload: { eventType: "TAB_HIDDEN" | "FULLSCREEN_EXIT"; localLeaveCount: number }) => {
      if (!attemptIdNum || !activeSessionId) return;
      void (async () => {
        try {
          const response = await studentAssignmentAttemptService.event(attemptIdNum, {
            eventType: payload.eventType,
            activeSessionId,
          });
          if (response.data && typeof response.data.leaveEventCount === "number") {
            setServerLeaveCountRef.current(response.data.leaveEventCount);
          }
        } catch (err) {
          console.warn("leave signal failed", toAppError(err).code);
        }
      })();
    },
    [attemptIdNum, activeSessionId],
  );

  const {
    away,
    leaveCount,
    needsEnterFullscreen,
    enterFullscreen,
    setServerLeaveCount,
  } = useAttemptFullscreen({
    enabled: isExamActive,
    onLeaveSignal: handleLeaveSignal,
  });

  useEffect(() => {
    setServerLeaveCountRef.current = setServerLeaveCount;
  }, [setServerLeaveCount]);

  const handleTimeUp = useCallback(() => {
    if (!isSubmitting) void flushAllPending();
  }, [isSubmitting, flushAllPending]);

  const { formattedTime, isUrgent } = useServerCountdown(
    runtime?.deadlineAt,
    runtime?.serverNow,
    handleTimeUp,
  );

  const hasUnsaved =
    saveStatus === "unsaved" || saveStatus === "saving" || saveStatus === "error";

  useEffect(() => {
    if (!hasUnsaved || !isExamActive) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasUnsaved, isExamActive]);

  const changeAnswer = useCallback(
    (attemptQuestionId: string, answerPayload: AttemptAnswerPayload) => {
      const id = Number(attemptQuestionId);
      if (!Number.isFinite(id)) return;
      setAnswer(id, answerPayload, { immediate: true });
    },
    [setAnswer],
  );

  const handleSubmitExam = async () => {
    if (!activeSessionId) {
      setSessionLoadError("ASSESSMENT_ATTEMPT_SESSION_LOST");
      return;
    }
    try {
      setIsSubmitting(true);
      await flushAllPending();
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      await studentAssignmentAttemptService.submit(parsedAssignmentId, {
        activeSessionId,
        requestId,
      });
      setShowSubmitConfirm(false);
      router.push(`/student/assignments/${parsedAssignmentId}/result`);
    } catch (err) {
      console.error("Submit failed", toAppError(err).code, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveInline =
    saveStatus === "saving" || saveStatus === "unsaved"
      ? { tone: "progress" as const, message: tf("saving") }
      : saveStatus === "error"
        ? { tone: "error" as const, message: tf("saveFailed") }
        : { tone: "success" as const, message: tf("saved") };

  if (!validAssignmentId) {
    return (
      <FullPageState
        variant="error"
        title={t("errors.invalidAssignment")}
        action={
          <Link href="/student/assignments">
            <Button variant="secondary">{t("backToAssignments")}</Button>
          </Link>
        }
      />
    );
  }

  if (isAuthLoading) {
    return <FullPageState variant="loading" title={t("states.checkingAuth")} />;
  }

  if (!user || user.role !== "STUDENT") {
    return (
      <FullPageState
        variant="error"
        title={t("errors.studentOnly")}
        action={
          <Link href="/student">
            <Button variant="secondary">{t("backToDashboard")}</Button>
          </Link>
        }
      />
    );
  }

  if (runtimeState.status === "LOADING") {
    return (
      <FullPageState
        variant="loading"
        title={t("states.starting")}
        description={t("errors.startFailedDescription")}
      />
    );
  }

  const effectiveErrorCode =
    fatalSessionCode ??
    sessionLoadError ??
    (runtimeState.status === "ERROR" ? runtimeState.errorCode : null);

  if (effectiveErrorCode && (runtimeState.status === "ERROR" || fatalSessionCode || sessionLoadError)) {
    const conflict = effectiveErrorCode === "ASSESSMENT_ATTEMPT_SESSION_CONFLICT";
    const lost = effectiveErrorCode === "ASSESSMENT_ATTEMPT_SESSION_LOST";
    return (
      <FullPageState
        variant="error"
        title={
          conflict
            ? t("session.conflict")
            : lost
              ? t("submit.sessionMissing")
              : t("errors.startFailedTitle")
        }
        description={
          conflict
            ? t("session.conflict")
            : lost
              ? t("submit.sessionMissing")
              : t("errors.startFailedDescription")
        }
        action={
          conflict || lost ? (
            <Link href="/student/assignments">
              <Button variant="secondary">{t("backToAssignments")}</Button>
            </Link>
          ) : (
            <Button onClick={runtimeState.retry}>{tf("retry")}</Button>
          )
        }
      />
    );
  }

  if (isExamActive && runtime) {
    const questionCount = runtime.questions.length;
    const answeredCount = runtime.questions.filter((question) => {
      const payload = answers[String(question.attemptQuestionId)];
      return hasMeaningfulAnswer(payload);
    }).length;
    const unAnsweredCount = questionCount - answeredCount;

    return (
      <main className="fixed inset-0 z-40 flex h-dvh flex-col overflow-hidden bg-muted/20">
        <header className="z-20 flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5 shadow-2xs sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
                {runtime.assignmentTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary">
                  {t("player.progress", { answered: answeredCount, total: questionCount })}
                </span>
                <span className="inline-flex items-center gap-1">
                  · <InlineStatus tone={saveInline.tone} message={saveInline.message} />
                </span>
                {leaveCount > 0 && (
                  <span className="font-semibold text-destructive">
                    · {leaveCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            {formattedTime && (
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition sm:text-sm ${
                  isUrgent
                    ? "animate-pulse border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border bg-muted/60 text-foreground"
                }`}
                title={t("player.attemptDeadline")}
              >
                <Clock3 className={`h-4 w-4 ${isUrgent ? "text-destructive" : "text-primary"}`} />
                <span className="font-mono tracking-tight">{formattedTime}</span>
              </div>
            )}

            <Button
              onClick={() => setShowSubmitConfirm(true)}
              className="gap-2 rounded-xl font-bold shadow-xs"
              size="sm"
            >
              <Send className="h-4 w-4" />
              <span>{t("submit.button")}</span>
            </Button>
          </div>
        </header>

        <section
          className="min-h-0 flex-1 overflow-y-auto px-2 py-4 sm:px-4 sm:py-6 pb-20"
          inert={away || needsEnterFullscreen || undefined}
        >
          <StudentPaper runtime={runtime} answers={answers} onAnswerChange={changeAnswer} />
        </section>

        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs">
            <div role="dialog" aria-modal="true" className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    unAnsweredCount > 0 ? "bg-warning/15 text-warning-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {unAnsweredCount > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t("submit.title")}</h2>
                  <p className="text-xs text-muted-foreground">{tf("working")}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("player.progress", { answered: answeredCount, total: questionCount })}</span>
                </div>
                {unAnsweredCount > 0 && (
                  <div className="flex justify-between pt-1 border-t border-border/60 text-destructive font-semibold">
                    <span>{t("submit.unanswered", { count: unAnsweredCount })}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowSubmitConfirm(false)} disabled={isSubmitting}>
                  {t("submit.cancel")}
                </Button>
                <BusyButton
                  className="flex-1 rounded-xl gap-1.5"
                  onClick={handleSubmitExam}
                  busy={isSubmitting}
                  busyLabel={t("submit.confirming")}
                >
                  <Send className="h-4 w-4" />
                  <span>{t("submit.confirm")}</span>
                </BusyButton>
              </div>
            </div>
          </div>
        )}

        {needsEnterFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-xs">
            <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Maximize className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-foreground">Vào toàn màn hình để bắt đầu làm bài</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Bài kiểm tra yêu cầu chế độ toàn màn hình. Thời gian vẫn tính theo máy chủ.
              </p>
              <div className="mt-5">
                <Button className="w-full gap-2 rounded-xl" onClick={() => void enterFullscreen()}>
                  <Maximize className="h-4 w-4" />
                  Vào toàn màn hình
                </Button>
              </div>
            </div>
          </div>
        )}

        {away && !needsEnterFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-2xl">
              <Lock className="mx-auto h-8 w-8 text-destructive" />
              <h2 className="mt-3 text-lg font-bold">Bạn đã rời màn hình làm bài</h2>
              <p className="mt-2 text-sm text-muted-foreground">Quay lại toàn màn hình để tiếp tục.</p>
              <Button className="mt-4 w-full rounded-xl" onClick={() => void enterFullscreen()}>
                Tiếp tục làm bài
              </Button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <FullPageState
      variant="empty"
      title={t("errors.startFailedTitle")}
      description={t("errors.startFailedDescription")}
      action={
        <Link href="/student/assignments">
          <Button variant="secondary">{t("backToAssignments")}</Button>
        </Link>
      }
    />
  );
}
