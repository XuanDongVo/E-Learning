"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookOpenText,
  ChevronsUpDown,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { StudentListPagination } from "@/components/student-ui/data-list/student-list-pagination";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { studentKnowledgeNoteService } from "@/services/student/student-knowledge-note.service";
import { studentUnitService } from "@/services/student/student-unit.service";
import type {
  StudentKnowledgeNoteSummary,
  StudentKnowledgeRoleFilter,
} from "@/types/student-knowledge-note";
import {
  chooseKnowledgeLibraryRole,
  KNOWLEDGE_LIBRARY_ROLES,
} from "./knowledge-library-roles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const PAGE_SIZE = 12;

type FilterOption = {
  value: string;
  label: string;
  description?: string;
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/** Searchable shadcn/cmdk selector shared by the Unit and Topic filters. */
function KnowledgeFilterCombobox({
  label,
  ariaLabel,
  value,
  options,
  allLabel,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  options: FilterOption[];
  allLabel: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("student.knowledge.library");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const labelId = useId();
  const selected = options.find((option) => option.value === value);
  const normalizedQuery = normalizeSearchText(query);
  const filtered = options.filter((option) =>
    normalizeSearchText(`${option.label} ${option.description ?? ""}`).includes(normalizedQuery),
  );

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="min-w-0 space-y-1.5">
      <span id={labelId} className="student-label">{label}</span>
      <Popover
        open={open && !disabled}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-label={ariaLabel}
            aria-labelledby={labelId}
            aria-expanded={open && !disabled}
            aria-haspopup="listbox"
            disabled={disabled}
            className="student-control student-control--quiet flex min-h-11 w-full min-w-0 items-center justify-between gap-2 px-3 text-left"
          >
            <span className="flex min-w-0 items-center gap-2">
              <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 truncate font-semibold">
                {selected ? selected.label : allLabel}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="student-theme w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] border-2 border-ink bg-card p-1 shadow-pop"
        >
          <Command shouldFilter={false} className="bg-transparent">
            <CommandInput className="focus-visible:!outline-none focus-visible:!ring-0"
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder}
              aria-label={placeholder}
            />
            <CommandList className="max-h-64">
              <CommandEmpty>{t("noComboboxResults")}</CommandEmpty>
              <CommandGroup>
                {normalizeSearchText(allLabel).includes(normalizedQuery) && (
                  <CommandItem
                    value="__all__"
                    data-checked={value === ""}
                    onSelect={() => choose("")}
                    className="min-h-11 cursor-pointer"
                  >
                    <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{allLabel}</span>
                  </CommandItem>
                )}
                {filtered.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    data-checked={value === option.value}
                    onSelect={() => choose(option.value)}
                    className="min-h-11 cursor-pointer py-2"
                  >
                    <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-semibold">{option.label}</span>
                      {option.description && (
                        <span className="truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function StudentKnowledgeLibrary() {
  const t = useTranslations("student.knowledge.library");
  const tRole = useTranslations("student.knowledge.role");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [unitId, setUnitId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [role, setRole] = useState<StudentKnowledgeRoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLElement | null>(null);
  const shouldFocusListRef = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [input]);

  const unitsQuery = useQuery({
    queryKey: ["student", "knowledge-notes", "visible-units"],
    queryFn: async () => (await studentUnitService.list()).data ?? [],
  });
  const unitDetailQuery = useQuery({
    queryKey: ["student", "knowledge-notes", "unit-topics", unitId],
    queryFn: async () =>
      (await studentUnitService.getUnitDetail(Number(unitId))).data,
    enabled: Boolean(unitId),
  });
  const visibleTopics = (unitDetailQuery.data?.sections ?? []).flatMap(
    (section) => section.topics,
  );
  const notesQuery = useQuery({
    queryKey: [
      "student",
      "knowledge-notes",
      "library",
      search,
      unitId,
      topicId,
      role,
      page,
    ],
    queryFn: async () =>
      (
        await studentKnowledgeNoteService.list({
          search: search || undefined,
          unitId: unitId ? Number(unitId) : undefined,
          topicId: topicId ? Number(topicId) : undefined,
          role,
          page,
          size: PAGE_SIZE,
        })
      ).data,
  });

  const notes = notesQuery.data?.items ?? [];
  const hasFilters = Boolean(search || unitId || topicId || role !== "ALL");
  const total = notesQuery.data?.totalElements ?? 0;
  const pages = notesQuery.data?.totalPages ?? 1;

  useEffect(() => {
    if (notesQuery.isError) {
      shouldFocusListRef.current = false;
      return;
    }
    if (!shouldFocusListRef.current || notesQuery.isFetching) return;

    const frame = window.requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;

      list.focus({ preventScroll: true });
      list.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      shouldFocusListRef.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [notesQuery.isError, notesQuery.isFetching, page]);

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    shouldFocusListRef.current = true;
    setPage(nextPage);
  };

  const clearFilters = () => {
    setInput("");
    setSearch("");
    setUnitId("");
    setTopicId("");
    setRole("ALL");
    setPage(1);
  };


  const handleUnitChange = (value: string) => {
    setUnitId(value);

    if (role === "UNLINKED") {
      setRole("ALL");
    }

    setTopicId("");
    setPage(1);
  };

  const unitOptions: FilterOption[] = (unitsQuery.data ?? []).map((unit) => ({
    value: String(unit.id),
    label: unit.name,
    description: unit.code,
  }));
  const topicOptions: FilterOption[] = visibleTopics.map((topic) => ({
    value: String(topic.id),
    label: topic.name,
  }));

  return (
    <main className="student-knowledge mx-auto max-w-6xl space-y-6 pb-12">
      <PaperSurface
        as="section"
        variant="kraft"
        tape
        emphasis="feature"
        className="student-knowledge-hero relative overflow-hidden p-5 sm:p-6"
      >
        <StudentDoodle
          id="doodle.star-sticker"
          className="pointer-events-none absolute -right-3 -top-3 hidden w-16 rotate-[16deg] opacity-90 sm:block"
        />
        <StudentPageHeading
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <BookMarked className="size-4" aria-hidden="true" /> {t("eyebrow")}
            </span>
          }
          title={
            <>
              {t("titlePrefix")} <span className="student-highlight">{t("titleHighlight")}</span>
            </>
          }
          description={t("intro")}
          artwork={
            <div className="student-knowledge-hero-art relative">
              <StudentIllustration
                id="scene.knowledge-shelf"
                decorative
                priority
                className="relative z-10 w-full max-w-[330px] drop-shadow-sm"
              />
              <StudentDoodle
                id="doodle.reading-trail"
                className="pointer-events-none absolute -bottom-4 left-0 w-28 -rotate-12 opacity-80"
              />
            </div>
          }
          artworkClassName="hidden w-[40%] max-w-[340px] sm:block"
          className="gap-5"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="student-chip bg-card !p-2">
            <Sparkles className="size-3.5" aria-hidden="true" /> {t("tagPace")}
          </span>
          <span className="student-chip bg-card !p-2">
            <BookOpenText className="size-3.5" aria-hidden="true" /> {t("tagContent")}
          </span>
        </div>
      </PaperSurface>

      <PaperSurface
        as="section"
        variant="plain"
        className="space-y-4 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="student-section-title">{t("searchTitle")}</h2>
            <p className="student-body text-muted-foreground">
              {t("searchIntro")}
            </p>
          </div>
          <StudentDoodle
            id="doodle.bookmark-note"
            className="pointer-events-none hidden h-16 w-auto rotate-[8deg] sm:block"
          />
        </div>
        <div
          role="group"
          aria-label={t("roleFilter")}
          className="student-knowledge-role-filters flex flex-wrap gap-2"
        >
          {KNOWLEDGE_LIBRARY_ROLES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={role === item.value}
              className={`student-control min-h-11 px-4 ${role === item.value ? "student-filter-active" : "student-control--quiet"}`}
              onClick={() => {
                const next = chooseKnowledgeLibraryRole(
                  item.value,
                  unitId,
                  topicId,
                );
                setRole(next.role);
                setUnitId(next.unitId);
                setTopicId(next.topicId);
                setPage(1);
              }}
            >
              {tRole(item.value)}
            </button>
          ))}
        </div>
        <div
          role="search"
          aria-label={t("searchGroup")}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_minmax(160px,220px)]"
        >
          <label className="block space-y-1.5">
            <span className="student-label">{t("searchLabel")}</span>
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchAria")}
                className="student-field w-full !pl-10 !pr-3"
              />
            </span>
          </label>

          <KnowledgeFilterCombobox
            label={t("unitFilter")}
            ariaLabel={t("unitAria")}
            value={unitId}
            options={unitOptions}
            allLabel={t("all")}
            placeholder={t("unitPlaceholder")}
            disabled={unitsQuery.isPending || unitsQuery.isError}
            onChange={handleUnitChange}
          />
          <KnowledgeFilterCombobox
            label={t("topicFilter")}
            ariaLabel={t("topicAria")}
            value={topicId}
            options={topicOptions}
            allLabel={t("allTopics")}
            placeholder={t("topicPlaceholder")}
            disabled={
              !unitId ||
              unitDetailQuery.isPending ||
              unitDetailQuery.isError ||
              visibleTopics.length === 0
            }
            onChange={(nextTopicId) => {
              setTopicId(nextTopicId);
              setPage(1);
            }}
          />
        </div>
        {unitDetailQuery.isError && unitId && (
          <p role="status" className="text-sm text-destructive">
            {t("unitTopicError")}
            <button
              type="button"
              className="ml-2 font-bold underline"
              onClick={() => void unitDetailQuery.refetch()}
            >
              {t("retry")}
            </button>
          </p>
        )}
        {unitsQuery.isError && (
          <p role="status" className="text-sm text-destructive">
            {t("unitListError")}
            <button
              type="button"
              onClick={() => void unitsQuery.refetch()}
              className="ml-2 font-bold underline"
            >
              {t("retry")}
            </button>
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-3">
          <p className="student-meta text-muted-foreground" role="status">
            {notesQuery.isPending
              ? t("searching")
              : (hasFilters ? t("resultsFiltered", { count: total }) : t("resultsAll", { count: total }))}
          </p>
          {hasFilters && (
            <button
              type="button"
              className="student-label min-h-10 text-primary underline underline-offset-4"
              onClick={clearFilters}
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      </PaperSurface>

      {notesQuery.isPending ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          role="status"
          aria-label={t("loading")}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="student-knowledge-skeleton h-52 animate-pulse rounded-xl border-2 border-ink/30 bg-card"
            />
          ))}
        </div>
      ) : notesQuery.isError ? (
        <PaperSurface
          as="section"
          className="space-y-3 p-6 sm:p-8"
          role="alert"
        >
          <h2 className="student-card-title">{t("loadError")}</h2>
          <p className="student-body text-muted-foreground">
            {notesQuery.error instanceof Error
              ? notesQuery.error.message
              : t("loadErrorFallback")}
          </p>
          <button
            type="button"
            className="student-control student-control--action"
            onClick={() => void notesQuery.refetch()}
          >
            {t("reload")}
          </button>
        </PaperSurface>
      ) : notes.length === 0 ? (
        <PaperSurface as="section" className="p-6">
          <StudentCollectionEmptyState
            title={
              hasFilters
                ? role === "UNLINKED"
                  ? t("emptyFree")
                  : t("emptyFiltered")
                : t("emptyAll")
            }
            description={
              hasFilters
                ? t("emptyFiltersDescription")
                : t("emptyDescription")
            }
            illustration={
              hasFilters ? "illustration.no-results" : "illustration.no-lessons"
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="student-control student-control--action"
                  onClick={clearFilters}
                >
                  {t("seeAll")}
                </button>
              ) : (
                <Link
                  href="/student/units"
                  className="student-control student-control--action"
                >
                  {t("goToHub")}
                </Link>
              )
            }
          />
        </PaperSurface>
      ) : (
        <>
          <section
            ref={listRef}
            id="knowledge-note-card-list"
            tabIndex={-1}
            aria-label={t("listAria")}
            className="scroll-mt-24 grid gap-4 outline-none sm:grid-cols-2 xl:grid-cols-3"
          >
            {notes.map((note, i) => (
              <KnowledgeNoteCard
                key={note.id}
                note={note}
                index={(page - 1) * PAGE_SIZE + i}
              />
            ))}
          </section>
          <StudentListPagination
            page={page}
            totalPages={pages}
            pageLabel={t("page", { page, pages })}
            previousLabel={t("previousPage")}
            nextLabel={t("nextPage")}
            onPageChange={changePage}
            disabled={notesQuery.isFetching}
            className="mx-auto max-w-md"
          />
        </>
      )}
    </main>
  );
}

export function KnowledgeNoteCard({
  note,
  index,
}: {
  note: StudentKnowledgeNoteSummary;
  index: number;
}) {
  const t = useTranslations("student.knowledge.library");
  const tRole = useTranslations("student.knowledge.role");
  const tag = note.units[0];
  return (
    <Link
      href={`/student/knowledge/${note.id}`}
      className="student-knowledge-card group relative flex min-w-0 flex-col p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="student-knowledge-card-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <BookMarked
          className="size-6 -rotate-12 text-primary transition-transform group-hover:rotate-0"
          aria-hidden="true"
        />
      </div>
      <p className="student-meta mb-2 text-primary">
        {tag ? `${tag.code} · ${tag.name}` : t("freeReading")}
        {note.units.length > 1 ? ` · +${note.units.length - 1} Unit` : ""}
      </p>
      <div
        role="group"
        className="mb-2 flex flex-wrap gap-1.5"
        aria-label={t("roleAria")}
      >
        {(note.roles ?? []).map((item) => (
          <span
            key={item}
            data-knowledge-role={item}
            className="student-knowledge-role-tag student-caption"
          >
            {tRole(item)}
          </span>
        ))}
      </div>
      <h3 className="student-card-title mb-2 line-clamp-3 text-foreground group-hover:text-primary">
        {note.title}
      </h3>
      <p className="student-body mb-5 line-clamp-3 flex-1 text-muted-foreground">
        {note.description?.trim() ||
          t("defaultDescription")}
      </p>
      <span className="student-label mt-auto inline-flex items-center gap-2 border-t border-dashed border-border pt-3 text-primary">
        {t("openNote")}{" "}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
