"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, GripVertical, Layers, Plus, Tags } from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentView,
  CreateTopicRequest,
  UpdateSectionRequest,
  UpdateStatusRequest,
} from "@/types/content";
import { EntityHeader } from "./components/entity-header";
import { TableTitle } from "./components/table-title";
import { ContentEditor } from "./components/content-editor";

export function SectionDetail({
  sectionId,
  onNavigate,
}: {
  sectionId: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const client = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [justMovedId, setJustMovedId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const section = useQuery({
    queryKey: QUERY_KEYS.contentSection(sectionId),
    queryFn: async () => (await contentService.getSection(sectionId)).data,
  });
  const topics = useQuery({
    queryKey: QUERY_KEYS.contentTopics(sectionId),
    queryFn: async () => (await contentService.listTopics(sectionId)).data,
  });

  const refresh = () => {
    client.invalidateQueries({
      queryKey: QUERY_KEYS.contentSection(sectionId),
    });
    client.invalidateQueries({ queryKey: QUERY_KEYS.contentTopics(sectionId) });
  };

  const update = useMutation({
    mutationFn: (payload: UpdateSectionRequest) =>
      contentService.updateSection(sectionId, payload),
    onSuccess: () => {
      refresh();
      setEditOpen(false);
    },
  });
  const create = useMutation({
    mutationFn: contentService.createTopic,
    onSuccess: () => {
      refresh();
      setCreateOpen(false);
      setName("");
      setDescription("");
    },
  });
  const status = useMutation({
    mutationFn: (payload: UpdateStatusRequest) =>
      contentService.updateSectionStatus(sectionId, payload),
    onSuccess: refresh,
  });
  const archive = useMutation({
    mutationFn: () => contentService.archiveSection(sectionId),
    onSuccess: refresh,
  });
  const reorder = useMutation({
    mutationFn: (items: { id: number; displayOrder: number }[]) =>
      contentService.reorderTopics(sectionId, { items }),
    onSuccess: refresh,
  });

  const move = (index: number, direction: -1 | 1) => {
    const items = [...(topics.data ?? [])];
    const target = index + direction;
    if (target < 0 || target >= items.length || reorder.isPending) return;
    const movedId = items[index].id;
    [items[index], items[target]] = [items[target], items[index]];
    setJustMovedId(movedId);
    reorder.mutate(
      items.map((item, itemIndex) => ({
        id: item.id,
        displayOrder: itemIndex + 1,
      })),
    );
  };

  useEffect(() => {
    if (justMovedId === null) return;
    const timer = setTimeout(() => setJustMovedId(null), 900);
    return () => clearTimeout(timer);
  }, [justMovedId]);

  const reorderTo = (draggedId: number, targetId: number) => {
    const items = [...(topics.data ?? [])];
    const fromIndex = items.findIndex((item) => item.id === draggedId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    setJustMovedId(draggedId);
    reorder.mutate(
      items.map((item, itemIndex) => ({
        id: item.id,
        displayOrder: itemIndex + 1,
      })),
    );
  };

  // NOTE on why drag-and-drop can silently fail in React:
  // 1. `stopPropagation()` inside onDragStart is unnecessary and, in some
  //    browsers, interferes with the drag image being captured — removed.
  // 2. The draggable element must not have `user-select` issues and should
  //    not itself contain other draggable/interactive descendants.
  // 3. `onDragOver` MUST call preventDefault() on the drop target for
  //    `onDrop` to ever fire at all — this is native browser behavior,
  //    not React-specific, and is the single most common reason drop
  //    handlers "don't work".
  const handleDragStart = (id: number) => (event: React.DragEvent) => {
    setDragId(id);
    event.dataTransfer.effectAllowed = "move";
    // Some browsers (notably Firefox) require dataTransfer to carry data
    // for the drag operation to be allowed to start at all.
    event.dataTransfer.setData("text/plain", String(id));
  };
  const handleDragOver = (id: number) => (event: React.DragEvent) => {
    // Always preventDefault on dragover for valid drop targets — without
    // this, the browser rejects the drop and onDrop never runs.
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (id !== dragId) setDragOverId(id);
  };
  const handleDragLeave = (id: number) => () => {
    setDragOverId((current) => (current === id ? null : current));
  };
  const handleDrop = (id: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceId = dragId ?? Number(event.dataTransfer.getData("text/plain"));
    if (sourceId && sourceId !== id) reorderTo(sourceId, id);
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  if (section.isLoading)
    return <p className="text-body-sm  text-slate-400">Loading section...</p>;
  if (section.isError || !section.data)
    return (
      <p className="rounded-lg bg-rose-50 p-4 text-body-sm  text-rose-600">
        Could not load section.
      </p>
    );

  const list = topics.data ?? [];

  return (
    <>
      <EntityHeader
        title={section.data.name}
        label="Section"
        status={section.data.status}
        description={
          section.data.description ?? "Organize topics in this section."
        }
        icon={<Tags size={21} />}
        editLabel="Edit Section"
        onEdit={() => setEditOpen((open) => !open)}
        onStatusChange={(nextStatus) => status.mutate({ status: nextStatus })}
        onArchive={() => archive.mutate()}
        actionPending={status.isPending || archive.isPending}
      />

      {editOpen && (
        <div className="mt-5">
          <ContentEditor
            kind="section"
            initial={section.data}
            onSubmit={(payload) => update.mutate(payload as UpdateSectionRequest)}
            onCancel={() => setEditOpen(false)}
            pending={update.isPending}
            error={update.isError ? "Could not save changes." : undefined}
          />
        </div>
      )}

      <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
        <div className="p-4 sm:p-5 sm:pb-0">
          <TableTitle
            title="Topics"
            count={list.length}
            action="Add Topic"
            onAction={() => setCreateOpen((open) => !open)}
          />
        </div>

        {createOpen && (
          <form
            className="mx-4 mb-1 rounded-xl border border-primary/15 bg-primary-light/40 p-4 sm:mx-5"
            onSubmit={(event) => {
              event.preventDefault();
              const payload: CreateTopicRequest = {
                sectionId,
                name,
                description,
              };
              create.mutate(payload);
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Topic name
                </span>
                <input
                  required
                  autoFocus
                  placeholder="e.g. Adding fractions"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-sm  text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Description
                </span>
                <input
                  placeholder="Optional short description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-sm  text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm  font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={create.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-body-sm  font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Plus size={15} />
                {create.isPending ? "Saving..." : "Save topic"}
              </button>
            </div>
          </form>
        )}

        {list.length === 0 && !createOpen ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center sm:px-5">
            <Layers className="text-slate-300" size={26} strokeWidth={1.5} />
            <p className="text-body-sm  text-slate-500">No topics yet</p>
            <p className="text-xs text-slate-400">
              Add a topic to start organizing this section's question banks.
            </p>
          </div>
        ) : (
          <>
            {/* Column header — desktop only, sits directly above the row list */}
            <div className="mt-4 hidden grid-cols-[3rem_1fr_7rem_7rem_5.5rem] gap-3 border-y border-slate-100 bg-slate-50/70 px-5 py-2 text-xs font-medium text-slate-400 md:grid">
              <span>Order</span>
              <span>Topic</span>
              <span className="text-right">Question banks</span>
              <span>Status</span>
              <span className="text-right">Reorder</span>
            </div>

            {/* Row list — hairline dividers, no per-row card chrome */}
            <ul className="divide-y divide-slate-100 border-b border-slate-100 md:border-b-0">
              {list.map((topic, index) => {
                const isDraft = topic.status !== "PUBLISHED";
                const highlighted = justMovedId === topic.id;
                const isDragging = dragId === topic.id;
                const isDragOver = dragOverId === topic.id && dragId !== topic.id;
                return (
                  <li
                    key={topic.id}
                    onDragOver={handleDragOver(topic.id)}
                    onDragEnter={handleDragOver(topic.id)}
                    onDragLeave={handleDragLeave(topic.id)}
                    onDrop={handleDrop(topic.id)}
                    onClick={() => onNavigate("topic", topic.id)}
                    className={`group grid cursor-pointer grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-4 py-3.5 transition-colors duration-700 sm:px-5 md:grid-cols-[3rem_1fr_7rem_7rem_5.5rem] md:items-center md:gap-3 md:py-3 ${
                      isDragging
                        ? "opacity-40"
                        : isDragOver
                          ? "bg-primary-light/60 ring-1 ring-inset ring-primary/30"
                          : highlighted
                            ? "bg-primary-light/40"
                            : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Order number — tabular, aligned like a spreadsheet column */}
                    <span className="pt-0.5 font-mono text-body-sm tabular-nums text-slate-400 md:pt-0">
                      {String(topic.displayOrder).padStart(2, "0")}
                    </span>

                    {/* Name + description + mobile-only meta row */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-slate-800">
                          {topic.name}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-body-sm text-slate-400">
                        {topic.description ?? "No description"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 md:hidden">
                        <StatusDot draft={isDraft} label={topic.status} />
                        <span className="whitespace-nowrap text-xs text-slate-400">
                          {topic.totalQuestionBank} question banks
                        </span>
                      </div>
                    </div>

                    {/* Question banks — desktop column */}
                    <span className="hidden text-right text-body-sm tabular-nums text-slate-500 md:block">
                      {topic.totalQuestionBank}
                    </span>

                    {/* Status — desktop column */}
                    <div className="hidden md:flex md:items-center md:justify-start">
                      <StatusDot draft={isDraft} label={topic.status} />
                    </div>

                    {/* Reorder controls */}
                    <div
                      className="col-start-3 row-start-1 flex shrink-0 items-center gap-0.5 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-end"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {/* Drag handle. draggable is set here only (not on the
                          whole row) so clicking/selecting row text still
                          works normally. `select-none` stops the browser
                          treating the mousedown as a text-selection drag,
                          which otherwise silently swallows dragstart. */}
                      <span
                        draggable="true"
                        onDragStart={handleDragStart(topic.id)}
                        onDragEnd={handleDragEnd}
                        aria-label="Drag to reorder topic"
                        title="Drag to reorder"
                        className="mr-0.5 hidden select-none rounded p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing md:block md:cursor-grab"
                      >
                        <GripVertical size={15} className="pointer-events-none" />
                      </span>
                      <button
                        type="button"
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(index, -1)}
                        aria-label="Move topic up"
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === list.length - 1 || reorder.isPending}
                        onClick={() => move(index, 1)}
                        aria-label="Move topic down"
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </>
  );
}

function StatusDot({ draft, label }: { draft: boolean; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          draft ? "bg-amber-400" : "bg-emerald-500"
        }`}
      />
      {label}
    </span>
  );
}