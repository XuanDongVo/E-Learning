"use client";

import { Extension, InputRule } from "@tiptap/core";
import { Table, TableKit, TableView } from "@tiptap/extension-table";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView, ViewMutationRecord } from "@tiptap/pm/view";
import { createTable } from "./knowledge-note-document";

class KnowledgeTableView extends TableView {
  private readonly keyPointButton: HTMLButtonElement;

  constructor(
    node: ProseMirrorNode,
    cellMinWidth: number,
    view: EditorView,
    HTMLAttributes: Record<string, unknown> = {},
  ) {
    super(node, cellMinWidth, view, HTMLAttributes);

    const toolbar = document.createElement("div");
    toolbar.className = "knowledge-table-toolbar";
    toolbar.setAttribute("contenteditable", "false");

    this.keyPointButton = document.createElement("button");
    this.keyPointButton.type = "button";
    this.keyPointButton.className = "knowledge-table-key-point";
    this.keyPointButton.addEventListener("mousedown", event => {
      event.preventDefault();
    });
    this.keyPointButton.addEventListener("click", () => {
      const { $from } = view.state.selection;
      for (let depth = $from.depth; depth > 0; depth--) {
        const selectedNode = $from.node(depth);
        if (selectedNode.type.name !== "table") continue;
        view.dispatch(view.state.tr.setNodeMarkup(
          $from.before(depth),
          undefined,
          { ...selectedNode.attrs, isKeyPoint: !selectedNode.attrs.isKeyPoint },
        ));
        return;
      }
    });

    toolbar.appendChild(this.keyPointButton);
    this.dom.insertBefore(toolbar, this.table);
    this.updateKeyPointButton(node, view.editable);
  }

  update(node: ProseMirrorNode) {
    const updated = super.update(node);
    if (!updated) return false;
    this.updateKeyPointButton(node, this.keyPointButton.disabled === false);
    return true;
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    if (mutation.target === this.keyPointButton ||
        this.keyPointButton.contains(mutation.target)) {
      return true;
    }
    return super.ignoreMutation(mutation);
  }

  private updateKeyPointButton(node: ProseMirrorNode, editable: boolean) {
    const isKeyPoint = node.attrs.isKeyPoint === true;
    this.keyPointButton.disabled = !editable;
    this.keyPointButton.setAttribute("aria-pressed", String(isKeyPoint));
    this.keyPointButton.setAttribute(
      "aria-label",
      isKeyPoint
        ? "Bỏ đánh dấu bảng là kiến thức trọng tâm"
        : "Đánh dấu bảng là kiến thức trọng tâm",
    );
    this.keyPointButton.textContent = isKeyPoint ? "Bỏ trọng tâm" : "Trọng tâm";
    this.keyPointButton.dataset.active = String(isKeyPoint);
  }
}

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
  View: KnowledgeTableView,
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
