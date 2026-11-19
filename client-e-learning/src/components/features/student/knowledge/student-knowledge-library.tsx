import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";

/** S01 — planned standalone student Library. No mock content or API call yet. */
export function StudentKnowledgeLibrary() {
  return (
    <main className="space-y-6 pb-8">
      <StudentBackLink href="/student">Trang chủ</StudentBackLink>
      <PaperSurface as="section" variant="kraft" tape emphasis="feature" className="space-y-2 p-5 sm:p-7">
        <ScrapbookHeading as="h1" className="student-page-title">Sổ tay kiến thức</ScrapbookHeading>
        <p className="student-body text-muted-foreground">
          Thư viện lý thuyết để đọc lại kiến thức, bao gồm cả bài chưa liên kết Topic.
        </p>
      </PaperSurface>
      <PaperSurface as="section" variant="plain" className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input disabled aria-label="Tìm bài lý thuyết" placeholder="Tìm trong sổ tay..." className="min-h-11 w-full rounded-md border px-3 disabled:opacity-60" />
          <button disabled type="button" className="min-h-11 rounded-md border px-4 opacity-60">Lọc theo Unit</button>
        </div>
        <p role="status" className="student-body text-muted-foreground">
          Thư viện sẽ được kết nối với các bài Published theo khối lớp trong Phase 04. Chưa có dữ liệu giả.
        </p>
      </PaperSurface>
    </main>
  );
}
