"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Clipboard, Download, FileJson2, FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  KnowledgeDocument, KnowledgeDocumentNode,
  KnowledgeNoteBlockSnapshot, KnowledgeNoteEditorSnapshot,
} from "@/types/knowledge-note";
import {
  createBlockSnapshot, createEditorSnapshot, parseKnowledgeImport,
} from "./knowledge-note-document";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";
import { KnowledgeNoteWorkspaceDialog } from "./knowledge-note-workspace-dialog";

export type ImportMode = "insert" | "append" | "replace";
type Tab = "import" | "export";
type ExportScope = "document" | "block";

export function KnowledgeImportExportDialog({
  open, onOpenChange, document, disabled, onApply, selectedBlock,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  document: KnowledgeDocument;
  disabled: boolean;
  onApply: (payload: KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot,
    mode: ImportMode) => boolean;
  selectedBlock: () => KnowledgeDocumentNode[] | null;
}) {
  const [tab, setTab] = useState<Tab>("import");
  const [raw, setRaw] = useState("");
  const [payload, setPayload] = useState<KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("append");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [scope, setScope] = useState<ExportScope>("document");
  const fileRef = useRef<HTMLInputElement>(null);

  const inspect = (value: string) => {
    try {
      const parsed = parseKnowledgeImport(value);
      setPayload(parsed);
      setError(null);
      setConfirmReplace(false);
      if (parsed.format === "e-learning-knowledge-note-blocks") setMode("insert");
    } catch (cause) {
      setPayload(null);
      setError(cause instanceof Error ? cause.message : "Không thể đọc file JSON.");
    }
  };
  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json") || file.size > 512 * 1024) {
      setError("Chỉ hỗ trợ file .json tối đa 512 KB.");
      return;
    }
    try {
      const value = await file.text();
      setRaw(value);
      inspect(value);
    } catch {
      setError("Không thể đọc file.");
    }
  };
  const exportPreview = useMemo(() => {
    try {
      const snapshot = scope === "document"
        ? createEditorSnapshot(document)
        : createBlockSnapshot(selectedBlock() ??
            (() => { throw new Error("Chọn một Learning Block hoặc bảng trước khi xuất."); })());
      return { json: JSON.stringify(snapshot, null, 2), error: null as string | null };
    } catch (cause) {
      return { json: "", error: cause instanceof Error ? cause.message : "Không thể xuất JSON." };
    }
  // The selected node is read on every open/render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, document, open, selectedBlock]);

  const exportJson = async (copy: boolean) => {
    if (exportPreview.error) return toast.error(exportPreview.error);
    if (copy) {
      try {
        await navigator.clipboard.writeText(exportPreview.json);
        toast.success("Đã sao chép JSON.");
      } catch { toast.error("Không thể sao chép."); }
      return;
    }
    const url = URL.createObjectURL(new Blob([exportPreview.json], { type: "application/json" }));
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `knowledge-note-v3-${scope}.json`;
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const apply = () => {
    if (!payload || disabled || (mode === "replace" && !confirmReplace)) return;
    if (!onApply(payload, mode)) {
      setError("Không thể chèn nội dung vào vị trí này. Hãy chọn thêm vào cuối.");
      return;
    }
    toast.success("Đã nhập nội dung. Auto-save sẽ lưu bản mới khi bạn ngừng chỉnh sửa.");
    onOpenChange(false);
  };
  const preview: KnowledgeDocument | null = payload
    ? payload.format === "e-learning-knowledge-note-blocks"
      ? { type: "doc", content: payload.content }
      : payload.document
    : null;

  return (
    <KnowledgeNoteWorkspaceDialog
      open={open} onOpenChange={onOpenChange} icon={FileJson2}
      title="Nhập / Xuất nội dung"
      description="Một Document duy nhất. Nhận file v1/v2/v3; Quick Summary cũ được giữ trong khối ghi chú trọng tâm."
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Đóng</Button>
          {tab === "import" ? (
            <Button type="button" size="sm" disabled={!payload || disabled || (mode === "replace" && !confirmReplace)}
              onClick={apply}><Upload className="size-4" /> Áp dụng</Button>
          ) : (
            <>
              <Button type="button" size="sm" variant="outline" disabled={Boolean(exportPreview.error)}
                onClick={() => void exportJson(true)}><Clipboard className="size-4" /> Sao chép</Button>
              <Button type="button" size="sm" disabled={Boolean(exportPreview.error)}
                onClick={() => void exportJson(false)}><Download className="size-4" /> Tải JSON</Button>
            </>
          )}
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex gap-2 border-b border-border p-3">
          <Button type="button" size="sm" variant={tab === "import" ? "secondary" : "ghost"} onClick={() => setTab("import")}>
            <Upload className="size-4" /> Nhập
          </Button>
          <Button type="button" size="sm" variant={tab === "export" ? "secondary" : "ghost"} onClick={() => setTab("export")}>
            <Download className="size-4" /> Xuất
          </Button>
        </div>
        {tab === "import" ? (
          <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4 md:grid-cols-2">
            <div className="space-y-3">
              <input ref={fileRef} type="file" accept=".json,application/json" className="sr-only"
                aria-label="Chọn file JSON" onChange={e => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
              <Button type="button" variant="outline" className="w-full"
                onClick={() => fileRef.current?.click()}><FileUp /> Chọn file JSON</Button>
              <label htmlFor="knowledge-import-content" className="block text-sm font-bold">Hoặc dán JSON</label>
              <Textarea id="knowledge-import-content" className="min-h-40 font-mono text-xs"
                value={raw} onChange={e => { setRaw(e.target.value); setPayload(null); setError(null); }} />
              <Button type="button" size="sm" onClick={() => inspect(raw)} disabled={!raw.trim()}>
                <Check className="size-4" /> Kiểm tra JSON
              </Button>
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold">Cách nhập</legend>
                {(["insert","append","replace"] as const).map(value => (
                  <label key={value} className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={mode === value} onChange={() => { setMode(value); setConfirmReplace(false); }} />
                    {value === "insert" ? "Tại con trỏ" : value === "append" ? "Thêm vào cuối" : "Thay thế toàn bộ"}
                  </label>
                ))}
              </fieldset>
              {mode === "replace" && (
                <label className="flex items-start gap-2 rounded-md border border-destructive/30 p-2 text-xs">
                  <input type="checkbox" checked={confirmReplace} onChange={e => setConfirmReplace(e.target.checked)} />
                  Tôi xác nhận thay thế nội dung hiện tại (nên xuất bản sao trước).
                </label>
              )}
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="min-h-0 space-y-3">
              <p className="text-sm font-bold">Xem trước file nhập</p>
              {preview ? (
                <div className="max-h-[60vh] overflow-auto rounded-lg border border-border bg-card p-4">
                  <KnowledgeNoteRenderer document={preview} />
                </div>
              ) : <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                Chọn file hoặc dán JSON rồi nhấn Kiểm tra.
              </p>}
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-bold">Phạm vi xuất</p>
              <label className="flex gap-2 text-sm">
                <input type="radio" checked={scope === "document"} onChange={() => setScope("document")} />
                Toàn bộ bài lý thuyết
              </label>
              <label className="flex gap-2 text-sm">
                <input type="radio" checked={scope === "block"} onChange={() => setScope("block")} />
                Khối / bảng đang chọn
              </label>
              <p className="text-xs text-muted-foreground">
                File sử dụng schemaVersion 3 chỉ cho Import/Export. Content API không dùng trường này.
              </p>
              {exportPreview.error && <p className="text-sm text-destructive">{exportPreview.error}</p>}
            </div>
            <div className="min-h-0 overflow-auto rounded-lg border border-border p-3">
              <pre className="whitespace-pre-wrap break-all font-mono text-xs">{exportPreview.json.slice(0, 16000)}</pre>
            </div>
          </div>
        )}
      </div>
    </KnowledgeNoteWorkspaceDialog>
  );
}
