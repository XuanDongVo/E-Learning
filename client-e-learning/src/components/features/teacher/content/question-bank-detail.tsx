"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  FileQuestion,
  SquarePen,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type {
  ContentView,
  QuestionResponse,
  UpdateQuestionBankRequest,
} from "@/types/content";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { EntityHeader } from "./components/entity-header";
import { Badge } from "./components/badge";
import { ContentEditor } from "./components/content-editor";
import { DeleteQuestionsDialog } from "./components/delete-question-dialog";
import {
  questionTypeOptions,
  questionDifficultyOptions,
} from "@/types/content";

export function QuestionBankDetail({
  bankId,
  onNavigate,
}: {
  bankId: number;
  onNavigate: (view: ContentView, id?: number, bankName?: string) => void;
}) {
  const client = useQueryClient();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") === "global" ? "global" : "content";

  const [editOpen, setEditOpen] = useState(false);

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedCompleteness, setSelectedCompleteness] = useState<"" | "complete" | "incomplete">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [previewQuestion, setPreviewQuestion] = useState<QuestionResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[] | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const [filterKey, setFilterKey] = useState({ bankId, page, pageSize, debouncedSearch, selectedType, selectedDifficulty, selectedCompleteness });
  if (
    filterKey.bankId !== bankId || filterKey.page !== page || filterKey.pageSize !== pageSize ||
    filterKey.debouncedSearch !== debouncedSearch || filterKey.selectedType !== selectedType ||
    filterKey.selectedDifficulty !== selectedDifficulty || filterKey.selectedCompleteness !== selectedCompleteness
  ) {
    setFilterKey({ bankId, page, pageSize, debouncedSearch, selectedType, selectedDifficulty, selectedCompleteness });
    setSelectedIds(new Set());
  }

  const bankQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestionBank(bankId),
    queryFn: async () => (await contentService.getQuestionBank(bankId)).data,
  });
  const questionsQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestions({ bankId, search: debouncedSearch, type: selectedType || undefined, difficulty: selectedDifficulty || undefined, isComplete: selectedCompleteness === "" ? undefined : selectedCompleteness === "complete", page, size: pageSize }),
    queryFn: async () => (await contentService.listQuestions({ bankId, search: debouncedSearch || undefined, type: selectedType || undefined, difficulty: selectedDifficulty || undefined, isComplete: selectedCompleteness === "" ? undefined : selectedCompleteness === "complete", page, size: pageSize })).data,
    enabled: !!bankId,
  });

  const bank = bankQuery.data;
  const topicQuery = useQuery({
    queryKey: QUERY_KEYS.contentTopic(bank?.topicId ?? 0),
    queryFn: async () => (await contentService.getTopic(bank!.topicId)).data,
    enabled: Boolean(bank?.topicId),
  });
  const sectionQuery = useQuery({
    queryKey: QUERY_KEYS.contentSection(topicQuery.data?.sectionId ?? 0),
    queryFn: async () => (await contentService.getSection(topicQuery.data!.sectionId)).data,
    enabled: Boolean(topicQuery.data?.sectionId),
  });
  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.contentUnit(sectionQuery.data?.unitId ?? 0),
    queryFn: async () => (await contentService.getUnit(sectionQuery.data!.unitId)).data,
    enabled: Boolean(sectionQuery.data?.unitId),
  });

  useEffect(() => {
    if (!previewQuestion) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setPreviewQuestion(null); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewQuestion]);

  const pageData = questionsQuery.data;
  const questionsList = pageData?.items ?? [];
  const pageIds = questionsList.map((q) => q.id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;
  const toggleOne = (id: number) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAllOnPage = () => setSelectedIds(allOnPageSelected ? new Set() : new Set(pageIds));

  const deletePreviewLabels = (deleteTargetIds ?? []).slice(0, 3).map((id) => {
    const found = questionsList.find((q) => q.id === id);
    const text = found?.content ?? `Question #${id}`;
    return text.length > 70 ? `${text.slice(0, 70)}…` : text;
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => contentService.updateQuestionBankStatus(bankId, { status: nextStatus }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBank(bankId) }),
        ...(bankQuery.data?.topicId ? [client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBanks(bankQuery.data.topicId) })] : []),
      ]);
      toast.success("Question bank status updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update question bank status"),
  });
  const archiveMutation = useMutation({
    mutationFn: () => contentService.archiveQuestionBank(bankId),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBank(bankId) }),
        ...(bankQuery.data?.topicId ? [client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBanks(bankQuery.data.topicId) })] : []),
      ]);
      toast.success("Question bank archived");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not archive question bank"),
  });
  const update = useMutation({
    mutationFn: (payload: UpdateQuestionBankRequest) => contentService.updateQuestionBank(bankId, payload),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBank(bankId) }),
        ...(bankQuery.data?.topicId ? [client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBanks(bankQuery.data.topicId) })] : []),
      ]);
      setEditOpen(false);
      toast.success("Question bank updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save question bank"),
  });
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => contentService.bulkDeleteQuestions({ questionBankId: bankId, ids }),
    onSuccess: async (_, ids) => {
      await client.invalidateQueries({ queryKey: ["content", "questions"], refetchType: "all" });
      await client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBank(bankId) });
      if (ids.length >= questionsList.length && page > 1) setPage((currentPage) => Math.max(1, currentPage - 1));
      setSelectedIds(new Set());
      setDeleteTargetIds(null);
      toast.success(ids.length === 1 ? "Question deleted" : `${ids.length} questions deleted`);
    },
  });

  return (
    <>
      <EntityHeader
        title={bank?.name ?? "Question Bank"}
        label={`${bank?.totalQuestions ?? 0} questions (${bank?.readyQuestions ?? 0} ready)`}
        status={bank?.status}
        icon={<FileQuestion size={21} />}
        description={bank?.description ?? "Manage questions inside this bank."}
        editLabel="Edit Question Bank"
        onEdit={() => setEditOpen((open) => !open)}
        onStatusChange={(nextStatus) => statusMutation.mutate(nextStatus)}
        onArchive={() => archiveMutation.mutate()}
        actionPending={statusMutation.isPending || archiveMutation.isPending || update.isPending}
      />

      <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {source === "global" ? (
          <>
            <Link href="/teacher/content/question-banks" className="rounded hover:text-primary hover:underline">Question Banks</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : (
          <button type="button" onClick={() => onNavigate("overview")} className="rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Content</button>
        )}
        {unitQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/units/${unitQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{unitQuery.data.name}</Link></>}
        {sectionQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/sections/${sectionQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{sectionQuery.data.name}</Link></>}
        {topicQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/topics/${topicQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{topicQuery.data.name}</Link></>}
        <span aria-hidden="true">/</span><span aria-current="page" className="max-w-[220px] truncate font-semibold text-foreground">{bank?.name ?? "Question Bank"}</span>
      </nav>

      {editOpen && (
        <div className="mt-5"><ContentEditor kind="question-bank" initial={{ name: bank?.name ?? "", description: bank?.description ?? "" }} onSubmit={(payload) => update.mutate(payload as UpdateQuestionBankRequest)} onCancel={() => setEditOpen(false)} pending={update.isPending} error={update.isError ? "Could not save changes." : undefined} /></div>
      )}

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <div className="mb-3 flex min-w-[640px] items-center gap-2">
          <div className="mr-auto flex h-8 w-[220px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400">
            <Search size={14} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border-0 text-body-sm text-slate-700 outline-none" placeholder="Search question..." />
            {search && <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>}
          </div>
          <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setPage(1); }} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-body-sm text-slate-700 outline-none"><option value="">All Types</option>{questionTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select aria-label="Filter by difficulty" value={selectedDifficulty} onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-body-sm text-slate-700 outline-none"><option value="">All Difficulty</option>{questionDifficultyOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select aria-label="Filter by completeness" value={selectedCompleteness} onChange={(e) => { setSelectedCompleteness(e.target.value as "" | "complete" | "incomplete"); setPage(1); }} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-body-sm text-slate-700 outline-none"><option value="">All Completeness</option><option value="complete">Complete</option><option value="incomplete">Incomplete</option></select>
          <button type="button" disabled title="Question import is not connected to a server API yet" className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm font-semibold text-slate-400"><Upload size={14} />Import (coming soon)</button>
          <button type="button" onClick={() => onNavigate("bulk-create", bankId, bank?.name)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-body-sm font-bold text-white transition hover:bg-primary-hover"><Plus size={14} />Add questions</button>
        </div>

        {selectedIds.size > 0 && <div role="region" aria-label="Bulk actions" className="mb-3 flex min-w-[640px] items-center justify-between rounded-lg border border-primary/20 bg-primary-light/50 px-3 py-2"><span className="text-body-sm font-medium text-slate-700">{selectedIds.size} selected</span><div className="flex items-center gap-2"><button type="button" onClick={() => setSelectedIds(new Set())} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white">Clear selection</button><button type="button" onClick={() => setDeleteTargetIds(Array.from(selectedIds))} className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"><Trash2 size={13} />Delete {selectedIds.size}</button></div></div>}

        <table className="w-full min-w-[680px] border-collapse text-body-sm">
          <thead><tr><th className="w-10 bg-slate-50 p-2.5 text-left"><input type="checkbox" aria-label="Select all questions on this page" checked={allOnPageSelected} ref={(el) => { if (el) el.indeterminate = someOnPageSelected; }} onChange={toggleAllOnPage} disabled={pageIds.length === 0} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary disabled:cursor-not-allowed" /></th><th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">#</th><th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Question Content</th><th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Type</th><th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Difficulty</th><th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Completeness</th><th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Actions</th></tr></thead>
          <tbody>
            {questionsQuery.isLoading ? <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-400">Loading questions...</td></tr> : questionsQuery.isError ? <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-600"><p role="alert">{questionsQuery.error instanceof Error ? questionsQuery.error.message : "Could not load questions."}</p><button type="button" onClick={() => questionsQuery.refetch()} className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Retry</button></td></tr> : questionsList.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-400">No questions match these filters. Try changing or clearing your filters.</td></tr> : questionsList.map((question, index) => {
              const rowIndex = (page - 1) * pageSize + index + 1;
              const isReady = question.complete ?? question.is_complete;
              const isSelected = selectedIds.has(question.id);
              return <tr key={question.id} className={`cursor-pointer transition ${isSelected ? "bg-primary-light/40 hover:bg-primary-light/50" : "hover:bg-slate-50/80"}`} onClick={() => setPreviewQuestion(question)}>
                <td className="border-b border-slate-100 p-2.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`Select question ${rowIndex}`} checked={isSelected} onChange={() => toggleOne(question.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary" /></td>
                <td className="border-b border-slate-100 p-2.5 text-sm text-slate-400">{rowIndex}</td>
                <td className="border-b border-slate-100 p-2.5 text-sm text-slate-700"><b className="font-semibold text-slate-900">{question.content}</b></td>
                <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500"><Badge tone="blue">{questionTypeOptions.find((item) => item.value === question.type)?.label ?? question.type}</Badge></td>
                <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500"><Badge tone={question.difficulty === "EASY" ? "easy" : question.difficulty === "MEDIUM" ? "medium" : "hard"}>{question.difficulty}</Badge></td>
                <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500"><Badge tone={isReady ? "green" : "gray"}>{isReady ? "Complete" : "Incomplete"}</Badge></td>
                <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-2"><button type="button" title="Preview Question" onClick={() => setPreviewQuestion(question)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Eye size={16} /></button><button type="button" title="Edit Question" onClick={() => onNavigate("question", question.id, bank?.name)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><SquarePen size={16} /></button><button type="button" title="Delete Question" onClick={() => setDeleteTargetIds([question.id])} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></div></td>
              </tr>;
            })}
          </tbody>
        </table>

        <div className="mt-3 flex min-w-[640px] items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>Page {page} of {Math.max(1, pageData?.totalPages ?? 1)} · {pageData?.totalElements ?? 0} questions</span>
          <div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={!pageData || page >= pageData.totalPages} onClick={() => setPage((currentPage) => currentPage + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div>
        </div>
      </section>

      {previewQuestion && <div role="dialog" aria-modal="true" aria-label="Question preview" className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewQuestion(null); }}><div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Question preview</h2><p className="mt-1 text-xs text-slate-500">{questionTypeOptions.find((item) => item.value === previewQuestion.type)?.label ?? previewQuestion.type}</p></div><button type="button" onClick={() => setPreviewQuestion(null)} aria-label="Close preview" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div><div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-800">{previewQuestion.content}</div></div></div>}

      <DeleteQuestionsDialog questionIds={deleteTargetIds ?? []} questionLabels={deletePreviewLabels} open={deleteTargetIds !== null} pending={deleteMutation.isPending} onCancel={() => setDeleteTargetIds(null)} onConfirm={() => deleteTargetIds && deleteMutation.mutate(deleteTargetIds)} />
    </>
  );
}
