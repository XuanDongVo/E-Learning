"use client";

import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Loader2,
  MoreHorizontal,
  PencilLine,
  Save,
  Settings,
  Megaphone,
  Archive,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useBuilder, useIsDirty } from "@/components/features/teacher/assignments/builder/store";
import { useIssues } from "./Canvas";
import { updateAssignmentStatus } from "@/services/assignment.service";

// ─── Management status badge ─────────────────────────────────────────────────
const MGMT_BADGE: Record<
  "DRAFT" | "PUBLISHED" | "ARCHIVED",
  { label: string; dot: string; border: string; bg: string; text: string }
> = {
  DRAFT: {
    label: "Draft",
    dot: "bg-muted-foreground",
    border: "border-muted-foreground/30",
    bg: "bg-muted/60",
    text: "text-muted-foreground",
  },
  PUBLISHED: {
    label: "Published",
    dot: "bg-success",
    border: "border-success/30",
    bg: "bg-success/10",
    text: "text-success",
  },
  ARCHIVED: {
    label: "Archived",
    dot: "bg-warning",
    border: "border-warning/40",
    bg: "bg-warning/10",
    text: "text-warning-foreground",
  },
};

function ManagementStatusBadge({
  status,
}: {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
}) {
  if (!status) return null;
  const s = MGMT_BADGE[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        s.border,
        s.bg,
        s.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Save status badge ────────────────────────────────────────────────────────
export function StatusBadge() {
  const dirty = useIsDirty();
  const status = useBuilder((s) => s.saveStatus);
  const lastSavedAt = useBuilder((s) => s.lastSavedAt);
  const save = useBuilder((s) => s.save);
  const base =
    "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap";
  if (status === "saving")
    return (
      <span className={cn(base, "border-primary/30 bg-primary/5 text-primary")}>
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (status === "error")
    return (
      <span className={cn(base, "border-destructive/30 bg-destructive/5 text-destructive")}>
        Save failed
        <button onClick={() => save()} className="font-semibold underline">
          Retry
        </button>
      </span>
    );
  if (dirty)
    return (
      <span className={cn(base, "border-warning/40 bg-warning/10 text-warning-foreground")}>
        <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Unsaved changes
      </span>
    );
  if (lastSavedAt)
    return (
      <span
        className={cn(base, "border-success/30 bg-success/10 text-success")}
        title={new Date(lastSavedAt).toLocaleString()}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Saved
      </span>
    );
  return <span className={cn(base, "text-muted-foreground")}>Draft</span>;
}

// ─── Header ───────────────────────────────────────────────────────────────────
export function Header() {
  const router = useRouter();
  const a = useBuilder((s) => s.assignment);
  const mode = useBuilder((s) => s.mode);
  const autosave = useBuilder((s) => s.autosave);
  const saveStatus = useBuilder((s) => s.saveStatus);
  const { set, mutate, save, ask } = useBuilder.getState();
  const dirty = useIsDirty();
  const errors = useIssues().filter((i) => i.level === "error").length;

  // Management status (DRAFT / PUBLISHED / ARCHIVED) from the builder assignment
  const mgmtStatus = a.status; // "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined
  const serverId = a.serverId;

  const [statusLoading, setStatusLoading] = useState(false);

  const leave = () => router.push("/teacher/assignments");
  const onBack = () => {
    if (!dirty) return leave();
    ask({
      title: "Leave with unsaved changes?",
      description: "Your latest edits have not been saved yet.",
      actions: [
        {
          label: "Leave without saving",
          variant: "outline",
          run: () => (
            set({ savedSnapshot: "" }),
            useBuilder.getState().load(useBuilder.getState().assignment),
            leave()
          ),
        },
        {
          label: "Save & leave",
          run: async () =>
            (await save()) ? leave() : toast.error("Save failed — still here"),
        },
      ],
    });
  };

  /** Call PATCH /v1/assignments/:id/status and refresh builder state */
  const changeStatus = async (next: "PUBLISHED" | "ARCHIVED" | "DRAFT") => {
    if (!serverId) {
      toast.error("Assignment has no server ID — save first.");
      return;
    }
    // If there are unsaved changes, save first
    if (dirty) {
      const ok = await save();
      if (!ok) {
        toast.error("Please save your changes before changing status.");
        return;
      }
    }
    setStatusLoading(true);
    try {
      const res = await updateAssignmentStatus(serverId, next);
      if (res.data) {
        // Update status in the builder store without full reload
        set({ assignment: { ...a, status: res.data.status } });
        const labels: Record<string, string> = {
          PUBLISHED: "Assignment published ✓",
          ARCHIVED: "Assignment archived",
          DRAFT: "Assignment moved back to Draft",
        };
        toast.success(labels[next] ?? `Status → ${next}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // Determine which status actions are available based on current status
  const canPublish = mgmtStatus === "DRAFT";
  const canArchive = mgmtStatus === "DRAFT" || mgmtStatus === "PUBLISHED";
  const canUnarchive = mgmtStatus === "ARCHIVED";

  return (
    <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b bg-card px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Back to assignments" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <input
          aria-label="Assignment title"
          value={a.title}
          onChange={(e) => mutate((d) => (d.title = e.target.value))}
          placeholder="Untitled assignment"
          className="h-8 min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-2 text-base font-semibold outline-none hover:border-border focus:border-primary"
        />
        <StatusBadge />
        <ManagementStatusBadge status={mgmtStatus} />
        <span
          className={cn(
            "hidden whitespace-nowrap text-xs xl:inline",
            errors ? "text-destructive" : "text-success",
          )}
        >
          {errors ? `${errors} error(s) before publishing` : "Ready to publish"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Edit / Preview toggle */}
        <div className="flex rounded-md border p-0.5" role="tablist" aria-label="Mode">
          <button
            role="tab"
            aria-selected={mode === "edit"}
            onClick={() => set({ mode: "edit" })}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded px-2.5 text-sm",
              mode === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <PencilLine className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            role="tab"
            aria-selected={mode === "preview"}
            onClick={() => set({ mode: "preview" })}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded px-2.5 text-sm",
              mode === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Student </span>
            Preview
          </button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          onClick={() => set({ settingsOpen: true })}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Save Draft button */}
        <Button
          size="sm"
          onClick={() => save()}
          disabled={saveStatus === "saving"}
          title="Save draft (Ctrl+S)"
          className={cn("bg-primary text-primary-foreground")}
        >
          <Save className="h-4 w-4" /> Save Draft
        </Button>

        {/* Publish quick-button — only shown when DRAFT and no errors */}
        {canPublish && !errors && (
          <Button
            size="sm"
            id="btn-publish-assignment"
            disabled={statusLoading || dirty}
            onClick={() => changeStatus("PUBLISHED")}
            className="gap-1.5 bg-success text-white hover:bg-success/90"
            title={dirty ? "Save first, then publish" : "Publish assignment"}
          >
            {statusLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Publish
          </Button>
        )}

        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {/* ── Status management ── */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Assignment Status
            </DropdownMenuLabel>

            {canPublish && (
              <DropdownMenuItem
                id="menu-publish-assignment"
                disabled={statusLoading || !!errors}
                onClick={() => changeStatus("PUBLISHED")}
                className="gap-2"
              >
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Megaphone className="h-4 w-4 text-success" />
                )}
                <div>
                  <div className="font-medium">Publish</div>
                  <div className="text-xs text-muted-foreground">
                    {errors
                      ? `Fix ${errors} error(s) first`
                      : "Make visible to students"}
                  </div>
                </div>
              </DropdownMenuItem>
            )}

            {canArchive && (
              <DropdownMenuItem
                id="menu-archive-assignment"
                disabled={statusLoading}
                onClick={() => changeStatus("ARCHIVED")}
                className="gap-2"
              >
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">Archive</div>
                  <div className="text-xs text-muted-foreground">
                    Hide from students, keep data
                  </div>
                </div>
              </DropdownMenuItem>
            )}

            {canUnarchive && (
              <DropdownMenuItem
                id="menu-unarchive-assignment"
                disabled={statusLoading}
                onClick={() => changeStatus("DRAFT")}
                className="gap-2"
              >
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 text-primary" />
                )}
                <div>
                  <div className="font-medium">Move to Draft</div>
                  <div className="text-xs text-muted-foreground">
                    Restore from archive
                  </div>
                </div>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* ── Save settings ── */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Saving
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={autosave}
              onCheckedChange={(v) => set({ autosave: !!v })}
            >
              Autosave (1.2s after last change)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
