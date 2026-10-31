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
import { StudentPaper } from "./student-paper";
import { useAttemptFullscreen } from "./hooks/use-attempt-fullscreen";
import type { AttemptAnswerPayload } from "@/types/student/assignment-attempt";

// ============================================================================
// 1. HELPER & COUNTDOWN HOOK
// ============================================================================

export function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;

  if (Array.isArray(value)) {
    return value.some(hasMeaningfulAnswer);
  }

  if (typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>);
    return values.length > 0 && values.some(hasMeaningfulAnswer);
  }

  return false;
}

function isPositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

/**
 * Đếm ngược dựa trên mốc deadlineAt và thời gian serverNow trả về từ server
 */
function useServerCountdown(
  deadlineAt?: string | null,
  serverNow?: string | null,
  onTimeUp?: () => void,
) {
  // Tính độ lệch giữa đồng hồ Client và Server
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

      if (secondsLeft <= 0) {
        onTimeUpRef.current?.();
      }
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
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [remainingSeconds]);

  const isUrgent = remainingSeconds !== null && remainingSeconds > 0 && remainingSeconds < 300; // < 5 phút
  const isTimeUp = remainingSeconds === 0;

  return { remainingSeconds, formattedTime, isUrgent, isTimeUp };
}

// ============================================================================
// 2. MAIN PAGE COMPONENT
// ============================================================================

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

  console.log("runtimeState", runtimeState);

  const [answers, setAnswers] = useState<Record<string, AttemptAnswerPayload>>({});
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runtime = runtimeState.runtime;
  const isExamActive = runtimeState.status === "ACTIVE";

  // Hook toàn màn hình và cảnh báo rời màn hình
  const { isFullscreen, isSupported, away, leaveCount, enterFullscreen } =
    useAttemptFullscreen({
      enabled: isExamActive,
    });

  // Khởi tạo câu trả lời từ runtime
  useEffect(() => {
    if (!runtime) return;
    const initial = createInitialAttemptAnswers(runtime);
    const mapped: Record<string, AttemptAnswerPayload> = {};
    Object.entries(initial).forEach(([k, v]) => {
      mapped[String(k)] = v;
    });
    setAnswers(mapped);
    setHasLocalChanges(false);
  }, [runtime]);

  // Xử lý khi hết thời gian làm bài
  const handleTimeUp = useCallback(() => {
    if (!isSubmitting) {
      // Tự động kích hoạt nộp bài hoặc thông báo hết giờ
      console.warn("Time is up! Auto-submitting attempt...");
    }
  }, [isSubmitting]);

  // Bộ đếm giờ từ server
  const { formattedTime, isUrgent, isTimeUp } = useServerCountdown(
    runtime?.deadlineAt,
    runtime?.serverNow,
    handleTimeUp,
  );

  // Cảnh báo khi người dùng tắt hoặc tải lại trang khi đang làm bài
  useEffect(() => {
    if (!hasLocalChanges || !isExamActive) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasLocalChanges, isExamActive]);

  const changeAnswer = useCallback(
    (attemptQuestionId: string, answerPayload: AttemptAnswerPayload) => {
      setAnswers((current) => ({
        ...current,
        [attemptQuestionId]: answerPayload,
      }));
      setHasLocalChanges(true);
    },
    [],
  );

  // Xử lý nộp bài thi
  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      // Gọi API nộp bài của bạn tại đây (ví dụ: submitAttempt(runtime.attemptId, answers))
      setShowSubmitConfirm(false);
    } catch (err) {
      console.error("Submit failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TRẠNG THÁI KIỂM TRA ĐIỀU KIỆN ---

  if (!validAssignmentId) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6"
          role="alert"
        >
          <h1 className="font-bold text-destructive">
            Mã đề thi không hợp lệ.
          </h1>
          <Link
            href="/student/assignments"
            className="mt-4 inline-flex text-sm font-semibold text-primary underline"
          >
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

  if (runtimeState.status === "ERROR") {
    const conflict =
      runtimeState.errorCode === "ASSESSMENT_ATTEMPT_SESSION_CONFLICT";
    const lost = runtimeState.errorCode === "ASSESSMENT_ATTEMPT_SESSION_LOST";
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

  // --- TRẠNG THÁI ĐANG LÀM BÀI CHÍNH THỨC ---

  if (isExamActive && runtime) {
    const questionCount = runtime.questions.length;
    const answeredCount = runtime.questions.filter((question) => {
      const payload = answers[String(question.attemptQuestionId)];
      return hasMeaningfulAnswer(payload);
    }).length;
    const unAnsweredCount = questionCount - answeredCount;

    return (
      <main className="fixed inset-0 z-40 flex h-dvh flex-col overflow-hidden bg-muted/20">
        {/* HEADER CỐ ĐỊNH CHUYÊN NGHIỆP */}
        <header className="z-20 flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5 shadow-2xs sm:px-6">
          {/* Cột trái: Tên bài thi & Tiến độ */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
                {runtime.assignmentTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary">
                  Đã làm {answeredCount}/{questionCount} câu
                </span>
                {leaveCount > 0 && (
                  <span className="font-semibold text-destructive">
                    · Rời màn hình: {leaveCount} lần
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Đồng hồ đếm ngược & Nút nộp bài */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            {/* Bộ đếm ngược thời gian */}
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

            {/* Nút nộp bài */}
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

        {/* VÙNG GIẤY THI CUỘN ĐỘC LẬP (Không bao giờ bị header che) */}
        <section
          className="min-h-0 flex-1 overflow-y-auto px-2 py-4 sm:px-4 sm:py-6 pb-20"
          inert={away || undefined}
        >
          <StudentPaper
            runtime={runtime}
            answers={answers}
            onAnswerChange={changeAnswer}
          />
        </section>

        {/* MODAL XÁC NHẬN NỘP BÀI (Submit Confirmation Dialog) */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  unAnsweredCount > 0 ? "bg-warning/15 text-warning-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {unAnsweredCount > 0 ? <AlertTriangle className="h-6 w-6 text-amber-600" /> : <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Xác nhận nộp bài thi</h2>
                  <p className="text-xs text-muted-foreground">Kiểm tra kỹ trước khi hoàn tất</p>
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

              {unAnsweredCount > 0 && (
                <p className="text-xs leading-relaxed text-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  Lưu ý: Bạn vẫn còn <b>{unAnsweredCount} câu</b> chưa trả lời. Sau khi nộp bạn sẽ không thể chỉnh sửa lại bài làm.
                </p>
              )}

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                >
                  Làm tiếp
                </Button>
                <Button
                  className="flex-1 rounded-xl gap-1.5"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Xác nhận nộp</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CẢNH BÁO KHI RỜI MÀN HÌNH/TAB */}
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
              <h2
                id="away-title"
                className="mt-4 text-lg font-bold text-foreground"
              >
                Bạn đã rời khỏi màn hình làm bài
              </h2>
              <p className="mt-1 text-sm font-semibold text-destructive">
                Cảnh cáo lần {leaveCount}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Quy chế thi không cho phép chuyển tab hoặc thoát toàn màn hình.
                Thời gian làm bài vẫn tiếp tục đếm. Hãy bấm nút dưới đây để quay lại.
              </p>
              <div className="mt-5">
                <Button
                  className="w-full gap-2 rounded-xl"
                  onClick={() => void enterFullscreen()}
                >
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

  // --- TRẠNG THÁI ĐÃ NỘP BÀI HOẶC HẾT GIỜ ---

  if (runtimeState.status === "COMPLETE" && runtime) {
    const timedOut = runtime.status === "TIMED_OUT";
    return (
      <StatusPanel
        icon={
          timedOut ? (
            <Clock3 className="h-6 w-6" />
          ) : (
            <BookOpenCheck className="h-6 w-6" />
          )
        }
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
    <StatusPanel
      icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
      title="Đang tải..."
    />
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
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
        {action}
        {!action && (
          <Link href="/student/assignments">
            <Button variant="secondary" className="rounded-xl">Về danh sách bài tập</Button>
          </Link>
        )}
      </section>
    </main>
  );
}
