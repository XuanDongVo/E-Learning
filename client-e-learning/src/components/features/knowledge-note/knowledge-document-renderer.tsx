import type {
  KnowledgeDocument, KnowledgeDocumentMark, KnowledgeDocumentNode,
  KnowledgeLearningSectionRole,
} from "@/types/knowledge-note";
import {
  isLearningKind, LEARNING_BLOCK_LABELS, LEARNING_SECTION_LABELS, normalizeSafeHref,
} from "./knowledge-note-document";

/** Safe, shared JSON renderer for Teacher Preview, Import Preview and templates. */
export function KnowledgeDocumentRenderer({ document, compact = false }: {
  document: KnowledgeDocument; compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3 text-sm leading-6" : "space-y-4 text-[0.98rem] leading-7"}>
      {document.content.map((node,index) => <RenderNode key={index} node={node} compact={compact} />)}
    </div>
  );
}

function RenderNode({ node, compact }: { node: KnowledgeDocumentNode; compact: boolean }) {
  const children = node.content?.map((child,index) =>
    <RenderNode key={index} node={child} compact={compact} />);
  switch (node.type) {
    case "text":
      return <>{renderMarks(node.text ?? "", node.marks ?? [])}</>;
    case "hardBreak":
      return <br />;
    case "paragraph":
      return <p className="whitespace-pre-wrap">{children?.length ? children : "\u00a0"}</p>;
    case "heading":
      return Number(node.attrs?.level) === 3
        ? <h3 id={typeof node.attrs?.id === "string" ? node.attrs.id : undefined} className="pt-2 text-lg font-bold text-foreground">{children}</h3>
        : <h2 id={typeof node.attrs?.id === "string" ? node.attrs.id : undefined} className="pt-3 text-xl font-extrabold text-foreground sm:text-2xl">{children}</h2>;
    case "bulletList":
      return <ul className="ml-5 list-disc space-y-1">{children}</ul>;
    case "orderedList":
      return <ol start={validNumber(node.attrs?.start,1)} className="ml-5 list-decimal space-y-1">{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    case "horizontalRule":
      return <hr className="my-6 border-border" />;
    case "table":
      return (
        <div id={typeof node.attrs?.id === "string" ? node.attrs.id : undefined} className="max-w-full overflow-x-auto rounded-md border border-border" role="region"
          aria-label={node.attrs?.purpose === "comparison" ? "Bảng so sánh" : "Bảng nội dung"} tabIndex={0}>
          <table className="min-w-max w-full border-collapse text-left text-sm">
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr>{children}</tr>;
    case "tableCell":
      return <td colSpan={validNumber(node.attrs?.colspan,1)} rowSpan={validNumber(node.attrs?.rowspan,1)}
        className="min-w-28 border border-border p-3 align-top break-words [&_p]:my-1">{children}</td>;
    case "tableHeader":
      return <th scope="col" colSpan={validNumber(node.attrs?.colspan,1)}
        rowSpan={validNumber(node.attrs?.rowspan,1)}
        className="min-w-28 border border-border bg-muted/40 p-3 font-bold align-top break-words [&_p]:my-1">{children}</th>;
    case "learningBlock": {
      const kind = isLearningKind(node.attrs?.kind) ? node.attrs.kind : "callout";
      const title = typeof node.attrs?.title === "string" && node.attrs.title.trim()
        ? node.attrs.title : LEARNING_BLOCK_LABELS[kind];
      const variant = node.attrs?.variant;
      return (
        <aside className={[
          "rounded-md border-l-4 px-4 py-4",
          kind === "commonMistake" || variant === "warning"
            ? "border-destructive bg-destructive/5"
            : "border-primary bg-primary/5",
        ].join(" ")} data-learning-kind={kind} id={typeof node.attrs?.id === "string" ? node.attrs.id : undefined}>
          <p className="mb-3 text-base font-extrabold text-foreground">{title}</p>
          <div className="space-y-3">{children}</div>
        </aside>
      );
    }
    case "learningSection": {
      const role = node.attrs?.role as KnowledgeLearningSectionRole;
      return (
        <section className="space-y-1.5" data-learning-role={role}>
          <p className="text-xs font-bold text-muted-foreground">
            {LEARNING_SECTION_LABELS[role] ?? String(role ?? "")}
          </p>
          <div className="space-y-2 text-foreground">{children}</div>
        </section>
      );
    }
    default:
      // Unsupported nodes are never interpreted as HTML.
      return null;
  }
}
function validNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value < 20 ? value : fallback;
}
function renderMarks(text: string, marks: KnowledgeDocumentMark[]) {
  return marks.reduce<React.ReactNode>((content, mark, i) => {
    if (mark.type === "bold") return <strong key={i}>{content}</strong>;
    if (mark.type === "italic") return <em key={i}>{content}</em>;
    if (mark.type === "link") {
      const href = normalizeSafeHref(mark.attrs?.href ?? "");
      return href ? (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
          className="font-semibold text-primary underline underline-offset-2">{content}</a>
      ) : content;
    }
    return content;
  }, text);
}
