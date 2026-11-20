"use client";

import { useState } from "react";
import { LayoutTemplate, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { KnowledgeDocumentNode } from "@/types/knowledge-note";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";
import { KNOWLEDGE_TEMPLATES } from "./knowledge-note-templates";

export function KnowledgeTemplateDialog({
  open, onOpenChange, disabled, onInsert,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  disabled: boolean;
  onInsert: (nodes: KnowledgeDocumentNode[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(KNOWLEDGE_TEMPLATES[0].id);
  const filtered = KNOWLEDGE_TEMPLATES.filter(item =>
    `${item.title} ${item.description} ${item.category}`.toLocaleLowerCase("vi")
      .includes(search.trim().toLocaleLowerCase("vi")));
  const chosen = filtered.find(t => t.id === selected) ?? filtered[0] ?? null;

  const insert = () => {
    if (disabled || !chosen) return;
    // Clone: the editor must never mutate the built-in template registry.
    onInsert(structuredClone(chosen.content));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[min(96vw,1000px)] max-w-none overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
            <LayoutTemplate className="size-5" /> Thư viện khối mẫu
          </DialogTitle>
          <DialogDescription>
            Chọn mẫu để chèn vào bài đang soạn. Mẫu chỉ tạo nội dung client, không thay đổi metadata.
          </DialogDescription>
        </DialogHeader>
        <label className="relative block">
          <span className="sr-only">Tìm mẫu</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc loại mẫu…" className="h-10 pl-9" />
        </label>
        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(14rem,1fr)_minmax(0,1.5fr)]">
          <div className="max-h-[52dvh] space-y-2 overflow-y-auto" aria-label="Các mẫu có sẵn">
            {filtered.map(item => (
              <button type="button" key={item.id}
                onClick={() => setSelected(item.id)}
                aria-pressed={chosen?.id === item.id}
                className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring ${chosen?.id === item.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                <span className="block text-sm font-bold">{item.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.category} · {item.description}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="p-3 text-sm text-muted-foreground">Không tìm thấy mẫu phù hợp.</p>}
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-muted/20 p-3" aria-label="Xem trước mẫu">
            <p className="mb-3 text-xs font-bold text-muted-foreground">XEM TRƯỚC MẪU</p>
            <div className="max-h-[50dvh] overflow-y-auto rounded-lg bg-card p-4">
              {chosen ? <KnowledgeNoteRenderer document={{ type: "doc", content: chosen.content }} />
                : <p className="text-sm text-muted-foreground">Không có mẫu để xem trước.</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button type="button" onClick={insert} disabled={disabled || !chosen}>Chèn mẫu vào bài</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
