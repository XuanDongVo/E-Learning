"use client";

import Link from "next/link";
import { ArrowLeft, Check, Clock3, Heart, Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { activitySessionService } from "@/services/activity-session.service";
import type { ActivitySession, ActivitySessionMode, ActivitySessionQuestion, SelectionStrategy } from "@/types/activity-session";
import { cn } from "@/lib/utils";

type Props = { activityId: number };

const primary = "inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "inline-flex min-h-11 items-center justify-center rounded-lg border border-border-color bg-card-bg px-5 py-2.5 text-body-sm font-bold text-neutral-dark transition hover:bg-background-app disabled:cursor-not-allowed disabled:opacity-50";

export function ActivitySessionRunner({ activityId }: Props) {
  const [mode, setMode] = useState<ActivitySessionMode>();
  const [strategy, setStrategy] = useState<SelectionStrategy>("RANDOM");
  const [session, setSession] = useState<ActivitySession>();
  const [feedback, setFeedback] = useState<{ correct: boolean; retryAvailable: boolean; answerRevealed: boolean; correctAnswer?: string; explanation?: string }>();
  const [hint, setHint] = useState<string>();
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());

  const options = useQuery({
    queryKey: ["activity-session-options", activityId],
    queryFn: () => activitySessionService.options(activityId),
  });
  const sessionOptions = options.data?.data;
  const effectiveMode = mode ?? (sessionOptions?.activityMode !== "BOTH" ? sessionOptions?.activityMode : undefined);
  const effectiveStrategy = sessionOptions?.selectionStrategies.includes(strategy) ? strategy : sessionOptions?.selectionStrategies[0];

  const start = useMutation({
    mutationFn: () => activitySessionService.start(activityId, effectiveMode, effectiveStrategy),
    onSuccess: (result) => { if (result.data) setSession(result.data); },
  });

  const current = useMemo(() => session?.questions.find((question) => !question.resolved), [session]);

  const answerMutation = useMutation({
    mutationFn: () => activitySessionService.answer(session!.id, current!.id, current!.type === "MULTIPLE_CHOICE" ? selected : answer),
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
    onSuccess: (result) => { if (result.data) setSession(result.data); },
  });

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  if (!session) {
    return (
      <main className="min-h-screen bg-background-app px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/student/activities" className="inline-flex min-h-10 items-center gap-2 text-body-sm font-semibold text-neutral-muted hover:text-neutral-dark">
            <ArrowLeft className="h-4 w-4" /> Activities
          </Link>

          <div className="mt-10">
            <p className="text-body-sm font-bold uppercase tracking-[0.12em] text-primary">Activity</p>
            <h1 className="mt-2 text-display font-extrabold tracking-tight text-neutral-dark">Choose how you want to practice</h1>
            <p className="mt-3 max-w-2xl text-body text-neutral-muted">
              Pick a mode, then jump straight into the questions. Practice is calm and guided; Try Hard is timed and challenging.
            </p>
          </div>

          <section className="mt-10">
            <h2 className="text-section-title font-bold text-neutral-dark">How do you want to play?</h2>
            <div className="mt-4 grid gap-3">
              {(["LEARNING", "TRY_HARD"] as ActivitySessionMode[])
                .filter((value) => sessionOptions?.activityMode === "BOTH" || sessionOptions?.activityMode === value)
                .map((value) => {
                  const active = mode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={cn("flex min-h-24 w-full items-start justify-between gap-5 rounded-xl border bg-card-bg p-5 text-left transition", active ? "border-primary bg-primary-light" : "border-border-color hover:border-primary/40")}
                    >
                      <span className="flex gap-4">
                        <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", active ? "border-primary bg-primary" : "border-input")}>
                          {active && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span>
                          <span className="block text-card-title font-bold text-neutral-dark">{value === "LEARNING" ? "Practice" : "Try Hard"}</span>
                          <span className="mt-1 block text-body-sm text-neutral-muted">{value === "LEARNING" ? "No timer · 1 retry · optional hint" : "Timer per question · lives · no retry"}</span>
                        </span>
                      </span>
                      {value === "LEARNING" ? <Sparkles className="h-5 w-5 shrink-0 text-primary" /> : <Clock3 className="h-5 w-5 shrink-0 text-neutral-muted" />}
                    </button>
                  );
                })}
            </div>
          </section>

          {(sessionOptions?.selectionStrategies?.length ?? 0) > 1 && (
            <section className="mt-9">
              <h2 className="text-section-title font-bold text-neutral-dark">Question focus</h2>
              <div className="mt-4 grid gap-3">
                {(sessionOptions?.selectionStrategies ?? []).map((value) => {
                  const active = effectiveStrategy === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStrategy(value)}
                      className={cn("flex min-h-16 items-center gap-4 rounded-xl border bg-card-bg px-5 text-left transition", active ? "border-primary bg-primary-light" : "border-border-color hover:border-primary/40")}
                    >
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", active ? "border-primary bg-primary" : "border-input")}>
                        {active && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span>
                        <span className="block text-body font-bold text-neutral-dark">{value === "RANDOM" ? "Random" : "Focus on weak areas"}</span>
                        <span className="text-body-sm text-neutral-muted">{value === "RANDOM" ? "A balanced mix of available questions." : "Prioritize questions that need more practice."}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {options.isError && <p role="alert" className="mt-5 text-body-sm text-danger-text">{options.error.message}</p>}
          {start.isError && <p role="alert" className="mt-5 text-body-sm text-danger-text">{start.error.message}</p>}

          <div className="mt-8 flex justify-end">
            <button type="button" onClick={() => start.mutate()} disabled={!effectiveMode || !effectiveStrategy || !sessionOptions || start.isPending} className={primary}>
              {start.isPending ? "Starting…" : "Start practice"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (session.status !== "IN_PROGRESS" || !current) {
    return <ResultView session={session} activityId={activityId} />;
  }

  const secondsLeft = current.deadlineAt ? Math.max(0, Math.ceil((new Date(current.deadlineAt).getTime() - now) / 1000)) : undefined;
  const canSubmit = current.type === "MULTIPLE_CHOICE" ? selected.length > 0 : answer.trim().length > 0;
  const progress = Math.round(((current.position + 1) / session.totalQuestions) * 100);

  return (
    <main className="min-h-screen bg-background-app">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 sm:px-8">
        <header className="shrink-0 border-b border-border-color py-4">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Leave this activity? Your current run will not be saved or resumed.")) finishMutation.mutate();
              }}
              className="inline-flex min-h-10 items-center gap-2 text-body-sm font-semibold text-neutral-muted hover:text-neutral-dark"
            >
              <ArrowLeft className="h-4 w-4" /> Exit {session.mode === "LEARNING" ? "Practice" : "Try Hard"}
            </button>

            <div className="flex items-center gap-5">
              {session.mode === "TRY_HARD" && (
                <div className={cn("flex items-center gap-2 text-body-sm font-extrabold", secondsLeft !== undefined && secondsLeft <= 5 ? "text-danger-text" : "text-neutral-dark")}>
                  <Clock3 className="h-4 w-4" /> {secondsLeft}s
                </div>
              )}
              {session.mode === "TRY_HARD" && (
                <div className="flex items-center gap-1.5 text-body-sm font-bold text-neutral-dark">
                  {Array.from({ length: session.lives ?? 0 }).map((_, index) => <Heart key={index} className="h-4 w-4 fill-current text-danger-text" />)}
                </div>
              )}
              <span className="text-body-sm font-bold text-neutral-muted">{current.position + 1} / {session.totalQuestions}</span>
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-border-color">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: progress + "%" }} />
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-8 sm:py-12">
          <div className="mx-auto w-full max-w-2xl">
            <p className="text-body-sm font-semibold text-neutral-muted">
              {current.type === "FILL_IN_BLANK" || current.type === "TYPE_ANSWER" ? "Type your answer" : "Choose the correct answer"}
            </p>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-neutral-dark sm:text-3xl">{current.content}</h1>

            <AnswerControl question={current} answer={answer} selected={selected} disabled={!!feedback} onAnswer={setAnswer} onSelected={setSelected} />

            {hint && (
              <div className="mt-5 flex gap-3 border-l-2 border-accent bg-accent-light px-4 py-3 text-body-sm text-neutral-dark">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                <span>{hint}</span>
              </div>
            )}

            {feedback && (
              <div role="status" className={cn("mt-6 border-l-2 px-4 py-4", feedback.correct ? "border-success bg-success-light" : "border-danger bg-danger-light")}>
                <p className="font-bold text-neutral-dark">{feedback.correct ? "Correct" : feedback.retryAvailable ? "Not quite" : "Incorrect"}</p>
                <p className="mt-1 text-body-sm text-neutral-muted">
                  {feedback.correct ? "Nice work. Keep going." : feedback.retryAvailable ? "You have one more try." : "Review the answer before continuing."}
                </p>
                {feedback.answerRevealed && (
                  <>
                    <p className="mt-3 text-body-sm text-neutral-dark"><b>Correct answer:</b> {feedback.correctAnswer}</p>
                    {feedback.explanation && <p className="mt-1 text-body-sm text-neutral-muted">{feedback.explanation}</p>}
                  </>
                )}
              </div>
            )}

            <div className="mt-7 flex min-h-12 items-center justify-between gap-4">
              <div>
                {session.mode === "LEARNING" && current.hasHint && !current.hintUsed && !feedback && (
                  <button type="button" onClick={() => hintMutation.mutate()} disabled={hintMutation.isPending} className="inline-flex min-h-10 items-center gap-2 text-body-sm font-bold text-neutral-muted hover:text-neutral-dark disabled:opacity-50">
                    <Lightbulb className="h-4 w-4" /> {hintMutation.isPending ? "Showing hint…" : "Hint"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {feedback && !feedback.retryAvailable ? (
                  <button type="button" onClick={() => { setFeedback(undefined); setHint(undefined); }} className={primary}>Continue</button>
                ) : (
                  <button type="button" onClick={() => answerMutation.mutate()} disabled={!canSubmit || answerMutation.isPending} className={primary}>
                    {answerMutation.isPending ? "Checking…" : feedback?.retryAvailable ? "Try again" : "Check answer"}
                  </button>
                )}
              </div>
            </div>

            {answerMutation.isError && <p role="alert" className="mt-3 text-body-sm text-danger-text">{answerMutation.error.message}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function AnswerControl({ question, answer, selected, disabled, onAnswer, onSelected }: {
  question: ActivitySessionQuestion;
  answer: string;
  selected: string[];
  disabled: boolean;
  onAnswer: (value: string) => void;
  onSelected: (value: string[]) => void;
}) {
  if (question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") {
    return (
      <div className="mt-7 grid gap-3">
        {question.options.map((option) => {
          const checked = selected.includes(option.key);
          return (
            <label key={option.key} className={cn("flex min-h-16 items-center gap-4 rounded-xl border bg-card-bg px-5 py-4 transition", checked ? "border-primary bg-primary-light" : "border-border-color hover:border-primary/40", disabled ? "cursor-default opacity-90" : "cursor-pointer")}>
              <input type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name="answer" disabled={disabled} checked={checked} onChange={() => onSelected(question.type === "MULTIPLE_CHOICE" ? checked ? selected.filter((key) => key !== option.key) : [...selected, option.key] : [option.key])} className="sr-only" />
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-body-sm font-extrabold", checked ? "border-primary bg-primary text-primary-foreground" : "border-border-color text-neutral-muted")}>
                {checked ? <Check className="h-4 w-4" /> : option.key}
              </span>
              <span className="text-body font-semibold text-neutral-dark">{option.content}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {["TRUE", "FALSE"].map((value) => {
          const active = answer === value;
          return <button key={value} type="button" disabled={disabled} onClick={() => onAnswer(value)} className={cn("min-h-16 rounded-xl border bg-card-bg text-body font-extrabold transition", active ? "border-primary bg-primary-light text-primary" : "border-border-color hover:border-primary/40")}>{value === "TRUE" ? "True" : "False"}</button>;
        })}
      </div>
    );
  }

  return <input value={answer} disabled={disabled} onChange={(event) => onAnswer(event.target.value)} className="mt-7 h-14 w-full rounded-xl border border-border-color bg-card-bg px-4 text-body font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-background-app" placeholder="Type your answer" />;
}

function ResultView({ session, activityId }: { session: ActivitySession; activityId: number }) {
  const isGameOver = session.status === "GAME_OVER";
  const isAbandoned = session.status === "ABANDONED";

  return (
    <main className="min-h-screen bg-background-app px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col justify-center">
        <Link href="/student/activities" className="inline-flex min-h-10 w-fit items-center gap-2 text-body-sm font-semibold text-neutral-muted hover:text-neutral-dark">
          <ArrowLeft className="h-4 w-4" /> Activities
        </Link>
        <div className="mt-8">
          <p className="text-body-sm font-bold uppercase tracking-[0.12em] text-primary">{session.mode === "LEARNING" ? "Practice complete" : "Try Hard ended"}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
            {isGameOver ? "You used all your lives." : isAbandoned ? "This run was left." : "Great work."}
          </h1>
          <div className="mt-10">
            <p className="text-6xl font-extrabold tracking-tight text-neutral-dark">{session.score ?? 0}%</p>
            <p className="mt-2 text-body text-neutral-muted">{session.finalCorrectCount} / {session.totalQuestions} final correct</p>
          </div>
          <div className="mt-8 grid grid-cols-2 border-y border-border-color py-5">
            <div><p className="text-body-sm text-neutral-muted">First try</p><p className="mt-1 text-ui-2xl font-extrabold text-neutral-dark">{session.firstCorrectCount}</p></div>
            <div><p className="text-body-sm text-neutral-muted">Final</p><p className="mt-1 text-ui-2xl font-extrabold text-neutral-dark">{session.finalCorrectCount}</p></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={"/student/activities/" + activityId} className={primary}>Practice again</Link>
            <Link href="/student/activities" className={secondary}>Back to activities</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
