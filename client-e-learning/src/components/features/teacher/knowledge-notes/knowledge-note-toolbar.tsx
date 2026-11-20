"use client";

import type { Editor } from "@tiptap/react";
import { TableMap } from "@tiptap/pm/tables";
import { toast } from "sonner";
import {
  Bold, Braces, ChevronDown, Heading2, Heading3, Italic, Lightbulb,
  Link2, List, ListOrdered, Minus, Redo2, Table2, TableColumnsSplit,
  TriangleAlert, Undo2, BookOpen, Plus, Rows3, Columns3, Merge, Split,
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
  const $from = editor.state.selection.$from;
  let selectedTable: ReturnType<typeof $from.node> | null = null;
  for (let depth = $from.depth; depth >= 1; depth--) {
    if ($from.node(depth).type.name === "table") {
      selectedTable = $from.node(depth);
      break;
    }
  }
  const inTable = selectedTable !== null;
  const purpose = selectedTable?.attrs.purpose;
  const rowCount = selectedTable?.childCount ?? 0;
  const columnCount = selectedTable ? TableMap.get(selectedTable).width : 0;
  const canAddRow = inTable && rowCount < 100 && editor.can().addRowAfter();
  const canAddColumn = inTable && columnCount < 12 && editor.can().addColumnAfter();
  const editTable = (run: () => boolean) => {
    if (disabled || !inTable) return;
    if (!run()) toast.error("Không thể chỉnh bảng. Hãy đặt con trỏ vào một ô rồi thử lại.");
  };
  const insertBlock = (kind: KnowledgeLearningBlockKind) =>
    editor.chain().focus().insertContent(createLearningBlock(kind)).run();
  const insertTable = (kind: "general" | "comparison") => {
    if (!editor.chain().focus().insertContent([
      createTable(kind),
      { type: "paragraph" },
    ]).run()) {
      toast.error("Không thể chèn bảng.");
      return;
    }

    let firstCellPosition: number | undefined;
    const selectionPosition = editor.state.selection.from;
    editor.state.doc.descendants((node, position) => {
      if (position < selectionPosition &&
          (node.type.name === "tableCell" || node.type.name === "tableHeader")) {
        firstCellPosition = position + 2;
      }
      return true;
    });
    if (firstCellPosition !== undefined) {
      editor.commands.setTextSelection(firstCellPosition);
    }
  };

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    // const href = window.prompt("Nhập liên kết HTTPS, HTTP hoặc email");
    const href = window.prompt("Chưa Triển khai");
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
          <span className="shrink-0 rounded-md bg-muted/60 px-2 py-1 text-xs font-semibold text-foreground">
            {rowCount} hàng · {columnCount} cột
          </span>
          <Button type="button" size="sm" variant="secondary" className="shrink-0"
            onMouseDown={event => event.preventDefault()}
            aria-label="Thêm hàng bên dưới ô hiện tại"
            disabled={disabled || !canAddRow}
            onClick={() => editTable(() => editor.chain().focus().addRowAfter().run())}>
            <Plus className="size-3.5" /> Hàng
          </Button>
          <Button type="button" size="sm" variant="secondary" className="shrink-0"
            onMouseDown={event => event.preventDefault()}
            aria-label="Thêm cột bên phải ô hiện tại"
            disabled={disabled || !canAddColumn}
            onClick={() => editTable(() => editor.chain().focus().addColumnAfter().run())}>
            <Plus className="size-3.5" /> Cột
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="outline" disabled={disabled}
                className="shrink-0" aria-label="Các thao tác bảng khác">
                Chỉnh bảng <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled={rowCount >= 100 || !editor.can().addRowBefore()}
                onSelect={() => editTable(() => editor.chain().focus().addRowBefore().run())}>
                <Rows3 /> Thêm hàng phía trên
              </DropdownMenuItem>
              <DropdownMenuItem disabled={rowCount >= 100 || !editor.can().addRowAfter()}
                onSelect={() => editTable(() => editor.chain().focus().addRowAfter().run())}>
                <Rows3 /> Thêm hàng phía dưới
              </DropdownMenuItem>
              <DropdownMenuItem disabled={columnCount >= 12 || !editor.can().addColumnBefore()}
                onSelect={() => editTable(() => editor.chain().focus().addColumnBefore().run())}>
                <Columns3 /> Thêm cột bên trái
              </DropdownMenuItem>
              <DropdownMenuItem disabled={columnCount >= 12 || !editor.can().addColumnAfter()}
                onSelect={() => editTable(() => editor.chain().focus().addColumnAfter().run())}>
                <Columns3 /> Thêm cột bên phải
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().toggleHeaderRow()}
                onSelect={() => editTable(() => editor.chain().focus().toggleHeaderRow().run())}>
                Đổi hàng tiêu đề
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().toggleHeaderColumn()}
                onSelect={() => editTable(() => editor.chain().focus().toggleHeaderColumn().run())}>
                Đổi cột tiêu đề
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().mergeCells()}
                onSelect={() => editTable(() => editor.chain().focus().mergeCells().run())}>
                <Merge /> Gộp ô đã chọn
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().splitCell()}
                onSelect={() => editTable(() => editor.chain().focus().splitCell().run())}>
                <Split /> Tách ô
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editTable(() =>
                editor.chain().focus().updateAttributes("table",
                  { purpose: purpose === "comparison" ? "general" : "comparison" }).run())}>
                {purpose === "comparison" ? "Đổi thành bảng thường" : "Đổi thành bảng so sánh"}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().deleteRow()}
                onSelect={() => editTable(() => editor.chain().focus().deleteRow().run())}>
                Xóa hàng đang chọn
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().deleteColumn()}
                onSelect={() => editTable(() => editor.chain().focus().deleteColumn().run())}>
                Xóa cột đang chọn
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!editor.can().deleteTable()}
                onSelect={() => editTable(() => editor.chain().focus().deleteTable().run())}
                className="text-destructive">
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
