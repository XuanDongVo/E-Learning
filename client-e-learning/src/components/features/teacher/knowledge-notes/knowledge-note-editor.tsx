import { TeacherKnowledgeNoteLayout, KnowledgeNoteFeaturePending } from "./knowledge-note-layout";
import { TeacherKnowledgeNotePreview } from "./knowledge-note-preview";

/** T02 — Word-like document canvas shell, no fake editor or fake save. */
export function TeacherKnowledgeNoteEditor({ noteId }: { noteId?: number }) {
  return (
    <TeacherKnowledgeNoteLayout
      title={noteId === undefined ? "Tạo Knowledge Note" : "Chỉnh sửa Knowledge Note"}
      description="Editor dạng tài liệu, kèm các learning block. Không có Category hoặc Media trong MVP."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card p-3">
        <span className="text-sm text-muted-foreground">Chưa lưu • Chức năng đang phát triển</span>
        <div className="flex gap-2">
          <button type="button" disabled className="rounded-md border px-3 py-2 text-sm opacity-60">Lưu nháp</button>
          <button type="button" disabled className="rounded-md border px-3 py-2 text-sm opacity-60">Xem trước</button>
          <button type="button" disabled className="rounded-md border px-3 py-2 text-sm opacity-60">Công bố</button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section aria-label="Document editor" className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1 rounded-md border bg-card p-2 text-sm" aria-label="Formatting toolbar">
            {["Đoạn văn", "H2", "H3", "B", "I", "Danh sách", "Công thức", "Ví dụ", "So sánh", "Lưu ý", "Lỗi thường gặp"].map(item => (
              <button key={item} disabled type="button" className="rounded border px-2 py-1 opacity-60">{item}</button>
            ))}
          </div>
          <div className="mx-auto min-h-[400px] max-w-[820px] rounded-lg border bg-card p-6 sm:p-10">
            <p className="mb-6 text-2xl font-semibold text-foreground">Nội dung Knowledge Note</p>
            <div className="rounded-md border border-dashed p-4 text-muted-foreground">
              Vùng soạn thảo Word-like sẽ được tích hợp tại Phase 02. Không dùng textarea cho từng đoạn.
            </div>
          </div>
          <KnowledgeNoteFeaturePending phase="Phase 02 — Rich-text engine, JSON schema, Quick Summary & Learning Blocks"/>
        </section>
        <aside aria-label="Knowledge Note settings" className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Thông tin học liệu</h2>
          <p className="text-sm text-muted-foreground">Grade • Title • Description</p>
          <h3 className="pt-3 font-semibold">Topic liên kết</h3>
          <p className="text-sm text-muted-foreground">Tùy chọn. Một Note có thể dùng tại nhiều Topic.</p>
          <button type="button" disabled className="rounded-md border px-3 py-2 text-sm opacity-60">Quản lý liên kết</button>
        </aside>
      </div>
      <details className="rounded-md border p-4">
        <summary className="cursor-pointer font-semibold">Khung chế độ Student Preview</summary>
        <div className="mt-4"><TeacherKnowledgeNotePreview /></div>
      </details>
    </TeacherKnowledgeNoteLayout>
  );
}
