"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import type { KnowledgeDocument, KnowledgeNoteContent } from "@/types/knowledge-note";

export type KnowledgeAutoSaveStatus = "clean" | "unsaved" | "saving" | "saved" | "error";
const EMPTY: KnowledgeDocument = { type: "doc", content: [] };

/** Serialize writes per editor, debounce 2s, and avoid duplicate snapshots. */
export function useKnowledgeNoteAutosave(noteId: number, editable: boolean) {
  const [status, setStatus] = useState<KnowledgeAutoSaveStatus>("clean");
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [changeToken, setChangeToken] = useState(0);
  const latest = useRef<KnowledgeDocument>(EMPTY);
  const lastSent = useRef("");
  const sequence = useRef(0);
  const committed = useRef(0);
  const hydrated = useRef(false);
  const inFlight = useRef(false);
  const activeNoteId = useRef(noteId);
  const writable = useRef(editable);
  useEffect(() => {
    activeNoteId.current = noteId;
    writable.current = editable;
  }, [noteId, editable]);

  const reset = useCallback((content: KnowledgeNoteContent) => {
    latest.current = content.document;
    lastSent.current = JSON.stringify(content.document);
    sequence.current = 0;
    committed.current = 0;
    hydrated.current = true;
    setReady(true);
    setDirty(false);
    setStatus("clean");
    setChangeToken(0);
    setLastSavedAt(content.updatedAt);
  }, []);

  const updateDocument = useCallback((document: KnowledgeDocument) => {
    if (!hydrated.current || !writable.current) return;
    if (JSON.stringify(document) === JSON.stringify(latest.current)) return;
    latest.current = document;
    sequence.current += 1;
    const differs = JSON.stringify(document) !== lastSent.current;
    setDirty(differs);
    setChangeToken(sequence.current);
    setStatus(differs ? "unsaved" : "saved");
  }, []);

  const saveNow = useCallback(async () => {
    if (!hydrated.current || !writable.current || inFlight.current
        || committed.current >= sequence.current) return;
    inFlight.current = true;
    const targetId = noteId;
    try {
      while (committed.current < sequence.current && writable.current) {
        const current = sequence.current;
        const snapshot = latest.current;
        const serialized = JSON.stringify(snapshot);
        if (serialized === lastSent.current) {
          committed.current = current;
          continue;
        }
        setStatus("saving");
        const result = await teacherKnowledgeNoteService.saveContent(targetId, {
          document: snapshot,
        });
        if (activeNoteId.current !== targetId) return;
        if (!result.data) throw new Error("Server không xác nhận đã lưu bài học.");
        committed.current = current;
        lastSent.current = serialized;
        setLastSavedAt(result.data.updatedAt);
      }
      if (activeNoteId.current !== targetId) return;
      const differs = JSON.stringify(latest.current) !== lastSent.current;
      setDirty(differs);
      setStatus(differs ? "unsaved" : "saved");
    } catch (cause) {
      if (activeNoteId.current !== targetId) return;
      setDirty(true);
      setStatus("error");
      throw cause;
    } finally {
      inFlight.current = false;
    }
  }, [noteId]);

  useEffect(() => {
    if (!ready || !editable || !dirty || changeToken === 0) return;
    const timer = window.setTimeout(() => { void saveNow().catch(() => {}); }, 2000);
    return () => window.clearTimeout(timer);
  }, [changeToken, ready, editable, dirty, saveNow]);

  return { status, dirty, ready, lastSavedAt, reset, updateDocument, saveNow };
}
