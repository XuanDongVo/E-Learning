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
import {
  useTeacherKnowledgeNote,
  useTeacherKnowledgeNoteContent,
} from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { useKnowledgeNoteAutosave } from "@/hooks/knowledge-note/use-knowledge-note-autosave";
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
  ensureKnowledgeIds,
  extractKnowledgeNavigation,
  isDocumentEmpty,
  validateKnowledgeDocument,
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
} from "./knowledge-note-import-export";
import { KnowledgeTemplateDialog } from "./knowledge-note-template-dialog";
import { KnowledgeHeading } from "./knowledge-note-heading";
import { KnowledgeNodeIds } from "./knowledge-note-node-ids";
import { KnowledgeNoteStatusActions } from "./knowledge-note-status-actions";
import { KnowledgeNoteToolbar } from "./knowledge-note-toolbar";

export function TeacherKnowledgeNoteEditor({ noteId }: { noteId: number }) {
  const router = useRouter();
  const noteQuery = useTeacherKnowledgeNote(noteId);
  const note = noteQuery.data;
  const contentQuery = useTeacherKnowledgeNoteContent(noteId, Boolean(note));
  const readOnly =
    !note || note.status === "ARCHIVED" || note.status === "PUBLISHED";
  const autosave = useKnowledgeNoteAutosave(noteId, !readOnly);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const [document, setDocument] = useState<KnowledgeDocument>(
    EMPTY_KNOWLEDGE_DOCUMENT,
  );
  const [importOpen, setImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [, setSelectionVersion] = useState(0);
  const previewTabRef = useRef<Window | null>(null);
  const previewChannelRef = useRef<BroadcastChannel | null>(null);
  const previewSessionRef = useRef<string | null>(null);
  const latestPreviewRef = useRef<KnowledgePreviewPayload | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
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
      KnowledgeHeading,
      KnowledgeLearningBlock,
      KnowledgeLearningSection,
      KnowledgeNodeIds,
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
      if (!hydratedRef.current) return;
      const next = currentEditor.getJSON() as KnowledgeDocument;
      setDocument(next);
      autosave.updateDocument(next);
    },
    onSelectionUpdate: () => {
      setSelectionVersion((current) => current + 1);
    },
  });

  // Load one persisted document; any missing stable IDs are filled without losing content.
  useEffect(() => {
    if (!editor || !contentQuery.data) return;
    try {
      const loaded = contentQuery.data;
      validateKnowledgeDocument(loaded.document);
      const normalized = ensureKnowledgeIds(loaded.document);
      hydratedRef.current = false;
      editor.commands.setContent(normalized, { emitUpdate: false });
      setDocument(normalized);
      autosave.reset(loaded);
      hydratedRef.current = true;
      if (JSON.stringify(normalized) !== JSON.stringify(loaded.document)) {
        autosave.updateDocument(normalized);
      }
      setLoadError(null);
    } catch (cause) {
      setLoadError(
        cause instanceof Error ? cause.message : "Bản lưu không hợp lệ.",
      );
    }
  }, [editor, contentQuery.data, autosave.reset, autosave.updateDocument]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    const warnOnUnload = (event: BeforeUnloadEvent) => {
      if (!autosave.dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [autosave.dirty]);

  useEffect(() => {
    if (!autosave.dirty) return;
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
  }, [autosave.dirty]);

  // Keep the current draft in memory while a separate Teacher preview tab reads it.
  // No URL payload, localStorage, sessionStorage or backend content endpoint.
  useEffect(() => {
    latestPreviewRef.current = note
      ? { title: note.title, description: note.description, document }
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
  }, [note, noteId, document]);

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
    : autosave.status === "saving"
      ? "saving"
      : autosave.status === "error"
        ? "saveError"
        : autosave.dirty
          ? "unsaved"
          : "clean";

  const statePresentation = useMemo(() => {
    if (editorState === "readOnly")
      return {
        icon: LockKeyhole,
        label: "Chỉ đọc",
        className: "text-muted-foreground",
      };
    if (editorState === "saving")
      return {
        icon: Info,
        label: "Đang lưu…",
        className: "text-foreground",
      };
    if (editorState === "saveError")
      return {
        icon: TriangleAlert,
        label: "Lưu thất bại — thử lại",
        className: "text-destructive",
      };
    if (editorState === "unsaved")
      return {
        icon: Info,
        label: "Chưa lưu thay đổi",
        className: "text-foreground",
      };
    return {
      icon: Check,
      label: autosave.status === "saved" ? "Đã lưu" : "Đã tải nội dung",
      className: "text-muted-foreground",
    };
  }, [editorState, autosave.status]);

  const handleBack = () => {
    if (autosave.dirty) {
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
    if (!editor || readOnly || !autosave.ready) return false;
    const ok = editor.chain().focus().insertContent(nodes).run();
    if (!ok)
      toast.error(
        "Không thể chèn mẫu vào vị trí hiện tại. Hãy chọn một đoạn văn ngoài bảng hoặc Learning Block.",
      );
    return ok;
  };

  const applyImport = (
    payload: KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot,
    mode: ImportMode,
  ): boolean => {
    if (!editor || readOnly || !autosave.ready) return false;
    const incoming: KnowledgeDocument =
      payload.format === "e-learning-knowledge-note-blocks"
        ? { type: "doc", content: payload.content }
        : payload.document;
    const normalized = ensureKnowledgeIds(incoming, mode !== "replace");
    try {
      // Import is a deliberate edit: capture the Tiptap document explicitly
      // rather than depending on whether setContent/insertContent emits onUpdate.
      let applied = true;
      if (mode === "replace") {
        editor.commands.setContent(normalized, { emitUpdate: false });
      } else if (normalized.content.length) {
        applied = mode === "append"
          ? editor.chain().focus()
              .insertContentAt(editor.state.doc.content.size, normalized.content).run()
          : editor.chain().focus().insertContent(normalized.content).run();
      }
      if (!applied) return false;
      const next = editor.getJSON() as KnowledgeDocument;
      validateKnowledgeDocument(next);
      setDocument(next);
      autosave.updateDocument(next);
      // Send the imported snapshot immediately so leaving before the 2s
      // typing debounce does not silently discard the imported content.
      void autosave.saveNow().catch((cause: unknown) => {
        toast.error(cause instanceof Error
          ? cause.message
          : "Không thể lưu nội dung vừa nhập. Hãy thử Lưu ngay.");
      });
      return true;
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Không thể nhập nội dung.",
      );
      return false;
    }
  };

  const focusNode = (id: string) => {
    if (!editor) return;
    editor.state.doc.descendants((node, pos) => {
      if (node.attrs.id !== id) return;
      editor
        .chain()
        .focus()
        .setTextSelection(Math.min(pos + 1, editor.state.doc.content.size))
        .run();
      return false;
    });
  };

  const navigation = extractKnowledgeNavigation(document);

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

  if (
    contentQuery.isPending ||
    (!autosave.ready && !contentQuery.isError && !loadError)
  ) {
    return (
      <EditorState
        title="Đang tải nội dung…"
        description="Đang đọc bản đã lưu từ server."
      />
    );
  }
  if (contentQuery.isError || loadError) {
    return (
      <EditorState
        title="Không thể mở nội dung bài lý thuyết"
        description={loadError ?? "Không tải được nội dung từ server."}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => contentQuery.refetch()}
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
            Một bài lý thuyết · Lưu trên server
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
            <KnowledgeNoteStatusActions
              note={note}
              disabled={autosave.dirty || autosave.status === "saving"}
            />
            <Button
              type="button"
              disabled={
                readOnly ||
                !autosave.ready ||
                !autosave.dirty ||
                autosave.status === "saving"
              }
              onClick={() => {
                void autosave.saveNow().catch((cause: unknown) => {
                  toast.error(
                    cause instanceof Error
                      ? cause.message
                      : "Không thể lưu bài học.",
                  );
                });
              }}
            >
              <Save />{" "}
              {autosave.status === "error" ? "Thử lưu lại" : "Lưu ngay"}
            </Button>
          </div>
        </div>
        {note.status === "PUBLISHED" ? (
          <div className="flex gap-2 border-t border-accent bg-accent/10 px-4 py-3 text-sm text-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
            <p>
              <strong>Bài đang công bố.</strong> Gỡ công bố trước khi chỉnh sửa
              để tránh thay đổi nội dung học sinh đang đọc. Auto-save tạm dừng.
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
          <section className="border-2 border-ink shadow-pop rounded-lg bg-card p-4">
            <h2 className="font-extrabold text-foreground">Cấu trúc bài học</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Mục lục lấy từ H2/H3. Trọng tâm lấy từ Learning Block và bảng được
              đánh dấu.
            </p>
            <h3 className="mt-4 text-xs font-bold uppercase text-muted-foreground">
              Mục lục ({navigation.outline.length})
            </h3>
            <div className="mt-2 space-y-1">
              {navigation.outline.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Thêm tiêu đề H2/H3 để tạo mục lục.
                </p>
              ) : (
                navigation.outline.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => focusNode(item.id)}
                    className={`block w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted ${item.level === 3 ? "pl-5" : "font-semibold"}`}
                  >
                    {item.title}
                  </button>
                ))
              )}
            </div>
            <h3 className="mt-4 text-xs font-bold uppercase text-muted-foreground">
              Trọng tâm ({navigation.keyPoints.length})
            </h3>
            <div className="mt-2 space-y-1">
              {navigation.keyPoints.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Dùng biểu tượng Bookmark trên Learning Block hoặc đánh dấu
                  bảng.
                </p>
              ) : (
                navigation.keyPoints.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => focusNode(item.id)}
                    className="block w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                  >
                    ★ {item.title}
                  </button>
                ))
              )}
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
            {/* <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              Metadata và liên kết Topic chỉ đọc trong phase này.
            </p> */}
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
              Một số thay đổi chưa được server xác nhận lưu. Rời trang lúc này
              có thể làm mất nội dung vừa chỉnh sửa.
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
