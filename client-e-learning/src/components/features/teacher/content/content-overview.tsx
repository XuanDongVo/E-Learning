"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Layers,
  Plus,
  Search,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import { contentService } from "@/services/content.service";
import { gradeService } from "@/services/grade.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentSection,
  ContentTopic,
  ContentUnit,
  ContentView,
  CreateUnitRequest,
} from "@/types/content";
import { useLocale } from "@/components/i18n/locale-provider";
import { CreateUnitModal } from "./components/create-unit-modal";

export function ContentOverview({
  onNavigate,
}: {
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [gradeId, setGradeId] = useState<number>();
  const [selectedUnitId, setSelectedUnitId] = useState<number>();
  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreateUnitRequest>({
    gradeId: 0,
    code: "",
    name: "",
    description: "",
    displayOrder: 0,
  });

  const grades = useQuery({
    queryKey: ["grades"],
    queryFn: async () => (await gradeService.list()).data ?? [],
  });

  const selectedGradeId = gradeId ?? grades.data?.[0]?.id;

  const units = useQuery({
    queryKey: QUERY_KEYS.contentUnits(selectedGradeId ?? 0),
    queryFn: async () =>
      (await contentService.listUnits(selectedGradeId!)).data ?? [],
    enabled: Boolean(selectedGradeId),
  });

  const visibleUnits = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (units.data ?? []).filter(
      (unit) =>
        !search || `${unit.code} ${unit.name}`.toLowerCase().includes(search),
    );
  }, [query, units.data]);

  const activeUnit =
    (units.data ?? []).find((unit) => unit.id === selectedUnitId) ??
    visibleUnits[0];
  const sections = useQuery({
    queryKey: QUERY_KEYS.contentSections(activeUnit?.id ?? 0),
    queryFn: async () =>
      (await contentService.listSections(activeUnit!.id)).data ?? [],
    enabled: Boolean(activeUnit),
  });

  const topics = useQueries({
    queries: (sections.data ?? []).map((section) => ({
      queryKey: QUERY_KEYS.contentTopics(section.id),
      queryFn: async () =>
        (await contentService.listTopics(section.id)).data ?? [],
      enabled: expandedSections.includes(section.id),
    })),
  });
  
  const createUnit = useMutation({
    mutationFn: contentService.createUnit,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.contentUnits(selectedGradeId ?? 0),
      });
      setFormOpen(false);
      if (response.data) setSelectedUnitId(response.data.id);
    },
  });

  const openCreate = () => {
    if (!selectedGradeId) return;
    setForm({
      gradeId: selectedGradeId,
      code: "",
      name: "",
      description: "",
      displayOrder: 0,
    });
    setFormOpen(true);
  };
  const toggleSection = (id: number) => {
    setExpandedSections((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };
  const topicsFor = (section: ContentSection): ContentTopic[] => {
    const index = (sections.data ?? []).findIndex(
      (item) => item.id === section.id,
    );
    const topicData = topics[index]?.data;
    return Array.isArray(topicData) ? topicData : [];
  };

  return (
    <>
      <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-body-sm font-bold text-primary">{t("content")}</p>
          <h1 className="mt-1 text-page-title font-extrabold tracking-tight">
            {t("content")}
          </h1>
          <p className="mt-1 text-body text-neutral-muted">
            {t("contentDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-body-sm font-bold text-primary-foreground"
        >
          <Plus className="size-4" /> {t("createUnit")}
        </button>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(grades.data ?? []).map((grade) => (
          <button
            key={grade.id}
            type="button"
            onClick={() => {
              setGradeId(grade.id);
              setSelectedUnitId(undefined);
            }}
            className={`shrink-0 rounded-lg border px-4 py-2 text-body-sm font-bold ${selectedGradeId === grade.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}
          >
            {grade.name}
          </button>
        ))}
      </div>

      <section aria-label="Content Explorer and workspace" className="grid min-h-[calc(100vh-20rem)] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-section-title font-bold">Content Explorer</h2>
              <span className="rounded-md border border-border bg-card px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground">Grade → Unit</span>
            </div>
            <p className="mt-1 text-body-sm text-muted-foreground">Choose a unit to explore its sections and topics.</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <h3 className="text-body-sm font-bold">{t("units")}</h3>

              <span className="text-body-sm text-muted-foreground">{visibleUnits.length} {t("unitCount")}</span>
            </div>

            <label className="relative mt-3 block">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search")}
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2 text-body-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {units.isLoading && (
              <p className="p-3 text-body-sm text-muted-foreground">
                {t("loading")}
              </p>
            )}

            {units.isError && (
              <div className="m-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-body-sm text-destructive">
                Could not load units. Refresh the page and try again.
              </div>
            )}

            {!units.isLoading && !units.isError && visibleUnits.length === 0 && (
              <p className="p-3 text-body-sm text-muted-foreground">
                {t("noUnits")}
              </p>
            )}

            {visibleUnits.map((unit) => (
              <UnitRow
                key={unit.id}
                unit={unit}
                active={activeUnit?.id === unit.id}
                onClick={() => setSelectedUnitId(unit.id)}
                onOpen={() => onNavigate("unit", unit.id)}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          {activeUnit ? (
            <>
              <div className="border-b border-border bg-card p-4">
                <nav aria-label="Content breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-body-sm text-muted-foreground">
                  <button type="button" onClick={() => onNavigate("overview")} className="hover:text-primary hover:underline">Content</button>
                  <ChevronRight className="size-3.5" />
                  <span className="font-semibold text-foreground">{activeUnit.code} · {activeUnit.name}</span>
                </nav>
                <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-start">
                  <h2 className="text-section-title font-bold">
                    <button
                      type="button"
                      onClick={() => onNavigate("unit", activeUnit.id)}
                      className="cursor-pointer text-left transition-colors hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline focus-visible:outline-none"
                    >
                      {activeUnit.code} · {activeUnit.name}
                    </button>
                  </h2>
                  <button type="button" onClick={() => onNavigate("unit", activeUnit.id)} className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-border px-3 py-2 text-body-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                    Manage unit <ArrowRight className="size-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
                  <span>{activeUnit.totalSection} sections</span>
                  <span>{activeUnit.totalTopic} topics</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{activeUnit.status}</span>
                  <span className="sm:ml-auto">{t("sectionsAndTopics")}</span>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {sections.isLoading && (
                  <p className="text-body-sm text-muted-foreground">
                    {t("loading")}
                  </p>
                )}

                {sections.isError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-body-sm text-destructive">
                    Could not load sections for this unit. Try opening the unit details or refresh the page.
                  </div>
                )}

                {!sections.isLoading && !sections.isError && (sections.data ?? []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                    <Layers className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 font-semibold">No sections in this unit yet</p>
                    <p className="mt-1 text-body-sm text-muted-foreground">Create the first section to start organizing topics.</p>
                    <button type="button" onClick={() => onNavigate("unit", activeUnit.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground">
                      Manage unit <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                )}

                {!sections.isLoading && !sections.isError &&
                  (sections.data ?? []).map((section) => {
                    const expanded = expandedSections.includes(section.id);
                    const sectionTopics = topicsFor(section);

                    return (
                      <div
                        key={section.id}
                        className="overflow-hidden rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-2 bg-background px-3 py-2.5">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => toggleSection(section.id)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            {expanded ? (
                              <ChevronDown className="size-4 shrink-0 text-primary" />
                            ) : (
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <Layers className="size-4 shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 truncate text-body font-bold">
                              {section.name}
                            </span>
                          </button>
                          <StatusBadge status={section.status} />
                          <span className="shrink-0 text-body-sm text-muted-foreground">
                            {section.totalTopic} topics
                          </span>
                          <button
                            type="button"
                            aria-label={`Open section ${section.name}`}
                            onClick={() => onNavigate("section", section.id)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <ExternalLink className="size-3.5" />
                          </button>
                        </div>

                        {expanded && (
                          <div className="divide-y divide-border border-t border-border">
                            {topics[(sections.data ?? []).findIndex((item) => item.id === section.id)]?.isLoading && (
                              <p className="px-4 py-3 text-body-sm text-muted-foreground">{t("loading")}</p>
                            )}
                            {topics[(sections.data ?? []).findIndex((item) => item.id === section.id)]?.isError && (
                              <div className="px-4 py-3 text-body-sm text-destructive">
                                Could not load topics. Open the section to retry.
                              </div>
                            )}
                            {sectionTopics.map((topic) => (
                              <button
                                key={topic.id}
                                type="button"
                                onClick={() => onNavigate("topic", topic.id)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                              >
                                <Folder className="size-4 text-primary" />

                                <span className="flex-1 text-body">
                                  {topic.name}
                                </span>

                                <StatusBadge status={topic.status} />
                                <span className="text-body-sm text-muted-foreground">
                                  {topic.totalQuestionBank} {t("questionBanks")}
                                </span>
                              </button>
                            ))}

                            {!topics[(sections.data ?? []).findIndex((item) => item.id === section.id)]?.isLoading && !topics[(sections.data ?? []).findIndex((item) => item.id === section.id)]?.isError && sectionTopics.length === 0 && (
                              <p className="px-4 py-3 text-body-sm text-muted-foreground">
                                {t("noTopics")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="grid h-full min-h-[20rem] place-items-center p-8 text-center">
              <div>
                <Folder className="mx-auto size-8 text-primary" />

                <p className="mt-3 text-body font-bold">{t("selectUnit")}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <CreateUnitModal
        key={formOpen ? "open" : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        onFormChange={setForm}
        onSubmit={async () => {
          await createUnit.mutateAsync(form);
        }}
        isSubmitting={createUnit.isPending}
        isUploadingCover={false}
        onCoverChange={() => undefined}
      />
    </>
  );
}

function UnitRow({
  unit,
  active,
  onClick,
  onOpen,
}: {
  unit: ContentUnit;
  active: boolean;
  onClick: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-body ${active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Folder className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate font-semibold">
          {unit.code} · {unit.name}
        </span>
      </button>
      <StatusBadge status={unit.status} />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${unit.name}`}
        className="rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary"
      >
        <ExternalLink className="size-3.5" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: ContentUnit["status"] }) {
  const labels = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };
  const styles = {
    DRAFT: "bg-warm-soft text-primary",
    PUBLISHED: "bg-success-soft text-success",
    ARCHIVED: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
