"use client";

<<<<<<< HEAD
import { ArrowLeft, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTeacherKnowledgeNote } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { formatDateTime } from "@/utils/format";
import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import { cn } from "@/lib/utils";

export function TeacherKnowledgeNoteDetail({ noteId }: { noteId: number }) {
  const noteQuery = useTeacherKnowledgeNote(noteId);
  const note = noteQuery.data;

  if (noteQuery.isPending) return <DetailState title="Đang tải bài lý thuyết…" />;
  if (noteQuery.isError || !note) return <DetailState title="Không thể tải bài lý thuyết" action={<Button type="button" variant="outline" onClick={() => noteQuery.refetch()}>Thử lại</Button>} />;

  return (
    <TeacherKnowledgeNoteLayout title={note.title} description={note.description || "Bài lý thuyết chưa có mô tả."}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Link href="/teacher/knowledge-notes" className={buttonVariants({ variant: "ghost" })}><ArrowLeft /> Danh sách</Link>
        <Link href={`/teacher/knowledge-notes/${note.id}/edit`} className={cn(buttonVariants(), "ml-auto")}><Pencil /> Mở Editor</Link>
      </div>
      <dl className="grid border border-border bg-card sm:grid-cols-2 lg:grid-cols-4" aria-label="Thông tin bài lý thuyết">
        <Metadata label="Trạng thái" value={note.status} />
        <Metadata label="Grade ID" value={String(note.gradeId)} />
        <Metadata label="Topic liên kết" value={String(note.linkedTopicCount)} />
        <Metadata label="Cập nhật" value={formatDateTime(note.updatedAt, "vi-VN")} />
      </dl>
      <div className="border border-dashed border-border bg-card p-7 text-center">
        <h2 className="font-extrabold">Nội dung chưa có API đọc</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Phase 02.2 cho phép thiết kế nội dung trong phiên Editor và xem trước bằng state client. Nội dung này chưa được tải hoặc lưu từ server cho đến Phase 02.3.</p>
        <Link href={`/teacher/knowledge-notes/${note.id}/edit`} className={cn(buttonVariants(), "mt-4")}><Pencil /> Bắt đầu soạn</Link>
=======
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpenText, CalendarClock, FileText, Layers3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTeacherKnowledgeNote } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { gradeService } from "@/services/grade.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import { toAppError } from "@/lib/errors/app-error";
import type { KnowledgeNoteStatus } from "@/types/knowledge-note";
import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";

const statusLabels: Record<KnowledgeNoteStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã công bố",
  UNPUBLISHED: "Đã ẩn",
  ARCHIVED: "Lưu trữ",
};

function dateLabel(value: string | null) {
  if (!value) return "Chưa có";
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  return match
    ? match[3] + "/" + match[2] + "/" + match[1] + " " + match[4] + ":" + match[5]
    : "Không xác định";
}

export function TeacherKnowledgeNoteDetail({ noteId }: { noteId: number }) {
  const noteQuery = useTeacherKnowledgeNote(noteId);
  const gradesQuery = useQuery({
    queryKey: ["teacher", "grades", "active"],
    queryFn: async () => {
      const response = await gradeService.list();
      if (!Array.isArray(response.data)) throw new Error("Không thể tải thông tin khối lớp.");
      return response.data;
    },
    enabled: Number.isSafeInteger(noteId) && noteId > 0,
  });

  const note = noteQuery.data;
  const gradeName = gradesQuery.data?.find((grade) => grade.id === note?.gradeId)?.name;

  const breadcrumbs = [
    { label: "Content", href: "/teacher/content" },
    { label: "Sổ tay kiến thức", href: "/teacher/content/knowledge-notes" },
    { label: note?.title || "Chi tiết bài lý thuyết" },
  ];

  const actions = (
    <Link
      href="/teacher/content/knowledge-notes"
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Quay lại danh sách
    </Link>
  );

  if (!Number.isSafeInteger(noteId) || noteId <= 0) {
    return (
      <TeacherKnowledgeNoteLayout title="Không tìm thấy bài lý thuyết" description="Mã bài không hợp lệ." breadcrumbs={breadcrumbs} actions={actions}>
        <RegionState variant="error" title="Đường dẫn không hợp lệ" />
      </TeacherKnowledgeNoteLayout>
    );
  }

  if (noteQuery.isPending) {
    return (
      <TeacherKnowledgeNoteLayout title="Chi tiết bài lý thuyết" description="Đang tải thông tin..." breadcrumbs={breadcrumbs}>
        <RegionState variant="loading" title="Đang tải Knowledge Note" />
      </TeacherKnowledgeNoteLayout>
    );
  }

  if (noteQuery.isError || !note) {
    return (
      <TeacherKnowledgeNoteLayout title="Không tải được bài lý thuyết" description="Không thể lấy thông tin bài." breadcrumbs={breadcrumbs} actions={actions}>
        <RegionState
          variant="error"
          title="Không thể mở Knowledge Note"
          description={toAppError(noteQuery.error).message}
          action={<Button type="button" variant="outline" onClick={() => void noteQuery.refetch()}>Thử lại</Button>}
        />
      </TeacherKnowledgeNoteLayout>
    );
  }

  return (
    <TeacherKnowledgeNoteLayout
      title={note.title}
      description="Thông tin bài lý thuyết và trạng thái quản lý."
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6" aria-labelledby="knowledge-metadata-title">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <h2 id="knowledge-metadata-title" className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-5 text-primary" aria-hidden="true" />
              Thông tin cơ bản
            </h2>
            <StatusBadge status={note.status} label={statusLabels[note.status]} />
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tên bài</dt>
              <dd className="mt-1 break-words text-base font-semibold">{note.title}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Khối lớp</dt>
              <dd className="mt-1 text-sm">{gradeName ?? `ID ${note.gradeId}`}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic đã liên kết</dt>
              <dd className="mt-1 text-sm tabular-nums">{note.linkedTopicCount}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mô tả</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                {note.description || "Chưa có mô tả."}
              </dd>
            </div>
          </dl>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpenText className="size-4" aria-hidden="true" />
              Nội dung bài lý thuyết
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Nội dung chưa được kết nối trong giai đoạn này. Word-like Editor, Quick Summary và Publish sẽ được triển khai sau khi duyệt thiết kế giao diện.
            </p>
          </div>
        </section>

        <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-5" aria-label="Thông tin quản lý">
          <h2 className="font-semibold">Thông tin quản lý</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Layers3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>Knowledge Note #{note.id}</span>
            </div>
            <div className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div><p className="text-muted-foreground">Ngày tạo</p><p>{dateLabel(note.createdAt)}</p></div>
            </div>
            <div className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div><p className="text-muted-foreground">Cập nhật gần nhất</p><p>{dateLabel(note.updatedAt)}</p></div>
            </div>
            {note.publishedAt && (
              <div><p className="text-muted-foreground">Đã công bố</p><p>{dateLabel(note.publishedAt)}</p></div>
            )}
          </div>
          {note.status === "DRAFT" && (
            <p className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              Bản nháp chưa hiển thị với học sinh. Chức năng công bố hiện chưa mở.
            </p>
          )}
        </aside>
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
      </div>
    </TeacherKnowledgeNoteLayout>
  );
}
<<<<<<< HEAD

function Metadata({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><dt className="text-xs font-bold text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold text-foreground">{value}</dd></div>;
}

function DetailState({ title, action }: { title: string; action?: React.ReactNode }) {
  return <TeacherKnowledgeNoteLayout title="Knowledge Notes" description="Chi tiết metadata"><div className="border border-dashed border-border bg-card p-8 text-center"><p className="font-extrabold">{title}</p>{action ? <div className="mt-4">{action}</div> : null}</div></TeacherKnowledgeNoteLayout>;
}
=======
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
