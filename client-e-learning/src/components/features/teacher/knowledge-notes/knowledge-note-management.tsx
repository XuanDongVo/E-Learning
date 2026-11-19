import { TeacherKnowledgeNoteLayout, KnowledgeNoteFeaturePending } from "./knowledge-note-layout";

/** T01 — Teacher library shell, not a live list until Phase 03. */
export function TeacherKnowledgeNoteManagement() {
  return (
    <TeacherKnowledgeNoteLayout title="Knowledge Notes" description="Quản lý học liệu lý thuyết độc lập với Topic.">
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="Tìm Knowledge Note" disabled placeholder="Tìm bài lý thuyết..." className="min-h-10 flex-1 rounded-md border bg-background px-3 text-sm disabled:opacity-60" />
        <button type="button" disabled className="min-h-10 rounded-md border px-4 text-sm opacity-60">Lọc khối lớp</button>
        <button type="button" disabled className="min-h-10 rounded-md border px-4 text-sm opacity-60">+ Tạo mới</button>
      </div>
      <section aria-label="Danh sách Knowledge Note" className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr><th scope="col" className="p-3">Bài viết</th><th scope="col" className="p-3">Khối</th><th scope="col" className="p-3">Topic liên kết</th><th scope="col" className="p-3">Trạng thái</th><th scope="col" className="p-3">Cập nhật</th></tr>
          </thead>
          <tbody><tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Danh sách sẽ kết nối API ở Phase 03.</td></tr></tbody>
        </table>
      </section>
      <KnowledgeNoteFeaturePending phase="Phase 03 — Management, lọc, liên kết và xuất bản"/>
    </TeacherKnowledgeNoteLayout>
  );
}
