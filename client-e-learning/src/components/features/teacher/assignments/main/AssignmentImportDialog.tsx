"use client";

import { useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { toast } from "sonner";

// import { downloadAssignmentQuestionTemplate } from "@/services/assignment.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AssignmentImportDialog({
  open,
  onClose,
}: Props) {
  const [isDownloading, setIsDownloading] =
    useState(false);

  if (!open) {
    return null;
  }

  const downloadTemplate = async () => {
    setIsDownloading(true);

    try {
      // await downloadAssignmentQuestionTemplate();
      toast.success("Template downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not download the template.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-body-sm font-bold text-primary">
              Import questions
            </p>

            <h2 className="mt-1 text-section-title font-bold">
              Add questions from Excel
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 rounded-lg border-2 border-dashed border-border p-8 text-center">
          <Upload className="mx-auto size-8 text-primary" />

          <p className="mt-3 text-body font-bold">
            Drag and drop your file here
          </p>

          <p className="mt-1 text-body-sm text-muted-foreground">
            Or select an .xlsx file, up to 5MB
          </p>

          <button
            type="button"
            disabled
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground opacity-60"
          >
            Choose file
          </button>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          disabled={isDownloading}
          className="mt-4 inline-flex items-center gap-2 text-body-sm font-bold text-primary"
        >
          <Download className="size-4" />

          {isDownloading
            ? "Downloading..."
            : "Download Excel template"}
        </button>

        <p className="mt-2 text-[0.6875rem] text-muted-foreground">
          File parsing and preview will be connected in
          the Excel import milestone.
        </p>
      </div>
    </div>
  );
}