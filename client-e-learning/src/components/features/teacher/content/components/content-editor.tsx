import { useState } from "react";
import type { UpdateSectionRequest, UpdateTopicRequest, UpdateUnitRequest } from "@/types/content";

type EditorKind = "unit" | "section" | "topic";
type EditorPayload = UpdateUnitRequest | UpdateSectionRequest | UpdateTopicRequest;

interface ContentEditorProps {
  kind: EditorKind;
  initial: { code?: string; name: string; description?: string };
  onSubmit: (payload: EditorPayload) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string;
}

export function ContentEditor({ kind, initial, onSubmit, onCancel, pending, error }: ContentEditorProps) {
  const [code, setCode] = useState(initial.code ?? "");
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(kind === "unit" ? { code, name, description } : { name, description });
  };

  return (
    <form onSubmit={submit} className="mb-5 rounded-xl border border-primary/20 bg-primary-light/30 p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Edit {kind}</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Update content details</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {kind === "unit" && <label className="text-sm font-medium text-slate-600">Code<input required value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>}
        <label className="text-sm font-medium text-slate-600">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
        <label className="text-sm font-medium text-slate-600 sm:col-span-2">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
      </div>
      {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Saving..." : "Save changes"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  );
}