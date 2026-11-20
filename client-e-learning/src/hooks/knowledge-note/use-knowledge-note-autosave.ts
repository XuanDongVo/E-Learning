"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import type { KnowledgeDocument, KnowledgeNoteContent } from "@/types/knowledge-note";

type Snapshot = { document: KnowledgeDocument; summary: KnowledgeDocument };
export type KnowledgeAutoSaveStatus = "clean" | "unsaved" | "saving" | "saved" | "error";
const EMPTY: KnowledgeDocument = { type: "doc", content: [] };

/** Serialized PUT queue: an older request can never complete after a newer one. */
export function useKnowledgeNoteAutosave(noteId: number, editable: boolean) {
  const [status, setStatus] = useState<KnowledgeAutoSaveStatus>("clean");
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [changeToken, setChangeToken] = useState(0);
  const latest = useRef<Snapshot>({ document: EMPTY, summary: EMPTY });
  const sequence = useRef(0);
  const committed = useRef(0);
  const hydrated = useRef(false);
  const inFlight = useRef(false);
  const activeNoteId = useRef(noteId);
  const writable = useRef(editable);
  // Sync the mutable guards after render to respect React's ref rules.
  useEffect(() => {
    activeNoteId.current = noteId;
    writable.current = editable;
  }, [noteId, editable]);

  const reset = useCallback((content: KnowledgeNoteContent) => {
    latest.current = { document: content.document, summary: content.summary };
    sequence.current = 0;
    committed.current = 0;
    hydrated.current = true;
    setChangeToken(0);
    setReady(true);
    setDirty(false);
    setStatus("clean");
    setLastSavedAt(content.updatedAt);
  }, []);

  const update = useCallback((patch: Partial<Snapshot>) => {
    if (!hydrated.current || !writable.current) return;
    latest.current = { ...latest.current, ...patch };
    sequence.current += 1;
    setChangeToken(sequence.current);
    setDirty(true);
    setStatus("unsaved");
  }, []);

  const updateDocument = useCallback(
    (document: KnowledgeDocument) => update({ document }), [update]);
  const updateSummary = useCallback(
    (summary: KnowledgeDocument) => update({ summary }), [update]);

  const saveNow = useCallback(async () => {
    if (!hydrated.current || !writable.current || inFlight.current
        || committed.current >= sequence.current) return;
    const requestNoteId = noteId;
    inFlight.current = true;
    try {
      while (committed.current < sequence.current && writable.current) {
        const current = sequence.current;
        const snapshot = latest.current;
        setStatus("saving");
        const result = await teacherKnowledgeNoteService.saveContent(requestNoteId, {
          schemaVersion: 2,
          document: snapshot.document,
          summary: snapshot.summary,
        });
        if (activeNoteId.current !== requestNoteId) return;
        if (!result.data) throw new Error("Server không xác nhận đã lưu nội dung.");
        committed.current = current;
        setLastSavedAt(result.data.updatedAt);
      }
      if (activeNoteId.current !== requestNoteId) return;
      if (committed.current >= sequence.current) {
        setDirty(false);
        setStatus("saved");
      }
    } catch (cause) {
      if (activeNoteId.current !== requestNoteId) return;
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

  return { status, dirty, ready, lastSavedAt, reset, updateDocument, updateSummary, saveNow };
}
