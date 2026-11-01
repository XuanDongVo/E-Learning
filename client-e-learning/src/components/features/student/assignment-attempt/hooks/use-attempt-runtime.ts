"use client";

import { useCallback, useEffect, useState } from "react";
import { toAppError } from "@/lib/errors/app-error";
import { getOrCreateAttemptSessionCredential } from "@/services/student/assessment-attempt-session-store";
import {
  consumeAttemptRuntime,
} from "@/services/student/assessment-attempt-runtime-store";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import type {
  AttemptAnswerPayload,
  AttemptRuntimeResponse,
} from "@/types/student/assignment-attempt";

type AttemptRuntimeState =
  | { status: "LOADING"; runtime: null; errorCode: null }
  | { status: "ACTIVE"; runtime: AttemptRuntimeResponse; errorCode: null }
  | { status: "COMPLETE"; runtime: AttemptRuntimeResponse; errorCode: null }
  | { status: "ERROR"; runtime: null; errorCode: string };

function stateFromRuntime(runtime: AttemptRuntimeResponse): AttemptRuntimeState {
  return runtime.status === "IN_PROGRESS"
    ? { status: "ACTIVE", runtime, errorCode: null }
    : { status: "COMPLETE", runtime, errorCode: null };
}

export function useAttemptRuntime(
  studentId: number | null,
  assignmentId: number,
  enabled: boolean,
) {
  const [state, setState] = useState<AttemptRuntimeState>({
    status: "LOADING",
    runtime: null,
    errorCode: null,
  });

  const recover = useCallback(async () => {
    if (!enabled || studentId === null) return;

    setState({ status: "LOADING", runtime: null, errorCode: null });

    try {
      const handoff = consumeAttemptRuntime(studentId, assignmentId);
      if (handoff) {
        setState(stateFromRuntime(handoff));
        return;
      }

      const activeSessionId = await getOrCreateAttemptSessionCredential(
        studentId,
        assignmentId,
      );
      const response = await studentAssignmentAttemptService.startOrResume(
        assignmentId,
        { activeSessionId },
      );

      if (!response.data) {
        throw new Error("ASSESSMENT_ATTEMPT_EMPTY_RESPONSE");
      }

      setState(stateFromRuntime(response.data));
    } catch (error) {
      setState({
        status: "ERROR",
        runtime: null,
        errorCode: toAppError(error).code,
      });
    }
  }, [assignmentId, enabled, studentId]);

  useEffect(() => {
    void recover();
  }, [recover]);

  const retry = useCallback(() => {
    void recover();
  }, [recover]);

  return {
    ...state,
    retry,
  };
}

export function createInitialAttemptAnswers(
  runtime: AttemptRuntimeResponse,
): Record<number, AttemptAnswerPayload> {
  return Object.fromEntries(
    runtime.questions.map((question) => [
      question.attemptQuestionId,
      question.answerPayload ?? {},
    ]),
  );
}
