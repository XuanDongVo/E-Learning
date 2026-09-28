"use client";

import { useEffect, useState } from "react";
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

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
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

  // Selection only belongs to the currently visible page/filter.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [
    bankId,
    page,
    pageSize,
    debouncedSearch,
    selectedType,
    selectedDifficulty,
  ]);

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
          page,
          size: pageSize,
        })
      ).data,
    enabled: !!bankId,
  });

  const bank = bankQuery.data;
  const pageData = questionsQuery.data;
  const questionsList = pageData?.items ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

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
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QUERY_KEYS.contentQuestionBank(bankId),
      });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => contentService.archiveQuestionBank(bankId),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QUERY_KEYS.contentQuestionBank(bankId),
      });
    },
  });

  // Update Question Bank mutation
  const update = useMutation({
    mutationFn: (payload: UpdateQuestionBankRequest) =>
      contentService.updateQuestionBank(bankId, payload),
    onSuccess: () => {
      bankQuery.refetch();
      setEditOpen(false);
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

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        {/* Toolbar */}
        <div className="mb-3 flex min-w-[640px] items-center gap-2">
          <div className="mr-auto flex h-8 w-[220px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400">
            <Search size={14} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 text-body-sm text-slate-700 outline-none"
              placeholder="Search question..."
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

          <button
            type="button"
            onClick={() => onNavigate("import")}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-body-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Upload size={14} />
            Import
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

        {/* Questions Table */}
        <table className="w-full min-w-[680px] border-collapse text-body-sm">
          <thead>
            <tr>
              {/* Select all */}
              <th className="w-10 bg-slate-50 p-2.5 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all questions on this page"
                  checked={allOnPageSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        someOnPageSelected;
                    }
                  }}
                  onChange={toggleAllOnPage}
                  disabled={pageIds.length === 0}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary disabled:cursor-not-allowed"
                />
              </th>

              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                #
              </th>

              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Question Content
              </th>

              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Type
              </th>

              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Difficulty
              </th>

              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Completeness
              </th>

              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {questionsQuery.isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-sm text-slate-400"
                >
                  Loading questions...
                </td>
              </tr>
            ) : questionsList.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-sm text-slate-400"
                >
                  No questions found in this bank.
                </td>
              </tr>
            ) : (
              questionsList.map((question, index) => {
                const rowIndex =
                  (page - 1) * pageSize + index + 1;

                const isReady =
                  question.complete ??
                  question.is_complete;

                const isSelected =
                  selectedIds.has(question.id);

                return (
                  <tr
                    key={question.id}
                    className={`cursor-pointer transition ${isSelected
                      ? "bg-primary-light/40 hover:bg-primary-light/50"
                      : "hover:bg-slate-50/80"
                      }`}
                    onClick={() =>
                      setPreviewQuestion(question)
                    }
                  >
                    {/* Checkbox */}
                    <td
                      className="border-b border-slate-100 p-2.5"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select question ${rowIndex}`}
                        checked={isSelected}
                        onChange={() =>
                          toggleOne(question.id)
                        }
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
                      />
                    </td>

                    {/* Row number */}
                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-400">
                      {rowIndex}
                    </td>

                    {/* Content */}
                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-700">
                      <b className="font-semibold text-slate-900">
                        {question.content}
                      </b>
                    </td>

                    {/* Type */}
                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500">
                      <Badge tone="blue">
                        {question.type}
                      </Badge>
                    </td>

                    {/* Difficulty */}
                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500">
                      <Badge
                        tone={
                          question.difficulty ===
                            "EASY"
                            ? "easy"
                            : question.difficulty ===
                              "MEDIUM"
                              ? "medium"
                              : "hard"
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </td>

                    {/* Completeness */}
                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500">
                      <Badge
                        tone={
                          isReady ? "green" : "gray"
                        }
                      >
                        {isReady
                          ? "Complete"
                          : "Incomplete"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td
                      className="border-b border-slate-100 p-2.5 text-sm text-slate-500"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Preview Question"
                          onClick={() =>
                            setPreviewQuestion(question)
                          }
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit Question"
                          onClick={() =>
                            onNavigate(
                              "question",
                              question.id,
                              bank?.name,
                            )
                          }
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <SquarePen size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          title="Delete Question"
                          onClick={() =>
                            setDeleteTargetIds([
                              question.id,
                            ])
                          }
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

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
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Badge tone="blue">
                  {previewQuestion.type}
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

                <p className="mt-1 text-base font-bold text-slate-900">
                  {previewQuestion.content}
                </p>
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
          </div>
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