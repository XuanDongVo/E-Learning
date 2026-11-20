"use client";

import { Extension, InputRule } from "@tiptap/core";
import { Table, TableKit } from "@tiptap/extension-table";
import { createTable } from "./knowledge-note-document";

/**
 * Use Tiptap's maintained table implementation for node schema, cell navigation,
 * resizing, selection, repair and row/column commands.
 *
 * The only custom table attribute is the Knowledge Note presentation purpose.
 * Legacy v2 JSON still uses: table > tableRow > tableHeader/tableCell.
 */
export const KnowledgeTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: { default: null },
      isKeyPoint: { default: false },
      purpose: {
        default: "general",
        parseHTML: element =>
          element.getAttribute("data-purpose") === "comparison" ? "comparison" : "general",
        renderHTML: attrs => ({
          "data-purpose": attrs.purpose === "comparison" ? "comparison" : "general",
        }),
      },
    };
  },
}).configure({
  resizable: true,
  lastColumnResizable: true,
  allowTableNodeSelection: true,
  cellMinWidth: 110,
  HTMLAttributes: {
    class: "knowledge-table",
  },
});

/** Disable only Table: the custom extension above preserves purpose, while
 * official row/cell/header extensions retain their complete table schema.
 */
export const KnowledgeTableKit = TableKit.configure({
  table: false,
  tableRow: {
    HTMLAttributes: { class: "knowledge-table-row" },
  },
  tableCell: {
    HTMLAttributes: { class: "knowledge-table-cell" },
  },
  tableHeader: {
    HTMLAttributes: { class: "knowledge-table-header" },
  },
});

/** Keep existing /table and /compare shortcuts as a small, separate extension;
 * no custom ProseMirror table editing/plugin/keyboard implementation.
 */
export const KnowledgeTableShortcuts = Extension.create({
  name: "knowledgeTableShortcuts",
  addInputRules() {
    return [
      { find: /\/table\s$/, purpose: "general" as const },
      { find: /\/compare\s$/, purpose: "comparison" as const },
    ].map(({ find, purpose }) => new InputRule({
      find,
      handler: ({ chain, range }) => {
        chain()
          .deleteRange(range)
          .insertContentAt(range.from, [createTable(purpose), { type: "paragraph" }])
          .run();
      },
    }));
  },
});
