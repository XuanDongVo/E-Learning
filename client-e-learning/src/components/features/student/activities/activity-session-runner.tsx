"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { activitySessionService } from "@/services/activity-session.service";
import type {
  ActivitySession,
  ActivitySessionMode,
  ActivitySessionQuestion,
  SelectionStrategy,
} from "@/types/activity-session";

type Props = {
  activityId: number;
};

const card =
  "rounded-2xl border border-border-color bg-card-bg p-5 shadow-sm";
const primary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondary =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border-color bg-card-bg px-4 py-2 text-body-sm font-bold transition hover:bg-background-app disabled:cursor-not-allowed disabled:opacity-50";

export function ActivitySessionRunner({ activityId }: Props) {
  const [mode, setMode] = useState<ActivitySessionMode>();
  const [strategy, setStrategy] = useState<SelectionStrategy>("RANDOM");
  const [session, setSession] = useState<ActivitySession>();
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    retryAvailable: boolean;
    answerRevealed: boolean;
    correctAnswer?: string;
    explanation?: string;
  }>();
  const [hint, setHint] = useState<string>();
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const options = useQuery({
    queryKey: ["activity-session-options", activityId],
    queryFn: () => activitySessionService.options(activityId),
  });
  const sessionOptions = options.data?.data;

  const effectiveMode =
    mode ??
    (sessionOptions?.activityMode !== "BOTH"
      ? sessionOptions?.activityMode
      : undefined);
  const effectiveStrategy =
    sessionOptions?.selectionStrategies.includes(strategy)
      ? strategy
      : sessionOptions?.selectionStrategies[0];

  const start = useMutation({
    mutationFn: () =>
      activitySessionService.start(activityId, effectiveMode, effectiveStrategy),
    onSuccess: (result) => {
      if (result.data) setSession(result.data);
    },
  });
  const current = useMemo(
    () => session?.questions.find((question) => !question.resolved),
    [session],
  );
  const answerMutation = useMutation({
    mutationFn: () =>
      activitySessionService.answer(
        session!.id,
        current!.id,
        current!.type === "MULTIPLE_CHOICE" ? selected : answer,
      ),
    onSuccess: (result) => {
      if (!result.data) return;
      setSession(result.data.session);
      setFeedback(result.data);
      setAnswer("");
      setSelected([]);
      setHint(undefined);
    },
  });
  const hintMutation = useMutation({
    mutationFn: () => activitySessionService.hint(session!.id, current!.id),
    onSuccess: (result) => {
      if (result.data) {
        setHint(result.data.hint);
        setSession(result.data.session);
      }
    },
  });
  const finishMutation = useMutation({
    mutationFn: () => activitySessionService.finish(session!.id),
    onSuccess: (result) => {
      if (result.data) setSession(result.data);
    },
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!session) {
    return (
      <section className="mx-auto max-w-3xl space-y-5">
        <header className={card}>
          <p className="text-body-sm font-bold text-primary">Activity practice</p>
          <h1 className="mt-1 text-page-title font-extrabold">Choose how you want to play</h1>
          <p className="mt-2 text-body text-neutral-muted">
            Practice has immediate feedback, one retry and optional hints. Try Hard has a timer per question, lives, no retry and no hint.
          </p>
        </header>
        <section className={card}>
          <fieldset>
            <legend className="text-card-title font-bold">Mode</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["LEARNING", "TRY_HARD"] as ActivitySessionMode[])
                .filter((value) => sessionOptions?.activityMode === "BOTH" || sessionOptions?.activityMode === value)
                .map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-xl border p-4 text-left ${mode === value ? "border-primary bg-primary-light" : "border-border-color"}`}
                >
                  <span className="block font-bold">{value === "LEARNING" ? "Practice" : "Try Hard"}</span>
                  <span className="mt-1 block text-body-sm text-neutral-muted">
                    {value === "LEARNING" ? "No timer · 1 retry · optional hint" : "Seconds per question · lives · no retry"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-5 block text-body-sm font-bold">
            Question strategy
            <select value={effectiveStrategy} onChange={(event) => setStrategy(event.target.value as SelectionStrategy)} className="mt-2 h-10 w-full rounded-lg border border-border-color bg-card-bg px-3">
              {(sessionOptions?.selectionStrategies ?? []).map((value) => (
                <option key={value} value={value}>{value === "RANDOM" ? "Random" : "Weakness priority"}</option>
              ))}
            </select>
          </label>
          {options.isError && <p role="alert" className="mt-4 text-body-sm text-danger-text">{options.error.message}</p>}
          {start.isError && <p role="alert" className="mt-4 text-body-sm text-danger-text">{start.error.message}</p>}
          <button type="button" onClick={() => start.mutate()} disabled={!effectiveMode || !effectiveStrategy || !sessionOptions || start.isPending} className={`${primary} mt-5 w-full`}>
            {start.isPending ? "Starting…" : "Start activity"}
          </button>
        </section>
      </section>
    );
  }

  if (session.status !== "IN_PROGRESS" || !current) {
    return <ResultView session={session} activityId={activityId} />;
  }

  const secondsLeft = current.deadlineAt
    ? Math.max(0, Math.ceil((new Date(current.deadlineAt).getTime() - now) / 1000))
    : undefined;
  const canSubmit =
    current.type === "MULTIPLE_CHOICE" ? selected.length > 0 : answer.trim().length > 0;

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-body-sm font-bold text-primary">{session.mode === "LEARNING" ? "Practice" : "Try Hard"}</p>
            <h1 className="mt-1 text-card-title font-extrabold">Question {current.position + 1} of {session.totalQuestions}</h1>
          </div>
          <div className="text-right text-body-sm font-bold">
            {session.mode === "TRY_HARD" && <p className={secondsLeft !== undefined && secondsLeft <= 5 ? "text-danger-text" : "text-primary"}>{secondsLeft}s</p>}
            {session.mode === "TRY_HARD" && <p className="text-neutral-muted">Lives: {session.lives}</p>}
          </div>
        </div>
      </header>
      <section className={card}>
        <h2 className="text-section-title font-bold">{current.content}</h2>
        <AnswerControl question={current} answer={answer} selected={selected} onAnswer={setAnswer} onSelected={setSelected} />
        {hint && <p className="mt-4 rounded-lg bg-accent-light p-3 text-body-sm">{hint}</p>}
        {feedback && (
          <div role="status" className={`mt-5 rounded-xl p-4 ${feedback.correct ? "bg-success-light" : "bg-danger-light"}`}>
            <p className="font-bold">{feedback.correct ? "Correct!" : feedback.retryAvailable ? "Not quite. Try once more." : "Incorrect."}</p>
            {feedback.answerRevealed && <><p className="mt-2 text-body-sm">Correct answer: {feedback.correctAnswer}</p><p className="mt-1 text-body-sm">{feedback.explanation}</p></>}
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          {session.mode === "LEARNING" && !current.hintUsed && !feedback && (
            <button type="button" onClick={() => hintMutation.mutate()} disabled={hintMutation.isPending} className={secondary}>Show hint</button>
          )}
          <button type="button" onClick={() => answerMutation.mutate()} disabled={!canSubmit || answerMutation.isPending || !!feedback && !feedback.retryAvailable} className={primary}>
            {answerMutation.isPending ? "Checking…" : feedback?.retryAvailable ? "Try again" : "Submit answer"}
          </button>
          {feedback && !feedback.retryAvailable && (
            <button type="button" onClick={() => { setFeedback(undefined); setHint(undefined); }} className={secondary}>Continue</button>
          )}
          <button type="button" onClick={() => finishMutation.mutate()} disabled={finishMutation.isPending} className={`${secondary} ml-auto`}>Leave</button>
        </div>
        {answerMutation.isError && <p role="alert" className="mt-3 text-body-sm text-danger-text">{answerMutation.error.message}</p>}
      </section>
    </section>
  );
}

function AnswerControl({ question, answer, selected, onAnswer, onSelected }: {
  question: ActivitySessionQuestion;
  answer: string;
  selected: string[];
  onAnswer: (value: string) => void;
  onSelected: (value: string[]) => void;
}) {
  if (question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") {
    return <div className="mt-5 grid gap-3">{question.options.map((option) => {
      const checked = selected.includes(option.key);
      return <label key={option.key} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${checked ? "border-primary bg-primary-light" : "border-border-color"}`}>
        <input type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name="answer" checked={checked} onChange={() => onSelected(question.type === "MULTIPLE_CHOICE" ? checked ? selected.filter((key) => key !== option.key) : [...selected, option.key] : [option.key])} />
        <span><b>{option.key}.</b> {option.content}</span>
      </label>;
    })}</div>;
  }
  if (question.type === "TRUE_FALSE") return <div className="mt-5 grid grid-cols-2 gap-3">{["TRUE", "FALSE"].map((value) => <button key={value} type="button" onClick={() => onAnswer(value)} className={`rounded-lg border p-4 font-bold ${answer === value ? "border-primary bg-primary-light" : "border-border-color"}`}>{value}</button>)}</div>;
  return <input value={answer} onChange={(event) => onAnswer(event.target.value)} className="mt-5 h-11 w-full rounded-lg border border-border-color px-3" placeholder="Type your answer" />;
}

function ResultView({ session, activityId }: { session: ActivitySession; activityId: number }) {
  return <section className="mx-auto max-w-3xl space-y-5"><div className={card}><p className="text-body-sm font-bold text-primary">Activity result</p><h1 className="mt-1 text-page-title font-extrabold">{session.status === "GAME_OVER" ? "Game over" : session.status === "ABANDONED" ? "Run left" : "Well done!"}</h1><p className="mt-3 text-body">Score: <b>{session.score ?? 0}%</b></p><p className="mt-1 text-body-sm text-neutral-muted">Final correct: {session.finalCorrectCount} / {session.totalQuestions} · First correct: {session.firstCorrectCount}</p><div className="mt-5 flex gap-3"><Link href={`/student/activities/${activityId}`} className={primary}>Practice again</Link><Link href="/student" className={secondary}>Back to dashboard</Link></div></div></section>;
}
