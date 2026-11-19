import type { KnowledgeDocument } from "@/types/knowledge-note";

/** Renderer boundary: Phase 02 must allowlist JSON nodes/marks before rendering.
 * Do not dangerouslySetInnerHTML or interpret arbitrary node attributes.
 */
export function KnowledgeDocumentRenderer({ document }: { document: KnowledgeDocument }) {
  void document;
  return (
    <p role="status" className="text-sm text-muted-foreground">
      Trình hiển thị tài liệu sẽ được triển khai cùng bộ schema block ở Phase 02.
    </p>
  );
}
