"use client";

import { Link } from "@/i18n/navigation";
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

  // Quick Preview state
  const [previewQuestion, setPreviewQuestion] =
    useState<QuestionResponse | null>(null);

  // Multi-select + delete confirmation
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[] | null>(
    null,
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const [filterKey, setFilterKey] = useState({
    bankId,
    page,
    pageSize,
    debouncedSearch,
    selectedType,
    selectedDifficulty,
    selectedCompleteness,
  });
  if (
    filterKey.bankId !== bankId ||
    filterKey.page !== page ||
    filterKey.pageSize !== pageSize ||
    filterKey.debouncedSearch !== debouncedSearch ||
    filterKey.selectedType !== selectedType ||
    filterKey.selectedDifficulty !== selectedDifficulty ||
    filterKey.selectedCompleteness !== selectedCompleteness
  ) {
    setFilterKey({
      bankId,
      page,
      pageSize,
      debouncedSearch,
      selectedType,
      selectedDifficulty,
      selectedCompleteness,
    });
    setSelectedIds(new Set());
  }

  // Query QuestionBank detail
  const bankQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestionBank(bankId),
    queryFn: async () => (await contentService.getQuestionBank(bankId)).data,
  });

  // Query Paginated Questions
  const questionsQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestions({
      bankId,
      search: debouncedSearch,
      type: selectedType || undefined,
      difficulty: selectedDifficulty || undefined,
      isComplete: selectedCompleteness === "" ? undefined : selectedCompleteness === "complete",
      page,
      size: pageSize,
    }),
    queryFn: async () =>
      (
        await contentService.listQuestions({
          bankId,
          search: debouncedSearch || undefined,
          type: selectedType || undefined,
          difficulty: selectedDifficulty || undefined,
          isComplete: selectedCompleteness === "" ? undefined : selectedCompleteness === "complete",
          page,
          size: pageSize,
        })
      ).data,
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewQuestion(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewQuestion]);

  const pageData = questionsQuery.data;
  const questionsList = pageData?.items ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = Math.max(1, pageData?.totalPages ?? 1);

  // Selection helpers
  const pageIds = questionsList.map((q) => q.id);

  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));

  const allOnPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;

  const someOnPageSelected =
    selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleOne = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds(
      allOnPageSelected ? new Set() : new Set(pageIds),
    );
  };

  // Labels shown inside delete confirmation dialog.
  const deletePreviewLabels = (deleteTargetIds ?? [])
    .slice(0, 3)
    .map((id) => {
      const found = questionsList.find((q) => q.id === id);
      const text = found?.content ?? `Question #${id}`;

      return text.length > 70
        ? `${text.slice(0, 70)}…`
        : text;
    });

  // Bank Status mutation
  const statusMutation = useMutation({
    mutationFn: (
      nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED",
    ) =>
      contentService.updateQuestionBankStatus(bankId, {
        status: nextStatus,
      }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.contentQuestionBank(bankId),
        }),
        ...(bankQuery.data?.topicId
          ? [client.invalidateQueries({
              queryKey: QUERY_KEYS.contentQuestionBanks(bankQuery.data.topicId),
            })]
          : []),
      ]);
      toast.success("Question bank status updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update question bank status");
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => contentService.archiveQuestionBank(bankId),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.contentQuestionBank(bankId),
        }),
        ...(bankQuery.data?.topicId
          ? [client.invalidateQueries({
              queryKey: QUERY_KEYS.contentQuestionBanks(bankQuery.data.topicId),
            })]
          : []),
      ]);
      toast.success("Question bank archived");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not archive question bank");
    },
  });

  // Update Question Bank mutation
  const update = useMutation({
    mutationFn: (payload: UpdateQuestionBankRequest) =>
      contentService.updateQuestionBank(bankId, payload),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.contentQuestionBank(bankId),
        }),
        ...(bankQuery.data?.topicId
          ? [client.invalidateQueries({
              queryKey: QUERY_KEYS.contentQuestionBanks(bankQuery.data.topicId),
            })]
          : []),
      ]);
      setEditOpen(false);
      toast.success("Question bank updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save question bank");
    },
  });

  // Delete Questions mutation
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      contentService.bulkDeleteQuestions({
        questionBankId: bankId,
        ids,
      }),

    onSuccess: async (_, ids) => {
      await client.invalidateQueries({
        queryKey: ["content", "questions"],
        refetchType: "all",
      });

      await client.invalidateQueries({
        queryKey: QUERY_KEYS.contentQuestionBank(bankId),
      });

      if (ids.length >= questionsList.length && page > 1) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
      }

      setSelectedIds(new Set());
      setDeleteTargetIds(null);

      toast.success(
        ids.length === 1
          ? "Question deleted"
          : `${ids.length} questions deleted`,
      );
    },
  });

  return (
    <>
      <EntityHeader
        title={bank?.name ?? "Question Bank"}
        label={`${bank?.totalQuestions ?? 0} questions (${bank?.readyQuestions ?? 0} ready)`}
        status={bank?.status}
        icon={<FileQuestion size={21} />}
        description={
          bank?.description ?? "Manage questions inside this bank."
        }
        editLabel="Edit Question Bank"
        onEdit={() => setEditOpen((open) => !open)}
        onStatusChange={(nextStatus) =>
          statusMutation.mutate(nextStatus)
        }
        onArchive={() => archiveMutation.mutate()}
        actionPending={
          statusMutation.isPending ||
          archiveMutation.isPending ||
          update.isPending
        }
      />

      <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {source === "global" ? (
          <>
            <Link href="/teacher/content/question-banks" className="rounded hover:text-primary hover:underline">Question Banks</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : (
          <button type="button" onClick={() => onNavigate("overview")} className="rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Content
          </button>
        )}
        {unitQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/units/${unitQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{unitQuery.data.name}</Link></>}
        {sectionQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/sections/${sectionQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{sectionQuery.data.name}</Link></>}
        {topicQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/topics/${topicQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{topicQuery.data.name}</Link></>}
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="max-w-[220px] truncate font-semibold text-foreground">{bank?.name ?? "Question Bank"}</span>
      </nav>

      {editOpen && (
        <div className="mt-5">
          <ContentEditor
            kind="question-bank"
            initial={{
              name: bank?.name ?? "",
              description: bank?.description ?? "",
            }}
            onSubmit={(payload) =>
              update.mutate(
                payload as UpdateQuestionBankRequest,
              )
            }
            onCancel={() => setEditOpen(false)}
            pending={update.isPending}
            error={
              update.isError
                ? "Could not save changes."
                : undefined
            }
          />
        </div>
      )}

      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-5">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/teacher/content" className="hover:text-primary hover:underline">Content Explorer</Link>
            {unitQuery.data && <><span>/</span><Link href={`/teacher/content/units/${unitQuery.data.id}`} className="hover:text-primary hover:underline">{unitQuery.data.name}</Link></>}
            {topicQuery.data && <><span>/</span><Link href={`/teacher/content/topics/${topicQuery.data.id}`} className="hover:text-primary hover:underline">{topicQuery.data.name}</Link></>}
            <span>/</span><span className="font-medium text-slate-800">{bank?.name ?? "Question Bank"}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{topicQuery.data?.name ?? bank?.name ?? "Question Bank"} — Question Bank</h2><p className="mt-1 text-sm text-slate-500">Question bank · {bank?.status?.toLowerCase() ?? "loading"}</p></div>
            <div className="flex flex-wrap gap-2">
              <div className="min-w-[105px] rounded-lg border border-slate-200 px-3 py-2"><p className="text-xs text-slate-500">Questions</p><p className="mt-0.5 text-lg font-semibold text-slate-900">{bank?.totalQuestions ?? 0}</p></div>
              <div className="min-w-[105px] rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2"><p className="text-xs text-emerald-700">Complete</p><p className="mt-0.5 text-lg font-semibold text-emerald-800">{bank?.readyQuestions ?? 0}</p></div>
              <div className="min-w-[105px] rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2"><p className="text-xs text-amber-700">Incomplete</p><p className="mt-0.5 text-lg font-semibold text-amber-800">{Math.max(0, (bank?.totalQuestions ?? 0) - (bank?.readyQuestions ?? 0))}</p></div>
            </div>
          </div>
        </div>
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex h-9 min-w-[220px] flex-1 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-slate-400 sm:max-w-sm">
            <Search size={14} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 text-body-sm text-slate-700 outline-none"
              placeholder="Search questions..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-body-sm text-slate-700 outline-none"
          >
            <option value="">All Types</option>

            {questionTypeOptions.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by difficulty"
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-body-sm text-slate-700 outline-none"
          >
            <option value="">All Difficulty</option>

            {questionDifficultyOptions.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by completeness"
            value={selectedCompleteness}
            onChange={(e) => {
              setSelectedCompleteness(e.target.value as "" | "complete" | "incomplete");
              setPage(1);
            }}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-body-sm text-slate-700 outline-none"
          >
            <option value="">All Completeness</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>

          <button
            type="button"
            disabled
            title="Question import is not connected to a server API yet"
            className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm font-semibold text-slate-400"
          >
            <Upload size={14} />
            Import (coming soon)
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "bulk-create",
                bankId,
                bank?.name,
              )
            }
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-body-sm font-bold text-white transition hover:bg-primary-hover"
          >
            <Plus size={14} />
            Add questions
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div
            role="region"
            aria-label="Bulk actions"
            className="mb-3 flex min-w-[640px] items-center justify-between rounded-lg border border-primary/20 bg-primary-light/50 px-3 py-2"
          >
            <span className="text-body-sm font-medium text-slate-700">
              {selectedIds.size} selected
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedIds(new Set())
                }
                className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white"
              >
                Clear selection
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeleteTargetIds(
                    Array.from(selectedIds),
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
              >
                <Trash2 size={13} />
                Delete {selectedIds.size}
              </button>
            </div>
          </div>
        )}

        {/* Hybrid Question List: content-first cards with administration controls */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">Showing {totalElements === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalElements)} of {totalElements} questions</p>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700"><FileQuestion size={15} /> List</span>
        </div>
        <div className="space-y-2" role="list" aria-label="Questions in this bank">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <input
              type="checkbox"
              aria-label="Select all questions on this page"
              checked={allOnPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = someOnPageSelected;
              }}
              onChange={toggleAllOnPage}
              disabled={pageIds.length === 0}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary disabled:cursor-not-allowed"
            />
            <span className="flex-1">Question</span>
            <span className="hidden sm:block">Management actions</span>
          </div>

          {questionsQuery.isLoading ? (
            <div className="rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-400" role="status">
              Loading questions...
            </div>
          ) : questionsQuery.isError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-8 text-center text-sm text-slate-600">
              <p role="alert">{questionsQuery.error instanceof Error ? questionsQuery.error.message : "Could not load questions."}</p>
              <button
                type="button"
                onClick={() => questionsQuery.refetch()}
                className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : questionsList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <p className="font-semibold text-slate-700">No questions found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing your filters, or add a question to this bank.</p>
            </div>
          ) : (
            questionsList.map((question, index) => {
              const rowIndex = (page - 1) * pageSize + index + 1;
              const isReady = question.complete ?? question.is_complete;
              const isSelected = selectedIds.has(question.id);
              const typeLabel = questionTypeOptions.find((item) => item.value === question.type)?.label ?? question.type;
              const questionCode = "Q" + String(rowIndex).padStart(2, "0");
              const optionCount = question.options?.length ?? 0;
              const correctOptionCount = question.options?.filter((option) => option.isCorrect).length ?? 0;
              const answerCount = question.answers?.length ?? 0;
              const questionType = String(question.type).toUpperCase();

              return (
                <article
                  key={question.id}
                  role="listitem"
                  className={`group rounded-xl border transition-colors ${isSelected
                    ? "border-primary/40 bg-primary-light/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                >
                  <div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
                    <div className="flex items-start gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        aria-label={`Select question ${rowIndex}`}
                        checked={isSelected}
                        onChange={() => toggleOne(question.id)}
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
                      />
                      <span className="min-w-8 pt-0.5 text-xs font-semibold tabular-nums text-slate-400">{questionCode}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewQuestion(question)}
                      className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                      aria-label={`Preview question ${rowIndex}: ${question.content}`}
                    >
                      <span className="block whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-900">
                        {question.content || "Untitled question"}
                      </span>
                      <span className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Badge tone="blue">{typeLabel}</Badge>
                        <Badge tone={question.difficulty === "EASY" ? "easy" : question.difficulty === "MEDIUM" ? "medium" : "hard"}>
                          {question.difficulty}
                        </Badge>
                        <Badge tone={isReady ? "green" : "gray"}>{isReady ? "Complete" : "Incomplete"}</Badge>
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-1" aria-label={`Actions for question ${rowIndex}`}>
                      <button
                        type="button"
                        title="Preview Question"
                        aria-label={`Preview question ${rowIndex}`}
                        onClick={() => setPreviewQuestion(question)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Edit Question"
                        aria-label={`Edit question ${rowIndex}`}
                        onClick={() => onNavigate("question", question.id, bank?.name)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <SquarePen size={16} />
                      </button>
                      <button
                        type="button"
                        title="Delete Question"
                        aria-label={`Delete question ${rowIndex}`}
                        onClick={() => setDeleteTargetIds([question.id])}
                        className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Server Pagination Controls */}
        <div className="flex min-w-[640px] items-center justify-between pt-4 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <b>Total: {totalElements} questions</b>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                Show
              </span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(
                    Number(e.target.value),
                  );
                  setPage(1);
                }}
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <span className="text-xs text-slate-400">
                per page
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((p) =>
                  Math.max(1, p - 1),
                )
              }
              className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1,
            ).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() =>
                  setPage(pageNum)
                }
                className={`h-7 w-7 rounded border text-xs ${pageNum === page
                  ? "border-primary bg-primary font-bold text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1,
                  ),
                )
              }
              className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Quick Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="question-preview-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Badge tone="blue">
                  {questionTypeOptions.find((item) => item.value === previewQuestion.type)?.label ?? previewQuestion.type}
                </Badge>

                <Badge
                  tone={
                    previewQuestion.difficulty ===
                      "EASY"
                      ? "easy"
                      : previewQuestion.difficulty ===
                        "MEDIUM"
                        ? "medium"
                        : "hard"
                  }
                >
                  {previewQuestion.difficulty}
                </Badge>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewQuestion(null)
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  PROMPT
                </p>

                <h2 id="question-preview-title" className="mt-1 text-base font-bold text-slate-900">
                  {previewQuestion.content}
                </h2>
              </div>

              {/* Display Options */}
              {previewQuestion.options &&
                previewQuestion.options.length >
                0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-400">
                      OPTIONS
                    </p>

                    <div className="space-y-2">
                      {previewQuestion.options.map(
                        (opt, i) => (
                          <div
                            key={opt.id || i}
                            className={`flex items-center justify-between rounded-lg border p-2.5 text-sm ${opt.isCorrect
                              ? "border-emerald-200 bg-emerald-50/50 font-semibold text-emerald-900"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                              }`}
                          >
                            <span>
                              <strong className="mr-2 text-slate-400">
                                {String.fromCharCode(
                                  65 + i,
                                )}
                                .
                              </strong>

                              {opt.content}
                            </span>

                            {opt.isCorrect && (
                              <CheckCircle2
                                size={16}
                                className="shrink-0 text-emerald-600"
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Accepted Answers */}
              {previewQuestion.answers &&
                previewQuestion.answers.length >
                0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-400">
                      ACCEPTED ANSWERS
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {previewQuestion.answers.map(
                        (ans) => (
                          <span
                            key={ans.id}
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          >
                            {ans.rawValue}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {previewQuestion.explanation && (
                <div className="rounded-lg border border-amber-200/60 bg-amber-50/60 p-3">
                  <p className="text-xs font-semibold text-amber-800">
                    EXPLANATION
                  </p>

                  <p className="mt-0.5 text-xs text-amber-900">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  const id =
                    previewQuestion.id;

                  setPreviewQuestion(null);

                  onNavigate(
                    "question",
                    id,
                    bank?.name,
                  );
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Edit Question
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Questions Dialog */}
      <DeleteQuestionsDialog
        open={deleteTargetIds !== null}
        count={deleteTargetIds?.length ?? 0}
        previewLabels={deletePreviewLabels}
        pending={deleteMutation.isPending}
        errorMessage={
          deleteMutation.isError
            ? (deleteMutation.error as Error)
              ?.message ||
            "Could not delete the selected questions. Please try again."
            : undefined
        }
        onConfirm={() => {
          if (deleteTargetIds) {
            deleteMutation.mutate(
              deleteTargetIds,
            );
          }
        }}
        onCancel={() => {
          if (deleteMutation.isPending) {
            return;
          }

          deleteMutation.reset();
          setDeleteTargetIds(null);
        }}
      />
    </>
  );
}