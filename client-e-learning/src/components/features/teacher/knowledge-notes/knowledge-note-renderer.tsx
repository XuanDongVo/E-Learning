import type {
  KnowledgeDocument,
  KnowledgeDocumentMark,
  KnowledgeDocumentNode,
  KnowledgeLearningBlockKind,
} from "@/types/knowledge-note";
import { LEARNING_BLOCK_LABELS, normalizeSafeHref } from "./knowledge-note-document";

export function KnowledgeNoteRenderer({
  document,
  compact = false,
}: {
  document: KnowledgeDocument;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3 text-sm leading-6" : "space-y-5 text-[0.98rem] leading-7"}>
      {document.content.map((node, index) => (
        <RenderNode key={`${node.type}-${index}`} node={node} compact={compact} />
      ))}
    </div>
  );
}

function RenderNode({ node, compact }: { node: KnowledgeDocumentNode; compact: boolean }) {
  const children = node.content?.map((child, index) => (
    <RenderNode key={`${child.type}-${index}`} node={child} compact={compact} />
  ));

  switch (node.type) {
    case "text":
      return <>{applyMarks(node.text ?? "", node.marks ?? [])}</>;
    case "paragraph":
      return <p>{children || <br />}</p>;
    case "heading": {
      const level = Number(node.attrs?.level) === 3 ? 3 : 2;
      return level === 3 ? (
        <h3 className="pt-2 text-lg font-bold text-foreground">{children}</h3>
      ) : (
        <h2 className="pt-3 text-xl font-extrabold text-foreground sm:text-2xl">{children}</h2>
      );
    }
    case "bulletList":
      return <ul className="ml-5 list-disc space-y-1">{children}</ul>;
    case "orderedList":
      return <ol className="ml-5 list-decimal space-y-1">{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    case "horizontalRule":
      return <hr className="my-6 border-border" />;
    case "learningBlock":
      return <LearningBlockPreview attrs={node.attrs ?? {}} compact={compact} />;
    default:
      return <>{children}</>;
  }
}

function applyMarks(text: string, marks: KnowledgeDocumentMark[]) {
  return marks.reduce<React.ReactNode>((content, mark, index) => {
    if (mark.type === "bold") return <strong key={index}>{content}</strong>;
    if (mark.type === "italic") return <em key={index}>{content}</em>;
    if (mark.type === "link") {
      const href = normalizeSafeHref(mark.attrs?.href ?? "");
      return href ? (
        <a key={index} href={href} target="_blank" rel="noreferrer noopener" className="font-semibold text-primary underline underline-offset-2">
          {content}
        </a>
      ) : content;
    }
    return content;
  }, text);
}

function LearningBlockPreview({
  attrs,
  compact,
}: {
  attrs: Record<string, string | number | boolean | null>;
  compact: boolean;
}) {
  const kind = isLearningBlockKind(attrs.kind) ? attrs.kind : "callout";
  const title = String(attrs.title || LEARNING_BLOCK_LABELS[kind]);
  const body = String(attrs.body || "");
  const secondary = String(attrs.secondary || "");

  if (kind === "comparison") {
    return (
      <div className="overflow-x-auto border border-border bg-muted/20">
        <table className="min-w-[32rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-1/2 p-3 font-bold">{String(attrs.leftTitle || "Nội dung A")}</th>
              <th className="w-1/2 border-l border-border p-3 font-bold">{String(attrs.rightTitle || "Nội dung B")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="whitespace-pre-wrap p-3 align-top">{body}</td>
              <td className="whitespace-pre-wrap border-l border-border p-3 align-top">{secondary}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <aside className={`border-l-4 px-4 py-3 ${kind === "commonMistake" ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}`}>
      <p className="mb-1 text-sm font-extrabold text-foreground">{title}</p>
      <p className="whitespace-pre-wrap text-muted-foreground">{body || (compact ? "Chưa có nội dung." : "Nhập nội dung cho khối này.")}</p>
      {secondary ? <p className="mt-2 whitespace-pre-wrap text-foreground">{secondary}</p> : null}
    </aside>
  );
}

function isLearningBlockKind(value: unknown): value is KnowledgeLearningBlockKind {
  return typeof value === "string" && value in LEARNING_BLOCK_LABELS;
}
