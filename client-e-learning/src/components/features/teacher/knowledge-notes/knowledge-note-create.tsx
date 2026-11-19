"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft, FilePlus2, Save } from "lucide-react";
import { toast } from "sonner";
import { gradeService } from "@/services/grade.service";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import { toAppError } from "@/lib/errors/app-error";
import { PageBanner, RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";

export function TeacherKnowledgeNoteCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gradeId, setGradeId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attempted, setAttempted] = useState(false);

  const gradesQuery = useQuery({
    queryKey: ["teacher", "grades", "active"],
    queryFn: async () => {
      const response = await gradeService.list();
      if (!Array.isArray(response.data)) throw new Error("Không thể tải danh sách khối lớp.");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (gradeId === "") throw new Error("Vui lòng chọn khối lớp.");
      const response = await teacherKnowledgeNoteService.create({
        gradeId,
        title: title.trim(),
        description: description.trim() || null,
      });
      if (!response.data) throw new Error("Server không trả về Knowledge Note vừa tạo.");
      return response.data;
    },
    onSuccess: (note) => {
      queryClient.setQueryData(KNOWLEDGE_NOTE_KEYS.teacherDetail(note.id), note);
      void queryClient.invalidateQueries({ queryKey: KNOWLEDGE_NOTE_KEYS.teacherRoot });
      toast.success("Đã tạo bài lý thuyết.");
      router.push(`/teacher/content/knowledge-notes/${note.id}`);
    },
  });

  const titleError = !title.trim()
    ? "Vui lòng nhập tên bài lý thuyết."
    : title.trim().length > 200
      ? "Tên bài không được quá 200 ký tự."
      : null;
  const descriptionError = description.length > 1000
    ? "Mô tả không được quá 1000 ký tự."
    : null;
  const gradeError = gradeId === "" ? "Vui lòng chọn khối lớp." : null;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (titleError || gradeError || descriptionError || createMutation.isPending) return;
    createMutation.mutate();
  };

  return (
    <TeacherKnowledgeNoteLayout
      title="Tạo bài lý thuyết"
      description="Khởi tạo một Knowledge Note độc lập. Bạn có thể bổ sung nội dung sau khi giao diện Editor được hoàn thiện."
      breadcrumbs={[
        { label: "Content", href: "/teacher/content" },
        { label: "Sổ tay kiến thức", href: "/teacher/content/knowledge-notes" },
        { label: "Tạo mới" },
      ]}
      actions={
        <Link
          href="/teacher/content/knowledge-notes"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>
      }
    >
      {gradesQuery.isPending && <RegionState variant="loading" title="Đang tải khối lớp" />}
      {gradesQuery.isError && (
        <RegionState
          variant="error"
          title="Không tải được khối lớp"
          description={toAppError(gradesQuery.error).message}
          action={<Button type="button" variant="outline" onClick={() => void gradesQuery.refetch()}>Thử lại</Button>}
        />
      )}
      {gradesQuery.isSuccess && gradesQuery.data.length === 0 && (
        <RegionState variant="empty" title="Chưa có khối lớp đang hoạt động" description="Cần tạo hoặc kích hoạt khối lớp trước khi thêm bài lý thuyết." />
      )}

      {gradesQuery.isSuccess && gradesQuery.data.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <form
            noValidate
            onSubmit={submit}
            className="min-w-0 space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FilePlus2 className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Thông tin bài lý thuyết</h2>
            </div>
            {createMutation.isError && (
              <PageBanner tone="error" message={toAppError(createMutation.error).message} />
            )}
            <fieldset disabled={createMutation.isPending} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="knowledge-grade" className="block text-sm font-semibold">
                  Khối lớp <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <select
                  id="knowledge-grade"
                  required
                  value={gradeId}
                  aria-invalid={attempted && Boolean(gradeError)}
                  aria-describedby={attempted && gradeError ? "knowledge-grade-error" : undefined}
                  onChange={(event) => { setGradeId(event.target.value ? Number(event.target.value) : ""); createMutation.reset(); }}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Chọn khối lớp</option>
                  {gradesQuery.data.map((grade) => (
                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                  ))}
                </select>
                {attempted && gradeError && <p id="knowledge-grade-error" className="text-xs text-destructive">{gradeError}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="knowledge-title" className="block text-sm font-semibold">
                  Tên bài <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <Input
                  id="knowledge-title"
                  required
                  maxLength={200}
                  autoFocus
                  placeholder="Ví dụ: Hiện tại đơn và Hiện tại tiếp diễn"
                  className="h-10"
                  value={title}
                  aria-invalid={attempted && Boolean(titleError)}
                  aria-describedby={attempted && titleError ? "knowledge-title-error" : undefined}
                  onChange={(event) => { setTitle(event.target.value); createMutation.reset(); }}
                />
                {attempted && titleError && <p id="knowledge-title-error" className="text-xs text-destructive">{titleError}</p>}
                <p className="text-right text-xs text-muted-foreground">{title.length}/200</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="knowledge-description" className="block text-sm font-semibold">
                  Mô tả <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
                </label>
                <textarea
                  id="knowledge-description"
                  rows={4}
                  maxLength={1000}
                  value={description}
                  aria-invalid={attempted && Boolean(descriptionError)}
                  aria-describedby={attempted && descriptionError ? "knowledge-description-error" : undefined}
                  onChange={(event) => { setDescription(event.target.value); createMutation.reset(); }}
                  placeholder="Giới thiệu ngắn gọn nội dung kiến thức..."
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                {attempted && descriptionError && <p id="knowledge-description-error" className="text-xs text-destructive">{descriptionError}</p>}
                <p className="text-right text-xs text-muted-foreground">{description.length}/1000</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <Link
                  href="/teacher/content/knowledge-notes"
                  className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted"
                >
                  Hủy
                </Link>
                <Button type="submit" disabled={createMutation.isPending} className="min-h-10 gap-2 px-4">
                  <Save className="size-4" aria-hidden="true" />
                  {createMutation.isPending ? "Đang tạo..." : "Tạo bài lý thuyết"}
                </Button>
              </div>
            </fieldset>
          </form>
          <aside className="h-fit space-y-2 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Sau khi tạo bài</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Bài mới được lưu với trạng thái <strong>Draft</strong> và chưa xuất hiện trong thư viện của học sinh.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tính năng soạn nội dung, xem trước và công bố sẽ được mở sau khi duyệt thiết kế Editor.
            </p>
          </aside>
        </div>
      )}
    </TeacherKnowledgeNoteLayout>
  );
}
