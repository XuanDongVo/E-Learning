import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeDocumentRenderer } from "./knowledge-document-renderer";
import type { KnowledgeDocument } from "@/types/knowledge-note";

const document: KnowledgeDocument = {
  type: "doc",
  content: [
    { type: "heading", attrs: { id: "grammar", level: 2 },
      content: [{ type: "text", text: "Present Simple" }] },
    { type: "learningBlock", attrs: { id: "key-1", kind: "formula", title: "Công thức", variant: "default", isKeyPoint: true },
      content: [{ type: "learningSection", attrs: { role: "expression" }, content: [
        { type: "paragraph", content: [{ type: "text", text: "S + V" }] },
      ] }] },
  ],
};

describe("KnowledgeDocumentRenderer id isolation", () => {
  it("keeps original anchor IDs for full-reader compatibility", () => {
    const html = renderToStaticMarkup(<KnowledgeDocumentRenderer document={document} />);
    expect(html).toContain('id="grammar"');
    expect(html).toContain('id="key-1"');
  });

  it("prefixes copied Topic excerpt and Dialog blocks to avoid DOM id collisions", () => {
    const excerpt = renderToStaticMarkup(
      <KnowledgeDocumentRenderer document={document} compact idPrefix="topic-3-excerpt-" />,
    );
    const dialog = renderToStaticMarkup(
      <KnowledgeDocumentRenderer document={document} idPrefix="topic-3-dialog-" />,
    );
    expect(excerpt).toContain('id="topic-3-excerpt-grammar"');
    expect(excerpt).toContain('id="topic-3-excerpt-key-1"');
    expect(dialog).toContain('id="topic-3-dialog-grammar"');
    expect(dialog).not.toContain('id="topic-3-excerpt-grammar"');
  });
});
