"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Check, LayoutTemplate, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KnowledgeDocumentNode } from "@/types/knowledge-note";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";
import { KNOWLEDGE_TEMPLATES } from "./knowledge-note-templates";
import { KnowledgeNoteWorkspaceDialog } from "./knowledge-note-workspace-dialog";

const categories = ["Tất cả", "Ngữ pháp", "So sánh", "Ví dụ", "Lỗi thường gặp"] as const;
type Category = typeof categories[number];

export function KnowledgeTemplateDialog({
  open, onOpenChange, disabled, onInsert,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  disabled: boolean;
  onInsert: (nodes: KnowledgeDocumentNode[]) => boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("Tất cả");
  const [selectedId, setSelectedId] = useState(KNOWLEDGE_TEMPLATES[0].id);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return KNOWLEDGE_TEMPLATES.filter(item =>
      (category === "Tất cả" || item.category === category) &&
      `${item.title} ${item.description} ${item.category}`
        .toLocaleLowerCase("vi").includes(query),
    );
  }, [category, search]);
  const selected = filtered.find(item => item.id === selectedId) ?? filtered[0] ?? null;

  const insert = () => {
    if (disabled || !selected) return;
    // The template registry must stay immutable across editor sessions.
    if (onInsert(structuredClone(selected.content))) onOpenChange(false);
  };

  return (
    <KnowledgeNoteWorkspaceDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={LayoutTemplate}
      title="Thư viện khối mẫu"
      description="Chọn một bố cục học liệu, xem thử trước khi chèn. Mẫu được chèn vào bài đang soạn và vẫn có thể chỉnh sửa tự do."
      footer={
        <>
          <span className="text-xs text-muted-foreground">
            {filtered.length} mẫu có sẵn · Chỉ trong phiên soạn thảo
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button type="button" size="sm" onClick={insert} disabled={disabled || !selected}>
              <Check className="size-4" /> Chèn mẫu vào bài
            </Button>
          </div>
        </>
      }
    >
      <div className="grid h-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,1.15fr)] md:grid-cols-[minmax(260px,0.88fr)_minmax(0,1.25fr)] md:grid-rows-1">
        <section className="flex min-h-0 min-w-0 flex-col border-b border-border md:border-r md:border-b-0"
          aria-label="Danh sách mẫu">
          <div className="shrink-0 space-y-3 border-b border-border bg-muted/15 p-3 sm:p-4">
            <label className="relative block">
              <span className="sr-only">Tìm mẫu bài học</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={event => setSearch(event.target.value)}
                placeholder="Tìm mẫu bài học…" className="h-10 w-full pl-9" />
            </label>
            <div className="flex flex-wrap gap-1.5" aria-label="Lọc loại mẫu">
              {categories.map(value => (
                <Button key={value} type="button" size="xs"
                  aria-pressed={category === value}
                  variant={category === value ? "secondary" : "outline"}
                  onClick={() => setCategory(value)}
                  className="rounded-full text-xs">
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3 sm:p-4">
            {filtered.map(item => {
              const active = selected?.id === item.id;
              return (
                <button type="button" key={item.id} onClick={() => setSelectedId(item.id)}
                  aria-pressed={active}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"}`}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground">{item.title}</span>
                    {active && <Check className="size-4 shrink-0 text-primary" aria-label="Đã chọn" />}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-muted-foreground">{item.category}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Không tìm thấy mẫu phù hợp. Hãy thử từ khóa hoặc bộ lọc khác.
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 min-w-0 flex-col bg-muted/15" aria-label="Xem trước khối mẫu">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Xem trước</p>
              <h3 className="mt-1 truncate text-sm font-bold text-foreground">
                {selected?.title ?? "Chưa có mẫu được chọn"}
              </h3>
            </div>
            {selected && (
              <span className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold">
                {selected.category}
              </span>
            )}
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
            {selected ? (
              <article className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2 border-b border-dashed border-border pb-3 text-xs text-muted-foreground">
                  <BookOpenText className="size-4" /> Bản mẫu để tham khảo · Có thể chỉnh sửa sau khi chèn
                </div>
                <div className="min-w-0 break-words [&_[role=region]]:max-w-full">
                  <KnowledgeNoteRenderer document={{ type: "doc", content: selected.content }} />
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-24 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                Chọn một mẫu ở bên trái để xem trước.
              </div>
            )}
          </div>
        </section>
      </div>
    </KnowledgeNoteWorkspaceDialog>
  );
}
