import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { createTable, validateKnowledgeDocument } from "./knowledge-note-document";
import { KnowledgeTable, KnowledgeTableKit, KnowledgeTableShortcuts } from "./knowledge-note-table";

const instances: Editor[] = [];
afterEach(() => instances.splice(0).forEach(instance => instance.destroy()));

function makeEditor() {
  const editor = new Editor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      KnowledgeTableKit,
      KnowledgeTable,
      KnowledgeTableShortcuts,
    ],
    content: { type: "doc", content: [
      { type: "paragraph" },
      createTable("comparison",3,3),
      { type: "paragraph" },
    ] },
  });
  instances.push(editor);
  let firstCellPosition: number | undefined;
  editor.state.doc.descendants((node, pos) => {
    if (firstCellPosition === undefined &&
        (node.type.name === "tableCell" || node.type.name === "tableHeader")) {
      firstCellPosition = pos + 2;
      return false;
    }
    return firstCellPosition === undefined;
  });
  if (firstCellPosition === undefined) throw new Error("Missing first table cell");
  editor.commands.setTextSelection(firstCellPosition);
  return editor;
}

describe("Knowledge Note official Tiptap TableKit", () => {
  it("preserves the v2 comparison purpose and table JSON structure", () => {
    const editor = makeEditor();
    const table = editor.getJSON().content?.find(node => node.type === "table");
    expect(table?.attrs?.purpose).toBe("comparison");
    expect(table?.content?.[0].content?.length).toBe(3);
  });

  it("adds a row and column at the current table cell and can export valid JSON", () => {
    const editor = makeEditor();
    expect(editor.can().addColumnAfter()).toBe(true);
    expect(editor.chain().focus().addColumnAfter().run()).toBe(true);
    expect(editor.chain().focus().addRowAfter().run()).toBe(true);
    const json = editor.getJSON();
    const table = json.content?.find(node => node.type === "table");
    expect(table?.content?.length).toBe(4);
    expect(table?.content?.[0].content?.length).toBe(4);
    expect(() => validateKnowledgeDocument(json)).not.toThrow();
  });

  it("can change table purpose without changing the rows", () => {
    const editor = makeEditor();
    const before = editor.getJSON().content?.find(node => node.type === "table");
    expect(editor.chain().focus().updateAttributes("table", { purpose: "general" }).run()).toBe(true);
    const after = editor.getJSON().content?.find(node => node.type === "table");
    expect(after?.attrs?.purpose).toBe("general");
    expect(after?.content?.length).toBe(before?.content?.length);
  });
});
