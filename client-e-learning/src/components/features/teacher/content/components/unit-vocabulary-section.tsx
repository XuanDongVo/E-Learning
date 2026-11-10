"use client";

import {useDeferredValue,useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookA,
  Edit3,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
import { cn } from "@/lib/utils";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  CreateVocabularyWordRequest,
  UpdateVocabularyWordRequest,
  VocabularyWord,
} from "@/types/vocabulary";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table/data-table";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { RegionState } from "@/components/feedback";
import { VocabularyWordModal } from "./vocabulary-word-modal";
import { BulkImportVocabularyModal } from "./bulk-import-vocabulary-modal";

interface UnitVocabularySectionProps {
  unitId: number;
}

type VocabularyStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const DIFFICULTY_STYLES: Record<VocabularyWord["difficulty"], string> = {
  EASY: "border-success/30 bg-success-soft text-success",
  MEDIUM: "border-warning/30 bg-warning-soft text-warning",
  HARD: "border-destructive/30 bg-destructive-soft text-destructive",
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function UnitVocabularySection({ unitId }: UnitVocabularySectionProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] =
    useState<VocabularyStatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deletingWord, setDeletingWord] = useState<VocabularyWord | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page & filters when unitId changes
  useEffect(() => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
  }, [unitId]);

  // Fetch words with pagination
  const { data: pageResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.contentVocabulary(unitId, {
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: debouncedSearch || undefined,
      page,
      size: pageSize,
    }),
    queryFn: async () => {
      const response = await contentService.listVocabulary(unitId, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        page,
        size: pageSize,
      });
      return res.data;
    },
  });

  const words = pageResponse?.items ?? [];
  const totalElements = pageResponse?.totalElements ?? 0;
  const totalPages = pageResponse?.totalPages ?? 1;

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["content", "vocabulary", unitId],
    });
    // Also invalidate student game units cache so game hub syncs immediately!
    queryClient.invalidateQueries({
      queryKey: ["student", "game"],
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateVocabularyWordRequest) =>
      contentService.createVocabulary(unitId, payload),
    onSuccess: async () => {
      await refresh();
      setAddModalOpen(false);
      toast.success("Đã thêm từ vựng");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (words: CreateVocabularyWordRequest[]) =>
      contentService.bulkCreateVocabulary(unitId, { words }),
    onSuccess: async (response) => {
      await refresh();
      setBulkModalOpen(false);
      toast.success(`Đã thêm ${response.data?.length ?? 0} từ vựng`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateVocabularyWordRequest) => {
      if (!editingWord) throw new Error("Không tìm thấy từ vựng cần chỉnh sửa");
      return contentService.updateVocabulary(editingWord.id, payload);
    },
    onSuccess: async () => {
      await refresh();
      setEditingWord(null);
      toast.success("Đã cập nhật từ vựng");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus,
    }: {
      id: number;
      nextStatus: "ACTIVE" | "INACTIVE";
    }) => contentService.updateVocabularyStatus(id, nextStatus),
    onSuccess: async () => {
      await refresh();
      toast.success("Đã cập nhật trạng thái từ vựng");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentService.deleteVocabulary(id),
    onSuccess: async () => {
      await refresh();
      setDeletingWord(null);
      toast.success("Đã xóa từ vựng");
    },
  });

  const words = wordsQuery.data ?? [];
  const hasFilters = statusFilter !== "ALL" || Boolean(deferredSearch);

  const handleSpeak = (word: string) => {
    if (
      !word ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const columns: DataTableColumn<VocabularyWord>[] = [
    {
      id: "index",
      header: <span className="block text-center w-full">#</span>,
      width: "3.5rem",
      align: "center",
      className: "font-mono text-neutral-muted text-xs text-center",
      cell: (item) => {
        const idx = words.findIndex((w) => w.id === item.id);
        return <span>{(page - 1) * pageSize + (idx >= 0 ? idx + 1 : 1)}</span>;
      },
    },
    {
      id: "word",
      header: "Từ vựng (Word)",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{item.word}</span>
          <button
            type="button"
            onClick={() => handleSpeak(item.word)}
            className="rounded p-1 text-neutral-muted hover:text-primary hover:bg-primary/10 transition opacity-80 hover:opacity-100"
            title="Nghe phát âm"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          {item.partOfSpeech && (
            <span className="text-xs italic text-neutral-muted font-medium">
              ({item.partOfSpeech.toLowerCase()})
            </span>
          )}
        </div>
      ),
    },
    {
      id: "pronunciation",
      header: "Phiên âm",
      className: "font-mono text-xs text-neutral-muted",
      cell: (item) => item.pronunciation || "—",
    },
    {
      id: "meaningVi",
      header: "Nghĩa tiếng Việt",
      cell: (item) => (
        <div>
          <span className="font-medium text-foreground text-sm">{item.meaningVi}</span>
          {item.exampleSentence && (
            <p className="mt-0.5 text-xs text-neutral-muted italic truncate max-w-sm">
              &quot;{item.exampleSentence}&quot;
            </p>
          )}
        </div>
      ),
    },
    {
      id: "difficulty",
      header: "Độ khó",
      cell: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            item.difficulty === "EASY"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : item.difficulty === "MEDIUM"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {item.difficulty}
        </span>
      ),
    },
    {
      id: "status",
      header: <span className="block text-center w-full">Trạng thái</span>,
      align: "center",
      cell: (item) => (
        <button
          type="button"
          onClick={() =>
            toggleStatusMutation.mutate({
              id: item.id,
              nextStatus: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            })
          }
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition shadow-sm ${
            item.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-neutral-muted/10 text-neutral-muted hover:bg-neutral-muted/20"
          }`}
          title="Bấm để đổi trạng thái"
        >
          {item.status === "ACTIVE" ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Active</span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5 text-neutral-muted" />
              <span>Hidden</span>
            </>
          )}
        </button>
      ),
    },
    {
      id: "actions",
      header: <span className="block text-right w-full">Thao tác</span>,
      align: "right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setEditingWord(item)}
            className="rounded-lg p-1.5 text-neutral-muted hover:text-primary hover:bg-primary/10 transition"
            title="Chỉnh sửa từ này"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingWord(item)}
            className="rounded-lg p-1.5 text-neutral-muted hover:text-rose-600 hover:bg-rose-50 transition"
            title="Xóa từ này"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-5 space-y-4">
      {/* Header & Controls Toolbar Card */}
      <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-5 shadow-pop">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                <BookA className="h-4 w-4" />
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                Vocabulary Management
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {totalElements} từ
              </span>
            </div>
            <h2 className="mt-1 text-base font-bold text-foreground">
              Từ vựng của Unit (Dùng cho Mini-Game & Bài học)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={bulkMutation.isPending}
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-sm"
            >
              <Zap className="size-4 text-warning" aria-hidden="true" />
              Nhập nhanh
            </button>
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="size-4" aria-hidden="true" />
              Thêm từ vựng
            </button>
          </div>
        </div>

        {/* Mini-game Warning if total words < 4 */}
        {totalElements > 0 && totalElements < 4 && statusFilter === "ALL" && (
          <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Unit này hiện chỉ có <strong>{totalElements} từ</strong>. Để học sinh có thể chơi tốt các mini-game (Bắn bóng & Mưa từ), bạn nên thêm tối thiểu <strong>4 từ</strong>.
            </span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
          {/* Status filter tabs */}
          <div className="flex items-center rounded-xl border border-border bg-background p-1 text-xs font-semibold text-neutral-muted shadow-sm w-full sm:w-auto">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition font-bold ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                {s === "ALL" ? "Tất cả" : s === "ACTIVE" ? "Đang dùng" : "Tạm ẩn"}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
            <input
              type="text"
              placeholder="Tìm từ tiếng Anh, tiếng Việt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Content with Pagination using DataTable */}
      <DataTable
        data={words}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        loadingState={<SkeletonTable columns={7} rows={pageSize} />}
        emptyState={
          <div className="rounded-2xl border-2 border-ink bg-card p-8 shadow-pop">
            <RegionState
              variant="empty"
              title={
                debouncedSearch
                  ? "Không tìm thấy từ vựng phù hợp"
                  : "Chưa có từ vựng nào trong bài học này"
              }
              description={
                debouncedSearch
                  ? "Thử tìm kiếm với từ khóa khác hoặc làm mới bộ lọc."
                  : "Hãy thêm từ vựng để kích hoạt mini-game cho học sinh luyện tập."
              }
              action={
                !debouncedSearch ? (
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddModalOpen(true)}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                    >
                      + Thêm từ đầu tiên
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkModalOpen(true)}
                      className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-100 transition"
                    >
                      ⚡ Nhập nhanh
                    </button>
                  </div>
                ) : undefined
              }
            />
          </div>
        }
        minWidth="760px"
        pagination={{
          page,
          totalPages,
          totalElements,
          pageSize,
          pageSizeOptions: [5, 10, 20, 50],
          totalLabel: `Total: ${totalElements} Words`,
          showLabel: "Show",
          perPageLabel: "per page",
          previousLabel: "Previous",
          nextLabel: "Next",
          onPageChange: setPage,
          onPageSizeChange: (nextSize) => {
            setPageSize(nextSize);
            setPage(1);
          },
        }}
      />

      <VocabularyWordModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(
            payload as CreateVocabularyWordRequest,
          );
        }}
        isPending={createMutation.isPending}
      />

      <VocabularyWordModal
        open={Boolean(editingWord)}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) setEditingWord(null);
        }}
        word={editingWord}
        onSubmit={async (payload) => {
          await updateMutation.mutateAsync(
            payload as UpdateVocabularyWordRequest,
          );
        }}
        isPending={updateMutation.isPending}
      />

      <BulkImportVocabularyModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        onSubmit={async (wordsToCreate) => {
          await bulkMutation.mutateAsync(wordsToCreate);
        }}
        isPending={bulkMutation.isPending}
      />

      {/* Confirmation Dialog Xóa từ vựng */}
      {deletingWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl border-2 border-ink space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Xác nhận xóa từ vựng?
                </h3>
                <p className="text-xs text-neutral-muted">
                  Bạn có chắc muốn xóa từ &quot;<strong>{deletingWord.word}</strong>&quot; khỏi Unit này?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDeletingWord(null)}
                className="rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-neutral-muted hover:bg-muted transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingWord.id)}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
