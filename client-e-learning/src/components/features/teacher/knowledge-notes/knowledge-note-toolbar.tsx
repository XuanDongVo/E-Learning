"use client";

import type { Editor } from "@tiptap/react";
import {
  addColumnAfter, addColumnBefore, addRowAfter, addRowBefore,
  deleteColumn, deleteRow, deleteTable, toggleHeaderColumn, toggleHeaderRow,
} from "@tiptap/pm/tables";
import type { Command } from "@tiptap/pm/state";
import {
  Bold, Braces, ChevronDown, Heading2, Heading3, Italic, Lightbulb,
  Link2, List, ListOrdered, Minus, Redo2, Table2, TableColumnsSplit,
  TriangleAlert, Undo2, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KnowledgeLearningBlockKind } from "@/types/knowledge-note";
import {
  createLearningBlock, createTable, LEARNING_BLOCK_LABELS, normalizeSafeHref,
} from "./knowledge-note-document";

const learningIcons = {
  formula: Braces, example: BookOpen, callout: Lightbulb, commonMistake: TriangleAlert,
} satisfies Record<KnowledgeLearningBlockKind, typeof Braces>;

export function KnowledgeNoteToolbar({ editor, onOpenTemplates }: {
  editor: Editor | null;
  onOpenTemplates: () => void;
}) {
  if (!editor) return <div className="h-12 border-b border-border bg-muted/30" />;

  const disabled = !editor.isEditable;
  const inTable = editor.isActive("table");
  const purpose = editor.getAttributes("table").purpose;
  const $from = editor.state.selection.$from;
  let selectedTable = null as ReturnType<typeof $from.node> | null;
  for (let depth = $from.depth; depth >= 1; depth--) {
    if ($from.node(depth).type.name === "table") {
      selectedTable = $from.node(depth);
      break;
    }
  }
  const rowCount = selectedTable?.childCount ?? 0;
  const columnCount = selectedTable?.firstChild?.childCount ?? 0;
  const tableCommand = (command: Command) => {
    if (disabled || !inTable) return;
    command(editor.state, editor.view.dispatch, editor.view);
    editor.commands.focus();
  };
  const insertBlock = (kind: KnowledgeLearningBlockKind) =>
    editor.chain().focus().insertContent(createLearningBlock(kind)).run();
  const insertTable = (kind: "general" | "comparison") =>
    editor.chain().focus().insertContent([createTable(kind), { type: "paragraph" }]).run();

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = window.prompt("Nhập liên kết HTTPS, HTTP hoặc email");
    if (href === null) return;
    const safe = normalizeSafeHref(href);
    if (!safe) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
  };

  return (
    <div role="toolbar" aria-label="Định dạng bài lý thuyết"
      className="sticky top-[4.1rem] z-10 flex min-h-12 items-center gap-1 overflow-x-auto border-b border-border bg-card px-2 py-1.5">
      <Tool label="Hoàn tác" disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}><Undo2 /></Tool>
      <Tool label="Làm lại" disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}><Redo2 /></Tool>
      <Divider />
      <Tool label="Đoạn văn" active={editor.isActive("paragraph")} disabled={disabled}
        onClick={() => editor.chain().focus().setParagraph().run()}><span className="text-xs font-bold">P</span></Tool>
      <Tool label="Tiêu đề H2" active={editor.isActive("heading", { level: 2 })} disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></Tool>
      <Tool label="Tiêu đề H3" active={editor.isActive("heading", { level: 3 })} disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></Tool>
      <Tool label="In đậm" active={editor.isActive("bold")} disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></Tool>
      <Tool label="In nghiêng" active={editor.isActive("italic")} disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></Tool>
      <Tool label="Danh sách dấu chấm" active={editor.isActive("bulletList")} disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></Tool>
      <Tool label="Danh sách đánh số" active={editor.isActive("orderedList")} disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></Tool>
      <Tool label={editor.isActive("link") ? "Bỏ liên kết" : "Thêm liên kết"}
        active={editor.isActive("link")} disabled={disabled} onClick={setLink}><Link2 /></Tool>
      <Tool label="Đường phân cách" disabled={disabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></Tool>
      <Divider />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="sm" variant="outline" disabled={disabled} className="shrink-0">
            Thêm khối <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(Object.keys(LEARNING_BLOCK_LABELS) as KnowledgeLearningBlockKind[]).map(kind => {
            const Icon = learningIcons[kind];
            return <DropdownMenuItem key={kind} onSelect={() => insertBlock(kind)}>
              <Icon /> {LEARNING_BLOCK_LABELS[kind]}
            </DropdownMenuItem>;
          })}
          <DropdownMenuItem onSelect={() => insertTable("comparison")}>
            <TableColumnsSplit /> Bảng so sánh động
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => insertTable("general")}>
            <Table2 /> Bảng thông thường
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button type="button" size="sm" variant="outline" className="shrink-0"
        disabled={disabled} onClick={onOpenTemplates}>
        <BookOpen /> Mẫu bài học
      </Button>
      {inTable && (
        <>
          <Divider />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="secondary" disabled={disabled} className="shrink-0">
                Chỉnh bảng <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem disabled={rowCount >= 100} onSelect={() => tableCommand(addRowAfter)}>Thêm hàng phía dưới</DropdownMenuItem>
              <DropdownMenuItem disabled={rowCount >= 100} onSelect={() => tableCommand(addRowBefore)}>Thêm hàng phía trên</DropdownMenuItem>
              <DropdownMenuItem disabled={columnCount >= 12} onSelect={() => tableCommand(addColumnAfter)}>Thêm cột bên phải</DropdownMenuItem>
              <DropdownMenuItem disabled={columnCount >= 12} onSelect={() => tableCommand(addColumnBefore)}>Thêm cột bên trái</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => tableCommand(toggleHeaderRow)}>Đổi hàng tiêu đề</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => tableCommand(toggleHeaderColumn)}>Đổi cột tiêu đề</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editor.chain().focus().updateAttributes("table",
                { purpose: purpose === "comparison" ? "general" : "comparison" }).run()}>
                {purpose === "comparison" ? "Đổi thành bảng thường" : "Đổi thành bảng so sánh"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => tableCommand(deleteRow)}>Xóa hàng đang chọn</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => tableCommand(deleteColumn)}>Xóa cột đang chọn</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => tableCommand(deleteTable)} className="text-destructive">
                Xóa bảng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
function Divider() { return <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />; }
function Tool({ label, children, active = false, disabled, onClick }: {
  label: string; children: React.ReactNode; active?: boolean;
  disabled?: boolean; onClick: () => void;
}) {
  return <Button type="button" size="icon-sm" variant={active ? "secondary" : "ghost"}
    title={label} aria-label={label} aria-pressed={active} disabled={disabled}
    className="shrink-0" onClick={onClick}>{children}</Button>;
}
