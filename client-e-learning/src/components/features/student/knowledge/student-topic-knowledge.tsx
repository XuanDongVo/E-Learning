"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpenText, ChevronRight, LibraryBig, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { KnowledgeDocumentRenderer } from "@/components/features/knowledge-note/knowledge-document-renderer";
import { studentKnowledgeNoteService } from "@/services/student/student-knowledge-note.service";

/** S03.2 — Topic-aware reading uses server-validated, published links. */
export function StudentTopicKnowledge({ topicId }: { topicId: number }) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["student", "knowledge-notes", "topic", topicId],
    queryFn: async () => (await studentKnowledgeNoteService.forTopic(topicId)).data,
    enabled: Number.isSafeInteger(topicId) && topicId > 0,
    staleTime: 60_000,
  });
  const primary = query.data?.primary;
  const supplementary = query.data?.supplementary ?? [];
  const hasExcerpt = Boolean(primary?.summaryDocument.content.length);

  if (query.isPending) {
    return (
      <PaperSurface as="section" className="student-topic-knowledge space-y-3 p-4 sm:p-5" role="status">
        <p className="student-label">Đang tải lý thuyết của chủ đề…</p>
        <div className="h-12 animate-pulse rounded bg-muted/60" />
      </PaperSurface>
    );
  }
  if (query.isError) {
    return (
      <PaperSurface as="section" className="student-topic-knowledge space-y-2 p-4 sm:p-5">
        <h3 className="student-card-title">Chưa tải được kiến thức của chủ đề</h3>
        <p className="student-body text-muted-foreground">Bạn vẫn có thể xem hoạt động luyện tập bên dưới.</p>
        <button type="button" className="student-control student-control--secondary w-fit px-4"
          onClick={() => void query.refetch()}>Thử lại</button>
      </PaperSurface>
    );
  }
  if (!primary && !supplementary.length) {
    return (
      <PaperSurface as="section" className="student-topic-knowledge p-4 sm:p-5">
        <p className="student-label text-foreground">Chủ đề này chưa có bài lý thuyết được công bố.</p>
        <Link href="/student/knowledge" className="student-label mt-2 inline-flex items-center gap-1 text-primary underline underline-offset-4">
          Khám phá thư viện kiến thức <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </PaperSurface>
    );
  }
  return (
    <>
      <PaperSurface as="section" variant="lined" emphasis="feature"
        className="student-topic-knowledge space-y-4 p-4 sm:p-6" aria-label="Kiến thức của chủ đề">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="student-meta flex items-center gap-2 text-primary">
              <Sparkles className="size-4" aria-hidden="true" /> TRƯỚC KHI LUYỆN TẬP
            </p>
            <h3 className="student-section-title text-foreground">Kiến thức cần nhớ</h3>
            {primary && <p className="student-label text-muted-foreground">{primary.title}</p>}
          </div>
          <StudentIllustration id="illustration.topic-notes" decorative className="hidden w-20 shrink-0 sm:block" />
        </div>
        {primary ? (
          <>
            {hasExcerpt ? (
              <div className="student-topic-knowledge__excerpt">
                <KnowledgeDocumentRenderer document={primary.summaryDocument} compact />
              </div>
            ) : (
              <p className="student-body text-muted-foreground">Bài chính chưa có khối trọng tâm để xem nhanh.</p>
            )}
            {primary.totalKeyPoints > 3 && (
              <p className="student-caption text-muted-foreground">
                Đang xem 3/{primary.totalKeyPoints} nội dung trọng tâm · Xem đầy đủ để đọc tiếp
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="student-control student-control--secondary inline-flex items-center gap-2 px-4"
                onClick={() => setOpen(true)}>
                <BookOpenText className="size-4" aria-hidden="true" /> Xem nhanh lý thuyết
              </button>
              <Link href={`/student/knowledge/${primary.id}`}
                className="student-control student-control--action inline-flex items-center gap-2 px-4">
                Đọc lý thuyết đầy đủ <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <p className="student-body text-muted-foreground">Chưa có bài chính; bạn có thể đọc tài liệu bổ sung bên dưới.</p>
        )}
        {supplementary.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <h4 className="student-label text-foreground">Đọc thêm ({supplementary.length})</h4>
            {supplementary.map(note => (
              <Link key={note.id} href={`/student/knowledge/${note.id}`}
                className="student-topic-knowledge__related flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                <LibraryBig className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1">{note.title}</span>
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </PaperSurface>
      {primary && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="student-theme max-h-[85dvh] max-w-3xl overflow-y-auto border-2 border-ink bg-card shadow-pop">
            <DialogHeader>
              <DialogTitle className="student-section-title text-foreground">{primary.title}</DialogTitle>
              <DialogDescription>Trích từ các khối trọng tâm do giáo viên đánh dấu trong bài chính.</DialogDescription>
            </DialogHeader>
            {hasExcerpt ? (
              <div className="student-knowledge-reading">
                <KnowledgeDocumentRenderer document={primary.summaryDocument} compact />
              </div>
            ) : (
              <p className="student-body">Không có phần tóm tắt. Hãy đọc bài lý thuyết đầy đủ.</p>
            )}
            <Link href={`/student/knowledge/${primary.id}`}
              className="student-control student-control--action inline-flex w-fit items-center gap-2 px-4">
              Đọc toàn bộ bài <ArrowRight className="size-4" />
            </Link>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
