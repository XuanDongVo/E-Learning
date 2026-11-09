"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
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
import { RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
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
  const tErrors = useTranslations("errors");
  const tContent = useTranslations("teacher.content");
  const searchParams = useSearchParams();
  const source = searchParams.get("source") === "global" ? "global" : "content";

  const [editOpen, setEditOpen] = useState(false);

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedCompleteness, setSelectedCompleteness] = useState<
    "" | "complete" | "incomplete"
  >("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Quick Preview state
  const [previewQuestion, setPreviewQuestion] =
    useState<QuestionResponse | null>(null);

  // Multi-select + delete confirmation
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[] | null>(null);

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
      isComplete:
        selectedCompleteness === ""
          ? undefined
          : selectedCompleteness === "complete",
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
          isComplete:
            selectedCompleteness === ""
              ? undefined
              : selectedCompleteness === "complete",
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
    queryFn: async () =>
      (await contentService.getSection(topicQuery.data!.sectionId)).data,
    enabled: Boolean(topicQuery.data?.sectionId),
  });
  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.contentUnit(sectionQuery.data?.unitId ?? 0),
    queryFn: async () =>
      (await contentService.getUnit(sectionQuery.data!.unitId)).data,
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
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleOne = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds(allOnPageSelected ? new Set() : new Set(pageIds));
  };

  const deletePreviewLabels = (deleteTargetIds ?? []).slice(0, 3).map((id) => {
    const found = questionsList.find((q) => q.id === id);
    const text = found?.content ?? `Question #${id}`;
    return text.length > 70 ? `${text.slice(0, 70)}…` : text;
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: (nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
      contentService.updateQuestionBankStatus(bankId, { status: nextStatus }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.contentQuestionBank(bankId),
        }),
        ...(bankQuery.data?.topicId
          ? [
              client.invalidateQueries({
                queryKey: QUERY_KEYS.contentQuestionBanks(
                  bankQuery.data.topicId,
                ),
              }),
            ]
          : []),
      ]);
      toast.success("Question bank status updated");
    },
    onError: (error) => {
      toast.error(
        getAppErrorMessage(error, tErrors as (key: string) => string),
      );
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => contentService.archiveQuestionBank(bankId),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.contentQuestionBank(bankId),
        }),
        ...(bankQuery.data?.topicId
          ? [
              client.invalidateQueries({
                queryKey: QUERY_KEYS.contentQuestionBanks(
                  bankQuery.data.topicId,
                ),
              }),
            ]
          : []),
      ]);
      toast.success("Question bank archived");
    },
    onError: (error) => {
      toast.error(
        getAppErrorMessage(error, tErrors as (key: string) => string),
      );
    },
  });

  const update = useMutation({
    mutationFn: (payload: UpdateQuestionBankRequest) =>
      contentService.updateQuestionBank(bankId, payload),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.contentQuestionBank(bankId),
        }),
        ...(bankQuery.data?.topicId
          ? [
              client.invalidateQueries({
                queryKey: QUERY_KEYS.contentQuestionBanks(
                  bankQuery.data.topicId,
                ),
              }),
            ]
          : []),
      ]);
      setEditOpen(false);
      toast.success("Question bank updated");
    },
    onError: (error) => {
      toast.error(
        getAppErrorMessage(error, tErrors as (key: string) => string),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      contentService.bulkDeleteQuestions({ questionBankId: bankId, ids }),
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
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground"
      >
        {source === "global" ? (
          <>
            <Link
              href="/teacher/content/question-banks"
              className="rounded hover:text-primary hover:underline"
            >
              Question Banks
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate("overview")}
            className="rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Content
          </button>
        )}
        {unitQuery.data && (
          <>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <Link
              href={`/teacher/content/units/${unitQuery.data.id}`}
              className="max-w-[180px] truncate rounded hover:text-primary hover:underline"
            >
              {unitQuery.data.name}
            </Link>
          </>
        )}
        {sectionQuery.data && (
          <>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <Link
              href={`/teacher/content/sections/${sectionQuery.data.id}`}
              className="max-w-[180px] truncate rounded hover:text-primary hover:underline"
            >
              {sectionQuery.data.name}
            </Link>
          </>
        )}
        {topicQuery.data && (
          <>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <Link
              href={`/teacher/content/topics/${topicQuery.data.id}`}
              className="max-w-[180px] truncate rounded hover:text-primary hover:underline"
            >
              {topicQuery.data.name}
            </Link>
          </>
        )}
        <span aria-hidden="true" className="text-border">
          /
        </span>
        <span
          aria-current="page"
          className="max-w-[220px] truncate font-bold text-foreground"
        >
          {bank?.name ?? "Question Bank"}
        </span>
      </nav>

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
        actionPending={
          statusMutation.isPending ||
          archiveMutation.isPending ||
          update.isPending
        }
      />

      {/* Inline Content Editor */}
      {editOpen && (
        <div className="mt-5 rounded-xl border-2 border-ink bg-card p-5 shadow-pop">
          <ContentEditor
            kind="question-bank"
            initial={{
              name: bank?.name ?? "",
              description: bank?.description ?? "",
            }}
            onSubmit={(payload) =>
              update.mutate(payload as UpdateQuestionBankRequest)
            }
            onCancel={() => setEditOpen(false)}
            pending={update.isPending}
            error={update.isError ? "Could not save changes." : undefined}
          />
        </div>
      )}

      {/* Main Container Section */}
      <section className="mb-6 mt-4 rounded-xl border-2 border-ink bg-card p-4 text-card-foreground shadow-pop sm:p-6">
        {/* Header Thông tin tổng quan */}
        <div className="mb-5 border-b-2 border-border pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/teacher/content"
              className="hover:text-primary hover:underline"
            >
              Content Explorer
            </Link>
            {unitQuery.data && (
              <>
                <span className="text-border">/</span>
                <Link
                  href={`/teacher/content/units/${unitQuery.data.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {unitQuery.data.name}
                </Link>
              </>
            )}
            {topicQuery.data && (
              <>
                <span className="text-border">/</span>
                <Link
                  href={`/teacher/content/topics/${topicQuery.data.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {topicQuery.data.name}
                </Link>
              </>
            )}
            <span className="text-border">/</span>
            <span className="font-bold text-foreground">
              {bank?.name ?? "Question Bank"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {topicQuery.data?.name ?? bank?.name ?? "Question Bank"} —
                Question Bank
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question bank · {bank?.status?.toLowerCase() ?? "loading"}
              </p>
            </div>

            {/* Stat Badges */}
            <div className="flex flex-wrap gap-2.5">
              <div className="min-w-[105px] rounded-lg border-2 border-ink bg-muted/40 px-3.5 py-2 text-center shadow-pop-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Questions
                </p>
                <p className="mt-0.5 text-sm font-black text-foreground">
                  {bank?.totalQuestions ?? 0}
                </p>
              </div>
              <div className="min-w-[105px] rounded-lg border-2 border-ink bg-success-soft px-3.5 py-2 text-center text-success shadow-pop-sm">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Complete
                </p>
                <p className="mt-0.5 text-sm font-black">
                  {bank?.readyQuestions ?? 0}
                </p>
              </div>
              <div className="min-w-[105px] rounded-lg border-2 border-ink bg-warning-soft px-3.5 py-2 text-center text-warning shadow-pop-sm">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Incomplete
                </p>
                <p className="mt-0.5 text-sm font-black">
                  {Math.max(
                    0,
                    (bank?.totalQuestions ?? 0) - (bank?.readyQuestions ?? 0),
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Bộ lọc */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border-2 border-ink  px-3 text-muted-foreground shadow-pop-sm transition-colors focus-within:border-primary sm:max-w-xs">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Search questions..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Type */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border-2 border-ink  px-2.5 text-xs font-semibold text-foreground shadow-pop-sm outline-none transition-all hover:bg-muted focus:border-primary"
          >
            <option value="">All Types</option>
            {questionTypeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Filter Difficulty */}
          <select
            aria-label="Filter by difficulty"
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border-2 border-ink  px-2.5 text-xs font-semibold text-foreground shadow-pop-sm outline-none transition-all hover:bg-muted focus:border-primary"
          >
            <option value="">All Difficulty</option>
            {questionDifficultyOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Filter Completeness */}
          <select
            aria-label="Filter by completeness"
            value={selectedCompleteness}
            onChange={(e) => {
              setSelectedCompleteness(
                e.target.value as "" | "complete" | "incomplete",
              );
              setPage(1);
            }}
            className="h-9 rounded-lg border-2 border-ink  px-2.5 text-xs font-semibold text-foreground shadow-pop-sm outline-none transition-all hover:bg-muted focus:border-primary"
          >
            <option value="">All Completeness</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>

          {/* Button Import CSV */}
          <button
            type="button"
            onClick={() => onNavigate("import", bankId, bank?.name)}
            className="flex h-9 items-center gap-1.5 rounded-lg border-2 border-ink bg-card px-3.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-muted active:translate-y-0"
          >
            <Upload size={14} className="text-primary" />
            Import CSV
          </button>

          {/* Button Add questions */}
          <button
            type="button"
            onClick={() => onNavigate("bulk-create", bankId, bank?.name)}
            className="flex h-9 items-center gap-1.5 rounded-lg border-2 border-ink bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={15} />
            Add questions
          </button>
        </div>

        {/* Thanh Bulk Actions */}
        {selectedIds.size > 0 && (
          <div
            role="region"
            aria-label="Bulk actions"
            className="mb-4 flex min-w-[640px] items-center justify-between rounded-xl border-2 border-ink bg-primary-soft p-3 shadow-pop-sm"
          >
            <span className="text-xs font-bold text-primary">
              Đã chọn {selectedIds.size} câu hỏi
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-lg border-2 border-ink bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Bỏ chọn tất cả
              </button>

              <button
                type="button"
                onClick={() => setDeleteTargetIds(Array.from(selectedIds))}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Trash2 size={13} />
                Xóa {selectedIds.size} câu đã chọn
              </button>
            </div>
          </div>
        )}

        {/* Header Danh sách câu hỏi */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Hiển thị {totalElements === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalElements)} trên tổng số{" "}
            {totalElements} câu
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-bold text-foreground">
            <FileQuestion size={14} className="text-primary" /> Danh sách
          </span>
        </div>

        {/* Question List Items */}
        <div
          className="space-y-2.5"
          role="list"
          aria-label="Questions in this bank"
        >
          {/* Table Header Bar */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-ink bg-muted/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-pop-sm">
            <input
              type="checkbox"
              aria-label="Select all questions on this page"
              checked={allOnPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = someOnPageSelected;
              }}
              onChange={toggleAllOnPage}
              disabled={pageIds.length === 0}
              className="h-4 w-4 cursor-pointer rounded border-2 border-ink accent-primary"
            />
            <span className="flex-1">Nội dung câu hỏi</span>
            <span className="hidden sm:block">Thao tác</span>
          </div>

          {questionsQuery.isLoading ? (
            <SkeletonList count={5} />
          ) : questionsQuery.isError ? (
            <RegionState
              variant="error"
              description={getAppErrorMessage(
                questionsQuery.error,
                tErrors as (key: string) => string,
              )}
              action={
                <button
                  type="button"
                  onClick={() => void questionsQuery.refetch()}
                  className="rounded-lg border-2 border-ink bg-card px-3 py-1.5 text-xs font-bold shadow-pop-sm hover:-translate-y-0.5"
                >
                  {tErrors("retry")}
                </button>
              }
            />
          ) : questionsList.length === 0 ? (
            <RegionState
              variant="empty"
              description={tContent("bankDetail.emptyQuestions")}
            />
          ) : (
            questionsList.map((question, index) => {
              const rowIndex = (page - 1) * pageSize + index + 1;
              const isReady = question.complete ?? question.is_complete;
              const isSelected = selectedIds.has(question.id);
              const typeLabel =
                questionTypeOptions.find((item) => item.value === question.type)
                  ?.label ?? question.type;
              const questionCode = "Q" + String(rowIndex).padStart(2, "0");

              return (
                <article
                  key={question.id}
                  role="listitem"
                  className={`group rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-ink bg-primary-soft/50 shadow-pop"
                      : "border-border bg-card shadow-sm hover:border-ink hover:shadow-pop-sm"
                  }`}
                >
                  <div className="flex items-start gap-3.5 p-3.5 sm:gap-4 sm:p-4">
                    {/* Checkbox & Mã số */}
                    <div className="flex items-start gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        aria-label={`Select question ${rowIndex}`}
                        checked={isSelected}
                        onChange={() => toggleOne(question.id)}
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-2 border-ink accent-primary"
                      />
                      <span className="min-w-8 pt-0.5 font-mono text-xs font-bold text-muted-foreground">
                        {questionCode}
                      </span>
                    </div>

                    {/* Preview Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewQuestion(question)}
                      className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                      aria-label={`Preview question ${rowIndex}: ${question.content}`}
                    >
                      <span className="block whitespace-pre-wrap break-words text-sm font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors">
                        {question.content || "Untitled question"}
                      </span>
                      <span className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <Badge tone="blue">{typeLabel}</Badge>
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
                        <Badge tone={isReady ? "green" : "gray"}>
                          {isReady ? "Complete" : "Incomplete"}
                        </Badge>
                      </span>
                    </button>

                    {/* Action Buttons */}
                    <div
                      className="flex shrink-0 items-center gap-1"
                      aria-label={`Actions for question ${rowIndex}`}
                    >
                      <button
                        type="button"
                        title="Preview Question"
                        aria-label={`Preview question ${rowIndex}`}
                        onClick={() => setPreviewQuestion(question)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-pop-sm transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Edit Question"
                        aria-label={`Edit question ${rowIndex}`}
                        onClick={() =>
                          onNavigate("question", question.id, bank?.name)
                        }
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-pop-sm transition-all"
                      >
                        <SquarePen size={16} />
                      </button>
                      <button
                        type="button"
                        title="Delete Question"
                        aria-label={`Delete question ${rowIndex}`}
                        onClick={() => setDeleteTargetIds([question.id])}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive-soft hover:text-destructive hover:shadow-pop-sm transition-all"
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

        {/* Phân trang (Pagination) */}
        <div className="mt-5 flex min-w-[640px] items-center justify-between border-t-2 border-border pt-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">
              Tổng số: {totalElements} câu
            </span>
            <div className="flex items-center gap-1.5">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 rounded-md border-2 border-ink  px-2 text-xs font-bold text-foreground shadow-pop-sm outline-none transition-all hover:bg-muted"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>câu / trang</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-lg border-2 border-ink bg-card px-3 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 rounded-lg border-2 border-ink text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                    pageNum === page
                      ? "bg-primary text-primary-foreground shadow-pop"
                      : "bg-card text-foreground shadow-pop-sm hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-lg border-2 border-ink bg-card px-3 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Quick Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-preview-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-ink bg-card p-6 text-card-foreground shadow-pop"
          >
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-2">
                <Badge tone="blue">
                  {questionTypeOptions.find(
                    (item) => item.value === previewQuestion.type,
                  )?.label ?? previewQuestion.type}
                </Badge>
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
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-muted-foreground">
                  Đề bài (Prompt)
                </p>
                <h2
                  id="question-preview-title"
                  className="mt-1 text-base font-black text-foreground"
                >
                  {previewQuestion.content}
                </h2>
              </div>

              {/* Các lựa chọn trắc nghiệm */}
              {previewQuestion.options &&
                previewQuestion.options.length > 0 && (
                  <div>
                    <p className="mb-2 font-bold uppercase tracking-wider text-muted-foreground">
                      Lựa chọn (Options)
                    </p>
                    <div className="space-y-2">
                      {previewQuestion.options.map((opt, i) => (
                        <div
                          key={opt.id || i}
                          className={`flex items-center justify-between rounded-lg border-2 p-3 ${
                            opt.isCorrect
                              ? "border-ink bg-success-soft font-bold text-success shadow-pop-sm"
                              : "border-border bg-background text-foreground"
                          }`}
                        >
                          <span className="flex items-center">
                            <strong className="mr-2 text-muted-foreground">
                              {String.fromCharCode(65 + i)}.
                            </strong>
                            {opt.content}
                          </span>
                          {opt.isCorrect && (
                            <CheckCircle2
                              size={16}
                              className="shrink-0 text-success"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Đáp án chấp nhận */}
              {previewQuestion.answers &&
                previewQuestion.answers.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                      Đáp án chấp nhận
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previewQuestion.answers.map((ans) => (
                        <span
                          key={ans.id}
                          className="rounded-md border-2 border-ink bg-success-soft px-3 py-1 text-xs font-bold text-success shadow-pop-sm"
                        >
                          {ans.rawValue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Lời giải thích */}
              {previewQuestion.explanation && (
                <div className="rounded-xl border-2 border-ink bg-warning-soft p-3.5 text-warning shadow-pop-sm">
                  <p className="font-bold uppercase tracking-wider">
                    Giải thích chi tiết
                  </p>
                  <p className="mt-1 font-medium leading-relaxed">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t-2 border-border pt-4">
              <button
                type="button"
                onClick={() => {
                  const id = previewQuestion.id;
                  setPreviewQuestion(null);
                  onNavigate("question", id, bank?.name);
                }}
                className="rounded-lg border-2 border-ink bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Chỉnh sửa câu hỏi này
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
            ? (deleteMutation.error as Error)?.message ||
              "Could not delete the selected questions. Please try again."
            : undefined
        }
        onConfirm={() => {
          if (deleteTargetIds) {
            deleteMutation.mutate(deleteTargetIds);
          }
        }}
        onCancel={() => {
          if (deleteMutation.isPending) return;
          deleteMutation.reset();
          setDeleteTargetIds(null);
        }}
      />
    </>
  );
}
