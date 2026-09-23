"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
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

  const [form, setForm] = useState<CreateUnitRequest>({
    gradeId: 0,
    code: "",
    name: "",
    description: "",
  });

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

  const visibleUnits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return units.data ?? [];
    }

    return (units.data ?? []).filter((unit) =>
      `${unit.code} ${unit.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [units.data, query]);

  const openCreate = () => {
    if (!selectedGradeId) return;

    setForm({
      gradeId: selectedGradeId,
      code: "",
      name: "",
      description: "",
    });

    setFormOpen(true);
  };

  const submitCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createUnit.mutate(form);
  };

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

      {formOpen && (
        <form
          onSubmit={submitCreate}
          className="
            mb-5 grid gap-3 rounded-[9px]
            border border-primary/20
            bg-primary-light/40
            p-4
            sm:grid-cols-4
          "
        >
          <input
            required
            placeholder="Code"
            value={form.code}
            onChange={(event) =>
              setForm({
                ...form,
                code: event.target.value,
              })
            }
            className="
              h-10 rounded-lg
              border border-slate-200
              bg-white px-3
              text-body-sm
              outline-none
              focus:border-primary
              focus:ring-2 focus:ring-primary/10
            "
          />

          <input
            required
            placeholder="Unit name"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
            className="
              h-10 rounded-lg
              border border-slate-200
              bg-white px-3
              text-body-sm
              outline-none
              focus:border-primary
              focus:ring-2 focus:ring-primary/10
            "
          />

          <input
            placeholder="Description"
            value={form.description ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            className="
              h-10 rounded-lg
              border border-slate-200
              bg-white px-3
              text-body-sm
              outline-none
              focus:border-primary
              focus:ring-2 focus:ring-primary/10
              sm:col-span-2
            "
          />

          <div className="flex gap-2 sm:col-span-4">
            <button
              type="submit"
              disabled={createUnit.isPending}
              className="
                rounded-lg bg-primary
                px-4 py-2
                text-body-sm font-semibold text-white
                transition-colors
                hover:bg-primary-hover
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {createUnit.isPending ? "Saving..." : "Create"}
            </button>

            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="
                rounded-lg
                border border-slate-200
                bg-white
                px-4 py-2
                text-body-sm font-medium text-slate-600
                hover:bg-slate-50
              "
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
              Build and organize learning experiences.
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
            {/* Create Unit Card */}
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
            {visibleUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onOpen={() => onNavigate("unit", unit.id)}
              />
            ))}
          </div>
        )}

        {!units.isLoading &&
          !units.isError &&
          layout === "list" &&
          visibleUnits.length > 0 && (
            <div className="divide-y divide-slate-100 rounded-md border border-slate-100">
              {visibleUnits.map((unit) => (
                <button
                  type="button"
                  className="
                    flex w-full items-center
                    gap-3 p-3
                    text-left
                    transition-colors
                    hover:bg-primary-light/40
                  "
                  key={unit.id}
                  onClick={() => onNavigate("unit", unit.id)}
                >
                  <UnitIcon />

                  <span className="min-w-0 flex-1">
                    <strong className="block text-card-title text-slate-800">
                      {unit.code} - {unit.name}
                    </strong>

                    <span className="text-caption text-slate-400">
                      {unit.totalSection} sections · {unit.totalTopic} topics
                    </span>
                  </span>

                  <Badge tone={getStatusTone(unit.status)}>{unit.status}</Badge>
                </button>
              ))}
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

            <span className="hidden text-caption text-slate-400 sm:block">
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

function UnitCard({ unit, onOpen }: { unit: ContentUnit; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        min-h-[250px]
        rounded-lg
        border border-slate-200
        bg-white
        p-3
        text-left
        transition
        hover:border-primary
        hover:shadow-[0_5px_15px_rgba(79,70,229,0.1)]
      "
    >
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-md bg-slate-50">
        <IconTile tone={getUnitTone(unit)}>
          <BookOpen size={24} />
        </IconTile>
      </div>

      <span className="mt-3 block text-caption text-slate-400">
        {unit.code}
      </span>

      <strong className="my-1 block text-card-title text-slate-800">
        {unit.name}
      </strong>

      <span className="block text-caption text-slate-400">
        {unit.totalSection} sections · {unit.totalTopic} topics
      </span>

      <div className="mt-3 flex items-center justify-between">
        <Badge tone={getStatusTone(unit.status)}>{unit.status}</Badge>

        <Plus size={16} className="text-slate-300" />
      </div>
    </button>
  );
}

function UnitIcon() {
  return (
    <IconTile tone="blue">
      <BookOpen size={18} />
    </IconTile>
  );
}

/* =========================================================
   HELPERS
========================================================= */

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
