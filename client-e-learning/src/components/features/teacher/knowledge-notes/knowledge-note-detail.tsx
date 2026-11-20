"use client";

import { ArrowLeft, ArrowRight, BookOpen, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTeacherKnowledgeNote } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { formatDateTime } from "@/utils/format";
// import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import { cn } from "@/lib/utils";
import { KnowledgeNoteStatusActions } from "./knowledge-note-status-actions";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";

export function TeacherKnowledgeNoteDetail({ noteId }: { noteId: number }) {
  const noteQuery = useTeacherKnowledgeNote(noteId);
  const note = noteQuery.data;
  const topicsQuery = useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.linkedTopics(noteId),
    queryFn: async () => (await teacherKnowledgeNoteService.listLinkedTopics(noteId)).data,
    enabled: Boolean(note),
  });

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
        <KnowledgeNoteStatusActions note={note} />
      </div>
      <dl
        className="grid overflow-hidden rounded-lg border-2 border-ink bg-card shadow-pop sm:grid-cols-2 lg:grid-cols-4"
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
      <section className="mt-5 rounded-lg border-2 border-ink bg-card p-4 shadow-pop sm:p-5"
        aria-label="Các Topic đang sử dụng bài lý thuyết">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold">Topic đang sử dụng</h2>
          <span className="text-xs text-muted-foreground">({topicsQuery.data?.length ?? note.linkedTopicCount})</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Liên kết được quản lý tại Teacher Content → Topic. Một bài có thể được sử dụng ở nhiều Topic.
        </p>
        {topicsQuery.isPending ? (
          <p className="mt-4 text-sm text-muted-foreground">Đang tải liên kết…</p>
        ) : topicsQuery.isError ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-destructive">Không thể tải các Topic liên kết.</span>
            <Button size="sm" variant="outline" onClick={() => void topicsQuery.refetch()}>Thử lại</Button>
          </div>
        ) : !topicsQuery.data?.length ? (
          <p className="mt-4 rounded-lg border-2 border-dashed border-ink/50 p-4 text-sm text-muted-foreground">
            Bài lý thuyết chưa được gắn vào Topic nào. Mở một Topic trong Content để liên kết.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {topicsQuery.data.map(topic => (
              <Link key={topic.topicId} href={`/teacher/content/topics/${topic.topicId}`}
                className="flex flex-col gap-2 rounded-lg border-2 border-ink bg-background p-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{topic.topicName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {topic.unitName} / {topic.sectionName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {topic.primary ? "Primary · Bài chính" : "Supplementary · Bổ sung"}
                    {topic.topicStatus === "ARCHIVED" ? " · Topic đã lưu trữ" : ""}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
      <div className="mt-5 rounded-lg border-2 border-ink bg-card p-7 text-center shadow-pop">
        <h2 className="font-extrabold">Nội dung được lưu trên server</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Mở Editor để biên soạn bài đầy đủ và đánh dấu các khối kiến thức trọng tâm.
          Bản nháp được lưu tự động; bài đã công bố chỉ đọc cho đến khi gỡ công bố.
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
      <div className="rounded-lg border-2 border-ink bg-card p-8 text-center shadow-pop">
        <p className="font-extrabold">{title}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </>
  );
}
