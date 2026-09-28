"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

export const TYPED_CONFIRMATION_THRESHOLD = 5;
const CONFIRM_WORD = "DELETE";

export function DeleteQuestionsDialog({
    open,
    count,
    previewLabels,
    pending,
    errorMessage,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    count: number;
    previewLabels: string[];
    pending: boolean;
    errorMessage?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const [typed, setTyped] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    const requiresTyping = count >= TYPED_CONFIRMATION_THRESHOLD;
    const confirmEnabled =
        !pending && (!requiresTyping || typed.trim() === CONFIRM_WORD);

    // Reset the typed text whenever the dialog is opened fresh.
    useEffect(() => {
        if (open) setTyped("");
    }, [open]);

    // Move focus into the dialog: the input when typing is required,
    // otherwise the Cancel button (the safe default for a destructive prompt).
    useEffect(() => {
        if (!open) return;
        const target = requiresTyping ? inputRef.current : cancelRef.current;
        target?.focus();
    }, [open, requiresTyping]);

    // Escape closes — unless a delete is in flight.
    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !pending) onCancel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, pending, onCancel]);

    if (!open) return null;

    const hiddenCount = Math.max(0, count - previewLabels.length);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !pending) onCancel();
            }}
            role="presentation"
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-questions-title"
                aria-describedby="delete-questions-desc"
                className="w-full max-w-md rounded-xl bg-white shadow-xl"
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
                            <AlertTriangle size={18} />
                        </span>
                        <div>
                            <h2
                                id="delete-questions-title"
                                className="text-base font-bold text-slate-900"
                            >
                                Delete {count} {count === 1 ? "question" : "questions"}?
                            </h2>
                            <p
                                id="delete-questions-desc"
                                className="mt-0.5 text-body-sm text-slate-500"
                            >
                                This is permanent and cannot be undone.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        aria-label="Close"
                        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-4">
                    <ul className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-body-sm text-slate-700">
                        {previewLabels.map((label, index) => (
                            <li key={index} className="truncate">
                                • {label}
                            </li>
                        ))}
                        {hiddenCount > 0 && (
                            <li className="text-xs text-slate-400">
                                …and {hiddenCount} more
                            </li>
                        )}
                    </ul>

                    <p className="text-body-sm text-slate-600">
                        Their options, answers and attached media will be removed too.
                        Students' past results are not affected.
                    </p>

                    {requiresTyping && (
                        <label className="block">
                            <span className="mb-1 block text-xs font-medium text-slate-500">
                                Type <b className="font-mono text-rose-600">{CONFIRM_WORD}</b> to
                                confirm
                            </span>
                            <input
                                ref={inputRef}
                                value={typed}
                                onChange={(event) => setTyped(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && confirmEnabled) onConfirm();
                                }}
                                autoComplete="off"
                                spellCheck={false}
                                disabled={pending}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50"
                            />
                        </label>
                    )}

                    {errorMessage && (
                        <p
                            role="alert"
                            className="rounded-lg bg-rose-50 px-3 py-2 text-body-sm text-rose-600"
                        >
                            {errorMessage}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!confirmEnabled}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending && <Loader2 size={14} className="animate-spin" />}
                        {pending
                            ? "Deleting..."
                            : `Delete ${count} ${count === 1 ? "question" : "questions"}`}
                    </button>
                </div>
            </div>
        </div>
    );
}