"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { useCreateTeacherKnowledgeNote } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { toAppError } from "@/lib/errors/app-error";
import { gradeService } from "@/services/grade.service";

interface TeacherKnowledgeNoteCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeacherKnowledgeNoteCreateDialog({
  open,
  onOpenChange,
}: TeacherKnowledgeNoteCreateDialogProps) {
  const router = useRouter();
  const gradesQuery = useQuery({ queryKey: ["grades"], queryFn: gradeService.list });
  const createNote = useCreateTeacherKnowledgeNote();
  const grades = gradesQuery.data?.data ?? [];
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const reset = () => {
    setGradeId(null);
    setTitle("");
    setDescription("");
    setValidationError(null);
    createNote.reset();
  };

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && createNote.isPending) return;
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!gradeId) return setValidationError("Chọn khối lớp cho bài lý thuyết.");
    if (!trimmedTitle) return setValidationError("Nhập tiêu đề bài lý thuyết.");
    if (trimmedTitle.length > 200)
      return setValidationError("Tiêu đề không được vượt quá 200 ký tự.");
    if (description.trim().length > 1000)
      return setValidationError("Mô tả không được vượt quá 1000 ký tự.");

    setValidationError(null);
    try {
      const created = await createNote.mutateAsync({
        gradeId,
        title: trimmedTitle,
        description: description.trim() || null,
      });
      if (!created) {
        setValidationError("Server không trả về Knowledge Note vừa tạo.");
        return;
      }
      onOpenChange(false);
      router.push(`/teacher/knowledge-notes/${created.id}/edit`);
    } catch {
      // Keep the form open so the structured API error remains actionable.
    }
  };

  const error = validationError ?? (createNote.error ? toAppError(createNote.error).message : null);

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <form onSubmit={(event) => void submit(event)}>
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Tạo bài lý thuyết</DialogTitle>
            <DialogDescription>
              Tạo thông tin cơ bản, sau đó chuyển thẳng sang Editor để biên soạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-5">
            <div>
              <label htmlFor="knowledge-note-grade" className="mb-1.5 block text-sm font-bold">
                Khối lớp <span className="text-destructive">*</span>
              </label>
              <Select
                value={gradeId ? String(gradeId) : undefined}
                onValueChange={(value) => setGradeId(Number(value))}
                disabled={gradesQuery.isPending || grades.length === 0}
              >
                <SelectTrigger id="knowledge-note-grade" className="h-10">
                  <SelectValue placeholder={gradesQuery.isPending ? "Đang tải khối lớp…" : "Chọn khối lớp"} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.name} ({grade.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="knowledge-note-title" className="mb-1.5 block text-sm font-bold">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <Input
                id="knowledge-note-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                placeholder="Ví dụ: Hiện tại đơn và Hiện tại tiếp diễn"
                className="h-10"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{title.length}/200</p>
            </div>

            <div>
              <label htmlFor="knowledge-note-description" className="mb-1.5 block text-sm font-bold">
                Mô tả <span className="font-normal text-muted-foreground">(tùy chọn)</span>
              </label>
              <Textarea
                id="knowledge-note-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                placeholder="Mô tả ngắn nội dung và mục tiêu của bài…"
                className="min-h-28"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/1000</p>
            </div>

            {gradesQuery.isError ? (
              <p role="alert" className="border-l-4 border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">
                Không thể tải danh sách khối lớp.
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="border-l-4 border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => changeOpen(false)} disabled={createNote.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={createNote.isPending || grades.length === 0}>
              <FilePlus2 /> {createNote.isPending ? "Đang tạo…" : "Tạo và soạn bài"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
