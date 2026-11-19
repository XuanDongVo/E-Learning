/** T04 — planned inline section in Teacher Topic Detail.
 * Do not mount until linking APIs are implemented in Phase 03.
 */
export function TeacherTopicKnowledgeNotes({ topicId }: { topicId: number }) {
  return (
    <section aria-label="Knowledge Notes liên kết" data-topic-id={topicId} className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Knowledge Notes</h2>
        <button type="button" disabled className="rounded-md border px-3 py-2 text-sm opacity-60">Gắn học liệu</button>
      </div>
      <p className="text-sm text-muted-foreground">
        Phase 03: danh sách Note liên kết, Primary tùy chọn, sắp xếp và gỡ liên kết.
      </p>
    </section>
  );
}
