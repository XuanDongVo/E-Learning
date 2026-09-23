"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronDown,
  GripVertical,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { gradeService } from "@/services/grade.service";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentLayout,
  ContentUnit,
  ContentView,
  CreateUnitRequest,
  ContentTone,
} from "@/types/content";

import { Badge } from "./components/badge";
import { IconTile } from "./components/icon-tile";
import { ContentToolbar } from "./components/content-toolbar";
import { CreateUnitModal } from "./components/create-unit-modal";

export function ContentOverview({
  onNavigate,
}: {
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const queryClient = useQueryClient();

  const [gradeId, setGradeId] = useState<number | undefined>();
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<ContentLayout>("grid");

  const [formOpen, setFormOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>();
  const [mediaError, setMediaError] = useState<string>();

  const [form, setForm] = useState<CreateUnitRequest>({
    gradeId: 0,
    code: "",
    name: "",
    description: "",
    displayOrder: 0,
  });

  // Drag-and-drop reorder state
  const [orderedUnits, setOrderedUnits] = useState<ContentUnit[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [justMovedId, setJustMovedId] = useState<number | null>(null);

  const grades = useQuery({
    queryKey: ["grades"],
    queryFn: async () => (await gradeService.list()).data,
  });

  const selectedGradeId = gradeId ?? grades.data?.[0]?.id;

  const selectedGrade = grades.data?.find(
    (grade) => grade.id === selectedGradeId,
  );

  const units = useQuery({
    queryKey: QUERY_KEYS.contentUnits(selectedGradeId ?? 0),
    queryFn: async () =>
      (await contentService.listUnits(selectedGradeId!)).data,
    enabled: Boolean(selectedGradeId),
  });

  console.log("Units data:", units); // Log the units data for debugging

  // Keep local order in sync whenever fresh data arrives (initial load,
  // grade switch, or after a successful reorder/refetch).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOrderedUnits(units.data ?? []);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [units.data]);

  const createUnit = useMutation({
    mutationFn: contentService.createUnit,

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["content", "units"],
      });

      setFormOpen(false);

      if (response.data) {
        onNavigate("unit", response.data.id);
      }
    },
  });

  const uploadCover = useMutation({
    mutationFn: (file: File) => contentService.uploadMedia(file),
    onError: () => setMediaError("Could not upload the cover image."),
  });

  const reorder = useMutation({
    mutationFn: (items: { id: number; displayOrder: number }[]) =>
      contentService.reorderUnits(selectedGradeId!, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.contentUnits(selectedGradeId ?? 0),
      });
    },
  });

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  const visibleUnits = useMemo(() => {
    const base = orderedUnits;
    if (!isFiltering) return base;
    return base.filter((unit) =>
      `${unit.code} ${unit.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [orderedUnits, normalizedQuery, isFiltering]);

  useEffect(() => {
    if (justMovedId === null) return;
    const timer = setTimeout(() => setJustMovedId(null), 900);
    return () => clearTimeout(timer);
  }, [justMovedId]);

  const reorderTo = (draggedId: number, targetId: number) => {
    const items = [...orderedUnits];
    const fromIndex = items.findIndex((item) => item.id === draggedId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    setOrderedUnits(items);
    setJustMovedId(draggedId);
    reorder.mutate(
      items.map((item, itemIndex) => ({
        id: item.id,
        displayOrder: itemIndex + 1,
      })),
    );
  };

  // Mobile fallback — HTML5 drag doesn't work reliably on touch, so
  // narrow screens get explicit up/down buttons instead of the handle.
  const move = (index: number, direction: -1 | 1) => {
    const items = [...orderedUnits];
    const target = index + direction;
    if (target < 0 || target >= items.length || reorder.isPending) return;
    const movedId = items[index].id;
    [items[index], items[target]] = [items[target], items[index]];
    setOrderedUnits(items);
    setJustMovedId(movedId);
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

  const openCreate = () => {
    if (!selectedGradeId) return;

    setForm({
      gradeId: selectedGradeId,
      code: "",
      name: "",
      description: "",
      displayOrder: 0,
    });
    setCoverFile(null);
    setCoverPreview(undefined);
    setMediaError(undefined);

    setFormOpen(true);
  };

  const submitCreate = async () => {
    setMediaError(undefined);
    let uploadedMediaId: number | undefined;

    try {
      const uploadedMedia = coverFile
        ? await uploadCover.mutateAsync(coverFile)
        : undefined;

      uploadedMediaId = uploadedMedia?.data?.id;
      await createUnit.mutateAsync({
        ...form,
        coverMediaId: uploadedMediaId,
      });
    } catch (error) {
      if (uploadedMediaId) {
        await contentService.deleteMedia(uploadedMediaId).catch(() => undefined);
      }

      setMediaError(
        error instanceof Error
          ? error.message
          : "Could not upload the cover image.",
      );
    }
  };

  const handleCoverChange = (file: File | undefined) => {
    if (!file) return;
    const maxFileSize = 5 * 1024 * 1024;

    if (!file.type.startsWith("image/")) {
      setMediaError("Cover must be an image file.");
      return;
    }

    if (file.size > maxFileSize) {
      setMediaError("Cover image must be 5 MB or smaller.");
      return;
    }

    setMediaError(undefined);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Drag is only meaningful against the full, unfiltered, server order.
  const dragEnabled = !isFiltering;

  return (
    <>
      <ContentToolbar
        title="Content"
        description="Manage your learning content organized by grades and units."
        action="Create Unit"
        onAction={openCreate}
      >
        {/* Search */}
        <div className="flex h-9 w-full items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400 sm:w-[220px]">
          <Search size={14} />

          <input
            className="w-full border-0 text-body-sm text-slate-700 outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search units..."
          />
        </div>

        {/* Mobile Grade Select */}
        <div className="relative w-full sm:w-auto">
          <select
            className="
              h-10 w-full appearance-none rounded-xl
              border border-slate-200 bg-white
              pl-3.5 pr-9
              text-body-sm font-medium text-slate-600
              outline-none
              transition-colors
              hover:border-slate-300
              focus:border-primary
              focus:ring-2 focus:ring-primary/10
              sm:w-[140px]
            "
            value={selectedGradeId ?? ""}
            onChange={(event) => {
              setGradeId(Number(event.target.value));
            }}
          >
            {grades.data?.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Layout */}
        <div className="flex overflow-hidden rounded border border-slate-200">
          <button
            type="button"
            className={`flex p-1.5 ${
              layout === "grid"
                ? "bg-primary-light text-primary"
                : "bg-white text-slate-400"
            }`}
            onClick={() => setLayout("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid size={15} />
          </button>

          <button
            type="button"
            className={`flex p-1.5 ${
              layout === "list"
                ? "bg-primary-light text-primary"
                : "bg-white text-slate-400"
            }`}
            onClick={() => setLayout("list")}
            aria-label="List view"
          >
            <List size={15} />
          </button>
        </div>
      </ContentToolbar>

      <div className="mb-5 hidden gap-2 overflow-x-auto sm:flex">
        {grades.data?.map((grade) => (
          <button
            key={grade.id}
            type="button"
            className={`
              whitespace-nowrap rounded-md border px-5 py-2 text-body-sm
              transition-colors
              ${
                selectedGradeId === grade.id
                  ? "border-primary bg-primary text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }
            `}
            onClick={() => setGradeId(grade.id)}
          >
            {grade.name}
          </button>
        ))}
      </div>

      <CreateUnitModal
        key={formOpen ? "create-unit-open" : "create-unit-closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        onFormChange={setForm}
        onSubmit={submitCreate}
        isSubmitting={createUnit.isPending}
        coverPreview={coverPreview}
        coverFileName={coverFile?.name}
        isUploadingCover={uploadCover.isPending}
        onCoverChange={handleCoverChange}
        coverError={mediaError}
      />

      <section
        className="
          mb-5 rounded-[9px]
          border border-slate-200
          bg-white p-3
          shadow-[0_5px_18px_rgba(94,134,173,0.04)]
          sm:p-[18px]
        "
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-card-title font-bold text-slate-900">
              Units{" "}
              <small className="text-body-sm font-normal text-slate-400">
                ({selectedGrade?.name ?? "Grade"})
              </small>
            </h2>

            <p className="mt-1 text-body-sm text-slate-400">
              {dragEnabled
                ? "Drag a card's handle to reorder units."
                : "Build and organize learning experiences."}
            </p>
          </div>

          <div className="flex overflow-hidden rounded border border-slate-200">
            <button
              type="button"
              className={`flex p-1.5 ${
                layout === "grid"
                  ? "bg-primary-light text-primary"
                  : "bg-white text-slate-400"
              }`}
              onClick={() => setLayout("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>

            <button
              type="button"
              className={`flex p-1.5 ${
                layout === "list"
                  ? "bg-primary-light text-primary"
                  : "bg-white text-slate-400"
              }`}
              onClick={() => setLayout("list")}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {units.isLoading && (
          <div className="rounded-md border border-dashed border-slate-200 py-10 text-center text-body-sm text-slate-400">
            Loading units...
          </div>
        )}

        {units.isError && (
          <div className="rounded-md border border-dashed border-rose-200 bg-rose-50 py-10 text-center text-body-sm text-rose-500">
            Could not load units.
          </div>
        )}

        {!units.isLoading && !units.isError && visibleUnits.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-200 py-8 text-center text-body-sm text-slate-400">
            No units found.
          </p>
        )}

        {!units.isLoading && !units.isError && layout === "grid" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Create Unit Card — stays fixed, not part of drag-and-drop */}
            <button
              type="button"
              className="
                  order-first
                  flex min-h-[250px]
                  flex-col items-center justify-center
                  gap-3 rounded-lg
                  border border-dashed border-primary/30
                  bg-primary-light/30
                  p-4 text-primary
                  transition
                  hover:border-primary
                  hover:bg-primary-light
                "
              onClick={openCreate}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
                <Plus size={22} />
              </span>

              <b className="text-body-sm">Create Unit</b>
            </button>

            {/* Unit Cards */}
            {visibleUnits.map((unit, index) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onOpen={() => onNavigate("unit", unit.id)}
                draggable={dragEnabled}
                isDragging={dragId === unit.id}
                isDragOver={dragOverId === unit.id && dragId !== unit.id}
                isJustMoved={justMovedId === unit.id}
                onDragStart={handleDragStart(unit.id)}
                onDragOver={handleDragOver(unit.id)}
                onDragLeave={handleDragLeave(unit.id)}
                onDrop={handleDrop(unit.id)}
                onDragEnd={handleDragEnd}
                canReorder={dragEnabled}
                isFirst={index === 0}
                isLast={index === visibleUnits.length - 1}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                reorderPending={reorder.isPending}
              />
            ))}
          </div>
        )}

        {!units.isLoading &&
          !units.isError &&
          layout === "list" &&
          visibleUnits.length > 0 && (
            <div className="divide-y divide-slate-100 rounded-md border border-slate-100">
              {visibleUnits.map((unit, index) => {
                const isDragging = dragId === unit.id;
                const isDragOver = dragOverId === unit.id && dragId !== unit.id;
                const isJustMoved = justMovedId === unit.id;
                return (
                  <div
                    key={unit.id}
                    onDragOver={dragEnabled ? handleDragOver(unit.id) : undefined}
                    onDragEnter={dragEnabled ? handleDragOver(unit.id) : undefined}
                    onDragLeave={dragEnabled ? handleDragLeave(unit.id) : undefined}
                    onDrop={dragEnabled ? handleDrop(unit.id) : undefined}
                    className={`flex w-full items-center gap-1 transition-colors duration-700 ${
                      isDragging
                        ? "opacity-40"
                        : isDragOver
                          ? "bg-primary-light/60 ring-1 ring-inset ring-primary/30"
                          : isJustMoved
                            ? "bg-primary-light/40"
                            : ""
                    }`}
                  >
                    {dragEnabled && (
                      <>
                        {/* Desktop: drag handle */}
                        <span
                          draggable="true"
                          onDragStart={handleDragStart(unit.id)}
                          onDragEnd={handleDragEnd}
                          aria-label="Drag to reorder unit"
                          title="Drag to reorder"
                          className="ml-2 hidden shrink-0 select-none rounded p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing md:block md:cursor-grab"
                        >
                          <GripVertical size={15} className="pointer-events-none" />
                        </span>

                        {/* Mobile: up/down buttons */}
                        <div className="ml-2 flex shrink-0 gap-1 md:hidden">
                          <button
                            type="button"
                            disabled={index === 0 || reorder.isPending}
                            onClick={() => move(index, -1)}
                            aria-label="Move unit up"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={index === visibleUnits.length - 1 || reorder.isPending}
                            onClick={() => move(index, 1)}
                            aria-label="Move unit down"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      className="
                        flex w-full min-w-0 items-center
                        gap-3 p-3
                        text-left
                        transition-colors
                        hover:bg-primary-light/40
                      "
                      onClick={() => onNavigate("unit", unit.id)}
                    >
                      <UnitIcon />

                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-card-title text-slate-800">
                          {unit.code} - {unit.name}
                        </strong>

                        <span className="text-body-sm text-slate-400">
                          {unit.totalSection} sections · {unit.totalTopic} topics
                        </span>
                      </span>

                      <Badge tone={getStatusTone(unit.status)}>{unit.status}</Badge>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
      </section>

      <section
        className="
          mb-5 rounded-[9px]
          border border-slate-200
          bg-white p-3
          shadow-[0_5px_18px_rgba(94,134,173,0.04)]
          sm:p-[18px]
        "
      >
        <div className="mb-4">
          <h2 className="m-0 text-card-title font-bold text-slate-900">
            Recent Updates
          </h2>

          <p className="mt-1 text-body-sm text-slate-400">
            Latest changes in your content library.
          </p>
        </div>

        {visibleUnits.slice(0, 3).map((unit, index) => (
          <div
            className="
              flex items-center gap-2.5
              border-t border-slate-100
              py-2.5
            "
            key={unit.id}
          >
            <UnitIcon />

            <b className="flex-1 text-body-sm text-slate-800">
              {unit.code} - {unit.name}
            </b>

            <span className="hidden text-body-sm text-slate-400 sm:block">
              Updated {index + 2} days ago
            </span>

            <MoreHorizontal size={16} className="text-slate-400" />
          </div>
        ))}

        {visibleUnits.length === 0 && (
          <p className="border-t border-slate-100 py-5 text-center text-body-sm text-slate-400">
            No recent updates.
          </p>
        )}
      </section>
    </>
  );
}

function UnitCard({
  unit,
  onOpen,
  draggable,
  isDragging,
  isDragOver,
  isJustMoved,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  canReorder,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  reorderPending,
}: {
  unit: ContentUnit;
  onOpen: () => void;
  draggable: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isJustMoved: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  reorderPending: boolean;
}) {
  return (
    <div
      onDragOver={draggable ? onDragOver : undefined}
      onDragEnter={draggable ? onDragOver : undefined}
      onDragLeave={draggable ? onDragLeave : undefined}
      onDrop={draggable ? onDrop : undefined}
      className={`group relative min-h-[250px] rounded-lg border bg-white p-3 text-left transition ${
        isDragging
          ? "opacity-40"
          : isDragOver
            ? "border-primary bg-primary-light/40 ring-1 ring-inset ring-primary/30"
            : isJustMoved
              ? "border-primary/40 bg-primary-light/30"
              : "border-slate-200 hover:border-primary hover:shadow-[0_5px_15px_rgba(79,70,229,0.1)]"
      }`}
    >
      {canReorder && (
        <>
          {/* Desktop: drag handle */}
          {draggable && (
            <span
              draggable="true"
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              aria-label="Drag to reorder unit"
              title="Drag to reorder"
              className="absolute right-2 top-2 z-10 hidden select-none rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition hover:border-primary/40 hover:text-primary active:cursor-grabbing md:block md:cursor-grab"
            >
              <GripVertical size={15} className="pointer-events-none" />
            </span>
          )}

          {/* Mobile: up/down buttons — touch drag isn't reliable, so this
              is the primary reorder control on narrow screens. */}
          <div
            className="absolute right-2 top-2 z-10 flex gap-1 md:hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              disabled={isFirst || reorderPending}
              onClick={onMoveUp}
              aria-label="Move unit up"
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              disabled={isLast || reorderPending}
              onClick={onMoveDown}
              aria-label="Move unit down"
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        </>
      )}

      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-md bg-slate-50">
          {unit.coverUrl ? (
            <img src={unit.coverUrl} alt={`${unit.name} cover`} className="h-full w-full object-cover" />
          ) : (
            <IconTile tone={getUnitTone(unit)}>
              <BookOpen size={24} />
            </IconTile>
          )}
        </div>

        <span className="mt-3 block text-body-sm text-slate-400">
          {unit.code}
        </span>

        <strong className="my-1 block text-card-title text-slate-800">
          {unit.name}
        </strong>

        <span className="block text-body-sm text-slate-400">
          {unit.totalSection} sections · {unit.totalTopic} topics
        </span>

        <div className="mt-3 flex items-center justify-between">
          <Badge tone={getStatusTone(unit.status)}>{unit.status}</Badge>

          <ArrowRight size={16} className="text-slate-300" aria-hidden="true" />
        </div>
      </button>
    </div>
  );
}

function UnitIcon() {
  return (
    <IconTile tone="blue">
      <BookOpen size={18} />
    </IconTile>
  );
}

function getStatusTone(status: ContentUnit["status"]): "green" | "gray" {
  return status === "PUBLISHED" ? "green" : "gray";
}

function getUnitTone(unit: ContentUnit): ContentTone {
  switch (unit.id % 6) {
    case 0:
      return "mint";
    case 1:
      return "violet";
    case 2:
      return "blue";
    case 3:
      return "orange";
    case 4:
      return "teal";
    default:
      return "pink";
  }
}