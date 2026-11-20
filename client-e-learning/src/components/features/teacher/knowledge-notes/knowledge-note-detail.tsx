"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTeacherKnowledgeNote } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { formatDateTime } from "@/utils/format";
// import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import { cn } from "@/lib/utils";

export function TeacherKnowledgeNoteDetail({ noteId }: { noteId: number }) {
  const noteQuery = useTeacherKnowledgeNote(noteId);
  const note = noteQuery.data;

  if (noteQuery.isPending)
    return <DetailState title="Đang tải bài lý thuyết…" />;
  if (noteQuery.isError || !note)
    return (
      <DetailState
        title="Không thể tải bài lý thuyết"
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

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Link
          href="/teacher/knowledge-notes"
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft /> Danh sách
        </Link>
        <Link
          href={`/teacher/knowledge-notes/${note.id}/edit`}
          className={cn(buttonVariants(), "ml-auto")}
        >
          <Pencil /> Mở Editor
        </Link>
      </div>
      <dl
        className="grid border border-border bg-card sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Thông tin bài lý thuyết"
      >
        <Metadata label="Trạng thái" value={note.status} />
        <Metadata label="Grade ID" value={String(note.gradeId)} />
        <Metadata
          label="Topic liên kết"
          value={String(note.linkedTopicCount)}
        />
        <Metadata
          label="Cập nhật"
          value={formatDateTime(note.updatedAt, "vi-VN")}
        />
      </dl>
      <div className="border border-dashed border-border bg-card p-7 text-center">
        <h2 className="font-extrabold">Nội dung chưa có API đọc</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Phase 02.2 cho phép thiết kế nội dung trong phiên Editor và xem trước
          bằng state client. Nội dung này chưa được tải hoặc lưu từ server cho
          đến Phase 02.3.
        </p>
        <Link
          href={`/teacher/knowledge-notes/${note.id}/edit`}
          className={cn(buttonVariants(), "mt-4")}
        >
          <Pencil /> Bắt đầu soạn
        </Link>
      </div>
    </>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function DetailState({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div className="border border-dashed border-border bg-card p-8 text-center">
        <p className="font-extrabold">{title}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </>
  );
}
