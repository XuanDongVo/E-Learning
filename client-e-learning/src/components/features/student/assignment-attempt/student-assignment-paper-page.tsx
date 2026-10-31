"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Hourglass,
  LoaderCircle,
  Lock,
  Maximize,
  Send,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const isTimeUp = remainingSeconds === 0;
  return { remainingSeconds, formattedTime, isUrgent, isTimeUp };
}

export function StudentAssignmentPaperPage({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
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

  const { away, leaveCount, enterFullscreen } = useAttemptFullscreen({
    enabled: isExamActive,
  });

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
    try {
      setIsSubmitting(true);
      const flushed = await flushAllPending();
      if (!flushed) {
        console.warn("Pending answers could not be fully saved before submit");
        return;
      }
      // Submit API deferred — flush only for now
      setShowSubmitConfirm(false);
    } catch (err) {
      console.error("Submit prep failed", toAppError(err).code, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveStatusLabel =
    saveStatus === "saving"
      ? "Đang lưu..."
      : saveStatus === "unsaved"
        ? "Chưa lưu"
        : saveStatus === "error"
          ? "Lưu lỗi"
          : "Đã lưu";

  if (!validAssignmentId) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6" role="alert">
          <h1 className="font-bold text-destructive">Mã đề thi không hợp lệ.</h1>
          <Link href="/student/assignments" className="mt-4 inline-flex text-sm font-semibold text-primary underline">
            Quay lại danh sách bài tập
          </Link>
        </div>
      </main>
    );
  }

  if (isAuthLoading) {
    return (
      <StatusPanel
        icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
        title="Đang kiểm tra thông tin tài khoản..."
      />
    );
  }

  if (!user || user.role !== "STUDENT") {
    return (
      <StatusPanel
        icon={<ShieldAlert className="h-6 w-6" />}
        title="Chỉ học sinh mới có quyền làm bài kiểm tra này."
        action={
          <Link href="/student">
            <Button variant="secondary">Về trang chủ</Button>
          </Link>
        }
      />
    );
  }

  if (runtimeState.status === "LOADING") {
    return (
      <StatusPanel
        icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
        title="Đang tải dữ liệu bài thi..."
        description="Vui lòng chờ trong giây lát trong khi hệ thống đồng bộ đề thi."
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
      <StatusPanel
        icon={<CircleAlert className="h-6 w-6" />}
        title={
          conflict
            ? "Phiên làm bài đang mở ở thiết bị khác"
            : lost
              ? "Mất thông tin phiên làm bài"
              : "Không thể mở bài thi"
        }
        description={
          conflict
            ? "Bạn chỉ có thể mở một màn hình làm bài duy nhất. Hãy đóng các tab khác trước khi tiếp tục."
            : lost
              ? "Phiên làm bài trên thiết bị này không còn hiệu lực (dữ liệu phiên đã mất hoặc bạn đang ở trình duyệt/máy khác). Hãy mở lại đúng trình duyệt đã bấm Start (không xóa dữ liệu trang). Nếu vẫn không vào được, liên hệ giáo viên."
              : "Vui lòng làm mới lại trang hoặc liên hệ giáo viên để được hỗ trợ."
        }
        action={
          conflict || lost ? (
            <Link href="/student/assignments">
              <Button variant="secondary">Quay lại danh sách</Button>
            </Link>
          ) : (
            <Button onClick={runtimeState.retry}>Thử lại</Button>
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
                  Đã làm {answeredCount}/{questionCount} câu
                </span>
                <span
                  className={
                    saveStatus === "error"
                      ? "font-semibold text-destructive"
                      : saveStatus === "saving" || saveStatus === "unsaved"
                        ? "font-medium text-amber-600"
                        : "font-medium text-muted-foreground"
                  }
                >
                  · {saveStatusLabel}
                </span>
                {leaveCount > 0 && (
                  <span className="font-semibold text-destructive">
                    · Rời màn hình: {leaveCount} lần
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
                title="Thời gian làm bài còn lại"
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
              <span>Nộp bài</span>
            </Button>
          </div>
        </header>

        <section
          className="min-h-0 flex-1 overflow-y-auto px-2 py-4 sm:px-4 sm:py-6 pb-20"
          inert={away || undefined}
        >
          <StudentPaper runtime={runtime} answers={answers} onAnswerChange={changeAnswer} />
        </section>

        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    unAnsweredCount > 0
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {unAnsweredCount > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Xác nhận nộp bài thi</h2>
                  <p className="text-xs text-muted-foreground">
                    Autosave sẽ được đẩy hết trước; API nộp bài chưa kết nối.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số câu:</span>
                  <span className="font-bold text-foreground">{questionCount} câu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã trả lời:</span>
                  <span className="font-bold text-primary">{answeredCount} câu</span>
                </div>
                {unAnsweredCount > 0 && (
                  <div className="flex justify-between pt-1 border-t border-border/60 text-destructive font-semibold">
                    <span>Chưa trả lời:</span>
                    <span>{unAnsweredCount} câu</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                >
                  Làm tiếp
                </Button>
                <Button className="flex-1 rounded-xl gap-1.5" onClick={handleSubmitExam} disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Lưu nháp & đóng</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {away && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-xs">
            <div
              role="alertdialog"
              aria-labelledby="away-title"
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Lock className="h-6 w-6" />
              </div>
              <h2 id="away-title" className="mt-4 text-lg font-bold text-foreground">
                Bạn đã rời khỏi màn hình làm bài
              </h2>
              <p className="mt-1 text-sm font-semibold text-destructive">Cảnh cáo lần {leaveCount}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Quy chế thi không cho phép chuyển tab hoặc thoát toàn màn hình. Thời gian làm bài vẫn
                tiếp tục đếm.
              </p>
              <div className="mt-5">
                <Button className="w-full gap-2 rounded-xl" onClick={() => void enterFullscreen()}>
                  <Maximize className="h-4 w-4" />
                  Quay lại làm bài ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  if (runtimeState.status === "COMPLETE" && runtime) {
    const timedOut = runtime.status === "TIMED_OUT";
    return (
      <StatusPanel
        icon={timedOut ? <Clock3 className="h-6 w-6" /> : <BookOpenCheck className="h-6 w-6" />}
        title={timedOut ? "Hết thời gian làm bài" : "Đã hoàn thành bài kiểm tra"}
        description="Bài thi của bạn đã được ghi nhận vào hệ thống."
        action={
          <Link href="/student/assignments">
            <Button className="rounded-xl">Quay lại danh sách</Button>
          </Link>
        }
      />
    );
  }

  return (
    <StatusPanel icon={<LoaderCircle className="h-6 w-6 animate-spin" />} title="Đang tải..." />
  );
}

function StatusPanel({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center p-4 sm:p-6">
      <section className="w-full space-y-4 rounded-3xl border border-border bg-card p-6 text-center sm:p-8 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
        {description && (
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
        {action}
        {!action && (
          <Link href="/student/assignments">
            <Button variant="secondary" className="rounded-xl">
              Về danh sách bài tập
            </Button>
          </Link>
        )}
      </section>
    </main>
  );
}
