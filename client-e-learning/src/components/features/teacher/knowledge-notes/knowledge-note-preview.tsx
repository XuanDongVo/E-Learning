import { KnowledgeNoteFeaturePending } from "./knowledge-note-layout";

/** T03 — Preview is an editor mode, NOT a separate page. */
export function TeacherKnowledgeNotePreview() {
  return (
    <section aria-label="Student Preview" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button disabled type="button" className="rounded-md border px-3 py-2 text-sm opacity-60">Full Article</button>
        <button disabled type="button" className="rounded-md border px-3 py-2 text-sm opacity-60">Quick Summary</button>
        <button disabled type="button" className="rounded-md border px-3 py-2 text-sm opacity-60">Mobile / Desktop</button>
      </div>
      <KnowledgeNoteFeaturePending phase="Phase 03 — Student renderer preview & publish validation"/>
    </section>
  );
}
