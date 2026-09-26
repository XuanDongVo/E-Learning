"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  FileQuestion,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import type { ContentView, QuestionResponse } from "@/types/content";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { EntityHeader } from "./components/entity-header";
import { ContentTabs } from "./components/content-tabs";
import { Badge } from "./components/badge";

export function QuestionBankDetail({
  bankId = 1,
  onNavigate,
}: {
  bankId?: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const client = useQueryClient();

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Quick Preview state
  const [previewQuestion, setPreviewQuestion] = useState<QuestionResponse | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

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

  // Bank Status mutation
  const statusMutation = useMutation({
    mutationFn: (nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
      contentService.updateQuestionBankStatus(bankId, { status: nextStatus }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBank(bankId) });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => contentService.archiveQuestionBank(bankId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBank(bankId) });
    },
  });

  const bank = bankQuery.data;
  const pageData = questionsQuery.data;
  const questionsList = pageData?.items ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

  return (
    <>
      <EntityHeader
        title={bank?.name ?? "Question Bank"}
        label={`${bank?.totalQuestions ?? 0} questions (${bank?.readyQuestions ?? 0} ready)`}
        status={bank?.status}
        icon={<FileQuestion size={21} />}
        description={bank?.description ?? "Manage questions inside this bank."}
        editLabel="Edit Question Bank"
        onStatusChange={(nextStatus) => statusMutation.mutate(nextStatus)}
        onArchive={() => archiveMutation.mutate()}
        actionPending={statusMutation.isPending || archiveMutation.isPending}
      />

      <ContentTabs
        active="Questions"
        items={["Questions", "Details", "Statistics"]}
      />

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        {/* Toolbar: Search, Filters, Actions */}
        <div className="mb-3 flex min-w-[640px] items-center gap-2">
          <div className="mr-auto flex h-8 w-[220px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400">
            <Search size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 text-body-sm text-slate-700 outline-none"
              placeholder="Search prompt..."
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
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
            <option value="SINGLE_CHOICE">Single Choice</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_IN_BLANK">Fill in Blank</option>
            <option value="TYPE_ANSWER">Type Answer</option>
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
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
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
            onClick={() => onNavigate("bulk-create")}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-body-sm font-bold text-white transition hover:bg-primary-hover"
          >
            <Plus size={14} />
            Add questions
          </button>
        </div>

        {/* Questions Table */}
        <table className="w-full min-w-[680px] border-collapse text-body-sm">
          <thead>
            <tr>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">#</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Question Content</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Type</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Difficulty</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Completeness</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {questionsQuery.isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-400">
                  Loading questions...
                </td>
              </tr>
            ) : questionsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-400">
                  No questions found in this bank.
                </td>
              </tr>
            ) : (
              questionsList.map((question, index) => {
                const rowIndex = (page - 1) * pageSize + index + 1;
                const isReady = question.complete ?? question.is_complete;

                return (
                  <tr
                    key={question.id}
                    className="cursor-pointer transition hover:bg-slate-50/80"
                    onClick={() => setPreviewQuestion(question)}
                  >
                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-400">
                      {rowIndex}
                    </td>

                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-700">
                      <b className="font-semibold text-slate-900">
                        {question.content}
                      </b>
                    </td>

                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500">
                      <Badge tone="blue">{question.type}</Badge>
                    </td>

                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500">
                      <Badge
                        tone={
                          question.difficulty === "EASY"
                            ? "easy"
                            : question.difficulty === "MEDIUM"
                            ? "medium"
                            : "hard"
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </td>

                    <td className="border-b border-slate-100 p-2.5 text-sm text-slate-500">
                      <Badge tone={isReady ? "green" : "gray"}>
                        {isReady ? "Ready" : "Incomplete"}
                      </Badge>
                    </td>

                    <td
                      className="border-b border-slate-100 p-2.5 text-sm text-slate-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Preview Question"
                          onClick={() => setPreviewQuestion(question)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          title="Edit Question"
                          onClick={() => onNavigate("question", question.id)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal size={16} />
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
          <b>Total: {totalElements} questions</b>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 rounded border border-slate-200 bg-white text-xs text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`h-7 w-7 rounded border text-xs ${
                  pageNum === page
                    ? "border-primary bg-primary text-white font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2 rounded border border-slate-200 bg-white text-xs text-slate-600 disabled:opacity-40"
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
                <Badge tone="blue">{previewQuestion.type}</Badge>
                <Badge
                  tone={
                    previewQuestion.difficulty === "EASY"
                      ? "easy"
                      : previewQuestion.difficulty === "MEDIUM"
                      ? "medium"
                      : "hard"
                  }
                >
                  {previewQuestion.difficulty}
                </Badge>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">PROMPT</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {previewQuestion.content}
                </p>
              </div>

              {/* Display Options for Choice Types */}
              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">OPTIONS</p>
                  <div className="space-y-2">
                    {previewQuestion.options.map((opt, i) => (
                      <div
                        key={opt.id || i}
                        className={`flex items-center justify-between rounded-lg border p-2.5 text-sm ${
                          opt.isCorrect
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-900 font-semibold"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span>
                          <strong className="mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</strong>
                          {opt.content}
                        </span>
                        {opt.isCorrect && (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Accepted Answers for Text/TF types */}
              {previewQuestion.answers && previewQuestion.answers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">ACCEPTED ANSWERS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewQuestion.answers.map((ans) => (
                      <span
                        key={ans.id}
                        className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200"
                      >
                        {ans.rawValue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewQuestion.explanation && (
                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200/60">
                  <p className="text-xs font-semibold text-amber-800">EXPLANATION</p>
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
                  const id = previewQuestion.id;
                  setPreviewQuestion(null);
                  onNavigate("question", id);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Edit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}