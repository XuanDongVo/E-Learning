"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Braces,
  ChevronDown,
  Heading2,
  Heading3,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  Minus,
  Redo2,
  Scale,
  Sparkles,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KnowledgeLearningBlockKind } from "@/types/knowledge-note";
import {
  LEARNING_BLOCK_LABELS,
  normalizeSafeHref,
} from "./knowledge-note-document";

const learningBlockIcons = {
  formula: Braces,
  example: Sparkles,
  callout: Lightbulb,
  comparison: Scale,
  commonMistake: TriangleAlert,
} satisfies Record<KnowledgeLearningBlockKind, typeof Braces>;

export function KnowledgeNoteToolbar({ editor }: { editor: Editor | null }) {
  if (!editor)
    return <div className="h-11 border-b border-border bg-muted/30" />;

  const disabled = !editor.isEditable;
  const insertBlock = (kind: KnowledgeLearningBlockKind) => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "learningBlock",
        attrs: { kind, title: LEARNING_BLOCK_LABELS[kind] },
      })
      .run();
  };

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = window.prompt("Nhập liên kết HTTPS hoặc email");
    if (href === null) return;
    const safeHref = normalizeSafeHref(href);
    if (!safeHref) {
      window.alert("Liên kết không hợp lệ. Chỉ dùng HTTPS, HTTP hoặc mailto.");
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: safeHref })
      .run();
  };

  return (
    <div
      className="sticky top-[4.1rem] z-10 flex min-h-11 items-center gap-1 overflow-x-auto border-b border-border bg-card px-2 py-1.5"
      role="toolbar"
      aria-label="Định dạng bài lý thuyết"
    >
      <ToolbarButton
        label="Hoàn tác"
        disabled={!editor.can().undo() || disabled}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        label="Làm lại"
        disabled={!editor.can().redo() || disabled}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />
      <ToolbarButton
        label="Đoạn văn"
        active={editor.isActive("paragraph")}
        disabled={disabled}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <span className="text-xs font-bold">P</span>
      </ToolbarButton>
      <ToolbarButton
        label="Tiêu đề cấp 2"
        active={editor.isActive("heading", { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton
        label="Tiêu đề cấp 3"
        active={editor.isActive("heading", { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </ToolbarButton>
      <ToolbarButton
        label="In đậm"
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        label="In nghiêng"
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        label="Danh sách dấu chấm"
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Danh sách đánh số"
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        label={editor.isActive("link") ? "Bỏ liên kết" : "Thêm liên kết"}
        active={editor.isActive("link")}
        disabled={disabled}
        onClick={setLink}
      >
        <Link2 />
      </ToolbarButton>
      <ToolbarButton
        label="Đường phân cách"
        disabled={disabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-label="Thêm learning block"
            className="shrink-0"
          >
            Thêm khối <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(
            Object.keys(LEARNING_BLOCK_LABELS) as KnowledgeLearningBlockKind[]
          ).map((kind) => {
            const Icon = learningBlockIcons[kind];
            return (
              <DropdownMenuItem key={kind} onSelect={() => insertBlock(kind)}>
                <Icon /> {LEARNING_BLOCK_LABELS[kind]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ToolbarButton({
  label,
  active = false,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0"
    >
      {children}
    </Button>
  );
}
