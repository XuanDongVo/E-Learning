"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookA,
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  Trash2,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { RegionState } from "@/components/feedback";
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

import { BulkImportVocabularyModal } from "./bulk-import-vocabulary-modal";
import { VocabularyWordModal } from "./vocabulary-word-modal";

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
  const [statusFilter, setStatusFilter] =
    useState<VocabularyStatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deletingWord, setDeletingWord] = useState<VocabularyWord | null>(null);

  const wordsQuery = useQuery({
    queryKey: QUERY_KEYS.contentVocabulary(unitId, {
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: deferredSearch || undefined,
    }),
    queryFn: async () => {
      const response = await contentService.listVocabulary(unitId, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: deferredSearch || undefined,
      });
      return response.data ?? [];
    },
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.contentVocabularyRoot(unitId),
      }),
      queryClient.invalidateQueries({ queryKey: ["student", "game"] }),
    ]);
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

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchTerm("");
  };

  return (
    <section className="overflow-hidden border-2 border-ink rounded-lg shadow-pop bg-card">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BookA className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-card-title font-bold text-foreground">
                Từ vựng của Unit
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-caption font-semibold text-muted-foreground">
                {words.length}
              </span>
            </div>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Danh sách này dùng chung với trang Vocabulary trong Teacher Navbar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={bulkMutation.isPending}
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
            >
              <Zap className="size-4 text-warning" aria-hidden="true" />
              Nhập nhanh
            </button>
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => setAddModalOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-body-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden="true" />
              Thêm từ vựng
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div
          className="flex w-full items-center rounded-lg border border-border bg-card p-1 text-body-sm font-semibold sm:w-auto"
          aria-label="Lọc trạng thái từ vựng"
        >
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "min-h-10 flex-1 rounded-lg px-3 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none",
                statusFilter === status &&
                  "bg-primary text-primary-foreground hover:text-primary-foreground",
              )}
            >
              {status === "ALL"
                ? "Tất cả"
                : status === "ACTIVE"
                  ? "Đang dùng"
                  : "Tạm ẩn"}
            </button>
          ))}
        </div>

        <label className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Tìm từ vựng</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm từ hoặc nghĩa tiếng Việt"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-body text-foreground outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </label>
      </div>

      {toggleStatusMutation.isError && (
        <div
          role="alert"
          className="border-b border-destructive/30 bg-destructive-soft px-4 py-3 text-body-sm text-destructive sm:px-5"
        >
          {errorMessage(
            toggleStatusMutation.error,
            "Không thể cập nhật trạng thái từ vựng.",
          )}
        </div>
      )}

      {wordsQuery.isLoading ? (
        <SkeletonList count={5} className="p-4 sm:p-5" />
      ) : wordsQuery.isError ? (
        <RegionState
          variant="error"
          title="Không thể tải danh sách từ vựng"
          description={errorMessage(
            wordsQuery.error,
            "Đã xảy ra lỗi khi tải dữ liệu của Unit này.",
          )}
          action={
            <button
              type="button"
              onClick={() => void wordsQuery.refetch()}
              className="min-h-10 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Thử lại
            </button>
          }
        />
      ) : words.length === 0 ? (
        <RegionState
          variant="empty"
          title={
            hasFilters
              ? "Không tìm thấy từ vựng phù hợp"
              : "Unit này chưa có từ vựng"
          }
          description={
            hasFilters
              ? "Thay đổi bộ lọc hoặc từ khóa để xem kết quả khác."
              : "Thêm từ vựng đầu tiên để bắt đầu xây dựng danh sách của Unit."
          }
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-10 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="min-h-10 rounded-lg bg-primary px-3 py-2 text-body-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Thêm từ vựng
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto" aria-busy={wordsQuery.isFetching}>
          <table className="w-full min-w-max border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-label font-semibold text-muted-foreground">
                <th className="px-4 py-3 text-center sm:pl-5">#</th>
                <th className="px-3 py-3">Từ vựng</th>
                <th className="px-3 py-3">Phiên âm</th>
                <th className="px-3 py-3">Nghĩa tiếng Việt</th>
                <th className="px-3 py-3">Độ khó</th>
                <th className="px-3 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right sm:pr-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-body-sm text-foreground">
              {words.map((item, index) => {
                const statusPending =
                  toggleStatusMutation.isPending &&
                  toggleStatusMutation.variables?.id === item.id;
                const deletePending =
                  deleteMutation.isPending && deletingWord?.id === item.id;

                return (
                  <tr key={item.id} className="group hover:bg-muted/30">
                    <td className="px-4 py-3 text-center tabular-nums text-muted-foreground sm:pl-5">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.word}</span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.word)}
                          aria-label={`Nghe phát âm ${item.word}`}
                          className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Volume2 className="size-4" aria-hidden="true" />
                        </button>
                        {item.partOfSpeech && (
                          <span className="text-body-sm italic text-muted-foreground">
                            ({item.partOfSpeech.toLowerCase()})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {item.pronunciation || "—"}
                    </td>
                    <td className="max-w-sm px-3 py-3">
                      <span className="font-semibold">{item.meaningVi}</span>
                      {item.exampleSentence && (
                        <p className="mt-1 truncate italic text-muted-foreground">
                          “{item.exampleSentence}”
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-caption font-semibold",
                          DIFFICULTY_STYLES[item.difficulty],
                        )}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        disabled={statusPending}
                        aria-pressed={item.status === "ACTIVE"}
                        aria-label={`Đổi trạng thái của ${item.word}`}
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: item.id,
                            nextStatus:
                              item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                          })
                        }
                        className={cn(
                          "inline-flex min-h-10 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                          item.status === "ACTIVE"
                            ? "bg-success-soft text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.status === "ACTIVE" ? (
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        ) : (
                          <XCircle className="size-3.5" aria-hidden="true" />
                        )}
                        {statusPending
                          ? "Đang lưu"
                          : item.status === "ACTIVE"
                            ? "Đang dùng"
                            : "Tạm ẩn"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right sm:pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={deletePending || statusPending}
                          onClick={() => setEditingWord(item)}
                          aria-label={`Chỉnh sửa ${item.word}`}
                          className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={deletePending || statusPending}
                          onClick={() => {
                            deleteMutation.reset();
                            setDeletingWord(item);
                          }}
                          aria-label={`Xóa ${item.word}`}
                          className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

      <AlertDialog
        open={Boolean(deletingWord)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            deleteMutation.reset();
            setDeletingWord(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa từ vựng?</AlertDialogTitle>
            <AlertDialogDescription>
              Từ “<strong>{deletingWord?.word}</strong>” sẽ bị xóa khỏi Unit này
              và không còn xuất hiện trong danh sách Vocabulary dùng chung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive-soft p-3 text-body-sm text-destructive"
            >
              {errorMessage(
                deleteMutation.error,
                "Không thể xóa từ vựng. Vui lòng thử lại.",
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="border-border hover:bg-muted"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || !deletingWord}
              onClick={(event) => {
                event.preventDefault();
                if (deletingWord) deleteMutation.mutate(deletingWord.id);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa…" : "Xóa từ vựng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
