import { describe, expect, it } from "vitest";
import type { KnowledgeDocument } from "@/types/knowledge-note";
import {
  createBlockSnapshot, createEditorSnapshot, createLearningBlock, createTable,
  ensureKnowledgeIds, extractKnowledgeNavigation, isDocumentEmpty,
  normalizeSafeHref, parseKnowledgeImport, validateKnowledgeDocument,
} from "./knowledge-note-document";
import { KNOWLEDGE_TEMPLATES } from "./knowledge-note-templates";

const paragraph = (value: string) =>
  ({ type: "paragraph", content: [{ type: "text", text: value }] });

describe("Knowledge Note single-document portable contract", () => {
  it("exports a single document (schemaVersion is portable-file metadata only)", () => {
    const doc: KnowledgeDocument = { type: "doc", content: [paragraph("Present Simple")] };
    const snapshot = createEditorSnapshot(doc);
    expect(snapshot.schemaVersion).toBe(3);
    expect(snapshot).not.toHaveProperty("summary");
    const parsed = parseKnowledgeImport(JSON.stringify(snapshot));
    expect(parsed.format).toBe("e-learning-knowledge-note");
    if (parsed.format !== "e-learning-knowledge-note") throw new Error("Invalid result");
    expect(parsed.document.content).toEqual(doc.content);
  });

  it("preserves legacy v2 Summary as a marked callout in the same Document", () => {
    const legacy = {
      format: "e-learning-knowledge-note", schemaVersion: 2,
      document: { type: "doc", content: [paragraph("Lesson")] },
      summary: { type: "doc", content: [paragraph("Remember")] },
    };
    const result = parseKnowledgeImport(JSON.stringify(legacy));
    if (result.format !== "e-learning-knowledge-note") throw new Error("Invalid result");
    expect(result.document.content).toHaveLength(2);
    expect(result.document.content[1].attrs?.isKeyPoint).toBe(true);
    expect(JSON.stringify(result.document)).toContain("Remember");
  });

  it("accepts learning blocks and dynamic merged tables", () => {
    const block = createLearningBlock("example");
    block.content![0].content = [paragraph("She goes")];
    const table = createTable("comparison", 3, 3);
    table.content![0].content![0].attrs = { colspan: 1, rowspan: 2, colwidth: [180] };
    table.content![1].content!.shift();
    expect(() => validateKnowledgeDocument({ type: "doc", content: [block, table] })).not.toThrow();
  });

  it("extracts outline and key points without a Summary copy", () => {
    const formula = createLearningBlock("formula");
    formula.attrs!.isKeyPoint = true;
    const doc = ensureKnowledgeIds({ type: "doc", content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Present Simple" }] },
      formula,
    ] });
    const data = extractKnowledgeNavigation(doc);
    expect(data.outline).toHaveLength(1);
    expect(data.keyPoints).toHaveLength(1);
    expect(data.keyPoints[0].sectionId).toBe(data.outline[0].id);
  });

  it("regenerates duplicated IDs before insertion", () => {
    const formula = createLearningBlock("formula");
    const doc: KnowledgeDocument = { type: "doc", content: [formula, structuredClone(formula)] };
    const result = ensureKnowledgeIds(doc);
    expect(result.content[0].attrs?.id).not.toBe(result.content[1].attrs?.id);
  });

  it("rejects unsafe links, unsupported nodes and malformed tables", () => {
    const badLink = { type: "doc", content: [{
      type: "paragraph", content: [{
        type: "text", text: "Click",
        marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
      }],
    }]};
    expect(() => validateKnowledgeDocument(badLink)).toThrow(/Link không an toàn/);
    expect(() => validateKnowledgeDocument({ type: "doc", content: [{ type: "iframe" }] })).toThrow();
    const table = createTable("general",3,3);
    table.content![0].content![1].attrs = { colspan: 3, rowspan: 2 };
    expect(() => validateKnowledgeDocument({ type: "doc", content: [table] })).toThrow();
    expect(normalizeSafeHref("example.com/grammar")).toBe("https://example.com/grammar");
  });

  it("does not treat empty blocks or tables as readable content", () => {
    expect(isDocumentEmpty({ type: "doc", content: [{ type: "paragraph" }] })).toBe(true);
    expect(isDocumentEmpty({ type: "doc", content: [createLearningBlock("callout")] })).toBe(true);
    expect(isDocumentEmpty({ type: "doc", content: [createTable("general")] })).toBe(true);
  });

  it("supports block-file import and built-in v3 templates", () => {
    const block = createBlockSnapshot([createLearningBlock("formula")]);
    const parsed = parseKnowledgeImport(JSON.stringify(block));
    expect(parsed.format).toBe("e-learning-knowledge-note-blocks");
    for (const template of KNOWLEDGE_TEMPLATES) {
      expect(template.schemaVersion).toBe(3);
      expect(() => validateKnowledgeDocument({ type: "doc", content: template.content })).not.toThrow();
    }
  });

  it("refuses data loss for unmapped legacy v1 fields", () => {
    const legacy = {
      schemaVersion: 1,
      document: { type: "doc", content: [{
        type: "learningBlock", attrs: { kind: "example", body: "A", customField: "Important" },
      }] },
      summary: { type: "doc", content: [] },
    };
    expect(() => parseKnowledgeImport(JSON.stringify(legacy))).toThrow(/tránh mất dữ liệu/);
  });

  it("rejects oversized JSON and unsupported portable versions", () => {
    expect(() => parseKnowledgeImport("x".repeat(524289))).toThrow(/512 KB/);
    expect(() => parseKnowledgeImport('{"schemaVersion":99}')).toThrow(/Phiên bản/);
  });
});
