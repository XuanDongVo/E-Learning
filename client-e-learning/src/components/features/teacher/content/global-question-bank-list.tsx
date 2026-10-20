"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, RotateCcw, ChevronLeft, ChevronRight, LibraryBig } from "lucide-react";

import { gradeService } from "@/services/grade.service";
import { unitService } from "@/services/content/content.unit.service";
import { sectionService } from "@/services/content/content.section.service";
import { topicService } from "@/services/content/content.topic.service";
import { questionBankService } from "@/services/content/content.questionBank.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { GlobalQuestionBankFilters } from "@/types/content";

function numericParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function GlobalQuestionBankList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gradeId = numericParam(searchParams.get("gradeId"));
  const unitId = numericParam(searchParams.get("unitId"));
  const sectionId = numericParam(searchParams.get("sectionId"));
  const topicId = numericParam(searchParams.get("topicId"));
  const search = searchParams.get("search") ?? "";
  const includeArchived = searchParams.get("includeArchived") === "true";
  const page = Math.max(1, numericParam(searchParams.get("page")) ?? 1);
  const size = 20;
  const [searchDraft, setSearchDraft] = useState(search);

  const filters: GlobalQuestionBankFilters = useMemo(
    () => ({ gradeId, unitId, sectionId, topicId, search, includeArchived, page, size }),
    [gradeId, unitId, sectionId, topicId, search, includeArchived, page],
  );

  const gradesQuery = useQuery({ queryKey: ["grades"], queryFn: () => gradeService.list() });
  const unitsQuery = useQuery({
    queryKey: QUERY_KEYS.contentUnits(gradeId ?? 0),
    queryFn: () => unitService.list(gradeId!),
    enabled: Boolean(gradeId),
  });
  const sectionsQuery = useQuery({
    queryKey: QUERY_KEYS.contentSections(unitId ?? 0),
    queryFn: () => sectionService.list(unitId!),
    enabled: Boolean(unitId),
  });
  const topicsQuery = useQuery({
    queryKey: QUERY_KEYS.contentTopics(sectionId ?? 0),
    queryFn: () => topicService.list(sectionId!),
    enabled: Boolean(sectionId),
  });
  const banksQuery = useQuery({
    queryKey: QUERY_KEYS.globalQuestionBanks(filters as Record<string, unknown>),
    queryFn: () => questionBankService.browse(filters),
    placeholderData: (previous) => previous,
  });

  const updateUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    }
    if (resetPage) params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUrl({ search: searchDraft.trim() || undefined });
  };

  const resetFilters = () => {
    setSearchDraft("");
    router.push(pathname);
  };

  const grades = gradesQuery.data?.data ?? [];
  const units = unitsQuery.data?.data ?? [];
  const sections = sectionsQuery.data?.data ?? [];
  const topics = topicsQuery.data?.data ?? [];
  const pageData = banksQuery.data?.data;
  const banks = pageData?.items ?? [];

  const statusLabel = (status: string) => status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Archived" : "Draft";
  const statusClass = (status: string) => status === "PUBLISHED"
    ? "bg-emerald-50 text-emerald-700"
    : status === "ARCHIVED" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/teacher/content" className="hover:text-foreground">Content Explorer</Link>
            <span>/</span><span className="text-foreground">Question Banks</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Question Banks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse banks across grades, units, sections and topics.</p>
        </div>
        <div className="text-sm text-muted-foreground">{pageData?.totalElements ?? "—"} banks</div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <form onSubmit={onSearch} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search bank name or description..."
              aria-label="Search bank name or description"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Search</button>
          <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
            <RotateCcw className="size-4" /> Reset
          </button>
        </form>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Grade
            <select value={gradeId ?? ""} onChange={(e) => updateUrl({ gradeId: e.target.value || undefined, unitId: undefined, sectionId: undefined, topicId: undefined })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground">
              <option value="">All grades</option>
              {grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Unit
            <select value={unitId ?? ""} disabled={!gradeId} onChange={(e) => updateUrl({ unitId: e.target.value || undefined, sectionId: undefined, topicId: undefined })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground disabled:opacity-50">
              <option value="">All units</option>
              {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.code} · {unit.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Section
            <select value={sectionId ?? ""} disabled={!unitId} onChange={(e) => updateUrl({ sectionId: e.target.value || undefined, topicId: undefined })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground disabled:opacity-50">
              <option value="">All sections</option>
              {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Topic
            <select value={topicId ?? ""} disabled={!sectionId} onChange={(e) => updateUrl({ topicId: e.target.value || undefined })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground disabled:opacity-50">
              <option value="">All topics</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => updateUrl({ includeArchived: e.target.checked ? "true" : undefined })}
            className="size-4 rounded border-input accent-primary"
          />
          Include archived banks
        </label>
      </section>

      {banksQuery.isLoading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">Loading question banks…</div>
      ) : banksQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center">
          <p className="text-sm text-destructive">Could not load question banks.</p>
          <button onClick={() => void banksQuery.refetch()} className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">Retry</button>
        </div>
      ) : banks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <LibraryBig className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">{search || gradeId || unitId || sectionId || topicId ? "No banks match these filters" : "No question banks yet"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting the search or hierarchy filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {banks.map((bank) => (
              <Link key={bank.id} href={`/teacher/content/question-banks/${bank.id}`} className="block p-4 transition-colors hover:bg-muted/40 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{bank.name}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(bank.status)}`}>{statusLabel(bank.status)}</span>
                    </div>
                    {bank.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bank.description}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">Grade {bank.gradeName} <span className="px-1">/</span> {bank.unitCode} · {bank.unitName} <span className="px-1">/</span> {bank.sectionName} <span className="px-1">/</span> {bank.topicName}</p>
                  </div>
                  <div className="flex shrink-0 gap-5 text-sm">
                    <div><p className="font-semibold tabular-nums">{bank.totalQuestions}</p><p className="text-xs text-muted-foreground">Questions</p></div>
                    <div><p className="font-semibold tabular-nums">{bank.readyQuestions}</p><p className="text-xs text-muted-foreground">Ready</p></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Page {pageData?.page ?? page} of {Math.max(1, pageData?.totalPages ?? 1)} · {pageData?.totalElements ?? 0} banks</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => updateUrl({ page: String(page - 1) }, false)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 disabled:opacity-40"><ChevronLeft className="size-4" /> Previous</button>
              <button disabled={!pageData || page >= pageData.totalPages} onClick={() => updateUrl({ page: String(page + 1) }, false)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 disabled:opacity-40">Next <ChevronRight className="size-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
