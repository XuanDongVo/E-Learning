import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { activitySessionService } from "@/services/student/student-activity-session.service";
import type {
  ActivitySession,
  ActivitySessionQuestion,
} from "@/types/student/activity-session";

type TimeoutRequest = { sessionId: number; questionId: number };

export function usePracticeTimeoutEffects({
  answering,
  complete,
  lastPollAtRef,
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
  timeoutError,
  timeoutPending,
  tryHard,
}: {
  answering: boolean;
  complete: boolean;
  lastPollAtRef: { current: number };
  locked: boolean;
  now: number;
  over: boolean;
  question?: ActivitySessionQuestion;
  secondsLeft?: number;
  sendTimeout: (request: TimeoutRequest) => void;
  session?: ActivitySession;
  setNow: Dispatch<SetStateAction<number>>;
  setSession: Dispatch<SetStateAction<ActivitySession | undefined>>;
  syncServerClock: (session: ActivitySession) => void;
  timeoutError: boolean;
  timeoutPending: boolean;
  tryHard?: boolean;
}) {
  const requestedDeadline = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!tryHard || over || complete) return;
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [complete, over, setNow, tryHard]);

  useEffect(() => {
    if (
      !session ||
      !question ||
      !tryHard ||
      over ||
      locked ||
      secondsLeft === undefined ||
      secondsLeft > 0 ||
      timeoutPending ||
      timeoutError ||
      answering
    ) {
      return;
    }
    const currentTime = Date.now();
    if (currentTime - lastPollAtRef.current < 900) return;
    lastPollAtRef.current = currentTime;
    sendTimeout({ sessionId: session.id, questionId: question.id });
  }, [
    answering,
    lastPollAtRef,
    locked,
    now,
    over,
    question,
    secondsLeft,
    sendTimeout,
    session,
    timeoutError,
    timeoutPending,
    tryHard,
  ]);

  useEffect(() => {
    const sessionId = session?.id;
    const questionId = question?.id;
    const needsDeadline =
      tryHard &&
      !over &&
      !!question &&
      !question.resolved &&
      !question.deadlineAt;
    if (!needsDeadline || !sessionId || questionId === undefined) return;
    if (requestedDeadline.current.has(questionId)) return;
    requestedDeadline.current.add(questionId);
    activitySessionService
      .get(sessionId)
      .then((result) => {
        if (result.data) syncServerClock(result.data);
        const fresh = result.data?.questions.find(
          (candidate) => candidate.id === questionId,
        );
        if (!fresh?.deadlineAt) return;
        setSession(
          (current) =>
            current && {
              ...current,
              questions: current.questions.map((candidate) =>
                candidate.id === questionId
                  ? { ...candidate, deadlineAt: fresh.deadlineAt }
                  : candidate,
              ),
            },
        );
      })
      .catch(() => requestedDeadline.current.delete(questionId));
  }, [over, question, session, setSession, syncServerClock, tryHard]);

  return () => {
    if (!session || !question || timeoutPending) return;
    lastPollAtRef.current = Date.now();
    sendTimeout({ sessionId: session.id, questionId: question.id });
  };
}
