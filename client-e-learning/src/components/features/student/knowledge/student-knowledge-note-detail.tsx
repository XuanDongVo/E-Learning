"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import {
  BookMarked,
  BookOpenText,
  Bookmark,
  CalendarDays,
  ChevronRight,
  ArrowRight,
  ListTree,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";
import { KnowledgeDocumentRenderer } from "@/components/features/knowledge-note/knowledge-document-renderer";
import { extractKnowledgeNavigation } from "@/components/features/knowledge-note/knowledge-note-document";
import { studentKnowledgeNoteService } from "@/services/student/student-knowledge-note.service";
import type { KnowledgeDocument } from "@/types/knowledge-note";
import { useKnowledgeReadingProgress } from "./use-knowledge-reading-progress";

export function StudentKnowledgeNoteDetail({ noteId }: { noteId: number }) {
  const validId = Number.isSafeInteger(noteId) && noteId > 0;
  const readerRef = useRef<HTMLDivElement>(null);
  const noteQuery = useQuery({
    queryKey: ["student", "knowledge-notes", "detail", noteId],
    queryFn: async () => (await studentKnowledgeNoteService.get(noteId)).data,
    enabled: validId,
    staleTime: 30_000,
  });
  const outline = useMemo(() => {
    const doc = noteQuery.data?.document;
    return doc?.type === "doc" && Array.isArray(doc.content)
      ? extractKnowledgeNavigation(doc).outline.filter(item => item.id)
      : [];
  }, [noteQuery.data?.document]);
  const { progress, activeHeadingId } = useKnowledgeReadingProgress(readerRef, outline, noteId);

  if (!validId) {
    return (
      <StudentReadingState
        title="Đường dẫn bài học không hợp lệ"
        description="Hãy quay về thư viện để chọn một trang kiến thức khác."
      />
    );
  }
  if (noteQuery.isPending) {
    return (
      <main className="student-knowledge mx-auto max-w-6xl space-y-5 pb-12">
        <StudentBackLink href="/student/knowledge">
          Sổ tay kiến thức
        </StudentBackLink>
        <PaperSurface as="section" className="space-y-3 p-6" role="status">
          <p className="student-card-title">Đang mở trang kiến thức…</p>
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-52 animate-pulse rounded bg-muted/70" />
        </PaperSurface>
      </main>
    );
  }
  if (noteQuery.isError || !noteQuery.data) {
    return (
      <StudentReadingState
        title="Không thể mở trang kiến thức"
        description="Bài học có thể đã được gỡ công bố, không thuộc khối lớp của bạn hoặc tạm thời không truy cập được."
        retry={() => void noteQuery.refetch()}
      />
    );
  }

  const note = noteQuery.data;
  const document: KnowledgeDocument = note.document;
  if (document?.type !== "doc" || !Array.isArray(document.content)) {
    return (
      <StudentReadingState
        title="Bản nội dung chưa thể hiển thị"
        description="Vui lòng báo giáo viên kiểm tra bài lý thuyết này."
      />
    );
  }

  const navigation = extractKnowledgeNavigation(document);
  const updated = new Date(note.updatedAt);
  const updatedLabel = Number.isNaN(updated.getTime())
    ? null
    : updated.toLocaleDateString("vi-VN");

  return (
    <main
      className="student-knowledge mx-auto max-w-6xl space-y-5 pb-12"
      data-note-id={noteId}
    >
      <StudentBackLink href="/student/knowledge">
        Về Sổ tay kiến thức
      </StudentBackLink>

      <PaperSurface
        as="section"
        variant="kraft"
        tape
        emphasis="feature"
        className="student-knowledge-article-hero relative overflow-hidden p-5 sm:p-8"
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="student-meta inline-flex items-center gap-2 text-primary">
            <BookMarked className="size-4" aria-hidden="true" /> TRANG KIẾN THỨC
          </p>
          <h1 className="student-page-title text-foreground">{note.title}</h1>
          {note.description && (
            <p className="student-reading max-w-2xl text-muted-foreground">
              {note.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BookOpenText className="size-4" aria-hidden="true" /> Bài lý
              thuyết đã công bố
            </span>
            {updatedLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" /> Cập nhật{" "}
                {updatedLabel}
              </span>
            )}
          </div>
        </div>
        <StudentIllustration
          id="scene.open-notebook"
          decorative
          className="pointer-events-none absolute -bottom-16 -right-9 hidden w-56 -rotate-6 opacity-35 sm:block"
        />
      </PaperSurface>

      <div className="student-knowledge-reading-progress sticky top-16 z-20 rounded-lg border border-border bg-card/95 px-4 py-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="student-meta text-foreground">Tiến độ đọc trong phiên này</span>
          <span className="student-meta tabular-nums text-primary">{progress}%</span>
        </div>
        <div role="progressbar" aria-label="Tiến độ đọc" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={progress} className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_15.5rem]">
        <PaperSurface
          as="article"
          variant="plain"
          className="min-w-0 p-5 sm:p-8 lg:p-10"
          aria-label={note.title}
        >
          {outline.length > 0 && (
            <details className="student-knowledge-toc-mobile mb-5 rounded-lg border border-border bg-secondary/40 p-3 lg:hidden">
              <summary className="student-label cursor-pointer py-1 text-foreground">
                Mục lục bài đọc · {outline.length} đề mục
              </summary>
              <ReadingOutline outline={outline} activeHeadingId={activeHeadingId} />
            </details>
          )}
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-dashed border-border pb-4">
            <p className="student-note text-lg text-muted-foreground">
              Chậm một chút, hiểu sâu hơn một chút.
            </p>
            <StudentDoodle
              id="doodle.bookmark-note"
              className="pointer-events-none h-12 w-auto rotate-[7deg]"
            />
          </div>
          <div ref={readerRef} className="student-knowledge-reader student-reading min-w-0 text-foreground">
            {document.content.length ? (
              <KnowledgeDocumentRenderer document={document} />
            ) : (
              <p className="text-muted-foreground">
                Bài lý thuyết hiện chưa có nội dung để đọc.
              </p>
            )}
          </div>
          {note.linkedTopics?.length > 0 && (
            <section className="student-reading-topic-links mt-9 space-y-3 border-t border-dashed border-border pt-5" aria-labelledby="reading-topic-heading">
              <h2 id="reading-topic-heading" className="student-card-title flex items-center gap-2 text-foreground">
                <ListTree className="size-5 text-primary" aria-hidden="true" /> Tiếp tục luyện tập theo Topic
              </h2>
              <p className="student-body text-muted-foreground">
                Các chủ đề đang công bố có sử dụng trang kiến thức này.
              </p>
              <div className="flex flex-wrap gap-2">
                {note.linkedTopics.map(topic => (
                  <Link key={topic.topicId}
                    href={`/student/units/${topic.unitId}?topicId=${topic.topicId}`}
                    className="student-control student-control--secondary inline-flex items-center gap-2 px-3">
                    <span className="min-w-0">{topic.unitCode} · {topic.topicName}</span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}
          <div className="mt-10 border-t border-dashed border-border pt-5">
            <Link
              href="/student/knowledge"
              className="student-label inline-flex min-h-11 items-center gap-2 text-primary hover:underline"
            >
              <BookOpenText className="size-4" aria-hidden="true" />
              Khám phá những trang kiến thức khác{" "}
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </PaperSurface>

        <aside
          aria-label="Điều hướng bài đọc"
          className="space-y-4 lg:sticky lg:top-24"
        >
          <PaperSurface
            as="section"
            variant="lined"
            className="hidden p-4 sm:p-5 lg:block"
            aria-label="Mục lục"
          >
            <h2 className="student-section-title flex items-center gap-2">
              <Bookmark className="size-5 text-primary" aria-hidden="true" />{" "}
              Mục lục
            </h2>
            {navigation.outline.length ? (
              <ReadingOutline outline={outline} activeHeadingId={activeHeadingId} />
            ) : (
              <p className="student-body mt-3 text-muted-foreground">
                Bài này chưa có các đề mục H2/H3.
              </p>
            )}
          </PaperSurface>
          {navigation.keyPoints.length > 0 && (
            <PaperSurface
              as="section"
              variant="kraft"
              className="space-y-2 p-4 sm:p-5"
            >
              <h2 className="student-section-title flex items-center gap-2">
                <BookMarked
                  className="size-5 text-primary"
                  aria-hidden="true"
                />{" "}
                Đáng ghi nhớ
              </h2>
              <p className="student-caption text-muted-foreground">
                {navigation.keyPoints.length} khối hoặc bảng được thầy cô đánh
                dấu.
              </p>
              <ul className="space-y-1">
                {navigation.keyPoints
                  .filter((item) => item.id)
                  .map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="student-label block min-h-9 rounded-md px-2 py-2 text-primary hover:bg-card"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </PaperSurface>
          )}
        </aside>
      </div>
    </main>
  );
}


function ReadingOutline({ outline, activeHeadingId }: {
  outline: Array<{ id: string; title: string; level: 2 | 3 }>;
  activeHeadingId: string | null;
}) {
  return (
    <nav aria-label="Các phần trong bài" className="mt-3">
      <ol className="space-y-1.5">
        {outline.map(item => (
          <li key={item.id}>
            <a href={`#${item.id}`}
              aria-current={activeHeadingId === item.id ? "location" : undefined}
              className={`student-knowledge-toc-link student-label block min-h-11 rounded-md px-3 py-2 leading-6 focus-visible:outline-2 focus-visible:outline-primary ${item.level === 3 ? "ml-3 font-medium" : ""}`}>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StudentReadingState({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <main className="student-knowledge mx-auto max-w-3xl space-y-5 pb-12">
      <StudentBackLink href="/student/knowledge">
        Về Sổ tay kiến thức
      </StudentBackLink>
      <PaperSurface as="section" className="space-y-3 p-6 sm:p-8">
        <StudentIllustration
          id="illustration.no-lessons"
          decorative
          className="mx-auto w-36"
        />
        <h1 className="student-page-title text-center">{title}</h1>
        <p className="student-body text-center text-muted-foreground">
          {description}
        </p>
        {retry && (
          <button
            type="button"
            className="student-control student-control--action mx-auto"
            onClick={retry}
          >
            Thử lại
          </button>
        )}
      </PaperSurface>
    </main>
  );
}
