import { describe, expect, it } from "vitest";
import type { KnowledgeDocument } from "@/types/knowledge-note";
import {
  createBlockSnapshot, createEditorSnapshot, createLearningBlock, createTable,
  isDocumentEmpty, normalizeSafeHref, parseKnowledgeImport,
  validateKnowledgeDocument,
} from "./knowledge-note-document";
import { KNOWLEDGE_TEMPLATES } from "./knowledge-note-templates";

const paragraph = (value: string) =>
  ({ type: "paragraph", content: [{ type: "text", text: value }] });

describe("Knowledge Note v2 document contract", () => {
  it("exports schema v2 and round-trips article and summary independently", () => {
    const doc: KnowledgeDocument = { type: "doc", content: [paragraph("Present Simple")] };
    const summary: KnowledgeDocument = { type: "doc", content: [paragraph("Remember")] };
    const snapshot = createEditorSnapshot(doc, summary);
    expect(snapshot.schemaVersion).toBe(2);
    expect(snapshot.format).toBe("e-learning-knowledge-note");
    expect(parseKnowledgeImport(JSON.stringify(snapshot))).toEqual(snapshot);
  });
  it("accepts structured rich-text educational sections", () => {
    const block = createLearningBlock("example");
    const exampleSection = block.content?.[0];
    if (!exampleSection) throw new Error("Missing section");
    exampleSection.content = [{
      type: "paragraph",
      content: [{ type: "text", text: "She goes", marks: [{ type: "bold" }] }],
    }];
    validateKnowledgeDocument({ type: "doc", content: [block] });
  });
  it("creates a dynamic 4-column comparison with uniform row widths", () => {
    const table = createTable("comparison",4,5);
    expect(table.content).toHaveLength(5);
    expect(table.content?.[0].content).toHaveLength(4);
    validateKnowledgeDocument({ type: "doc", content: [table] });
  });
  it("accepts valid table cells with both column and row spans", () => {
    const table = createTable("comparison",3,3);
    const rows = table.content!;
    // Header's first cell spans two rows. Remove the covered cell from row 2.
    rows[0].content![0].attrs = { colspan: 1, rowspan: 2, colwidth: [180], align: null };
    rows[1].content!.shift();
    const doc: KnowledgeDocument = { type: "doc", content: [table] };
    expect(() => validateKnowledgeDocument(doc)).not.toThrow();
    expect(parseKnowledgeImport(JSON.stringify(createEditorSnapshot(doc, { type: "doc", content: [] }))))
      .toEqual(createEditorSnapshot(doc, { type: "doc", content: [] }));
  });
  it("rejects overlapping or out-of-bounds merged table cells", () => {
    const table = createTable("comparison",3,3);
    table.content![0].content![1].attrs = { colspan: 3, rowspan: 2, colwidth: null };
    expect(() => validateKnowledgeDocument({ type: "doc", content: [table] }))
      .toThrow(/giới hạn|chồng lên/);
  });
  it("migrates legacy comparison and formula without losing text", () => {
    const legacy = {
      schemaVersion: 1,
      document: { type: "doc", content: [
        { type: "learningBlock", attrs: {
          kind: "comparison", title: "Các thì", leftTitle: "Đơn",
          rightTitle: "Tiếp diễn", body: "S + V", secondary: "S + V-ing",
        }},
        { type: "learningBlock", attrs: {
          kind: "formula", title: "Công thức", body: "She goes", secondary: "Ghi nhớ",
        }},
      ]},
      summary: { type: "doc", content: [paragraph("Quick")] },
    };
    const migrated = parseKnowledgeImport(JSON.stringify(legacy));
    expect(migrated.format).toBe("e-learning-knowledge-note");
    if (migrated.format !== "e-learning-knowledge-note") throw new Error("Unexpected");
    expect(migrated.document.content.map(node => node.type)).toEqual(["heading","table","learningBlock"]);
    expect(JSON.stringify(migrated.document)).toContain("S + V-ing");
    expect(JSON.stringify(migrated.document)).toContain("She goes");
    expect(JSON.stringify(migrated.document)).toContain("Ghi nhớ");
  });
  it("rejects unsafe links and unknown nodes instead of dropping content", () => {
    const badLink = { type: "doc", content: [{
      type: "paragraph", content: [{
        type: "text", text: "Click",
        marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
      }],
    }]};
    expect(() => validateKnowledgeDocument(badLink)).toThrow(/Link không an toàn/);
    expect(() => validateKnowledgeDocument({ type: "doc", content: [{ type: "iframe" }] })).toThrow();
    expect(normalizeSafeHref("example.com/grammar")).toBe("https://example.com/grammar");
  });
  it("does not count empty educational blocks and tables as text", () => {
    expect(isDocumentEmpty({ type: "doc", content: [{ type: "paragraph" }] })).toBe(true);
    expect(isDocumentEmpty({ type: "doc", content: [createLearningBlock("callout")] })).toBe(true);
    expect(isDocumentEmpty({ type: "doc", content: [createTable("general")] })).toBe(true);
  });
  it("accepts independent block snapshots", () => {
    const block = createBlockSnapshot([createLearningBlock("formula")]);
    expect(parseKnowledgeImport(JSON.stringify(block))).toEqual(block);
  });
  it("validates built-in templates against the same v2 schema", () => {
    for (const template of KNOWLEDGE_TEMPLATES) {
      expect(template.schemaVersion).toBe(2);
      expect(() => validateKnowledgeDocument({ type: "doc", content: template.content })).not.toThrow();
    }
  });
  it("preserves secondary text from legacy callouts", () => {
    const v1 = {
      schemaVersion: 1,
      document: { type: "doc", content: [
        { type: "learningBlock", attrs: {
          kind: "callout", title: "Lưu ý", body: "Cách dùng", secondary: "Giải thích thêm",
        }},
      ] },
      summary: { type: "doc", content: [] },
    };
    const result = parseKnowledgeImport(JSON.stringify(v1));
    expect(JSON.stringify(result)).toContain("Giải thích thêm");
  });
  it("rejects unmapped legacy attributes to avoid silent data loss", () => {
    const v1 = {
      schemaVersion: 1,
      document: { type: "doc", content: [
        { type: "learningBlock", attrs: { kind: "example", body: "A", customField: "Important" } },
      ] },
      summary: { type: "doc", content: [] },
    };
    expect(() => parseKnowledgeImport(JSON.stringify(v1))).toThrow(/tránh mất dữ liệu/);
  });
  it("rejects oversized JSON and unsupported versions", () => {
    expect(() => parseKnowledgeImport("x".repeat(524289))).toThrow(/512 KB/);
    expect(() => parseKnowledgeImport('{"schemaVersion":3}')).toThrow(/schemaVersion/);
  });
});
