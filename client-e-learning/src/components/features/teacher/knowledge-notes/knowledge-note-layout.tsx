import type { ReactNode } from "react";
import { ContentBreadcrumb } from "@/components/features/teacher/content/components/content-breadcrumb";

type Breadcrumb = { label: string; href?: string };

export function TeacherKnowledgeNoteLayout({
  title,
  description,
  children,
  actions,
  breadcrumbs,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
}) {
  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-5">
      <ContentBreadcrumb
        items={
          breadcrumbs ?? [
            { label: "Content", href: "/teacher/content" },
            { label: "Sổ tay kiến thức" },
          ]
        }
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions}
      </div>
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
      {children}
    </div>
  );
}

export function KnowledgeNoteFeaturePending({ phase }: { phase: string }) {
  return (
    <div role="status" className="rounded-lg border border-border bg-card p-5 text-sm">
      <p className="font-semibold">Chức năng đang trong giai đoạn thiết kế</p>
      <p className="mt-1 text-muted-foreground">{phase}. Chưa kết nối API nội dung hoặc công bố.</p>
    </div>
  );
}
