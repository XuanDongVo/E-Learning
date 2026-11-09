"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, GripVertical, Plus, Tags } from "lucide-react";
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
import { FullPageState, PageBanner, RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
import { Link } from "@/i18n/navigation";
import { ContentBreadcrumb } from "./components/content-breadcrumb";

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
  const unit = useQuery({
    queryKey: QUERY_KEYS.contentUnit(section.data?.unitId ?? 0),
    queryFn: async () =>
      (await contentService.getUnit(section.data!.unitId)).data,
    enabled: Boolean(section.data?.unitId),
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

  const handleDragStart = (id: number) => (event: React.DragEvent) => {
    setDragId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
  };
  const handleDragOver = (id: number) => (event: React.DragEvent) => {
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

  if (section.isLoading) return <FullPageState variant="loading" />;
  if (section.isError || !section.data) return <FullPageState variant="error" />;
  if (unit.isLoading) return <FullPageState variant="loading" />;
  if (unit.isError || !unit.data)
    return (
      <FullPageState
        variant="error"
        action={
          <button type="button" onClick={() => void unit.refetch()}>
            Retry
          </button>
        }
      />
    );

  const list = topics.data ?? [];
  const mutationError =
    update.error ??
    status.error ??
    archive.error ??
    create.error ??
    reorder.error;

  return (
    <>
      <ContentBreadcrumb
        items={[
          { label: "Content" },
          { label: "Units", href: "/teacher/content" },
          {
            label: `${unit.data.code} - ${unit.data.name}`,
            href: `/teacher/content/units/${unit.data.id}`,
          },
          { label: section.data.name },
        ]}
      />
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
        context={
          <Link
            href={`/teacher/content/units/${unit.data.id}`}
            className="rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Unit: {unit.data.code} - {unit.data.name}
          </Link>
        }
      />

      {mutationError && (
        <PageBanner
          tone="error"
          className="mt-4"
          title="Không thể lưu thay đổi"
          message={
            mutationError instanceof Error
              ? mutationError.message
              : "Vui lòng kiểm tra dữ liệu và thử lại."
          }
          onDismiss={() => {
            update.reset();
            status.reset();
            archive.reset();
            create.reset();
            reorder.reset();
          }}
        />
      )}

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

      <section className="mt-5 overflow-hidden border-2 border-ink bg-card rounded-lg shadow-pop">
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
            className="mx-4 mb-1 border border-primary/20 bg-primary-soft p-4 sm:mx-5"
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
                <span className="mb-1 block text-label font-semibold text-muted-foreground">
                  Topic name
                </span>
                <input
                  required
                  autoFocus
                  placeholder="e.g. Adding fractions"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-label font-semibold text-muted-foreground">
                  Description
                </span>
                <input
                  placeholder="Optional short description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="min-h-10 rounded-lg border border-border bg-card px-4 py-2 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
              <button
                disabled={create.isPending}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                <Plus size={15} />
                {create.isPending ? "Saving..." : "Save topic"}
              </button>
            </div>
          </form>
        )}

        {topics.isLoading ? (
          <SkeletonList count={4} className="p-4 sm:p-5" />
        ) : topics.isError ? (
          <RegionState
            variant="error"
            title="Could not load topics"
            description="Try loading the topic list again."
            action={
              <button
                type="button"
                onClick={() => void topics.refetch()}
                className="rounded-lg border border-border px-3 py-2 font-semibold hover:bg-muted"
              >
                Retry
              </button>
            }
          />
        ) : list.length === 0 && !createOpen ? (
          <RegionState variant="empty" />
        ) : (
          <>
            {/* Column header — desktop only, sits directly above the row list */}
            <div className="mt-4 hidden grid-cols-[3rem_1fr_7rem_7rem_6rem] gap-3 border-y border-border bg-muted/50 px-5 py-2 text-label font-semibold text-muted-foreground md:grid">
              <span>Order</span>
              <span>Topic</span>
              <span className="text-right">Question banks</span>
              <span>Status</span>
              <span className="text-right">Reorder</span>
            </div>

            {/* Row list — hairline dividers, no per-row card chrome */}
            <ul className="divide-y divide-border border-b border-border md:border-b-0">
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
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onNavigate("topic", topic.id);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                    className={`group grid cursor-pointer grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-4 py-3.5 transition-colors duration-700 sm:px-5 md:grid-cols-[3rem_1fr_7rem_7rem_5.5rem] md:items-center md:gap-3 md:py-3 ${
                      isDragging
                        ? "opacity-40"
                        : isDragOver
                          ? "bg-primary-light/60 ring-1 ring-inset ring-primary/30"
                          : highlighted
                            ? "bg-primary-light/40"
                            : "hover:bg-muted/60 focus-within:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    }`}
                  >
                    {/* Order number — tabular, aligned like a spreadsheet column */}
                    <span className="pt-0.5 text-body-sm tabular-nums text-muted-foreground md:pt-0">
                      {String(topic.displayOrder).padStart(2, "0")}
                    </span>

                    {/* Name + description + mobile-only meta row */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-body font-semibold text-foreground">
                          {topic.name}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-body-sm text-muted-foreground">
                        {topic.description ?? "No description"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 md:hidden">
                        <StatusDot draft={isDraft} label={topic.status} />
                        <span className="whitespace-nowrap text-label text-muted-foreground">
                          {topic.totalQuestionBank} question banks
                        </span>
                      </div>
                    </div>

                    {/* Question banks — desktop column */}
                    <span className="hidden text-right text-body-sm tabular-nums text-muted-foreground md:block">
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
                      onKeyDown={(event) => event.stopPropagation()}
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
                        className="mr-0.5 hidden select-none rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing md:block md:cursor-grab"
                      >
                        <GripVertical size={15} className="pointer-events-none" />
                      </span>
                      <button
                        type="button"
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(index, -1)}
                        aria-label="Move topic up"
                        className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === list.length - 1 || reorder.isPending}
                        onClick={() => move(index, 1)}
                        aria-label="Move topic down"
                        className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-25"
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
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-label font-semibold text-muted-foreground">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          draft ? "bg-warning" : "bg-success"
        }`}
      />
      {label}
    </span>
  );
}
