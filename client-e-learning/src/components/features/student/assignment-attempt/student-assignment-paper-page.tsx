"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleAlert,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { toAppError } from "@/lib/errors/app-error";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import { getOrCreateAttemptSessionCredential } from "@/services/student/assessment-attempt-session-store";
import { consumeAttemptRuntime } from "@/services/student/assessment-attempt-runtime-store";
import { useAttemptBrowserLock } from "./hooks/use-attempt-browser-lock";
import { StudentPaper } from "./student-paper";
import type {
  AttemptAnswerPayload,
  AttemptRuntimeResponse,
} from "@/types/student/assignment-attempt";

type PagePhase = "INTRO" | "STARTING" | "ACTIVE" | "COMPLETE" | "ERROR";

function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasMeaningfulAnswer);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasMeaningfulAnswer);
  // Boolean false is still an explicit response, not an unanswered value.
  return true;
}

function isPositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function StudentAssignmentPaperPage({ assignmentId }: { assignmentId: string }) {
  const t = useTranslations("student.assignmentAttempt");
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const parsedAssignmentId = Number(assignmentId);
  const validAssignmentId = isPositiveInteger(parsedAssignmentId);
  const lockName = user?.role === "STUDENT" && validAssignmentId
    ? `assessment-attempt:${user.id}:assignment:${parsedAssignmentId}`
    : null;
  const lockState = useAttemptBrowserLock(lockName);
  const [phase, setPhase] = useState<PagePhase>("INTRO");
  const [runtime, setRuntime] = useState<AttemptRuntimeResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswerPayload>>({});
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [failureCode, setFailureCode] = useState<string | null>(null);
  const startRequestedRef = useRef(false);

  const formattedAttemptDeadline = useMemo(() => {
    if (!runtime?.deadlineAt) return null;
    const deadline = new Date(runtime.deadlineAt);
    if (Number.isNaN(deadline.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(deadline);
  }, [locale, runtime?.deadlineAt]);

  const startOrResume = useCallback(async () => {
    if (!user || user.role !== "STUDENT" || !validAssignmentId || lockState !== "OWNED") {
      return;
    }

    setPhase("STARTING");
    setFailureCode(null);

    try {
      // The same UUID is reused after a retry, refresh or ordinary browser restart.
      // Persist it before the HTTP request so a lost response cannot create a second ID.
      const activeSessionId = await getOrCreateAttemptSessionCredential(
        user.id,
        parsedAssignmentId,
      );
      const response = await studentAssignmentAttemptService.startOrResume(
        parsedAssignmentId,
        { activeSessionId },
      );

      if (!response.data) {
        throw new Error("ASSESSMENT_ATTEMPT_EMPTY_RESPONSE");
      }

      setRuntime(response.data);
      setAnswers(Object.fromEntries(
        response.data.questions.map((question) => [
          question.attemptQuestionId,
          question.answerPayload ?? {},
        ]),
      ));
      setHasLocalChanges(false);
      setPhase(response.data.status === "IN_PROGRESS" ? "ACTIVE" : "COMPLETE");
    } catch (error) {
      const normalized = toAppError(error);
      setFailureCode(normalized.code);
      setPhase("ERROR");
    }
  }, [lockState, parsedAssignmentId, user, validAssignmentId]);

  useEffect(() => {
    if (phase !== "INTRO" || !user || user.role !== "STUDENT" || !validAssignmentId || lockState !== "OWNED" || startRequestedRef.current) return;
    startRequestedRef.current = true;

    const handoffRuntime = consumeAttemptRuntime((user.id), parsedAssignmentId);
    if (handoffRuntime) {
      setRuntime(handoffRuntime);
      setAnswers(Object.fromEntries(
        handoffRuntime.questions.map((question) => [
          question.attemptQuestionId,
          question.answerPayload ?? {},
        ]),
      ));
      setHasLocalChanges(false);
      setPhase(handoffRuntime.status === "IN_PROGRESS" ? "ACTIVE" : "COMPLETE");
      return;
    }

    // A refresh or direct paper URL has no one-time handoff; ask the backend to resume.
    void startOrResume();
  }, [lockState, parsedAssignmentId, phase, startOrResume, user, validAssignmentId]);

  useEffect(() => {
    if (!hasLocalChanges || phase !== "ACTIVE") return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasLocalChanges, phase]);

  const leavePlayer = useCallback(() => {
    if (hasLocalChanges && !window.confirm(t("draft.confirmLeave"))) return;
    router.push("/student/assignments");
  }, [hasLocalChanges, router, t]);

  const changeAnswer = useCallback((
    attemptQuestionId: number,
    answerPayload: AttemptAnswerPayload,
  ) => {
    setAnswers((current) => ({ ...current, [attemptQuestionId]: answerPayload }));
    setHasLocalChanges(true);
  }, []);

  if (!validAssignmentId) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6" role="alert">
          <h1 className="font-bold text-rose-950">{t("errors.invalidAssignment")}</h1>
          <Link href="/student/assignments" className="mt-4 inline-flex text-sm font-semibold text-primary underline">
            {t("backToAssignments")}
          </Link>
        </div>
      </main>
    );
  }

  if (isAuthLoading) {
    return <StatusPanel icon={<LoaderCircle className="h-6 w-6 animate-spin" />} title={t("states.checkingAuth")} />;
  }

  if (!user || user.role !== "STUDENT") {
    return (
      <StatusPanel
        icon={<ShieldAlert className="h-6 w-6" />}
        title={t("errors.studentOnly")}
        action={<Link href="/student"><Button variant="secondary">{t("backToDashboard")}</Button></Link>}
      />
    );
  }

  if (lockState === "CHECKING") {
    return <StatusPanel icon={<LoaderCircle className="h-6 w-6 animate-spin" />} title={t("states.checkingSession")} />;
  }

  if (lockState === "CONFLICT") {
    return (
      <StatusPanel
        icon={<LockKeyhole className="h-6 w-6" />}
        title={t("session.conflictTitle")}
        description={t("session.conflictDescription")}
        action={<Link href="/student/assignments"><Button variant="secondary">{t("backToAssignments")}</Button></Link>}
      />
    );
  }

  if (lockState === "UNSUPPORTED") {
    return (
      <StatusPanel
        icon={<ShieldAlert className="h-6 w-6" />}
        title={t("session.lockUnsupportedTitle")}
        description={t("session.lockUnsupportedDescription")}
        action={<Link href="/student/assignments"><Button variant="secondary">{t("backToAssignments")}</Button></Link>}
      />
    );
  }

  if (lockState === "ERROR") {
    return (
      <StatusPanel
        icon={<CircleAlert className="h-6 w-6" />}
        title={t("session.lockErrorTitle")}
        description={t("session.lockErrorDescription")}
        action={<Link href="/student/assignments"><Button variant="secondary">{t("backToAssignments")}</Button></Link>}
      />
    );
  }

  if (phase === "ACTIVE" && runtime) {
    const questionCount = runtime.questions.length;
    const answeredCount = runtime.questions.filter((question) => {
      const payload = answers[question.attemptQuestionId];
      return hasMeaningfulAnswer(payload);
    }).length;

    return (
      <main className="mx-auto max-w-5xl space-y-5 p-4 pb-24 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("player.eyebrow")}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-dark">{runtime.assignmentTitle}</h1>
            <p className="mt-2 text-sm text-neutral-muted">
              {t("player.progress", { answered: answeredCount, total: questionCount })}
            </p>
          </div>
          <div className="space-y-2">
            {formattedAttemptDeadline && (
              <div className="rounded-xl border border-primary/20 bg-primary-light/40 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-neutral-dark">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {t("player.attemptDeadline")}
                </div>
                <p className="mt-1 text-neutral-muted">{formattedAttemptDeadline}</p>
              </div>
            )}
          </div>
        </header>

        {hasLocalChanges && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">{t("draft.warningTitle")}</p>
              <p className="mt-1">{t("draft.warningDescription")}</p>
            </div>
          </div>
        )}

        <StudentPaper runtime={runtime} answers={answers} onAnswerChange={changeAnswer} />

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-color pt-4">
          <Button variant="ghost" onClick={leavePlayer} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("backToAssignments")}
          </Button>
          <span className="text-xs text-neutral-muted">{t("draft.sprint2Note")}</span>
        </footer>
      </main>
    );
  }

  if (phase === "COMPLETE" && runtime) {
    const timedOut = runtime.status === "TIMED_OUT";
    return (
      <StatusPanel
        icon={timedOut ? <Clock3 className="h-6 w-6" /> : <BookOpenCheck className="h-6 w-6" />}
        title={timedOut ? t("states.timedOut") : t("states.alreadySubmitted")}
        description={t("states.resultSprint4")}
        action={<Link href="/student/assignments"><Button>{t("backToAssignments")}</Button></Link>}
      />
    );
  }

  if (phase === "INTRO" || phase === "STARTING") {
    return (
      <StatusPanel
        icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
        title={t("states.starting")}
        description={t("intro.description")}
      />
    );
  }

  if (phase === "ERROR") {
    const conflict = failureCode === "ASSESSMENT_ATTEMPT_SESSION_CONFLICT";
    const lost = failureCode === "ASSESSMENT_ATTEMPT_SESSION_LOST";
    return (
      <StatusPanel
        icon={<CircleAlert className="h-6 w-6" />}
        title={conflict ? t("session.conflictTitle") : lost ? t("session.credentialLostTitle") : t("errors.startFailedTitle")}
        description={conflict ? t("session.conflictDescription") : lost ? t("session.credentialLostDescription") : t("errors.startFailedDescription")}
        action={
          conflict || lost
            ? <Link href="/student/assignments"><Button variant="secondary">{t("backToAssignments")}</Button></Link>
            : <Button onClick={() => {
                startRequestedRef.current = false;
                void startOrResume();
              }}>{t("errors.retryIntro")}</Button>
        }
      />
    );
  }

  return (
    <StatusPanel
      icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
      title={t("states.starting")}
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
  const t = useTranslations("student.assignmentAttempt");
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center p-4 sm:p-6">
      <section className="w-full space-y-4 rounded-2xl border border-border-color bg-card-bg p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">{icon}</div>
        <h1 className="text-xl font-extrabold text-neutral-dark">{title}</h1>
        {description && <p className="mx-auto max-w-xl text-sm leading-6 text-neutral-muted">{description}</p>}
        {action}
        {!action && <Link href="/student/assignments"><Button variant="secondary">{t("backToAssignments")}</Button></Link>}
      </section>
    </main>
  );
}
