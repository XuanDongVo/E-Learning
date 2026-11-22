"use client";

import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

/**
 * Assign stable IDs without resetting Tiptap document/caret.
 * Moving or editing a node keeps its ID; pasted/duplicated nodes receive new IDs.
 */
export const KnowledgeNodeIds = Extension.create({
  name: "knowledgeNodeIds",
  addProseMirrorPlugins() {
    return [new Plugin({
      appendTransaction: (_transactions, _oldState, state) => {
        const seen = new Set<string>();
        let tr = state.tr;
        let changed = false;
        state.doc.descendants((node, pos) => {
          if (!["heading", "learningBlock", "table"].includes(node.type.name)) return;
          const id = typeof node.attrs.id === "string" ? node.attrs.id : "";
          if (!/^[A-Za-z0-9_-]{1,100}$/.test(id) || seen.has(id)) {
            const generated = crypto.randomUUID();
            tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: generated });
            seen.add(generated);
            changed = true;
          } else {
            seen.add(id);
          }
        });
        return changed ? tr.setMeta("addToHistory", false) : null;
      },
    })];
  },
});
