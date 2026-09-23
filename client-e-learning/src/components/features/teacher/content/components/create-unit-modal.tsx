"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import type { CreateUnitRequest } from "@/types/content";

interface CreateUnitModalProps {
  open: boolean;
  onClose: () => void;
  form: CreateUnitRequest;
  onFormChange: React.Dispatch<React.SetStateAction<CreateUnitRequest>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  coverPreview?: string;
  coverFileName?: string;
  isUploadingCover: boolean;
  onCoverChange: (file: File | undefined) => void;
  coverError?: string;
}

type FieldName = "code" | "name";

export function CreateUnitModal({
  open,
  onClose,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
  coverPreview,
  coverFileName,
  isUploadingCover,
  onCoverChange,
  coverError,
}: CreateUnitModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const errors: Partial<Record<FieldName, string>> = {
    code: form.code.trim() ? undefined : "Code is required.",
    name: form.name.trim() ? undefined : "Unit name is required.",
  };

  const errorFor = (field: FieldName) =>
    (touched[field] || attemptedSubmit) ? errors[field] : undefined;

  // Reset local validation state each time the modal is opened, and focus the first field.
  useEffect(() => {
    if (!open) return;
    setTouched({});
    setAttemptedSubmit(false);
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Close on Escape, keep focus cycling inside the dialog.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const container = dialogRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (errors.code || errors.name) return;
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-unit-title"
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="create-unit-title" className="text-card-title font-bold text-slate-900">
            Create unit
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-4">
            <Field label="Code" error={errorFor("code")}>
              <input
                ref={firstFieldRef}
                value={form.code}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, code: event.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
                placeholder="e.g. U1"
                className={fieldClass("h-10", Boolean(errorFor("code")))}
              />
            </Field>

            <Field label="Unit name" error={errorFor("name")}>
              <input
                value={form.name}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, name: event.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                placeholder="e.g. Numbers and Counting"
                className={fieldClass("h-10", Boolean(errorFor("name")))}
              />
            </Field>

            <Field label="Description" optional>
              <textarea
                value={form.description ?? ""}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={2}
                placeholder="Short summary of this unit"
                className={fieldClass("resize-none py-2", false)}
              />
            </Field>

            <Field label="Cover image" optional error={coverError}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3 hover:border-primary/40">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Unit cover preview"
                    className="h-14 w-20 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-white text-xs text-slate-400">
                    No cover
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-body-sm font-medium text-slate-700">
                    {isUploadingCover ? "Uploading..." : coverFileName ?? "Choose an image"}
                  </span>
                  <span className="block text-caption text-slate-400">PNG or JPG</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => onCoverChange(event.target.files?.[0])}
                />
              </label>
            </Field>

            <Field label="Display order" optional>
              <input
                type="number"
                min={0}
                value={form.displayOrder ?? 0}
                onChange={(event) =>
                  onFormChange((prev) => ({
                    ...prev,
                    displayOrder: Number(event.target.value),
                  }))
                }
                className={fieldClass("h-10", false)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover}
              className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-body-sm font-medium text-slate-600">
        {label}
        {optional && (
          <span className="text-caption font-normal text-slate-400">Optional</span>
        )}
      </span>
      {children}
      {error && <span className="mt-1 block text-caption text-rose-600">{error}</span>}
    </label>
  );
}

function fieldClass(extra: string, hasError: boolean) {
  return `
    w-full rounded-lg border bg-white px-3
    text-body-sm outline-none transition-colors
    ${extra}
    ${
      hasError
        ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
    }
  `;
}