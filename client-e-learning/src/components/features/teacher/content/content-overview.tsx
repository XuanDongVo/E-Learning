"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

import type { ContentLayout, ContentView } from "@/types/content";
import { contentGrades, contentUnits } from "@/mock/content";

import { Badge } from "./components/badge";
import { IconTile } from "./components/icon-tile";
import { ContentToolbar } from "./components/content-toolbar";
import { ChevronDown } from "lucide-react";

export function ContentOverview({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  const [grade, setGrade] = useState(contentGrades[0]);
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<ContentLayout>("grid");

  const visibleUnits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return contentUnits.filter((unit) => {
      const matchesGrade = unit.grade === grade;
      const matchesQuery =
        !normalizedQuery ||
        [unit.name, unit.code, ...unit.topicNames].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      return matchesGrade && matchesQuery;
    });
  }, [grade, query]);

  return (
    <>
      <ContentToolbar
        title="Content"
        description="Manage your learning content organized by grades and units."
        action="Create Unit"
        onAction={() => onNavigate("unit")}
      >
        <div className="flex h-9 w-full items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400 sm:w-[220px]">
          <Search size={14} />
          <input
            className="w-full border-0 text-content-body text-slate-700 outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search units or topics..."
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            className="
      h-10 w-full appearance-none rounded-xl
      border border-slate-200 bg-white
      pl-3.5 pr-9
      text-sm font-medium text-slate-600
      outline-none
      transition-colors
      hover:border-slate-300
      focus:border-primary
      focus:ring-2 focus:ring-primary/10
      sm:w-[140px]
    "
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
          >
            {contentGrades.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <ChevronDown
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </ContentToolbar>

      <div className="hidden sm:flex mb-5 flex gap-2 overflow-x-auto">
        {contentGrades.map((item) => (
          <button
            key={item}
            className={`whitespace-nowrap rounded-md border px-5 py-2 text-content-body ${grade === item ? "border-primary bg-primary text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)]" : "border-slate-200 bg-white text-slate-500"}`}
            onClick={() => setGrade(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="mb-5 rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-content-heading font-bold text-slate-900">
              Units{" "}
              <small className="text-content-body font-normal text-slate-400">
                ({grade})
              </small>
            </h2>

            <p className="mt-1 text-content-body text-slate-400">
              Build and organize learning experiences.
            </p>
          </div>

          <div className="flex overflow-hidden rounded border border-slate-200">
            <button
              className={`flex p-1.5 ${layout === "grid" ? "bg-primary-light text-primary" : "bg-white text-slate-400"}`}
              onClick={() => setLayout("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>

            <button
              className={`flex p-1.5 ${layout === "list" ? "bg-primary-light text-primary" : "bg-white text-slate-400"}`}
              onClick={() => setLayout("list")}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {visibleUnits.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-200 py-8 text-center text-content-body text-slate-400">
            No units or topics found.
          </p>
        )}

        {layout === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <button
              className="order-first flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-primary/30 bg-primary-light/30 p-4 text-primary transition hover:border-primary hover:bg-primary-light"
              onClick={() => onNavigate("unit")}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
                <Plus size={22} />
              </span>
              <b className="text-content-body">Create Unit</b>
            </button>

            {visibleUnits.map((unit) => (
              <button
                key={unit.id}
                className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-primary hover:shadow-[0_5px_15px_rgba(79,70,229,0.1)]"
                onClick={() => onNavigate("unit")}
              >
                {unit.imageUrl ? (
                  <div
                    className="aspect-[16/9] w-full rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${unit.imageUrl})` }}
                    role="img"
                    aria-label={`${unit.name} cover`}
                  />
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center rounded-md bg-slate-50">
                    <IconTile tone={unit.tone}>
                      <BookOpen size={24} />
                    </IconTile>
                  </div>
                )}

                <span className="mt-3 block text-content-caption text-slate-400">
                  Unit {unit.id}
                </span>

                <strong className="my-1 block text-content-heading text-slate-800">
                  {unit.name}
                </strong>

                <span className="block text-content-caption text-slate-400">
                  {unit.sections} sections · {unit.topics} topics
                </span>

                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={unit.progress ? "green" : "gray"}>
                    {unit.progress ? "Active" : "Draft"}
                  </Badge>

                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100">
            {visibleUnits.map((unit) => (
              <button
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-primary-light/40"
                key={unit.id}
                onClick={() => onNavigate("unit")}
              >
                {unit.imageUrl ? (
                  <div
                    className="h-12 w-20 shrink-0 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${unit.imageUrl})` }}
                    role="img"
                    aria-label={`${unit.name} cover`}
                  />
                ) : (
                  <IconTile tone={unit.tone}>
                    <BookOpen size={18} />
                  </IconTile>
                )}
                <span className="min-w-0 flex-1">
                  <strong className="block text-content-heading text-slate-800">
                    Unit {unit.id} - {unit.name}
                  </strong>
                  <span className="text-content-caption text-slate-400">
                    {unit.sections} sections · {unit.topics} topics
                  </span>
                </span>
                <Badge tone={unit.progress ? "green" : "gray"}>
                  {unit.progress ? "Active" : "Draft"}
                </Badge>
                
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mb-5 rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <div className="mb-4">
          <div>
            <h2 className="m-0 text-content-heading font-bold text-slate-900">
              Recent Updates
            </h2>
            <p className="mt-1 text-content-body text-slate-400">
              Latest changes in your content library.
            </p>
          </div>
        </div>

        {contentUnits.slice(0, 3).map((unit, index) => (
          <div
            className="flex items-center gap-2.5 border-t border-slate-100 py-2.5"
            key={unit.name}
          >
            <IconTile tone={unit.tone}>
              <BookOpen size={15} />
            </IconTile>

            <b className="flex-1 text-content-body text-slate-800">
              Unit {unit.id} - {unit.name}
            </b>

            <span className="text-content-caption text-slate-400">
              Updated {index + 2} days ago
            </span>

            <MoreHorizontal size={16} />
          </div>
        ))}
      </section>
    </>
  );
}
