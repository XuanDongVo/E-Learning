"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, BookOpen, ExternalLink, Link2, Plus, Search, Unlink2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RegionState } from "@/components/feedback";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import type { TopicKnowledgeNoteLink } from "@/types/knowledge-note";

type Role = "primary" | "supplementary";

const stateLabels = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã công bố",
  UNPUBLISHED: "Đã gỡ công bố",
  ARCHIVED: "Đã lưu trữ",
} as const;

export function TeacherTopicKnowledgeNotes({
  topicId, gradeId, disabled = false,
}: {
  topicId: number;
  gradeId: number;
  disabled?: boolean;
}) {
  const client = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [role, setRole] = useState<Role>("supplementary");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [unlinkTarget, setUnlinkTarget] = useState<TopicKnowledgeNoteLink | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const linksQuery = useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.topicLinks(topicId),
    queryFn: async () => (await teacherKnowledgeNoteService.listTopicLinks(topicId)).data,
    enabled: Number.isSafeInteger(topicId) && topicId > 0,
  });
  const candidatesQuery = useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList({
      gradeId, status: "PUBLISHED", search: debouncedSearch, page, size: 20,
    }),
    queryFn: async () => (await teacherKnowledgeNoteService.list({
      gradeId, status: "PUBLISHED", search: debouncedSearch, page, size: 20,
    })).data,
    enabled: pickerOpen && gradeId > 0,
  });

  const links = linksQuery.data ?? [];
  const primary = links.find(link => link.primary) ?? null;
  const supplementary = links.filter(link => !link.primary);
  const linkedIds = useMemo(() => new Set(links.map(link => link.noteId)), [links]);

  const refreshLinks = (items: TopicKnowledgeNoteLink[] | null) => {
    if (items) client.setQueryData(KNOWLEDGE_NOTE_KEYS.topicLinks(topicId), items);
    void client.invalidateQueries({ queryKey: KNOWLEDGE_NOTE_KEYS.teacherRoot });
  };
  const link = useMutation({
    mutationFn: ({ noteId, primary }: { noteId: number; primary: boolean }) =>
      teacherKnowledgeNoteService.linkTopicNote(topicId, noteId, primary),
    onSuccess: result => {
      refreshLinks(result.data);
      setPickerOpen(false);
      toast.success("Đã cập nhật liên kết bài lý thuyết.");
    },
    onError: cause => toast.error(cause instanceof Error ? cause.message : "Không thể liên kết bài lý thuyết."),
  });
  const unlink = useMutation({
    mutationFn: (noteId: number) => teacherKnowledgeNoteService.unlinkTopicNote(topicId, noteId),
    onSuccess: result => {
      refreshLinks(result.data);
      setUnlinkTarget(null);
      toast.success("Đã gỡ liên kết. Bài lý thuyết gốc vẫn được giữ.");
    },
    onError: cause => toast.error(cause instanceof Error ? cause.message : "Không thể gỡ liên kết."),
  });
  const reorder = useMutation({
    mutationFn: (ids: number[]) => teacherKnowledgeNoteService.reorderTopicSupplementary(topicId, ids),
    onSuccess: result => refreshLinks(result.data),
    onError: cause => toast.error(cause instanceof Error ? cause.message : "Không thể sắp xếp tài liệu."),
  });
  const pending = link.isPending || unlink.isPending || reorder.isPending;

  const openPicker = (nextRole: Role) => {
    setRole(nextRole);
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setPickerOpen(true);
  };
  const moveSupplementary = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= supplementary.length) return;
    const ids = supplementary.map(item => item.noteId);
    [ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]];
    reorder.mutate(ids);
  };
  const renderLink = (item: TopicKnowledgeNoteLink, index?: number) => (
    <div key={item.noteId} className="rounded-lg border-2 border-ink bg-background p-3 shadow-pop sm:p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">
          {item.primary ? "Primary · Bài chính" : "Supplementary · Bổ sung"}
        </span>
        <span className={item.status === "PUBLISHED"
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-amber-700 dark:text-amber-400"}>
          {stateLabels[item.status]}
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href={`/teacher/knowledge-notes/${item.noteId}`}
            className="break-words font-bold text-foreground hover:text-primary hover:underline">
            {item.title} <ExternalLink className="inline size-3.5" />
          </Link>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          )}
          {item.status !== "PUBLISHED" && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Liên kết còn lưu nhưng bài tạm ẩn với học sinh.
            </p>
          )}
        </div>
        {!disabled && (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {!item.primary && item.status === "PUBLISHED" && (
              <Button type="button" size="sm" variant="outline" disabled={pending}
                onClick={() => link.mutate({ noteId: item.noteId, primary: true })}>
                Đặt làm chính
              </Button>
            )}
            {index !== undefined && (
              <>
                <Button type="button" size="icon" variant="outline" aria-label={`Đưa ${item.title} lên`}
                  disabled={pending || index === 0} onClick={() => moveSupplementary(index, -1)}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" aria-label={`Đưa ${item.title} xuống`}
                  disabled={pending || index === supplementary.length - 1}
                  onClick={() => moveSupplementary(index, 1)}>
                  <ArrowDown className="size-4" />
                </Button>
              </>
            )}
            <Button type="button" size="icon" variant="outline"
              aria-label={`Gỡ liên kết ${item.title}`} disabled={pending}
              onClick={() => setUnlinkTarget(item)}>
              <Unlink2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section aria-label="Kiến thức liên kết" className="rounded-lg border-2 border-ink bg-card p-4 shadow-pop sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="size-5" />
            <h2 className="text-lg font-extrabold text-foreground">Bài lý thuyết của Topic</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gắn học liệu dùng chung theo đúng Grade. Gỡ liên kết không xóa bài gốc.
          </p>
        </div>
        <Link href="/teacher/knowledge-notes"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border-2 border-ink bg-background px-3 text-sm font-semibold hover:bg-muted">
          <BookOpen className="size-4" /> Thư viện Teacher
        </Link>
      </div>

      {linksQuery.isPending ? (
        <div className="mt-5"><RegionState variant="loading" description="Đang tải các liên kết…" /></div>
      ) : linksQuery.isError ? (
        <div className="mt-5"><RegionState variant="error"
          description="Không thể lấy danh sách bài lý thuyết."
          action={<Button variant="outline" onClick={() => void linksQuery.refetch()}>Thử lại</Button>} /></div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold">Bài lý thuyết chính</h3>
                <p className="text-xs text-muted-foreground">Tối đa một bài Primary cho Topic</p>
              </div>
              {!disabled && (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => openPicker("primary")}>
                  <Link2 className="size-4" /> {primary ? "Thay đổi bài chính" : "Gắn bài chính"}
                </Button>
              )}
            </div>
            {primary ? renderLink(primary) : (
              <p className="rounded-lg border-2 border-dashed border-ink/50 p-4 text-sm text-muted-foreground">
                Chưa có bài lý thuyết chính. Chọn một bài đã công bố để học sinh đọc trước khi luyện tập.
              </p>
            )}
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold">Tài liệu bổ sung ({supplementary.length})</h3>
                <p className="text-xs text-muted-foreground">Có thể dùng chung một bài với nhiều Topic</p>
              </div>
              {!disabled && (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => openPicker("supplementary")}>
                  <Plus className="size-4" /> Thêm tài liệu
                </Button>
              )}
            </div>
            {supplementary.length
              ? supplementary.map((item, i) => renderLink(item, i))
              : <p className="rounded-lg border-2 border-dashed border-ink/50 p-4 text-sm text-muted-foreground">
                  Chưa có tài liệu bổ sung.
                </p>}
          </div>
        </div>
      )}

      <Dialog open={pickerOpen} onOpenChange={open => { if (!pending) setPickerOpen(open); }}>
        <DialogContent className="flex max-h-[90dvh] flex-col border-2 border-ink bg-card shadow-pop sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn Knowledge Note</DialogTitle>
            <DialogDescription>
              {role === "primary" ? "Chọn bài lý thuyết chính" : "Thêm tài liệu bổ sung"} ·
              chỉ hiển thị bài đã công bố thuộc cùng Grade.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 space-y-3 overflow-y-auto py-1">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input aria-label="Tìm Knowledge Note" placeholder="Tìm tiêu đề hoặc mô tả…"
                className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {candidatesQuery.isPending ? (
              <RegionState variant="loading" description="Đang tìm bài lý thuyết…" />
            ) : candidatesQuery.isError ? (
              <RegionState variant="error" description="Không tải được bài lý thuyết."
                action={<Button variant="outline" onClick={() => void candidatesQuery.refetch()}>Thử lại</Button>} />
            ) : !candidatesQuery.data?.items.length ? (
              <div className="rounded-lg border-2 border-dashed border-ink/50 p-5 text-sm text-muted-foreground">
                Không tìm thấy bài đã công bố phù hợp. Hãy công bố bài trong thư viện trước.
              </div>
            ) : (
              <div className="space-y-2">
                {candidatesQuery.data.items.map(note => (
                  <div key={note.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-ink bg-background p-3 shadow-pop">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{note.title}</p>
                      {note.description && <p className="line-clamp-1 text-xs text-muted-foreground">{note.description}</p>}
                      {linkedIds.has(note.id) && <p className="mt-1 text-xs font-medium text-primary">Đã liên kết với Topic</p>}
                    </div>
                    <Button type="button" size="sm" disabled={pending || linkedIds.has(note.id)}
                      onClick={() => link.mutate({ noteId: note.id, primary: role === "primary" })}>
                      {linkedIds.has(note.id) ? "Đã gắn" : "Chọn"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {candidatesQuery.data && candidatesQuery.data.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2">
                <Button type="button" size="sm" variant="outline" disabled={page <= 1}
                  onClick={() => setPage(value => value - 1)}>Trang trước</Button>
                <span className="text-xs text-muted-foreground">Trang {page}/{candidatesQuery.data.totalPages}</span>
                <Button type="button" size="sm" variant="outline"
                  disabled={page >= candidatesQuery.data.totalPages}
                  onClick={() => setPage(value => value + 1)}>Trang sau</Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setPickerOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(unlinkTarget)}
        onOpenChange={open => { if (!open && !pending) setUnlinkTarget(null); }}>
        <AlertDialogContent className="border-2 border-ink bg-card shadow-pop">
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ liên kết bài lý thuyết?</AlertDialogTitle>
            <AlertDialogDescription>
              {unlinkTarget?.title} sẽ không còn liên kết với Topic này.
              Bài gốc và các liên kết đến Topic khác vẫn được giữ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={event => {
              event.preventDefault();
              if (unlinkTarget) unlink.mutate(unlinkTarget.noteId);
            }}>
              {pending ? "Đang gỡ…" : "Gỡ liên kết"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
