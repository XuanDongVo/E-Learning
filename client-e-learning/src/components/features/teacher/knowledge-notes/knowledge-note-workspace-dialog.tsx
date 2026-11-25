"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

/**
 * Editor-only wide dialog: overrides the global Dialog's sm:max-w-sm.
 * A single layout for Template Library and JSON Import/Export prevents
 * their two-column previews from collapsing on desktop.
 */
export function KnowledgeNoteWorkspaceDialog({
  open, onOpenChange, icon: Icon, title, description, children, footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "flex h-[min(88dvh,820px)] max-h-[calc(100dvh-1rem)]",
          "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)]",
          "sm:w-[min(960px,calc(100vw-3rem))] sm:max-w-[960px]",
          "min-h-0 flex-col gap-0 overflow-hidden rounded-2xl p-0",
        ].join(" ")}
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-border bg-card px-4 py-4 pr-12 sm:px-6 sm:py-5 sm:pr-14">
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold leading-tight sm:text-xl">
            <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-xs leading-relaxed sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-3 sm:px-6">
          {footer}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
