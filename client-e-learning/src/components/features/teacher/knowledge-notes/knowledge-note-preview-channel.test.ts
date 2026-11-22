import { describe, expect, it } from "vitest";
import {
  KNOWLEDGE_PREVIEW_REQUEST,
  KNOWLEDGE_PREVIEW_SNAPSHOT,
  isKnowledgePreviewRequest,
  isKnowledgePreviewSnapshot,
} from "./knowledge-note-preview-channel";

const payload = {
  title: "Hiện tại đơn và hiện tại tiếp diễn",
  description: null,
  document: { type: "doc", content: [{ type: "paragraph" }] },
};

describe("Teacher Knowledge Note preview protocol", () => {
  it("accepts valid requests for one note and session", () => {
    expect(isKnowledgePreviewRequest({
      type: KNOWLEDGE_PREVIEW_REQUEST,
      noteId: 42,
      session: "preview-42",
    })).toBe(true);
    expect(isKnowledgePreviewRequest({
      type: KNOWLEDGE_PREVIEW_REQUEST,
      noteId: "42",
      session: "preview-42",
    })).toBe(false);
  });

  it("accepts a single current document for Article and Dialog previews", () => {
    expect(isKnowledgePreviewSnapshot({
      type: KNOWLEDGE_PREVIEW_SNAPSHOT,
      noteId: 42,
      session: "preview-42",
      payload,
    })).toBe(true);
  });

  it("rejects malformed snapshot payloads", () => {
    expect(isKnowledgePreviewSnapshot({
      type: KNOWLEDGE_PREVIEW_SNAPSHOT,
      noteId: 42,
      session: "preview-42",
      payload: { ...payload, document: "not-json" },
    })).toBe(false);
    expect(isKnowledgePreviewSnapshot({
      type: KNOWLEDGE_PREVIEW_SNAPSHOT,
      noteId: 42,
      session: "",
      payload,
    })).toBe(false);
  });
});
