"use client";

import { useState } from "react";
import { Clipboard, Download, FileJson2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type {
  KnowledgeDocument, KnowledgeDocumentNode, KnowledgeNoteBlockSnapshot,
  KnowledgeNoteEditorSnapshot,
} from "@/types/knowledge-note";
import {
  createBlockSnapshot, createEditorSnapshot, parseKnowledgeImport,
} from "./knowledge-note-document";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";

export type ImportMode = "insert" | "append" | "replace";
export type ImportTarget = "article" | "summary" | "both";

export function KnowledgeImportExportDialog({
  open, onOpenChange, document, summary, disabled, onApply, selectedBlock,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
  disabled: boolean;
  onApply: (
    payload: KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot,
    target: ImportTarget,
    mode: ImportMode,
  ) => boolean;
  selectedBlock: () => KnowledgeDocumentNode[] | null;
}) {
  const [tab, setTab] = useState<"import" | "export">("import");
  const [raw, setRaw] = useState("");
  const [payload, setPayload] = useState<KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<ImportTarget>("article");
  const [mode, setMode] = useState<ImportMode>("append");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const parse = (source: string) => {
    setRaw(source);
    setPayload(null);
    setConfirmReplace(false);
    setError(null);
    try {
      const value = parseKnowledgeImport(source);
      setPayload(value);
      setMigrated(JSON.parse(source).schemaVersion === 1);
      if (value.format === "e-learning-knowledge-note-blocks") {
        setTarget("article");
        setMode("insert");
      }
    } catch (cause) {
      setMigrated(false);
      setError(cause instanceof Error ? cause.message : "Không thể đọc JSON.");
    }
  };

  const readFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Chỉ nhận file .json.");
      setPayload(null);
      return;
    }
    if (file.size > 512 * 1024) {
      setError("File vượt quá giới hạn 512 KB.");
      setPayload(null);
      return;
    }
    try { parse(await file.text()); }
    catch { setError("Không thể đọc file."); setPayload(null); }
  };

  const getExport = (scope: "both" | "article" | "summary" | "block") => {
    if (scope === "block") {
      const nodes = selectedBlock();
      if (!nodes?.length) throw new Error("Hãy chọn một khối trong Editor trước khi xuất.");
      return createBlockSnapshot(nodes);
    }
    return createEditorSnapshot(
      scope === "summary" ? { type: "doc", content: [] } : document,
      scope === "article" ? { type: "doc", content: [] } : summary,
    );
  };
  const exportJson = async (scope: "both" | "article" | "summary" | "block", copy: boolean) => {
    try {
      const json = JSON.stringify(getExport(scope), null, 2);
      if (copy) {
        await navigator.clipboard.writeText(json);
        toast.success("Đã sao chép JSON");
      } else {
        const blob = new Blob([json], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = `knowledge-note-v2-${scope}.json`;
        window.document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể xuất JSON.");
    }
  };
  const apply = () => {
    if (!payload || disabled) return;
    if ((mode === "replace" || target === "both") && !confirmReplace) {
      setError("Cần xác nhận trước khi thay thế nội dung hiện tại.");
      return;
    }
    if (onApply(payload, target, target === "both" ? "replace" : mode)) {
      toast.success("Đã nhập vào Editor. Nội dung vẫn chưa được lưu lên server.");
      onOpenChange(false);
    }
  };

  const previewDocument = payload
    ? payload.format === "e-learning-knowledge-note-blocks"
      ? { type: "doc" as const, content: payload.content }
      : target === "summary" ? payload.summary : payload.document
    : null;
  const previewSummary = payload?.format === "e-learning-knowledge-note"
    ? payload.summary : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[min(96vw,1000px)] max-w-none overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
            <FileJson2 className="size-5" /> Nhập / Xuất nội dung
          </DialogTitle>
          <DialogDescription>
            JSON schema v2. Dữ liệu nhập chỉ cập nhật phiên soạn thảo, không lưu lên server.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 border-b border-border pb-3" role="group" aria-label="Chọn thao tác">
          <Button type="button" size="sm" variant={tab === "import" ? "secondary" : "ghost"} onClick={() => setTab("import")}>
            <Upload /> Nhập
          </Button>
          <Button type="button" size="sm" variant={tab === "export" ? "secondary" : "ghost"} onClick={() => setTab("export")}>
            <Download /> Xuất
          </Button>
        </div>

        {tab === "export" ? (
          <section className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chọn phạm vi xuất. Export không kèm Grade, Topic Links, trạng thái Publish hay ID.
            </p>
            {([
              ["both", "Toàn bộ bài + Quick Summary"],
              ["article", "Chỉ bài đầy đủ"],
              ["summary", "Chỉ Quick Summary"],
              ["block", "Khối đang chọn trong Editor"],
            ] as const).map(([scope, label]) => (
              <div key={scope} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2">
                <span className="text-sm font-semibold">{label}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void exportJson(scope, true)}>
                    <Clipboard /> Sao chép
                  </Button>
                  <Button size="sm" onClick={() => void exportJson(scope, false)}>
                    <Download /> Tải JSON
                  </Button>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="space-y-4">
            <label className="block text-sm font-semibold">
              Chọn file JSON (tối đa 512 KB)
              <input type="file" accept=".json,application/json"
                className="mt-2 block w-full rounded-lg border border-border p-2 text-sm"
                onChange={event => void readFile(event.target.files?.[0])} />
            </label>
            <label className="block text-sm font-semibold">
              Hoặc dán JSON
              <Textarea value={raw} onChange={event => parse(event.target.value)}
                placeholder={'{"format":"e-learning-knowledge-note","schemaVersion":2,...}'}
                className="mt-2 min-h-32 font-mono text-xs" aria-label="JSON nhập vào Editor" />
            </label>
            {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}
            {payload && (
              <>
                <div role="status" className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  JSON hợp lệ. {migrated ? "Đã chuyển cấu trúc v1 thành v2 trong bộ nhớ. " : ""}
                  Hãy xem trước trước khi áp dụng.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    Nhập vào
                    <Select value={target} disabled={payload.format === "e-learning-knowledge-note-blocks"}
                      onValueChange={value => { setTarget(value as ImportTarget); setConfirmReplace(false); }}>
                      <SelectTrigger aria-label="Phạm vi nhập"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Bài đầy đủ</SelectItem>
                        {payload.format !== "e-learning-knowledge-note-blocks" && (
                          <>
                            <SelectItem value="summary">Quick Summary</SelectItem>
                            <SelectItem value="both">Cả bài và Quick Summary</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    Cách áp dụng
                    <Select value={target === "both" ? "replace" : mode}
                      disabled={target === "both"} onValueChange={value => { setMode(value as ImportMode); setConfirmReplace(false); }}>
                      <SelectTrigger aria-label="Cách áp dụng"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="insert">Chèn tại con trỏ</SelectItem>
                        <SelectItem value="append">Thêm vào cuối</SelectItem>
                        <SelectItem value="replace">Thay thế nội dung</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>
                {(mode === "replace" || target === "both") && (
                  <label className="flex items-start gap-2 text-sm font-semibold text-destructive">
                    <input type="checkbox" checked={confirmReplace}
                      onChange={e => setConfirmReplace(e.target.checked)}
                      className="mt-1" />
                    Tôi xác nhận thay thế nội dung đang có (có thể Undo sau khi áp dụng).
                  </label>
                )}
                <div className="max-h-[35dvh] overflow-y-auto rounded-lg border border-border bg-card p-4" aria-label="Xem trước JSON nhập">
                  <p className="mb-3 text-xs font-bold text-muted-foreground">XEM TRƯỚC BÀI HỌC</p>
                  {previewDocument && <KnowledgeNoteRenderer document={previewDocument} />}
                  {target === "both" && previewSummary && (
                    <section className="mt-5 border-t border-border pt-4">
                      <h3 className="mb-2 font-bold">Quick Summary</h3>
                      <KnowledgeNoteRenderer document={previewSummary} compact />
                    </section>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={apply} disabled={disabled || ((mode === "replace" || target === "both") && !confirmReplace)}>
                    <Upload /> Áp dụng vào Editor
                  </Button>
                </div>
              </>
            )}
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
