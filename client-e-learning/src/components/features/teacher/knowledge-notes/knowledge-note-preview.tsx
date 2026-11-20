"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KnowledgeDocument } from "@/types/knowledge-note";
import { cn } from "@/lib/utils";
import { KnowledgeNoteRenderer } from "./knowledge-note-renderer";

export function TeacherKnowledgeNotePreview({
  open,
  onOpenChange,
  title,
  description,
  document,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | null;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
}) {
  const [mode, setMode] = useState<"article" | "summary">("article");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(96vw,1100px)] max-w-none grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle className="text-lg font-extrabold">
            Xem trước dưới góc nhìn học sinh
          </DialogTitle>
          <DialogDescription>
            Nội dung lấy trực tiếp từ phiên soạn thảo hiện tại và chưa được lưu
            lên server.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2 sm:px-6">
          <div
            className="flex gap-1"
            role="group"
            aria-label="Nội dung xem trước"
          >
            <Button
              type="button"
              size="sm"
              variant={mode === "article" ? "secondary" : "ghost"}
              aria-pressed={mode === "article"}
              onClick={() => setMode("article")}
            >
              Bài đầy đủ
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "summary" ? "secondary" : "ghost"}
              aria-pressed={mode === "summary"}
              onClick={() => setMode("summary")}
            >
              Quick Summary
            </Button>
          </div>
          <div
            className="flex gap-1"
            role="group"
            aria-label="Kích thước bản xem trước"
          >
            <Button
              type="button"
              size="icon-sm"
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              aria-label="Xem bản desktop"
              aria-pressed={viewport === "desktop"}
              onClick={() => setViewport("desktop")}
            >
              <Monitor />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              aria-label="Xem bản mobile"
              aria-pressed={viewport === "mobile"}
              onClick={() => setViewport("mobile")}
            >
              <Smartphone />
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto bg-background-app p-3 sm:p-6">
          <article
            className={cn(
              "mx-auto min-h-[32rem] border border-border bg-card px-5 py-7 shadow-pop-sm transition-[max-width] sm:px-8",
              viewport === "mobile" ? "max-w-[390px]" : "max-w-[780px]",
            )}
          >
            <p className="mb-3 text-xs font-bold text-primary">
              Bản xem trước · Chưa lưu
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {title.trim() || "Bài lý thuyết chưa có tiêu đề"}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="mt-7">
              {mode === "article" ? (
                <KnowledgeNoteRenderer document={document} />
              ) : (
                <section className="border-l-4 border-primary bg-primary/5 p-4">
                  <h2 className="mb-3 text-lg font-extrabold">Quick Summary</h2>
                  <KnowledgeNoteRenderer document={summary} compact />
                </section>
              )}
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
