"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Volume2,
  Plus,
  Zap,
  Search,
  Trash2,
  Edit3,
  AlertCircle,
  Sparkles,
  BookA,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  VocabularyWord,
  CreateVocabularyWordRequest,
  UpdateVocabularyWordRequest,
} from "@/types/vocabulary";
import { VocabularyWordModal } from "./vocabulary-word-modal";
import { BulkImportVocabularyModal } from "./bulk-import-vocabulary-modal";

interface UnitVocabularySectionProps {
  unitId: number;
}

export function UnitVocabularySection({ unitId }: UnitVocabularySectionProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deletingWord, setDeletingWord] = useState<VocabularyWord | null>(null);

  // Fetch words
  const { data: words = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.contentVocabulary(unitId, {
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: searchTerm.trim() || undefined,
    }),
    queryFn: async () => {
      const res = await contentService.listVocabulary(unitId, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
      });
      return res.data ?? [];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["content", "vocabulary", unitId],
    });
    // Also invalidate student game units cache so game hub syncs immediately!
    queryClient.invalidateQueries({
      queryKey: ["student", "game"],
    });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateVocabularyWordRequest) =>
      contentService.createVocabulary(unitId, payload),
    onSuccess: () => {
      refresh();
      setAddModalOpen(false);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (wordsList: CreateVocabularyWordRequest[]) =>
      contentService.bulkCreateVocabulary(unitId, { words: wordsList }),
    onSuccess: () => {
      refresh();
      setBulkModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateVocabularyWordRequest) => {
      if (!editingWord) throw new Error("No word to edit");
      return contentService.updateVocabulary(editingWord.id, payload);
    },
    onSuccess: () => {
      refresh();
      setEditingWord(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: "ACTIVE" | "INACTIVE" }) =>
      contentService.updateVocabularyStatus(id, nextStatus),
    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentService.deleteVocabulary(id),
    onSuccess: () => {
      refresh();
      setDeletingWord(null);
    },
  });

  // Web Speech audio helper
  const handleSpeak = (word: string) => {
    if (!word || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const activeCount = words.filter((w) => w.status === "ACTIVE").length;

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 p-4 sm:p-5">
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
                {words.length} từ
              </span>
            </div>
            <h2 className="mt-1 text-base font-bold text-slate-800">
              Từ vựng của Unit (Dùng cho Mini-Game & Bài học)
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>Nhập nhanh</span>
            </button>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-dark transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Thêm từ vựng</span>
            </button>
          </div>
        </div>

        {/* Mini-game Warning if active words < 4 */}
        {activeCount > 0 && activeCount < 4 && (
          <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200/80 p-2.5 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Unit này hiện có <strong>{activeCount} từ hoạt động</strong>. Để học sinh có thể chơi tốt các mini-game (Bắn bóng & Mưa từ), bạn nên thêm tối thiểu <strong>4 từ</strong>.
            </span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
        {/* Status filter tabs */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold text-slate-600 shadow-sm w-full sm:w-auto">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition ${
                statusFilter === s
                  ? "bg-primary text-white shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              {s === "ALL" ? "Tất cả" : s === "ACTIVE" ? "Đang dùng" : "Tạm ẩn"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm từ tiếng Anh, tiếng Việt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-3 pl-4 pr-2 sm:pl-5 w-12 text-center">#</th>
              <th className="py-3 px-3">Từ vựng (Word)</th>
              <th className="py-3 px-3">Phiên âm</th>
              <th className="py-3 px-3">Nghĩa tiếng Việt</th>
              <th className="py-3 px-3">Độ khó</th>
              <th className="py-3 px-3 text-center">Trạng thái</th>
              <th className="py-3 pl-3 pr-4 sm:pr-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Đang tải danh sách từ vựng...
                </td>
              </tr>
            ) : words.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="mx-auto max-w-xs space-y-2">
                    <Sparkles className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      {searchTerm.trim()
                        ? "Không tìm thấy từ vựng phù hợp"
                        : "Chưa có từ vựng nào trong bài học này"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Hãy thêm từ vựng để kích hoạt mini-game cho học sinh luyện tập.
                    </p>
                    {!searchTerm.trim() && (
                      <div className="pt-2 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAddModalOpen(true)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dark transition"
                        >
                          + Thêm từ đầu tiên
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkModalOpen(true)}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                        >
                          ⚡ Nhập nhanh
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              words.map((item, idx) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition group"
                >
                  {/* Order */}
                  <td className="py-3 pl-4 pr-2 sm:pl-5 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Word + TTS button */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-[13px]">
                        {item.word}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(item.word)}
                        className="rounded p-1 text-slate-400 hover:text-primary hover:bg-primary/10 transition opacity-80 group-hover:opacity-100"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      {item.partOfSpeech && (
                        <span className="text-[10px] italic text-slate-400 font-medium">
                          ({item.partOfSpeech.toLowerCase()})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Pronunciation */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {item.pronunciation || "—"}
                  </td>

                  {/* Vietnamese Meaning */}
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">
                      {item.meaningVi}
                    </span>
                    {item.exampleSentence && (
                      <p className="mt-0.5 text-[11px] text-slate-400 italic truncate max-w-xs">
                        &quot;{item.exampleSentence}&quot;
                      </p>
                    )}
                  </td>

                  {/* Difficulty */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.difficulty === "EASY"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : item.difficulty === "MEDIUM"
                          ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                          : "bg-rose-50 text-rose-700 border border-rose-200/60"
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: item.id,
                          nextStatus: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                        })
                      }
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                        item.status === "ACTIVE"
                          ? "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/70"
                          : "bg-slate-200/80 text-slate-600 hover:bg-slate-300/80"
                      }`}
                      title="Bấm để đổi trạng thái"
                    >
                      {item.status === "ACTIVE" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-slate-500" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Action buttons */}
                  <td className="py-3 pl-3 pr-4 sm:pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingWord(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 transition"
                        title="Chỉnh sửa từ này"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingWord(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Xóa từ này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm từ vựng */}
      <VocabularyWordModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload as CreateVocabularyWordRequest);
        }}
        isPending={createMutation.isPending}
      />

      {/* Modal Sửa từ vựng */}
      <VocabularyWordModal
        open={!!editingWord}
        onOpenChange={(open) => !open && setEditingWord(null)}
        word={editingWord}
        onSubmit={async (payload) => {
          await updateMutation.mutateAsync(payload as UpdateVocabularyWordRequest);
        }}
        isPending={updateMutation.isPending}
      />

      {/* Modal Nhập nhanh */}
      <BulkImportVocabularyModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        onSubmit={async (wordsList) => {
          await bulkMutation.mutateAsync(wordsList);
        }}
        isPending={bulkMutation.isPending}
      />

      {/* Confirmation Dialog Xóa từ vựng */}
      {deletingWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Xác nhận xóa từ vựng?
                </h3>
                <p className="text-xs text-slate-500">
                  Bạn có chắc muốn xóa từ &quot;<strong>{deletingWord.word}</strong>&quot; khỏi Unit này?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingWord(null)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingWord.id)}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

