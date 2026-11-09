"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  GripVertical,
  Layers,
  Plus,
} from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentView,
  CreateSectionRequest,
  UpdateUnitRequest,
} from "@/types/content";
import { EntityHeader } from "./components/entity-header";
import { TableTitle } from "./components/table-title";
import { ContentEditor } from "./components/content-editor";
import { FullPageState, PageBanner, RegionState } from "@/components/feedback";
import { UnitVocabularySection } from "./components/unit-vocabulary-section";
import { ContentBreadcrumb } from "./components/content-breadcrumb";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
import { ContentTabs } from "./components/content-tabs";
import { formatDateTime } from "@/utils/format";

type UnitTab = "content" | "vocabulary" | "overview";

const UNIT_TABS: { value: UnitTab; label: string }[] = [
  { value: "content", label: "Nội dung" },
  { value: "vocabulary", label: "Từ vựng" },
  { value: "overview", label: "Tổng quan" },
];

export function UnitDetail({
  unitId,
  onNavigate,
}: {
  unitId: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const client = useQueryClient();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<UnitTab>("content");
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [justMovedId, setJustMovedId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const unit = useQuery({
    queryKey: QUERY_KEYS.contentUnit(unitId),
    queryFn: async () => (await contentService.getUnit(unitId)).data,
  });
  const sections = useQuery({
    queryKey: QUERY_KEYS.contentSections(unitId),
    queryFn: async () => (await contentService.listSections(unitId)).data,
  });

  const refresh = () => {
    client.invalidateQueries({ queryKey: QUERY_KEYS.contentUnit(unitId) });
    client.invalidateQueries({ queryKey: QUERY_KEYS.contentSections(unitId) });
  };

  const create = useMutation({
    mutationFn: contentService.createSection,
    onSuccess: () => {
      refresh();
      setCreateOpen(false);
      setName("");
      setDescription("");
    },
  });
  const update = useMutation({
    mutationFn: (payload: UpdateUnitRequest) =>
      contentService.updateUnit(unitId, payload),
    onSuccess: () => {
      refresh();
      setEditOpen(false);
    },
  });
  const status = useMutation({
    mutationFn: (nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
      contentService.updateUnitStatus(unitId, { status: nextStatus }),
    onSuccess: refresh,
  });
  const archive = useMutation({
    mutationFn: () => contentService.archiveUnit(unitId),
    onSuccess: refresh,
  });
  const reorder = useMutation({
    mutationFn: (items: { id: number; displayOrder: number }[]) =>
      contentService.reorderSections(unitId, { items }),
    onSuccess: refresh,
  });

  const move = (index: number, direction: -1 | 1) => {
    const items = [...(sections.data ?? [])];
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
    const items = [...(sections.data ?? [])];
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
  };
  const handleDragOver = (id: number) => (event: React.DragEvent) => {
    event.preventDefault();
    if (id !== dragId) setDragOverId(id);
  };
  const handleDragLeave = (id: number) => () => {
    setDragOverId((current) => (current === id ? null : current));
  };
  const handleDrop = (id: number) => (event: React.DragEvent) => {
    event.preventDefault();
    if (dragId !== null && dragId !== id) reorderTo(dragId, id);
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  if (unit.isLoading) return <FullPageState variant="loading" />;
  if (unit.isError || !unit.data) return <FullPageState variant="error" />;

  const list = sections.data ?? [];
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
          { label: `${unit.data.code} - ${unit.data.name}` },
        ]}
      />
      <EntityHeader
        title={`${unit.data.code} - ${unit.data.name}`}
        label={`Grade ${unit.data.gradeId}`}
        status={unit.data.status}
        description={
          unit.data.description ?? "Organize learning content for this unit."
        }
        icon={<BookOpen size={21} />}
        editLabel="Edit Unit"
        onEdit={() => setEditOpen((open) => !open)}
        onStatusChange={(nextStatus) => status.mutate(nextStatus)}
        onArchive={() => archive.mutate()}
        actionPending={status.isPending || archive.isPending}
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
            kind="unit"
            initial={unit.data}
            onSubmit={(payload) => update.mutate(payload as UpdateUnitRequest)}
            onCancel={() => setEditOpen(false)}
            pending={update.isPending}
            error={update.isError ? "Could not save changes." : undefined}
          />
        </div>
      )}

      <ContentTabs
        active={activeTab}
        items={UNIT_TABS}
        onChange={setActiveTab}
        idPrefix={`unit-${unitId}`}
        className="mt-6"
      />

      {activeTab === "content" && (
        <section
          id={`unit-${unitId}-panel-content`}
          role="tabpanel"
          aria-labelledby={`unit-${unitId}-tab-content`}
          className="mt-5 overflow-hidden rounded-xl border-2 border-ink shadow-pop bg-white shadow-none dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b-2 border-slate-300 p-2 sm:p-3 dark:border-slate-700">
            <TableTitle
              title="Sections"
              count={list.length}
              action="Add Section"
              onAction={() => setCreateOpen((open) => !open)}
            />
          </div>

          {createOpen && (
            <form
              className="border-b-2 border-slate-300 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800/50"
              onSubmit={(event) => {
                event.preventDefault();
                const payload: CreateSectionRequest = {
                  unitId,
                  name,
                  description,
                };
                create.mutate(payload);
              }}
            >
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
                    Section name
                  </span>
                  <input
                    required
                    autoFocus
                    placeholder="e.g. Fractions"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="min-h-11 w-full rounded-lg border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-none outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-0 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
                    Description
                  </span>
                  <input
                    placeholder="Optional short description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-11 w-full rounded-lg border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-none outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-0 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-primary"
                  />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="min-h-10 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-none transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={create.isPending}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-white shadow-none transition hover:bg-primary-hover hover:border-primary-hover disabled:opacity-50"
                >
                  <Plus size={15} />
                  {create.isPending ? "Saving..." : "Save section"}
                </button>
              </div>
            </form>
          )}

          {sections.isLoading ? (
            <SkeletonList count={4} className="p-4 sm:p-5" />
          ) : sections.isError ? (
            <div className="p-4 sm:p-5">
              <RegionState
                variant="error"
                title="Could not load sections"
                description="Try loading the section list again."
                action={
                  <button
                    type="button"
                    onClick={() => void sections.refetch()}
                    className="rounded-lg border-2 border-slate-300 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Retry
                  </button>
                }
              />
            </div>
          ) : list.length === 0 && !createOpen ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center sm:px-5">
              <Layers
                className="text-slate-400 dark:text-slate-500"
                size={28}
                strokeWidth={1.75}
              />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No sections yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add a section to start organizing this unit&apos;s topics.
              </p>
            </div>
          ) : (
            <>
              {/* Column header — desktop only, sits directly above the row list */}
              <div className="hidden grid-cols-[3.5rem_1fr_6rem_8rem_6rem] gap-3 border-b-2 border-slate-300 bg-slate-100/80 px-5 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 md:grid">
                <span>Order</span>
                <span>Section</span>
                <span className="text-right">Topics</span>
                <span>Status</span>
                <span className="text-right">Reorder</span>
              </div>

              {/* Row list */}
              <ul className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                {list.map((section, index) => {
                  const isDraft = section.status !== "PUBLISHED";
                  const highlighted = justMovedId === section.id;
                  const isDragging = dragId === section.id;
                  const isDragOver =
                    dragOverId === section.id && dragId !== section.id;
                  return (
                    <li
                      key={section.id}
                      draggable
                      onDragStart={handleDragStart(section.id)}
                      onDragOver={handleDragOver(section.id)}
                      onDragLeave={handleDragLeave(section.id)}
                      onDrop={handleDrop(section.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onNavigate("section", section.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onNavigate("section", section.id);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      className={`group grid cursor-pointer grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-4 py-3.5 transition duration-200 sm:px-5 md:grid-cols-[3.5rem_1fr_6rem_8rem_6rem] md:items-center md:gap-3 md:py-3 ${
                        isDragging
                          ? "opacity-30"
                          : isDragOver
                            ? "border-l-4 border-l-primary bg-primary/10"
                            : highlighted
                              ? "bg-primary/10"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Order number */}
                      <span className="pt-0.5 text-sm font-bold tabular-nums text-slate-500 dark:text-slate-400 md:pt-0">
                        {String(section.displayOrder).padStart(2, "0")}
                      </span>

                      {/* Name + description + mobile-only meta row */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-slate-900 group-hover:text-primary dark:text-slate-100">
                            {section.name}
                          </span>
                        </div>
                        {section.description && (
                          <p className="mt-0.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                            {section.description}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 md:hidden">
                          <StatusDot draft={isDraft} label={section.status} />
                          <span className="whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {section.totalTopic} topics
                          </span>
                        </div>
                      </div>

                      {/* Topics — desktop column */}
                      <span className="hidden text-right text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300 md:block">
                        {section.totalTopic}
                      </span>

                      {/* Status — desktop column */}
                      <div className="hidden md:flex md:items-center md:justify-start">
                        <StatusDot draft={isDraft} label={section.status} />
                      </div>

                      {/* Reorder controls */}
                      <div
                        className="col-start-3 row-start-1 flex shrink-0 items-center gap-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-end"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <GripVertical
                          size={16}
                          className="mr-0.5 hidden cursor-grab text-slate-400 transition hover:text-slate-700 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300 md:block"
                        />
                        <button
                          type="button"
                          disabled={index === 0 || reorder.isPending}
                          onClick={() => move(index, -1)}
                          aria-label="Move section up"
                          className="grid h-8 w-8 place-items-center rounded-lg border-2 border-slate-300 bg-white text-slate-600 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={
                            index === list.length - 1 || reorder.isPending
                          }
                          onClick={() => move(index, 1)}
                          aria-label="Move section down"
                          className="grid h-8 w-8 place-items-center rounded-lg border-2 border-slate-300 bg-white text-slate-600 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary"
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
      )}

      {activeTab === "vocabulary" && (
        <div
          id={`unit-${unitId}-panel-vocabulary`}
          role="tabpanel"
          aria-labelledby={`unit-${unitId}-tab-vocabulary`}
          className="mt-5"
        >
          <UnitVocabularySection unitId={unitId} />
        </div>
      )}

      {activeTab === "overview" && (
        <section
          id={`unit-${unitId}-panel-overview`}
          role="tabpanel"
          aria-labelledby={`unit-${unitId}-tab-overview`}
          className="mt-5 rounded-xl border-2 border-ink shadow-pop bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Thông tin Unit
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <OverviewField
              label="Mô tả"
              value={unit.data.description || "Chưa có mô tả"}
            />
            <OverviewField
              label="Khối lớp"
              value={`Grade ${unit.data.gradeId}`}
            />
            <OverviewField label="Mã Unit" value={unit.data.code} />
            <OverviewField label="Trạng thái" value={unit.data.status} />
            <OverviewField
              label="Số Section"
              value={String(unit.data.totalSection)}
            />
            <OverviewField
              label="Số Topic"
              value={String(unit.data.totalTopic)}
            />
            <OverviewField
              label="Thứ tự hiển thị"
              value={String(unit.data.displayOrder)}
            />
            <OverviewField
              label="Ngày tạo"
              value={formatDateTime(unit.data.createdAt, locale)}
            />
            <OverviewField
              label="Cập nhật gần nhất"
              value={formatDateTime(unit.data.updatedAt, locale)}
            />
            {unit.data.publishedAt && (
              <OverviewField
                label="Ngày xuất bản"
                value={formatDateTime(unit.data.publishedAt, locale)}
              />
            )}
          </dl>
        </section>
      )}
    </>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <dt className="text-sm font-bold text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

function StatusDot({ draft, label }: { draft: boolean; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 px-2 py-0.5 text-sm font-bold tracking-wide ${
        draft
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
          : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          draft ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />
      {label}
    </span>
  );
}
