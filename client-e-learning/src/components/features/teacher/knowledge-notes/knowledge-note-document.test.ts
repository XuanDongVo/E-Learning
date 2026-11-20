import { describe, expect, it } from "vitest";
import type { KnowledgeDocument } from "@/types/knowledge-note";
import {
  createEditorSnapshot,
  isDocumentEmpty,
  normalizeSafeHref,
} from "./knowledge-note-document";

describe("Knowledge Note document contract", () => {
  it("treats structural empty paragraphs as empty", () => {
    expect(isDocumentEmpty({ type: "doc", content: [{ type: "paragraph" }] })).toBe(true);
  });

  it("recognizes text and Learning Block attributes as content", () => {
    const textDocument: KnowledgeDocument = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Present Simple" }] }],
    };
    const blockDocument: KnowledgeDocument = {
      type: "doc",
      content: [{ type: "learningBlock", attrs: { kind: "formula", body: "S + V(s/es)" } }],
    };

    expect(isDocumentEmpty(textDocument)).toBe(false);
    expect(isDocumentEmpty(blockDocument)).toBe(false);
  });

  it("allows only supported safe link shapes", () => {
    expect(normalizeSafeHref("example.com/grammar")).toBe("https://example.com/grammar");
    expect(normalizeSafeHref("https://example.com")).toBe("https://example.com");
    expect(normalizeSafeHref("mailto:teacher@example.com")).toBe("mailto:teacher@example.com");
    expect(normalizeSafeHref("javascript:alert(1)")).toBeNull();
  });

  it("exports the versioned client snapshot", () => {
    const document: KnowledgeDocument = { type: "doc", content: [{ type: "paragraph" }] };
    expect(createEditorSnapshot(document, document)).toEqual({
      schemaVersion: 1,
      document,
      summary: document,
    });
  });
});
