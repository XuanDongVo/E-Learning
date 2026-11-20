"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle, Check, Clipboard, Download, FileJson2, FileUp, Upload,
} from "lucide-react";
import { toast } from "sonner";
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
import { KnowledgeNoteWorkspaceDialog } from "./knowledge-note-workspace-dialog";

export type ImportMode = "insert" | "append" | "replace";
export type ImportTarget = "article" | "summary" | "both";
type ExportScope = "both" | "article" | "summary" | "block";
type Tab = "import" | "export";

const exportScopes: Array<{ value: ExportScope; label: string; help: string }> = [
  { value: "both", label: "Toàn bộ bài", help: "Bài đầy đủ và Quick Summary" },
  { value: "article", label: "Chỉ bài đầy đủ", help: "Quick Summary trong file sẽ để trống" },
  { value: "summary", label: "Chỉ Quick Summary", help: "Bài đầy đủ trong file sẽ để trống" },
  { value: "block", label: "Khối đang chọn", help: "Xuất một Learning Block hoặc bảng đang chọn" },
];

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
  const [tab, setTab] = useState<Tab>("import");
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<ImportTarget>("article");
  const [mode, setMode] = useState<ImportMode>("append");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [scope, setScope] = useState<ExportScope>("both");

  const updateRaw = (value: string) => {
    setRaw(value);
    setFileName(null);
    setPayload(null);
    setError(null);
    setConfirmReplace(false);
    setMigrated(false);
  };

  const validate = (value = raw) => {
    setPayload(null);
    setError(null);
    setConfirmReplace(false);
    try {
      const parsed = parseKnowledgeImport(value);
      setPayload(parsed);
      setMigrated(JSON.parse(value).schemaVersion === 1);
      if (parsed.format === "e-learning-knowledge-note-blocks") {
        setTarget("article");
        setMode("insert");
      }
    } catch (cause) {
      setMigrated(false);
      setError(cause instanceof Error ? cause.message : "Không thể đọc JSON.");
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      updateRaw("");
      setError("Vui lòng chọn file .json.");
      return;
    }
    if (file.size > 512 * 1024) {
      updateRaw("");
      setError("File vượt quá giới hạn 512 KB.");
      return;
    }
    try {
      const content = await file.text();
      setRaw(content);
      setFileName(file.name);
      validate(content);
    } catch {
      updateRaw("");
      setError("Không thể đọc file JSON.");
    }
  };

  const getExport = (value: ExportScope): KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot => {
    if (value === "block") {
      const nodes = selectedBlock();
      if (!nodes?.length) throw new Error("Chọn một Learning Block hoặc bảng trong Editor trước khi xuất.");
      return createBlockSnapshot(nodes);
    }
    return createEditorSnapshot(
      value === "summary" ? { type: "doc", content: [] } : document,
      value === "article" ? { type: "doc", content: [] } : summary,
    );
  };

  const exportPreview = useMemo(() => {
    try {
      const json = JSON.stringify(getExport(scope), null, 2);
      return { json, error: null as string | null };
    } catch (cause) {
      return {
        json: "",
        error: cause instanceof Error ? cause.message : "Không thể tạo JSON xuất.",
      };
    }
  // selectedBlock reads the latest editor selection on every parent render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, document, summary, selectedBlock, open]);

  const exportJson = async (copy: boolean) => {
    if (exportPreview.error) {
      toast.error(exportPreview.error);
      return;
    }
    try {
      if (copy) {
        await navigator.clipboard.writeText(exportPreview.json);
        toast.success("Đã sao chép JSON v2.");
      } else {
        const url = URL.createObjectURL(new Blob([exportPreview.json], { type: "application/json;charset=utf-8" }));
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = `knowledge-note-v2-${scope}.json`;
        window.document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Đã tạo file JSON để tải xuống.");
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể xuất JSON.");
    }
  };

  const overwrite = target === "both" || mode === "replace";
  const canApply = payload !== null && !disabled && (!overwrite || confirmReplace);
  const apply = () => {
    if (!payload || disabled) return;
    if (overwrite && !confirmReplace) {
      setError("Vui lòng xác nhận trước khi thay thế nội dung hiện tại.");
      return;
    }
    const ok = onApply(payload, target, target === "both" ? "replace" : mode);
    if (!ok) {
      setError("Không thể nhập vào vị trí đã chọn. Hãy thử thêm cuối bài hoặc thay thế nội dung.");
      return;
    }
    toast.success("Đã nhập vào Editor. Nội dung vẫn chưa được lưu lên server.");
    onOpenChange(false);
  };

  const previewDocument = payload
    ? payload.format === "e-learning-knowledge-note-blocks"
      ? { type: "doc" as const, content: payload.content }
      : target === "summary" ? payload.summary : payload.document
    : null;
  const previewSummary = payload?.format === "e-learning-knowledge-note" ? payload.summary : null;

  return (
    <KnowledgeNoteWorkspaceDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={FileJson2}
      title="Nhập / Xuất nội dung"
      description="Chuyển học liệu bằng JSON schema v2, hỗ trợ nhập dữ liệu v1. Mọi thao tác chỉ diễn ra trong Editor, không thay đổi dữ liệu server."
      footer={
        <>
          <span className="text-xs text-muted-foreground">
            {tab === "import"
              ? (payload ? `Đã kiểm tra · ${migrated ? "Chuyển từ v1 sang v2" : "Schema v2"}` : "Chưa áp dụng nội dung")
              : "JSON xuất không chứa metadata hoặc trạng thái công bố"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            {tab === "import" ? (
              <Button type="button" size="sm" disabled={!canApply} onClick={apply}>
                <Upload className="size-4" /> Áp dụng vào Editor
              </Button>
            ) : (
              <>
                <Button type="button" size="sm" variant="outline" disabled={Boolean(exportPreview.error)}
                  onClick={() => void exportJson(true)}>
                  <Clipboard className="size-4" /> Sao chép
                </Button>
                <Button type="button" size="sm" disabled={Boolean(exportPreview.error)}
                  onClick={() => void exportJson(false)}>
                  <Download className="size-4" /> Tải JSON
                </Button>
              </>
            )}
          </div>
        </>
      }
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-border bg-muted/15 px-4 py-2 sm:px-6"
          role="group" aria-label="Chế độ nhập hoặc xuất">
          <Button type="button" size="sm" variant={tab === "import" ? "secondary" : "ghost"}
            aria-pressed={tab === "import"} onClick={() => setTab("import")}>
            <Upload className="size-4" /> Nhập dữ liệu
          </Button>
          <Button type="button" size="sm" variant={tab === "export" ? "secondary" : "ghost"}
            aria-pressed={tab === "export"} onClick={() => setTab("export")}>
            <Download className="size-4" /> Xuất dữ liệu
          </Button>
        </div>

        {tab === "import" ? (
          <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1.2fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:grid-rows-1">
            <section className="min-h-0 min-w-0 space-y-4 overflow-y-auto overscroll-contain border-b border-border p-4 md:border-r md:border-b-0 sm:p-5"
              aria-label="Nguồn và tùy chọn nhập">
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Nguồn nội dung</h3>
                <input type="file" ref={fileRef} accept=".json,application/json"
                  className="sr-only" aria-label="Chọn file JSON"
                  onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = ""; }} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring">
                  <FileUp className="size-6 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 text-xs leading-5">
                    <span className="block truncate font-bold text-foreground">
                      {fileName ?? "Chọn file JSON"}
                    </span>
                    <span className="text-muted-foreground">.json · Tối đa 512 KB</span>
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="knowledge-note-import-json" className="text-sm font-bold">Hoặc dán JSON</label>
                <Textarea id="knowledge-note-import-json"
                  value={raw} onChange={event => updateRaw(event.target.value)}
                  placeholder={'{"format":"e-learning-knowledge-note","schemaVersion":2,...}'}
                  className="min-h-28 w-full resize-y font-mono text-xs sm:min-h-40" />
                <Button type="button" size="sm" variant="secondary"
                  disabled={!raw.trim()} onClick={() => validate()}>
                  <Check className="size-4" /> Kiểm tra JSON
                </Button>
              </div>

              {error && (
                <p role="alert" className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-xs leading-5 text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />{error}
                </p>
              )}

              {payload && (
                <>
                  <p role="status" className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-5">
                    <Check className="mr-1 inline size-4 text-primary" />
                    JSON hợp lệ.{migrated ? " Đã chuyển nội dung v1 sang v2 để nhập." : ""}
                    {" "}Xem lại bản xem trước trước khi áp dụng.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-xs font-bold">Nhập vào</p>
                      <Select value={target}
                        onValueChange={value => { setTarget(value as ImportTarget); setConfirmReplace(false); }}
                        disabled={payload.format === "e-learning-knowledge-note-blocks"}>
                        <SelectTrigger className="w-full" aria-label="Phạm vi nhập"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">Bài đầy đủ</SelectItem>
                          {payload.format !== "e-learning-knowledge-note-blocks" && (
                            <>
                              <SelectItem value="summary">Quick Summary</SelectItem>
                              <SelectItem value="both">Cả hai phần</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-xs font-bold">Cách áp dụng</p>
                      <Select value={target === "both" ? "replace" : mode}
                        disabled={target === "both"}
                        onValueChange={value => { setMode(value as ImportMode); setConfirmReplace(false); }}>
                        <SelectTrigger className="w-full" aria-label="Cách áp dụng"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="insert">Chèn tại con trỏ</SelectItem>
                          <SelectItem value="append">Thêm vào cuối</SelectItem>
                          <SelectItem value="replace">Thay thế</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {overwrite && (
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs leading-5">
                      <input type="checkbox" checked={confirmReplace} onChange={event => setConfirmReplace(event.target.checked)}
                        className="mt-1 accent-primary" />
                      <span><strong>Xác nhận thay thế.</strong> Nội dung hiện tại trong phần được chọn sẽ bị thay thế. Hãy xuất JSON để sao lưu trước khi nhập đè.</span>
                    </label>
                  )}
                </>
              )}
            </section>

            <section className="flex min-h-0 min-w-0 flex-col bg-muted/15" aria-label="Xem trước dữ liệu nhập">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Xem trước nội dung</p>
                  <h3 className="mt-1 text-sm font-bold">{payload ? (target === "summary" ? "Quick Summary" : "Bài lý thuyết") : "Chưa có dữ liệu hợp lệ"}</h3>
                </div>
                {payload && <span className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs">Schema v2</span>}
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
                {previewDocument ? (
                  <article className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <div className="min-w-0 break-words">
                      <KnowledgeNoteRenderer document={previewDocument} compact={target === "summary"} />
                    </div>
                    {target === "both" && previewSummary && (
                      <section className="mt-6 border-t border-dashed border-border pt-4">
                        <h4 className="mb-3 text-sm font-bold">Quick Summary</h4>
                        <KnowledgeNoteRenderer document={previewSummary} compact />
                      </section>
                    )}
                  </article>
                ) : (
                  <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Chọn file hoặc dán JSON và bấm Kiểm tra JSON để xem trước nội dung tại đây.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1.2fr)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:grid-rows-1">
            <section className="min-h-0 min-w-0 space-y-3 overflow-y-auto overscroll-contain border-b border-border p-4 md:border-r md:border-b-0 sm:p-5"
              aria-label="Tùy chọn xuất">
              <h3 className="text-sm font-bold">Chọn nội dung cần xuất</h3>
              <p className="text-xs leading-5 text-muted-foreground">
                JSON không chứa Grade, Topic Links, ID hay trạng thái công bố.
              </p>
              {exportScopes.map(item => (
                <button key={item.value} type="button"
                  aria-pressed={scope === item.value} onClick={() => setScope(item.value)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring ${scope === item.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-muted/30"}`}>
                  <span className="flex items-center justify-between gap-2 text-sm font-bold">
                    {item.label}
                    {scope === item.value && <Check className="size-4 shrink-0 text-primary" />}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.help}</span>
                </button>
              ))}
            </section>

            <section className="flex min-h-0 min-w-0 flex-col bg-muted/15" aria-label="Xem trước JSON xuất">
              <div className="shrink-0 border-b border-border px-4 py-3">
                <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Xem trước JSON</p>
                <h3 className="mt-1 text-sm font-bold">
                  {exportScopes.find(item => item.value === scope)?.label}
                </h3>
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain p-3 sm:p-5">
                {exportPreview.error ? (
                  <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                    {exportPreview.error}
                  </p>
                ) : (
                  <div className="min-w-0 rounded-xl border border-border bg-card p-4">
                    <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-5 text-foreground">
                      {exportPreview.json.slice(0, 16000)}
                      {exportPreview.json.length > 16000 && "\n… (Xem trước rút gọn; file tải xuống vẫn đầy đủ)"}
                    </pre>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </KnowledgeNoteWorkspaceDialog>
  );
}
