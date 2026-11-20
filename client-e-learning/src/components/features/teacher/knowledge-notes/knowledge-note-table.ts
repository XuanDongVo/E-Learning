"use client";

import { Extension, InputRule, mergeAttributes, Node } from "@tiptap/core";
import { createTable } from "./knowledge-note-document";
import { goToNextCell, tableEditing } from "@tiptap/pm/tables";

/**
 * Schema-compatible ProseMirror table nodes using the already installed
 * @tiptap/pm package. No additional dependency or second data format.
 */
/**
 * TipTap core only transfers standard NodeConfig fields into ProseMirror.
 * Explicitly register tableRole metadata for the already installed PM tables plugin.
 */
export const KnowledgeTableSchema = Extension.create({
  name: "knowledgeTableSchema",
  extendNodeSchema(extension) {
    const roles: Record<string, string> = {
      table: "table", tableRow: "row",
      tableCell: "cell", tableHeader: "header_cell",
    };
    return roles[extension.name] ? { tableRole: roles[extension.name] } : {};
  },
});

export const KnowledgeTable = Node.create({
  name: "table",
  group: "block",
  content: "tableRow+",
  isolating: true,
  addAttributes() {
    return { purpose: {
      default: "general",
      parseHTML: element => element.getAttribute("data-purpose") === "comparison" ? "comparison" : "general",
      renderHTML: attrs => ({ "data-purpose": attrs.purpose }),
    }};
  },
  parseHTML() { return [{ tag: "table" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["table", mergeAttributes(HTMLAttributes, {
      class: "knowledge-table w-full border-collapse text-sm",
    }), 0];
  },
  addProseMirrorPlugins() { return [tableEditing({ allowTableNodeSelection: true })]; },
  addInputRules() {
    return [
      ["comparison", /\/compare\s$/],
      ["general", /\/table\s$/],
    ].map(([purpose, find]) => new InputRule({
      find: find as RegExp,
      handler: ({ chain, range }) => {
        chain().deleteRange(range).insertContentAt(range.from,
          [createTable(purpose as "comparison" | "general"), { type: "paragraph" }]).run();
      },
    }));
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => goToNextCell(1)(this.editor.state, this.editor.view.dispatch, this.editor.view),
      "Shift-Tab": () => goToNextCell(-1)(this.editor.state, this.editor.view.dispatch, this.editor.view),
    };
  },
});

export const KnowledgeTableRow = Node.create({
  name: "tableRow",
  content: "(tableCell|tableHeader)+",
  parseHTML() { return [{ tag: "tr" }]; },
  renderHTML({ HTMLAttributes }) { return ["tr", mergeAttributes(HTMLAttributes), 0]; },
});

const cellAttrs = {
  colspan: { default: 1, parseHTML: (element: HTMLElement) => Number(element.getAttribute("colspan") || 1) },
  rowspan: { default: 1, parseHTML: (element: HTMLElement) => Number(element.getAttribute("rowspan") || 1) },
  colwidth: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      const colwidth = element.getAttribute("data-colwidth");
      return colwidth ? colwidth.split(",").map(x => Number(x)) : null;
    },
    renderHTML: (attrs: Record<string, unknown>) =>
      Array.isArray(attrs.colwidth) ? { "data-colwidth": attrs.colwidth.join(",") } : {},
  },
};

export const KnowledgeTableCell = Node.create({
  name: "tableCell",
  content: "(paragraph|bulletList|orderedList)+",
  isolating: true,
  addAttributes() { return cellAttrs; },
  parseHTML() { return [{ tag: "td" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["td", mergeAttributes(HTMLAttributes, {
      class: "min-w-32 border border-border p-2 align-top [&_p]:my-1",
    }), 0];
  },
});

export const KnowledgeTableHeader = Node.create({
  name: "tableHeader",
  content: "(paragraph|bulletList|orderedList)+",
  isolating: true,
  addAttributes() { return cellAttrs; },
  parseHTML() { return [{ tag: "th" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["th", mergeAttributes(HTMLAttributes, {
      class: "min-w-32 border border-border bg-muted/50 p-2 text-left font-bold align-top [&_p]:my-1",
    }), 0];
  },
});
