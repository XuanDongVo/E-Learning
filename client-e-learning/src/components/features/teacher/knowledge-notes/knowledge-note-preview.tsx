"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenText, Monitor, Smartphone, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  extractKnowledgeNavigation, isDocumentEmpty,
} from "./knowledge-note-document";
import {
  KNOWLEDGE_PREVIEW_REQUEST, isKnowledgePreviewSnapshot,
  previewChannelName, type KnowledgePreviewPayload,
} from "./knowledge-note-preview-channel";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";

type PreviewStatus = "waiting" | "connected" | "unavailable";

/** Same-origin ephemeral Teacher preview. Never opens a Student draft API. */
export function TeacherKnowledgeNotePreviewPage({ noteId }: { noteId: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<PreviewStatus>("waiting");
  const [payload, setPayload] = useState<KnowledgePreviewPayload | null>(null);
  const [mode, setMode] = useState<"article" | "dialog">("article");
  const [dialogTab, setDialogTab] = useState<"outline" | "keyPoints">("outline");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const session = new URLSearchParams(window.location.search).get("session");
    if (!session || typeof BroadcastChannel === "undefined") {
      setStatus("unavailable");
      return;
    }
    const channel = new BroadcastChannel(previewChannelName(noteId, session));
    const receiveSnapshot = (event: MessageEvent<unknown>) => {
      if (!isKnowledgePreviewSnapshot(event.data)) return;
      if (event.data.session !== session || event.data.noteId !== noteId) return;
      setPayload(event.data.payload);
      setStatus("connected");
    };
    channel.addEventListener("message", receiveSnapshot);
    channel.postMessage({ type: KNOWLEDGE_PREVIEW_REQUEST, noteId, session });
    const timeout = window.setTimeout(() => {
      setStatus(current => current === "waiting" ? "unavailable" : current);
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
    if (new URLSearchParams(window.location.search).has("session")) {
      window.close();
      return;
    }
    router.push(`/teacher/knowledge-notes/${noteId}/edit`);
  };

  const navigation = payload ? extractKnowledgeNavigation(payload.document) : null;
  const openArticleAt = (id: string) => {
    setMode("article");
    // The renderer has stable IDs on headings and learning blocks.
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="space-y-4" aria-label="Xem trước Knowledge Note dưới góc nhìn học sinh">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card p-3 shadow-pop sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={backToEditor}>
            <ArrowLeft className="size-4" /> Về Editor
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold sm:text-lg">
              Xem trước dưới góc nhìn học sinh
            </h1>
            <p className="text-xs text-muted-foreground">
              Bản nháp trực tiếp từ Editor · Không phải API Student
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border p-1" aria-label="Chế độ nội dung">
            <Button type="button" size="sm" variant={mode === "article" ? "secondary" : "ghost"}
              aria-pressed={mode === "article"} onClick={() => setMode("article")}>Bài đầy đủ</Button>
            <Button type="button" size="sm" variant={mode === "dialog" ? "secondary" : "ghost"}
              aria-pressed={mode === "dialog"} onClick={() => setMode("dialog")}>Dialog kiến thức</Button>
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button type="button" size="icon-sm" variant={viewport === "desktop" ? "secondary" : "ghost"}
              aria-label="Xem desktop" aria-pressed={viewport === "desktop"}
              onClick={() => setViewport("desktop")}><Monitor /></Button>
            <Button type="button" size="icon-sm" variant={viewport === "mobile" ? "secondary" : "ghost"}
              aria-label="Xem mobile" aria-pressed={viewport === "mobile"}
              onClick={() => setViewport("mobile")}><Smartphone /></Button>
          </div>
        </div>
      </div>
      <div className="student-theme min-h-[min(80dvh,760px)] rounded-xl p-3 sm:p-7">
        <div className={cn("mx-auto w-full transition-[max-width] duration-200",
          viewport === "mobile" ? "max-w-[390px]" : "max-w-[800px]")}>
          {status !== "connected" || !payload ? (
            <PaperSurface as="section" variant="plain" tape className="p-6 text-center sm:p-10">
              <BookOpenText className="mx-auto size-9 text-primary" />
              <ScrapbookHeading as="h2" className="student-section-title mt-3">
                {status === "unavailable" ? "Không có phiên xem trước" : "Đang nhận nội dung từ Editor"}
              </ScrapbookHeading>
              <p role="status" className="student-body mt-3 text-muted-foreground">
                {status === "unavailable"
                  ? "Hãy mở trang này bằng nút Xem trước trong Editor."
                  : "Giữ tab Editor mở để truyền bản nháp hiện tại."}
              </p>
              {status === "unavailable" ? (
                <Button type="button" variant="outline" className="mt-4" onClick={backToEditor}>
                  <ArrowLeft className="size-4" /> Quay lại Editor
                </Button>
              ) : <RotateCw className="mx-auto mt-4 size-5 animate-spin" />}
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
              {mode === "article" ? (
                isDocumentEmpty(payload.document) ? (
                  <p className="rounded-lg border border-dashed p-5 text-muted-foreground">
                    Bài lý thuyết chưa có nội dung.
                  </p>
                ) : (
                  <div className="student-reading break-words">
                    <KnowledgeNoteRenderer document={payload.document} />
                  </div>
                )
              ) : (
                <section className="space-y-4" aria-label="Dialog kiến thức mô phỏng">
                  <div className="flex gap-2 rounded-lg border border-border p-1">
                    <Button type="button" size="sm" variant={dialogTab === "outline" ? "secondary" : "ghost"}
                      onClick={() => setDialogTab("outline")}>Mục lục</Button>
                    <Button type="button" size="sm" variant={dialogTab === "keyPoints" ? "secondary" : "ghost"}
                      onClick={() => setDialogTab("keyPoints")}>Trọng tâm</Button>
                  </div>
                  <div className="max-h-[65dvh] space-y-3 overflow-y-auto overscroll-contain">
                    {dialogTab === "outline" ? (
                      navigation?.outline.length ? navigation.outline.map(item => (
                        <button type="button" key={item.id} onClick={() => openArticleAt(item.id)}
                          className={cn("block w-full rounded-lg border border-border bg-card p-3 text-left text-sm",
                            item.level === 3 && "pl-7")}>
                          {item.title}
                        </button>
                      )) : <p className="text-sm text-muted-foreground">Chưa có tiêu đề H2/H3.</p>
                    ) : (
                      navigation?.keyPoints.length ? navigation.keyPoints.map(point => (
                        <div key={point.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
                          <KnowledgeNoteRenderer document={{ type: "doc", content: [point.node] }} compact />
                          <Button type="button" size="sm" variant="ghost"
                            onClick={() => openArticleAt(point.id)}>Xem trong bài đầy đủ</Button>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">
                        Giáo viên chưa đánh dấu khối trọng tâm.
                      </p>
                    )}
                  </div>
                </section>
              )}
              <p className="student-caption mt-8 border-t border-dashed border-border pt-3 text-muted-foreground">
                Đây là bản xem trước, không phải tài liệu Student đã được cấp quyền truy cập.
              </p>
            </PaperSurface>
          )}
        </div>
      </div>
    </main>
  );
}
