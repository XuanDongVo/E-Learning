"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleAlert,
  Clock3,
  LoaderCircle,
  ShieldAlert,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { useAttemptRuntime, createInitialAttemptAnswers } from "./hooks/use-attempt-runtime";
import { StudentPaper } from "./student-paper";
import { useAttemptFullscreen } from "./hooks/use-attempt-fullscreen";
import type { AttemptAnswerPayload } from "@/types/student/assignment-attempt";

function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasMeaningfulAnswer);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasMeaningfulAnswer);
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
  const runtimeState = useAttemptRuntime(
    user?.id ?? null,
    parsedAssignmentId,
    user?.role === "STUDENT" && validAssignmentId,
  );
  const [answers, setAnswers] = useState<Record<number, AttemptAnswerPayload>>({});
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const { isFullscreen, isSupported, enterFullscreen } = useAttemptFullscreen();

  const runtime = runtimeState.runtime;

  useEffect(() => {
    if (!runtime) return;
    setAnswers(createInitialAttemptAnswers(runtime));
    setHasLocalChanges(false);
  }, [runtime]);

  const formattedAttemptDeadline = useMemo(() => {
    if (!runtime?.deadlineAt) return null;
    const deadline = new Date(runtime.deadlineAt);
    if (Number.isNaN(deadline.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(deadline);
  }, [locale, runtime?.deadlineAt]);

  useEffect(() => {
    if (!hasLocalChanges || runtimeState.status !== "ACTIVE") return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasLocalChanges, runtimeState.status]);

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

  if (runtimeState.status === "LOADING") {
    return <StatusPanel icon={<LoaderCircle className="h-6 w-6 animate-spin" />} title={t("states.starting")} description={t("intro.description")} />;
  }

  if (runtimeState.status === "ERROR") {
    const conflict = runtimeState.errorCode === "ASSESSMENT_ATTEMPT_SESSION_CONFLICT";
    const lost = runtimeState.errorCode === "ASSESSMENT_ATTEMPT_SESSION_LOST";
    return (
      <StatusPanel
        icon={<CircleAlert className="h-6 w-6" />}
        title={conflict ? t("session.conflictTitle") : lost ? t("session.credentialLostTitle") : t("errors.startFailedTitle")}
        description={conflict ? t("session.conflictDescription") : lost ? t("session.credentialLostDescription") : t("errors.startFailedDescription")}
        action={
          conflict || lost
            ? <Link href="/student/assignments"><Button variant="secondary">{t("backToAssignments")}</Button></Link>
            : <Button onClick={runtimeState.retry}>{t("errors.retryIntro")}</Button>
        }
      />
    );
  }

  if (runtimeState.status === "ACTIVE" && runtime) {
    const questionCount = runtime.questions.length;
    const answeredCount = runtime.questions.filter((question) => {
      const payload = answers[question.attemptQuestionId];
      return hasMeaningfulAnswer(payload);
    }).length;

    return (
      <main className="fixed inset-0 z-40 flex h-dvh flex-col overflow-hidden bg-background-app">
        {!isFullscreen && (
          <div role="status" className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <span>{isSupported ? t("player.fullscreenPrompt") : t("player.fullscreenUnavailable")}</span>
            {isSupported && <Button size="sm" onClick={() => void enterFullscreen()} className="gap-2"><Maximize className="h-4 w-4" />{t("player.enterFullscreen")}</Button>}
          </div>
        )}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border-color bg-card-bg px-4 py-3 sm:px-6">
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

        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
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

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-color pt-4 pb-6">
          <Button variant="ghost" onClick={leavePlayer} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("backToAssignments")}
          </Button>
          <span className="text-xs text-neutral-muted">{t("draft.sprint2Note")}</span>
        </footer>
        </section>
      </main>
    );
  }

  if (runtimeState.status === "COMPLETE" && runtime) {
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

  return <StatusPanel icon={<LoaderCircle className="h-6 w-6 animate-spin" />} title={t("states.starting")} />;
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
