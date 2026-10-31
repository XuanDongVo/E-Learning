"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toAppError } from "@/lib/errors/app-error";

export interface SaveAttemptAnswerRequestBody {
  activeSessionId: string;
  requestId: string;
  expectedRevision: number;
  answerPayload: Record<string, unknown>;
}

export interface SaveAttemptAnswerResponseBody {
  requestId: string;
  attemptQuestionId: number;
  revision: number;
  savedAt: string;
  serverNow: string;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface UseAttemptAutosaveOptions {
  attemptId: number;
  activeSessionId: string | null;
  enabled?: boolean;
  initialAnswers?: Record<number, Record<string, unknown>>;
  initialRevisions?: Record<number, number>;
  saveApi: (
    attemptId: number,
    attemptQuestionId: number,
    body: SaveAttemptAnswerRequestBody,
  ) => Promise<SaveAttemptAnswerResponseBody>;
  debounceMs?: number;
  onError?: (questionId: number, error: unknown) => void;
  /** Fatal session errors — stop all queues; do not re-issue session UUID. */
  onSessionInvalid?: (code: string) => void;
}

interface QuestionQueueState {
  isSending: boolean;
  latestPayload: Record<string, unknown> | null;
  currentRevision: number;
  lastSavedPayloadJson: string;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  hasError: boolean;
}

function payloadJson(payload: Record<string, unknown> | null): string {
  return payload ? JSON.stringify(payload) : "";
}

function isDirty(q: QuestionQueueState): boolean {
  if (!q.latestPayload) return false;
  return payloadJson(q.latestPayload) !== q.lastSavedPayloadJson;
}

/**
 * Per-question autosave queue aligned with AssessmentAttemptQuestion.revision.
 * Sequential per question; parallel across questions. No session re-issue.
 */
export function useAttemptAutosave({
  attemptId,
  activeSessionId,
  enabled = true,
  initialAnswers = {},
  initialRevisions = {},
  saveApi,
  debounceMs = 800,
  onError,
  onSessionInvalid,
}: UseAttemptAutosaveOptions) {
  const [answers, setAnswers] = useState<Record<number, Record<string, unknown>>>(initialAnswers);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, SaveStatus>>({});
  const [fatalSessionCode, setFatalSessionCode] = useState<string | null>(null);

  const queuesRef = useRef<Map<number, QuestionQueueState>>(new Map());
  const stoppedRef = useRef(false);
  const attemptIdRef = useRef(attemptId);
  const sessionRef = useRef(activeSessionId);
  const saveApiRef = useRef(saveApi);
  const onErrorRef = useRef(onError);
  const onSessionInvalidRef = useRef(onSessionInvalid);

  attemptIdRef.current = attemptId;
  sessionRef.current = activeSessionId;
  saveApiRef.current = saveApi;
  onErrorRef.current = onError;
  onSessionInvalidRef.current = onSessionInvalid;

  // Reset queues when attempt changes
  useEffect(() => {
    for (const q of queuesRef.current.values()) {
      if (q.debounceTimer) clearTimeout(q.debounceTimer);
    }
    queuesRef.current = new Map();
    stoppedRef.current = false;
    setFatalSessionCode(null);
    setAnswers(initialAnswers);
    setQuestionStatuses({});
    setSaveStatus("saved");

    for (const [rawId, payload] of Object.entries(initialAnswers)) {
      const questionId = Number(rawId);
      if (!Number.isFinite(questionId)) continue;
      queuesRef.current.set(questionId, {
        isSending: false,
        latestPayload: payload,
        currentRevision: initialRevisions[questionId] ?? 0,
        lastSavedPayloadJson: payloadJson(payload),
        debounceTimer: null,
        hasError: false,
      });
    }
  }, [attemptId]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only on attempt change

  const updateGlobalStatus = useCallback(() => {
    let hasSaving = false;
    let hasUnsaved = false;
    let hasError = false;

    for (const q of queuesRef.current.values()) {
      if (q.isSending) hasSaving = true;
      if (q.debounceTimer !== null || isDirty(q)) hasUnsaved = true;
      if (q.hasError) hasError = true;
    }

    if (hasSaving) setSaveStatus("saving");
    else if (hasError) setSaveStatus("error");
    else if (hasUnsaved) setSaveStatus("unsaved");
    else setSaveStatus("saved");
  }, []);

  const getOrCreateQueue = useCallback((questionId: number): QuestionQueueState => {
    let q = queuesRef.current.get(questionId);
    if (!q) {
      q = {
        isSending: false,
        latestPayload: null,
        currentRevision: initialRevisions[questionId] ?? 0,
        lastSavedPayloadJson: "",
        debounceTimer: null,
        hasError: false,
      };
      queuesRef.current.set(questionId, q);
    }
    return q;
  }, [initialRevisions]);

  const processQueue = useCallback(async (questionId: number) => {
    if (stoppedRef.current || !enabled) return;

    const sessionId = sessionRef.current;
    if (!sessionId) return;

    const q = queuesRef.current.get(questionId);
    if (!q || q.isSending) return;

    if (!isDirty(q) || !q.latestPayload) {
      setQuestionStatuses((prev) => ({ ...prev, [questionId]: q.hasError ? "error" : "saved" }));
      updateGlobalStatus();
      return;
    }

    q.isSending = true;
    q.hasError = false;
    setQuestionStatuses((prev) => ({ ...prev, [questionId]: "saving" }));
    updateGlobalStatus();

    const payloadToSend = q.latestPayload;
    const jsonToSend = payloadJson(payloadToSend);
    const expectedRevision = q.currentRevision;
    const requestId = crypto.randomUUID();

    try {
      const response = await saveApiRef.current(attemptIdRef.current, questionId, {
        activeSessionId: sessionId,
        requestId,
        expectedRevision,
        answerPayload: payloadToSend,
      });

      q.currentRevision = response.revision;
      q.lastSavedPayloadJson = jsonToSend;
      q.isSending = false;
      q.hasError = false;
      setQuestionStatuses((prev) => ({ ...prev, [questionId]: "saved" }));

      if (isDirty(q)) {
        void processQueue(questionId);
      }
    } catch (err) {
      q.isSending = false;
      const code = toAppError(err).code;

      if (
        code === "ASSESSMENT_ATTEMPT_SESSION_LOST" ||
        code === "ASSESSMENT_ATTEMPT_SESSION_CONFLICT"
      ) {
        stoppedRef.current = true;
        setFatalSessionCode(code);
        onSessionInvalidRef.current?.(code);
        for (const item of queuesRef.current.values()) {
          if (item.debounceTimer) {
            clearTimeout(item.debounceTimer);
            item.debounceTimer = null;
          }
        }
      }

      q.hasError = true;
      setQuestionStatuses((prev) => ({ ...prev, [questionId]: "error" }));
      onErrorRef.current?.(questionId, err);
    } finally {
      updateGlobalStatus();
    }
  }, [enabled, updateGlobalStatus]);

  const setAnswer = useCallback(
    (
      questionId: number,
      payload: Record<string, unknown>,
      options?: { immediate?: boolean },
    ) => {
      if (stoppedRef.current || !enabled) {
        setAnswers((prev) => ({ ...prev, [questionId]: payload }));
        return;
      }

      setAnswers((prev) => ({ ...prev, [questionId]: payload }));

      const q = getOrCreateQueue(questionId);
      q.latestPayload = payload;
      q.hasError = false;

      if (q.debounceTimer) {
        clearTimeout(q.debounceTimer);
        q.debounceTimer = null;
      }

      if (options?.immediate) {
        void processQueue(questionId);
      } else {
        setQuestionStatuses((prev) => ({ ...prev, [questionId]: "unsaved" }));
        updateGlobalStatus();
        q.debounceTimer = setTimeout(() => {
          q.debounceTimer = null;
          void processQueue(questionId);
        }, debounceMs);
      }
    },
    [enabled, getOrCreateQueue, processQueue, debounceMs, updateGlobalStatus],
  );

  const flushQuestion = useCallback(
    (questionId: number) => {
      const q = queuesRef.current.get(questionId);
      if (!q) return;
      if (q.debounceTimer) {
        clearTimeout(q.debounceTimer);
        q.debounceTimer = null;
      }
      void processQueue(questionId);
    },
    [processQueue],
  );

  /**
   * Force all pending saves. Used later by submit; safe to call anytime.
   * Returns true only when every queue is idle and clean.
   */
  const flushAllPending = useCallback(async (timeoutMs = 8000): Promise<boolean> => {
    if (stoppedRef.current) return false;

    for (const [qId, q] of queuesRef.current.entries()) {
      if (q.debounceTimer) {
        clearTimeout(q.debounceTimer);
        q.debounceTimer = null;
      }
      if (isDirty(q)) {
        void processQueue(qId);
      }
    }

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      let busy = false;
      let dirty = false;
      let errored = false;

      for (const q of queuesRef.current.values()) {
        if (q.isSending || q.debounceTimer) busy = true;
        if (isDirty(q)) dirty = true;
        if (q.hasError) errored = true;
      }

      if (!busy && !dirty) return !errored;
      await new Promise((r) => setTimeout(r, 100));
    }

    return false;
  }, [processQueue]);

  return {
    answers,
    setAnswer,
    flushQuestion,
    flushAllPending,
    saveStatus,
    questionStatuses,
    fatalSessionCode,
  };
}
