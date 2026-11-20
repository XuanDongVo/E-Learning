"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Check,
  Clipboard,
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
} from "@/types/knowledge-note";
import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import {
  createEditorSnapshot,
  EMPTY_KNOWLEDGE_DOCUMENT,
  EMPTY_KNOWLEDGE_SUMMARY,
  isDocumentEmpty,
} from "./knowledge-note-document";
import { KnowledgeLearningBlock } from "./knowledge-note-learning-block";
import { KnowledgeNoteToolbar } from "./knowledge-note-toolbar";
import { TeacherKnowledgeNotePreview } from "./knowledge-note-preview";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const readOnly = note?.status === "ARCHIVED";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({
        placeholder:
          "Bắt đầu soạn bài… Gõ /formula, /example, /note, /compare hoặc /mistake rồi nhấn Space để chèn nhanh.",
      }),
      KnowledgeLearningBlock,
    ],
    content: EMPTY_KNOWLEDGE_DOCUMENT,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          "knowledge-note-prosemirror min-h-[30rem] px-5 py-7 text-base leading-7 outline-none sm:px-9 sm:py-9 [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_p]:my-3 [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-3 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:my-1 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_hr]:my-7 [&_hr]:border-border empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        "aria-label": "Nội dung bài lý thuyết",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setDocument(currentEditor.getJSON() as KnowledgeDocument);
      setDirty(true);
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

  const copySnapshot = async () => {
    const snapshot = createEditorSnapshot(document, summary);
    await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    toast.success("Đã sao chép JSON của phiên soạn thảo");
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
    <TeacherKnowledgeNoteLayout
      title={note.title}
      description={
        note.description || "Soạn nội dung bài lý thuyết và Quick Summary."
      }
    >
      <section
        className="bg-card"
        aria-label="Trạng thái và hành động Editor"
      >
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
            Schema v1 · Phiên client
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void copySnapshot()}
            >
              <Clipboard /> Sao chép JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
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
          <KnowledgeNoteToolbar editor={editor} />
          <EditorContent editor={editor} />
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
              Gõ <code>/formula</code>, <code>/example</code>,{" "}
              <code>/note</code>, <code>/compare</code> hoặc{" "}
              <code>/mistake</code>, sau đó nhấn Space.
            </p>
          </section>
        </aside>
      </div>

      <TeacherKnowledgeNotePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={note.title}
        description={note.description}
        document={document}
        summary={summary}
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
    </TeacherKnowledgeNoteLayout>
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
    <TeacherKnowledgeNoteLayout
      title="Knowledge Notes"
      description="Teacher Editor"
    >
      <div className="border border-dashed border-border bg-card p-8 text-center">
        <h2 className="font-extrabold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </TeacherKnowledgeNoteLayout>
  );
}
