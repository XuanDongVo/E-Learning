import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";

/** S03 — Reader shell. A URL alone must never authorize access to a draft. */
export function StudentKnowledgeNoteDetail({ noteId }: { noteId: number }) {
  return (
    <main className="mx-auto max-w-[860px] space-y-5 pb-8" data-note-id={noteId}>
      <StudentBackLink href="/student/knowledge">Sổ tay kiến thức</StudentBackLink>
      <PaperSurface as="article" variant="plain" className="space-y-4 p-5 sm:p-8">
        <ScrapbookHeading as="h1" className="student-page-title">Bài lý thuyết</ScrapbookHeading>
        <p role="status" className="student-body text-muted-foreground">
          Trình đọc Knowledge Note đang ở giai đoạn dựng khung. Chỉ nội dung Published được cấp quyền mới hiển thị sau Phase 04.
        </p>
      </PaperSurface>
    </main>
  );
}
