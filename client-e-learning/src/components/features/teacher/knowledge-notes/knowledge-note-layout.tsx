import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export function TeacherKnowledgeNoteLayout({
  title, description, children,
}: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href="/teacher" className="hover:underline">Tổng quan</Link>
        <span aria-hidden="true">/</span>
        <Link href="/teacher/knowledge-notes" className="hover:underline">Knowledge Notes</Link>
      </nav>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </main>
  );
}

export function KnowledgeNoteFeaturePending({ phase }: { phase: string }) {
  return (
    <div role="status" className="rounded-lg border border-border bg-card p-5 text-sm">
      <p className="font-semibold">Khung tính năng đã được tạo — chưa triển khai nghiệp vụ</p>
      <p className="mt-1 text-muted-foreground">
        {phase}. Chưa có dữ liệu giả, chức năng lưu/công bố chưa được bật.
      </p>
    </div>
  );
}
