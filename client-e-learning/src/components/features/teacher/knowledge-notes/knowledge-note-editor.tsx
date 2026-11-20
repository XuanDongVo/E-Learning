"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Check,
  FileJson2,
  LayoutTemplate,
  Eye,
  Info,
  LockKeyhole,
  Save,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/i18n/navigation";
import { useTeacherKnowledgeNote } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import type {
  KnowledgeDocument,
  KnowledgeNoteEditorState,
  KnowledgeDocumentNode,
  KnowledgeNoteEditorSnapshot,
  KnowledgeNoteBlockSnapshot,
} from "@/types/knowledge-note";
import {
  KNOWLEDGE_PREVIEW_REQUEST,
  KNOWLEDGE_PREVIEW_SNAPSHOT,
  isKnowledgePreviewRequest,
  previewChannelName,
  type KnowledgePreviewPayload,
} from "./knowledge-note-preview-channel";
// import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import {
  EMPTY_KNOWLEDGE_DOCUMENT,
  EMPTY_KNOWLEDGE_SUMMARY,
  isDocumentEmpty,
} from "./knowledge-note-document";
import {
  KnowledgeLearningBlock,
  KnowledgeLearningSection,
} from "./knowledge-note-learning-block";
import {
  KnowledgeTable,
  KnowledgeTableKit,
  KnowledgeTableShortcuts,
} from "./knowledge-note-table";
import tableStyles from "./knowledge-note-table.module.css";
import {
  KnowledgeImportExportDialog,
  type ImportMode,
  type ImportTarget,
} from "./knowledge-note-import-export";
import { KnowledgeTemplateDialog } from "./knowledge-note-template-dialog";
import { KnowledgeNoteToolbar } from "./knowledge-note-toolbar";

export function TeacherKnowledgeNoteEditor({ noteId }: { noteId: number }) {
  const router = useRouter();
  const noteQuery = useTeacherKnowledgeNote(noteId);
  const note = noteQuery.data;
  const [document, setDocument] = useState<KnowledgeDocument>(
    EMPTY_KNOWLEDGE_DOCUMENT,
  );
  const [summary, setSummary] = useState<KnowledgeDocument>(
    EMPTY_KNOWLEDGE_SUMMARY,
  );
  const [dirty, setDirty] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [, setSelectionVersion] = useState(0);
  const previewTabRef = useRef<Window | null>(null);
  const previewChannelRef = useRef<BroadcastChannel | null>(null);
  const previewSessionRef = useRef<string | null>(null);
  const latestPreviewRef = useRef<KnowledgePreviewPayload | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const readOnly = note?.status === "ARCHIVED";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
      }),
      Placeholder.configure({
        placeholder:
          "Bắt đầu soạn bài… Gõ /formula, /example, /note, /compare hoặc /mistake rồi nhấn Space để chèn nhanh.",
      }),
      KnowledgeLearningBlock,
      KnowledgeLearningSection,
      KnowledgeTableKit,
      KnowledgeTable,
      KnowledgeTableShortcuts,
    ],
    content: EMPTY_KNOWLEDGE_DOCUMENT,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `knowledge-note-prosemirror ${tableStyles.editor} min-h-[30rem] px-5 py-7 text-base leading-7 outline-none sm:px-9 sm:py-9 [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_p]:my-3 [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-3 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:my-1 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_hr]:my-7 [&_hr]:border-border empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`,
        "aria-label": "Nội dung bài lý thuyết",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setDocument(currentEditor.getJSON() as KnowledgeDocument);
      setDirty(true);
    },
    onSelectionUpdate: () => {
      setSelectionVersion((current) => current + 1);
    },
  });

  const summaryEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
        strike: false,
        underline: false,
      }),
      Placeholder.configure({
        placeholder: "Tóm tắt 2–4 ý quan trọng học sinh cần nhớ…",
      }),
    ],
    content: EMPTY_KNOWLEDGE_SUMMARY,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          "min-h-36 px-3 py-3 text-sm leading-6 outline-none [&_p]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        "aria-label": "Quick Summary",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSummary(currentEditor.getJSON() as KnowledgeDocument);
      setDirty(true);
    },
  });

  useEffect(() => {
    editor?.setEditable(!readOnly);
    summaryEditor?.setEditable(!readOnly);
  }, [editor, readOnly, summaryEditor]);

  useEffect(() => {
    const warnOnUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const interceptInternalLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      event.preventDefault();
      setPendingHref(destination.href);
      setLeaveDialogOpen(true);
    };
    window.document.addEventListener("click", interceptInternalLink, true);
    return () =>
      window.document.removeEventListener("click", interceptInternalLink, true);
  }, [dirty]);

  // Keep the current draft in memory while a separate Teacher preview tab reads it.
  // No URL payload, localStorage, sessionStorage or backend content endpoint.
  useEffect(() => {
    latestPreviewRef.current = note
      ? { title: note.title, description: note.description, document, summary }
      : null;
    const channel = previewChannelRef.current;
    const session = previewSessionRef.current;
    if (channel && session && latestPreviewRef.current) {
      channel.postMessage({
        type: KNOWLEDGE_PREVIEW_SNAPSHOT,
        noteId,
        session,
        payload: latestPreviewRef.current,
      });
    }
  }, [note, noteId, document, summary]);

  useEffect(
    () => () => {
      previewChannelRef.current?.close();
      previewChannelRef.current = null;
    },
    [],
  );

  const openPreview = () => {
    if (typeof BroadcastChannel === "undefined") {
      toast.error("Trình duyệt không hỗ trợ xem trước trên tab riêng.");
      return;
    }
    const existingTab = previewTabRef.current;
    if (existingTab && !existingTab.closed) {
      existingTab.focus();
      const payload = latestPreviewRef.current;
      const session = previewSessionRef.current;
      if (payload && session) {
        previewChannelRef.current?.postMessage({
          type: KNOWLEDGE_PREVIEW_SNAPSHOT,
          noteId,
          session,
          payload,
        });
      }
      return;
    }

    const session = crypto.randomUUID();
    const previewUrl = new URL(window.location.href);
    const editorPath = previewUrl.pathname.replace(/\/+$/, "");
    if (!editorPath.endsWith("/edit")) {
      toast.error("Không xác định được đường dẫn xem trước.");
      return;
    }
    previewUrl.pathname = editorPath.slice(0, -"/edit".length) + "/preview";
    previewUrl.search = new URLSearchParams({ session }).toString();
    previewUrl.hash = "";

    const channel = new BroadcastChannel(previewChannelName(noteId, session));
    channel.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (!isKnowledgePreviewRequest(event.data)) return;
      if (event.data.noteId !== noteId || event.data.session !== session)
        return;
      const payload = latestPreviewRef.current;
      if (!payload) return;
      channel.postMessage({
        type: KNOWLEDGE_PREVIEW_SNAPSHOT,
        noteId,
        session,
        payload,
      });
    });

    const tab = window.open(previewUrl.toString(), "_blank");
    if (!tab) {
      channel.close();
      toast.error(
        "Trình duyệt đã chặn tab xem trước. Hãy cho phép mở tab mới và thử lại.",
      );
      return;
    }
    previewChannelRef.current?.close();
    previewTabRef.current = tab;
    previewChannelRef.current = channel;
    previewSessionRef.current = session;
  };

  const editorState: KnowledgeNoteEditorState = readOnly
    ? "readOnly"
    : dirty
      ? "unsaved"
      : "clean";

  const statePresentation = useMemo(() => {
    if (editorState === "readOnly")
      return {
        icon: LockKeyhole,
        label: "Chỉ đọc",
        className: "text-muted-foreground",
      };
    if (editorState === "unsaved")
      return {
        icon: Info,
        label: "Chưa lưu thay đổi",
        className: "text-foreground",
      };
    return {
      icon: Check,
      label: "Chưa có thay đổi",
      className: "text-muted-foreground",
    };
  }, [editorState]);

  const handleBack = () => {
    if (dirty) {
      setPendingHref(null);
      setLeaveDialogOpen(true);
    } else router.push("/teacher/knowledge-notes");
  };

  const getSelectedBlock = (): KnowledgeDocumentNode[] | null => {
    if (!editor) return null;
    const index = editor.state.selection.$from.index(0);
    if (index >= editor.state.doc.childCount) return null;
    const node = editor.state.doc.child(index);
    return ["learningBlock", "table"].includes(node.type.name)
      ? [node.toJSON() as KnowledgeDocumentNode]
      : null;
  };

  const insertTemplate = (nodes: KnowledgeDocumentNode[]): boolean => {
    if (!editor || readOnly) return false;
    const ok = editor.chain().focus().insertContent(nodes).run();
    if (!ok)
      toast.error(
        "Không thể chèn mẫu vào vị trí hiện tại. Hãy chọn một đoạn văn ngoài bảng hoặc Learning Block.",
      );
    return ok;
  };

  const applyImport = (
    payload: KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot,
    target: ImportTarget,
    mode: ImportMode,
  ): boolean => {
    if (!editor || !summaryEditor || readOnly) return false;
    // Both editors are updated only on an explicit, confirmed full replacement.
    const applyTo = (
      instance: NonNullable<typeof editor>,
      incoming: KnowledgeDocument,
      action: ImportMode,
    ): boolean => {
      if (action === "replace") {
        instance.commands.setContent(incoming, { emitUpdate: true });
        return true;
      }
      if (!incoming.content.length) return true;
      return action === "append"
        ? instance
            .chain()
            .focus()
            .insertContentAt(instance.state.doc.content.size, incoming.content)
            .run()
        : instance.chain().focus().insertContent(incoming.content).run();
    };

    const article =
      payload.format === "e-learning-knowledge-note-blocks"
        ? { type: "doc" as const, content: payload.content }
        : payload.document;
    const nextSummary =
      payload.format === "e-learning-knowledge-note-blocks"
        ? null
        : payload.summary;

    try {
      if (target === "both") {
        if (!nextSummary) return false;
        const first = applyTo(editor, article, "replace");
        const second = applyTo(summaryEditor, nextSummary, "replace");
        if (first && second) setDirty(true);
        return first && second;
      }
      const destination = target === "summary" ? summaryEditor : editor;
      const next = target === "summary" ? nextSummary : article;
      if (!next) return false;
      const result = applyTo(destination, next, mode);
      if (result) setDirty(true);
      return result;
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Không thể nhập tài liệu.",
      );
      return false;
    }
  };

  if (noteQuery.isPending) {
    return (
      <EditorState
        title="Đang tải bài lý thuyết…"
        description="Đang lấy metadata từ server."
      />
    );
  }

  if (noteQuery.isError || !note) {
    return (
      <EditorState
        title="Không thể mở bài lý thuyết"
        description="Metadata không tải được hoặc bài không còn tồn tại."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => noteQuery.refetch()}
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  const StateIcon = statePresentation.icon;

  return (
    <>
      <section className="bg-card" aria-label="Trạng thái và hành động Editor">
        <div className="flex flex-wrap items-center border-2 border-ink shadow-pop rounded-lg mb-2 gap-3 px-3 py-2.5 sm:px-4">
          <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft /> Danh sách
          </Button>
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${statePresentation.className}`}
            role="status"
          >
            <StateIcon className="size-4" /> {statePresentation.label}
          </span>
          <span className="text-xs text-muted-foreground">
            Schema v2 · Chỉ lưu trong phiên
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <FileJson2 /> Nhập / Xuất
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={readOnly}
              onClick={() => setTemplatesOpen(true)}
            >
              <LayoutTemplate /> Khối mẫu
            </Button>
            <Button type="button" variant="outline" onClick={openPreview}>
              <Eye /> Xem trước
            </Button>
            <Button
              type="button"
              disabled
              title="API lưu nội dung sẽ được triển khai ở Phase 02.3"
            >
              <Save /> Lưu
            </Button>
          </div>
        </div>
        {note.status === "PUBLISHED" ? (
          <div className="flex gap-2 border-t border-accent bg-accent/10 px-4 py-3 text-sm text-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
            <p>
              <strong>Bài đang công bố.</strong> Khi API lưu được bật, mọi thay
              đổi đã lưu sẽ xuất hiện ngay với học sinh. Hãy gỡ công bố trước
              nếu cần biên tập theo giai đoạn.
            </p>
          </div>
        ) : null}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section
          className="min-w-0  border-2 border-ink shadow-pop rounded-lg bg-card"
          aria-label="Document editor"
        >
          <KnowledgeNoteToolbar
            editor={editor}
            onOpenTemplates={() => setTemplatesOpen(true)}
          />
          <div className="max-w-full overflow-x-auto">
            <EditorContent editor={editor} />
          </div>
        </section>

        <aside
          className="space-y-5 xl:sticky xl:top-[5.5rem]"
          aria-label="Thiết lập bài lý thuyết"
        >
          <section className=" border-2 border-ink shadow-pop rounded-lg bg-card p-4">
            <h2 className="font-extrabold text-foreground">Quick Summary</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Biên soạn riêng, không tự cắt từ bài đầy đủ. Bắt buộc khi bài là
              Primary của Topic.
            </p>
            <div className="mt-3 border border-border bg-background">
              <EditorContent editor={summaryEditor} />
            </div>
          </section>

          <section className=" border-2 border-ink shadow-pop rounded-lg bg-card p-4 text-sm">
            <h2 className="font-extrabold text-foreground">
              Thông tin học liệu
            </h2>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">
                  Trạng thái
                </dt>
                <dd className="mt-0.5 font-semibold">{note.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">
                  Grade ID
                </dt>
                <dd className="mt-0.5 font-semibold">{note.gradeId}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">
                  Topic liên kết
                </dt>
                <dd className="mt-0.5 font-semibold">
                  {note.linkedTopicCount}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              Metadata và liên kết Topic chỉ đọc trong phase này.
            </p>
          </section>

          <section className=" border-2 border-ink shadow-pop rounded-lg bg-muted/20 p-4 text-xs leading-5 text-muted-foreground">
            <h2 className="font-bold text-foreground">
              Chèn nhanh bằng bàn phím
            </h2>
            <p className="mt-2">
              Dùng menu Thêm khối để chèn nội dung. Có thể gõ{" "}
              <code>/formula</code>, <code>/example</code>, <code>/note</code>{" "}
              hoặc <code>/mistake</code> rồi nhấn Space. Bảng so sánh hỗ trợ
              thêm hàng và cột.
            </p>
          </section>
        </aside>
      </div>

      <KnowledgeImportExportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        document={document}
        summary={summary}
        disabled={readOnly}
        selectedBlock={getSelectedBlock}
        onApply={applyImport}
      />
      <KnowledgeTemplateDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        disabled={readOnly}
        onInsert={insertTemplate}
      />

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời phiên soạn thảo?</AlertDialogTitle>
            <AlertDialogDescription>
              Thay đổi hiện chỉ nằm trong bộ nhớ trình duyệt và sẽ mất khi bạn
              rời trang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingHref
                  ? window.location.assign(pendingHref)
                  : router.push("/teacher/knowledge-notes")
              }
            >
              Rời trang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <span className="sr-only" aria-live="polite">
        {isDocumentEmpty(document)
          ? "Bài đầy đủ đang trống."
          : "Bài đầy đủ có nội dung."}
      </span>
    </>
  );
}

function EditorState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div className="border border-dashed border-border bg-card p-8 text-center">
        <h2 className="font-extrabold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </>
  );
}
