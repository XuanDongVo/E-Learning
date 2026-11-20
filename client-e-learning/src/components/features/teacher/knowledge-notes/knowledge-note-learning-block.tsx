"use client";

import { InputRule, mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { KnowledgeLearningBlockKind, KnowledgeLearningSectionRole } from "@/types/knowledge-note";
import {
  createLearningBlock, isLearningKind, LEARNING_BLOCK_LABELS, LEARNING_SECTION_LABELS,
} from "./knowledge-note-document";

const shortcuts: Array<[RegExp, KnowledgeLearningBlockKind]> = [
  [/\/formula\s$/, "formula"],
  [/\/example\s$/, "example"],
  [/\/note\s$/, "callout"],
  [/\/mistake\s$/, "commonMistake"],
];

export const KnowledgeLearningBlock = Node.create({
  name: "learningBlock",
  group: "block",
  content: "learningSection+",
  isolating: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      kind: { default: "callout" },
      title: { default: "" },
      variant: { default: "default" },
    };
  },
  parseHTML() { return [{ tag: "section[data-learning-block]" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, {
      "data-learning-block": HTMLAttributes.kind,
    }), 0];
  },
  addNodeView() { return ReactNodeViewRenderer(LearningBlockNodeView); },
  addInputRules() {
    return shortcuts.map(([find, kind]) => new InputRule({
      find,
      handler: ({ chain, range }) => {
        chain().deleteRange(range)
          .insertContentAt(range.from, createLearningBlock(kind)).run();
      },
    }));
  },
});

export const KnowledgeLearningSection = Node.create({
  name: "learningSection",
  content: "(paragraph|bulletList|orderedList)+",
  defining: true,
  isolating: true,
  addAttributes() {
    return { role: { default: "body" } };
  },
  parseHTML() { return [{ tag: "section[data-learning-section]" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, {
      "data-learning-section": HTMLAttributes.role,
    }), 0];
  },
  addNodeView() { return ReactNodeViewRenderer(LearningSectionNodeView); },
});

function LearningBlockNodeView(props: NodeViewProps) {
  const kind = isLearningKind(props.node.attrs.kind) ? props.node.attrs.kind : "callout";
  const disabled = !props.editor.isEditable;
  const title = String(props.node.attrs.title || LEARNING_BLOCK_LABELS[kind]);
  const move = (direction: "up" | "down") => {
    const position = props.getPos();
    if (typeof position !== "number") return;
    const { state, view } = props.editor;
    const current = state.doc.nodeAt(position);
    if (!current) return;
    if (direction === "up") {
      const previous = state.doc.resolve(position).nodeBefore;
      if (!previous) return;
      view.dispatch(state.tr.delete(position, position + current.nodeSize)
        .insert(position - previous.nodeSize, current));
    } else {
      const next = state.doc.nodeAt(position + current.nodeSize);
      if (!next) return;
      view.dispatch(state.tr.delete(position, position + current.nodeSize)
        .insert(position + next.nodeSize, current));
    }
  };

  const duplicate = () => {
    const pos = props.getPos();
    if (typeof pos !== "number") return;
    props.editor.commands.insertContentAt(pos + props.node.nodeSize, props.node.toJSON());
  };

  return (
    <NodeViewWrapper as="section" data-learning-block={kind}
      className="group/my-block my-5 rounded-lg border-l-4 border-primary bg-primary/5 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-border pb-2" contentEditable={false}>
        <button type="button" data-drag-handle disabled={disabled}
          className="cursor-grab text-muted-foreground disabled:cursor-not-allowed"
          aria-label={`Kéo để sắp xếp ${title}`}>
          <GripVertical className="size-4" />
        </button>
        <Input value={String(props.node.attrs.title ?? "")} disabled={disabled}
          aria-label="Tiêu đề Learning Block" placeholder={LEARNING_BLOCK_LABELS[kind]}
          onChange={event => props.updateAttributes({ title: event.target.value })}
          className="h-9 min-w-32 flex-1 border-0 bg-transparent px-1 font-extrabold shadow-none" />
        {kind === "callout" && (
          <Select value={String(props.node.attrs.variant ?? "note")}
            onValueChange={variant => props.updateAttributes({ variant })}
            disabled={disabled}>
            <SelectTrigger aria-label="Loại ghi chú" className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Ghi chú</SelectItem>
              <SelectItem value="tip">Mẹo</SelectItem>
              <SelectItem value="warning">Cảnh báo</SelectItem>
              <SelectItem value="important">Quan trọng</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon-xs" type="button" variant="ghost" disabled={disabled}
            aria-label="Nhân bản khối" onClick={duplicate}><Copy /></Button>
          <Button size="icon-xs" type="button" variant="ghost" disabled={disabled}
            aria-label="Chuyển khối lên" onClick={() => move("up")}><ArrowUp /></Button>
          <Button size="icon-xs" type="button" variant="ghost" disabled={disabled}
            aria-label="Chuyển khối xuống" onClick={() => move("down")}><ArrowDown /></Button>
          <Button size="icon-xs" type="button" variant="ghost" disabled={disabled}
            aria-label="Xóa khối" onClick={props.deleteNode}><Trash2 /></Button>
        </div>
      </div>
      <NodeViewContent as="div" className="space-y-3" />
    </NodeViewWrapper>
  );
}

function LearningSectionNodeView(props: NodeViewProps) {
  const role = props.node.attrs.role as KnowledgeLearningSectionRole;
  return (
    <NodeViewWrapper as="section" data-learning-section={role}
      className="rounded-md border border-border/60 bg-card/80 p-3">
      <p contentEditable={false} className="mb-1.5 text-xs font-bold text-muted-foreground">
        {LEARNING_SECTION_LABELS[role] ?? role}
      </p>
      <NodeViewContent as="div" className="min-h-9 text-sm leading-6 [&_p]:my-1.5 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal" />
    </NodeViewWrapper>
  );
}
