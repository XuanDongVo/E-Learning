import type { KnowledgeDocument } from "@/types/knowledge-note";

/**
 * Ephemeral, same-origin Editor ↔ Teacher preview protocol.
 * Nothing is persisted or exposed through a Student API.
 */
export function previewChannelName(noteId: number, session: string) {
  return `e-learning:teacher:knowledge-preview:${noteId}:${session}`;
}

export const KNOWLEDGE_PREVIEW_REQUEST = "knowledge-note:preview-request";
export const KNOWLEDGE_PREVIEW_SNAPSHOT = "knowledge-note:preview-snapshot";

export interface KnowledgePreviewPayload {
  title: string;
  description: string | null;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
}

export interface KnowledgePreviewRequest {
  type: typeof KNOWLEDGE_PREVIEW_REQUEST;
  noteId: number;
  session: string;
}

export interface KnowledgePreviewSnapshot {
  type: typeof KNOWLEDGE_PREVIEW_SNAPSHOT;
  noteId: number;
  session: string;
  payload: KnowledgePreviewPayload;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isDocument(value: unknown): value is KnowledgeDocument {
  return (
    isObject(value) &&
    value.type === "doc" &&
    Array.isArray(value.content)
  );
}

export function isKnowledgePreviewRequest(value: unknown): value is KnowledgePreviewRequest {
  return (
    isObject(value) &&
    value.type === KNOWLEDGE_PREVIEW_REQUEST &&
    Number.isSafeInteger(value.noteId) &&
    typeof value.session === "string" &&
    value.session.length > 0
  );
}

export function isKnowledgePreviewSnapshot(value: unknown): value is KnowledgePreviewSnapshot {
  if (!isObject(value) || !isObject(value.payload)) return false;
  return (
    value.type === KNOWLEDGE_PREVIEW_SNAPSHOT &&
    Number.isSafeInteger(value.noteId) &&
    typeof value.session === "string" &&
    value.session.length > 0 &&
    typeof value.payload.title === "string" &&
    (value.payload.description === null ||
      typeof value.payload.description === "string") &&
    isDocument(value.payload.document) &&
    isDocument(value.payload.summary)
  );
}
