"use client";

import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { KnowledgeLearningBlockKind } from "@/types/knowledge-note";
import { LEARNING_BLOCK_LABELS } from "./knowledge-note-document";

const slashCommands: Array<[RegExp, KnowledgeLearningBlockKind]> = [
  [/\/formula\s$/, "formula"],
  [/\/example\s$/, "example"],
  [/\/note\s$/, "callout"],
  [/\/compare\s$/, "comparison"],
  [/\/mistake\s$/, "commonMistake"],
];

export const KnowledgeLearningBlock = Node.create({
  name: "learningBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      kind: { default: "callout" },
      title: { default: "" },
      body: { default: "" },
      secondary: { default: "" },
      leftTitle: { default: "" },
      rightTitle: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-learning-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(HTMLAttributes, {
        "data-learning-block": HTMLAttributes.kind,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LearningBlockNodeView);
  },

  addInputRules() {
    return slashCommands.map(([find, kind]) =>
      nodeInputRule({
        find,
        type: this.type,
        getAttributes: () => ({ kind, title: LEARNING_BLOCK_LABELS[kind] }),
      }),
    );
  },
});

function LearningBlockNodeView(props: NodeViewProps) {
  const kind = props.node.attrs.kind as KnowledgeLearningBlockKind;
  const label = LEARNING_BLOCK_LABELS[kind] ?? "Learning block";
  const readOnly = !props.editor.isEditable;

  const move = (direction: "up" | "down") => {
    const position = props.getPos();
    if (typeof position !== "number") return;
    const { state, view } = props.editor;
    const current = state.doc.nodeAt(position);
    if (!current) return;

    if (direction === "up") {
      const previous = state.doc.resolve(position).nodeBefore;
      if (!previous) return;
      view.dispatch(
        state.tr
          .delete(position, position + current.nodeSize)
          .insert(position - previous.nodeSize, current),
      );
      return;
    }

    const next = state.doc.nodeAt(position + current.nodeSize);
    if (!next) return;
    view.dispatch(
      state.tr
        .delete(position, position + current.nodeSize)
        .insert(position + next.nodeSize, current),
    );
  };

  return (
    <NodeViewWrapper
      as="section"
      data-learning-block={kind}
      className="group/my-block my-5 border-l-4 border-primary bg-primary/5 px-3 py-3 sm:px-4"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-border/70 pb-2">
        <button
          type="button"
          data-drag-handle
          aria-label={`Kéo để sắp xếp ${label}`}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          disabled={readOnly}
        >
          <GripVertical className="size-4" />
        </button>
        <span className="text-sm font-extrabold text-foreground">{label}</span>
        <div className="ml-auto flex gap-1">
          <Button type="button" size="icon-xs" variant="ghost" aria-label={`Di chuyển ${label} lên`} disabled={readOnly} onClick={() => move("up")}>
            <ArrowUp />
          </Button>
          <Button type="button" size="icon-xs" variant="ghost" aria-label={`Di chuyển ${label} xuống`} disabled={readOnly} onClick={() => move("down")}>
            <ArrowDown />
          </Button>
          <Button type="button" size="icon-xs" variant="ghost" aria-label={`Xóa ${label}`} disabled={readOnly} onClick={props.deleteNode}>
            <Trash2 />
          </Button>
        </div>
      </div>

      {kind === "comparison" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <ComparisonColumn
            title={props.node.attrs.leftTitle as string}
            body={props.node.attrs.body as string}
            titlePlaceholder="Tên cột A"
            bodyPlaceholder="Nội dung so sánh A"
            readOnly={readOnly}
            onTitle={(leftTitle) => props.updateAttributes({ leftTitle })}
            onBody={(body) => props.updateAttributes({ body })}
          />
          <ComparisonColumn
            title={props.node.attrs.rightTitle as string}
            body={props.node.attrs.secondary as string}
            titlePlaceholder="Tên cột B"
            bodyPlaceholder="Nội dung so sánh B"
            readOnly={readOnly}
            onTitle={(rightTitle) => props.updateAttributes({ rightTitle })}
            onBody={(secondary) => props.updateAttributes({ secondary })}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={(props.node.attrs.title as string) || ""}
            onChange={(event) => props.updateAttributes({ title: event.target.value })}
            aria-label={`Tiêu đề ${label}`}
            placeholder={label}
            disabled={readOnly}
            className="border-0 bg-transparent px-0 text-sm font-bold shadow-none focus-visible:ring-0"
          />
          <Textarea
            value={(props.node.attrs.body as string) || ""}
            onChange={(event) => props.updateAttributes({ body: event.target.value })}
            aria-label={`Nội dung ${label}`}
            placeholder={kind === "formula" ? "S + V(s/es) + O" : `Nhập nội dung ${label.toLocaleLowerCase("vi")}...`}
            disabled={readOnly}
            className="min-h-20 resize-y bg-card"
          />
          {kind === "commonMistake" ? (
            <Textarea
              value={(props.node.attrs.secondary as string) || ""}
              onChange={(event) => props.updateAttributes({ secondary: event.target.value })}
              aria-label="Cách sửa lỗi"
              placeholder="Cách sửa hoặc ghi nhớ đúng..."
              disabled={readOnly}
              className="min-h-16 resize-y bg-card"
            />
          ) : null}
        </div>
      )}
    </NodeViewWrapper>
  );
}

function ComparisonColumn({
  title,
  body,
  titlePlaceholder,
  bodyPlaceholder,
  readOnly,
  onTitle,
  onBody,
}: {
  title: string;
  body: string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  readOnly: boolean;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
}) {
  return (
    <div className="space-y-2 border border-border bg-card p-3">
      <Input value={title || ""} onChange={(event) => onTitle(event.target.value)} placeholder={titlePlaceholder} disabled={readOnly} aria-label={titlePlaceholder} className="font-bold" />
      <Textarea value={body || ""} onChange={(event) => onBody(event.target.value)} placeholder={bodyPlaceholder} disabled={readOnly} aria-label={bodyPlaceholder} className="min-h-28 resize-y" />
    </div>
  );
}
