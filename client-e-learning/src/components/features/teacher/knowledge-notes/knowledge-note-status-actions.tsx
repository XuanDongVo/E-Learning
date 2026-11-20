"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, BookOpenCheck, BookOpenX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { KnowledgeNote } from "@/types/knowledge-note";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";

type Action = "publish" | "unpublish" | "archive";
const labels: Record<Action, string> = {
  publish: "Công bố", unpublish: "Gỡ công bố", archive: "Lưu trữ",
};
const descriptions: Record<Action, string> = {
  publish: "Bài học sẽ có thể hiển thị cho học sinh khi các điểm đọc được triển khai. Bạn sẽ phải gỡ công bố trước khi sửa nội dung.",
  unpublish: "Bài học sẽ bị ẩn khỏi mọi điểm đọc của học sinh. Nội dung và liên kết Topic vẫn được giữ.",
  archive: "Bài học sẽ được lưu trữ và chỉ đọc. Không có thao tác khôi phục trong phạm vi MVP.",
};

export function KnowledgeNoteStatusActions({
  note, disabled = false,
}: { note: KnowledgeNote; disabled?: boolean }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<Action | null>(null);
  const [pending, setPending] = useState(false);

  const execute = async () => {
    if (!action || pending || disabled) return;
    const selected = action;
    setPending(true);
    try {
      if (selected === "publish") await teacherKnowledgeNoteService.publish(note.id);
      else if (selected === "unpublish") await teacherKnowledgeNoteService.unpublish(note.id);
      else await teacherKnowledgeNoteService.archive(note.id);
      setAction(null);
      await queryClient.invalidateQueries({ queryKey: KNOWLEDGE_NOTE_KEYS.teacherRoot });
      toast.success(`${labels[selected]} thành công.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {["DRAFT", "UNPUBLISHED"].includes(note.status) && (
        <Button type="button" variant="outline" disabled={disabled || pending}
          onClick={() => setAction("publish")}><BookOpenCheck /> Công bố</Button>
      )}
      {note.status === "PUBLISHED" && (
        <Button type="button" variant="outline" disabled={disabled || pending}
          onClick={() => setAction("unpublish")}><BookOpenX /> Gỡ công bố</Button>
      )}
      {note.status !== "ARCHIVED" && (
        <Button type="button" variant="outline" disabled={disabled || pending}
          onClick={() => setAction("archive")}><Archive /> Lưu trữ</Button>
      )}
      <AlertDialog open={Boolean(action)} onOpenChange={open => { if (!open && !pending) setAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action ? `${labels[action]} bài lý thuyết?` : "Xác nhận"}</AlertDialogTitle>
            <AlertDialogDescription>{action ? descriptions[action] : ""}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={pending || disabled} onClick={event => {
              event.preventDefault();
              void execute();
            }}>{pending ? "Đang xử lý…" : action ? labels[action] : "Xác nhận"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
