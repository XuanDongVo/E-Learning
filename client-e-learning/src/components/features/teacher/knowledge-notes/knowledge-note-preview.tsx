"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenText, Monitor, Smartphone, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { isDocumentEmpty } from "./knowledge-note-document";
import {
  KNOWLEDGE_PREVIEW_REQUEST,
  isKnowledgePreviewSnapshot,
  previewChannelName,
  type KnowledgePreviewPayload,
} from "./knowledge-note-preview-channel";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";

type PreviewStatus = "waiting" | "connected" | "unavailable";

/**
 * Teacher-only preview page using Student design tokens.
 * The Editor stays open in the other tab and supplies its current unsaved JSON
 * through a same-origin BroadcastChannel handshake (no backend or browser storage).
 */
export function TeacherKnowledgeNotePreviewPage({ noteId }: { noteId: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<PreviewStatus>("waiting");
  const [payload, setPayload] = useState<KnowledgePreviewPayload | null>(null);
  const [mode, setMode] = useState<"article" | "summary">("article");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const session = new URLSearchParams(window.location.search).get("session");

    if (!session || typeof BroadcastChannel === "undefined") {
      setStatus("unavailable");
      return;
    }

    // A per-open random session prevents one editor tab from leaking drafts to another.
    const channel = new BroadcastChannel(previewChannelName(noteId, session));
    const receiveSnapshot = (event: MessageEvent<unknown>) => {
      if (!isKnowledgePreviewSnapshot(event.data)) return;
      if (event.data.session !== session || event.data.noteId !== noteId) return;

      setPayload(event.data.payload);
      setStatus("connected");
    };

    channel.addEventListener("message", receiveSnapshot);
    channel.postMessage({ type: KNOWLEDGE_PREVIEW_REQUEST, noteId, session });

    // A direct URL or closed Editor must never show fake content indefinitely.
    const timeout = window.setTimeout(() => {
      setStatus((current) => current === "waiting" ? "unavailable" : current);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      channel.removeEventListener("message", receiveSnapshot);
      channel.close();
    };
  }, [noteId]);

  const backToEditor = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.focus();
      window.close();
      return;
    }
    // A browser may isolate window.opener; closing the tab is safer than
    // navigating into a fresh Editor and silently losing the unsaved draft.
    if (new URLSearchParams(window.location.search).has("session")) {
      window.close();
      return;
    }
    router.push(`/teacher/knowledge-notes/${noteId}/edit`);
  };

  const currentDocument = mode === "article" ? payload?.document : payload?.summary;
  const empty = currentDocument && isDocumentEmpty(currentDocument);

  return (
    <main className="space-y-4" aria-label="Xem trước Knowledge Note dưới góc nhìn học sinh">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card p-3 shadow-pop sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={backToEditor}>
            <ArrowLeft className="size-4" />
            Về Editor
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold sm:text-lg">Xem trước dưới góc nhìn học sinh</h1>
            <p className="text-xs text-muted-foreground">Chỉ xem · Bản nháp trên thiết bị · Chưa lưu lên server</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Tùy chọn xem trước">
          <div className="flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="Chế độ nội dung">
            <Button type="button" variant={mode === "article" ? "secondary" : "ghost"} size="sm"
              aria-pressed={mode === "article"} onClick={() => setMode("article")}>Bài đầy đủ</Button>
            <Button type="button" variant={mode === "summary" ? "secondary" : "ghost"} size="sm"
              aria-pressed={mode === "summary"} onClick={() => setMode("summary")}>Quick Summary</Button>
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="Kích thước hiển thị">
            <Button type="button" size="icon-sm" variant={viewport === "desktop" ? "secondary" : "ghost"}
              aria-label="Xem bản desktop" aria-pressed={viewport === "desktop"} onClick={() => setViewport("desktop")}><Monitor /></Button>
            <Button type="button" size="icon-sm" variant={viewport === "mobile" ? "secondary" : "ghost"}
              aria-label="Xem bản mobile" aria-pressed={viewport === "mobile"} onClick={() => setViewport("mobile")}><Smartphone /></Button>
          </div>
        </div>
      </div>

      <div className="student-theme min-h-[min(80dvh,760px)] rounded-xl p-3 sm:p-7">
        <div className={cn(
          "mx-auto w-full transition-[max-width] duration-200",
          viewport === "mobile" ? "max-w-[390px]" : "max-w-[800px]",
        )}>
          {status !== "connected" || !payload ? (
            <PaperSurface as="section" variant="plain" tape className="p-6 text-center sm:p-10">
              <BookOpenText className="mx-auto size-9 text-primary" aria-hidden="true" />
              <ScrapbookHeading as="h2" className="student-section-title mt-3">
                {status === "unavailable" ? "Không có phiên xem trước" : "Đang nhận nội dung từ Editor"}
              </ScrapbookHeading>
              <p role="status" className="student-body mx-auto mt-3 max-w-md text-muted-foreground">
                {status === "unavailable"
                  ? "Hãy mở bản xem trước bằng nút Xem trước trong Editor. Không có API nội dung hoặc bản nháp lưu trên server."
                  : "Giữ tab Editor đang mở để truyền bản nháp hiện tại. Nếu kết nối không thành công, hãy đóng trang này và mở lại từ Editor."}
              </p>
              {status === "unavailable" ? (
                <Button type="button" variant="outline" className="mt-4" onClick={backToEditor}>
                  <ArrowLeft className="size-4" /> Quay lại Editor
                </Button>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RotateCw className="size-4 animate-spin" aria-hidden="true" />
                  Đang kết nối phiên soạn thảo
                </div>
              )}
            </PaperSurface>
          ) : (
            <PaperSurface as="article" variant="plain" tape className="p-5 sm:p-9">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="student-meta rounded-full bg-secondary px-3 py-1">SỔ TAY KIẾN THỨC</span>
                <span className="student-caption text-muted-foreground">Xem trước · Chưa công bố</span>
              </div>
              <ScrapbookHeading as="h2" className="student-page-title break-words text-foreground">
                {payload.title || "Bài lý thuyết chưa có tiêu đề"}
              </ScrapbookHeading>
              {payload.description ? (
                <p className="student-body mt-3 whitespace-pre-wrap text-muted-foreground">
                  {payload.description}
                </p>
              ) : null}
              <div className="my-6 border-t-2 border-dashed border-border" />
              {mode === "summary" && (
                <h3 className="student-section-title mb-4 text-foreground">Ghi nhớ nhanh</h3>
              )}
              {empty ? (
                <p className="student-reading rounded-lg border border-dashed border-border p-5 text-muted-foreground">
                  {mode === "article" ? "Bài lý thuyết chưa có nội dung." : "Chưa có Quick Summary."}
                </p>
              ) : currentDocument ? (
                <div className="student-reading break-words">
                  <KnowledgeNoteRenderer document={currentDocument} compact={mode === "summary"} />
                </div>
              ) : null}
              <div className="mt-8 border-t border-dashed border-border pt-3">
                <p className="student-caption text-muted-foreground">
                  Đây là bản xem trước từ phiên soạn thảo của giáo viên, không phải nội dung học sinh đã được cấp quyền truy cập.
                </p>
              </div>
            </PaperSurface>
          )}
        </div>
      </div>
    </main>
  );
}
