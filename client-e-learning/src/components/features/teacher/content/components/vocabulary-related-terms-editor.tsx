"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { contentService } from "@/services/content.service";
import type {
  VocabularyRelatedTerm,
  VocabularyRelatedTerms,
  VocabularyPartOfSpeech,
} from "@/types/vocabulary";

const GROUPS = [
  { key: "wordFamilies", label: "Họ từ", description: "Các dạng từ cùng gốc (ví dụ: engagement, engaging)." },
  { key: "synonyms", label: "Đồng nghĩa", description: "Từ hoặc cụm từ có nghĩa tương tự." },
  { key: "antonyms", label: "Trái nghĩa", description: "Từ hoặc cụm từ mang nghĩa đối lập." },
] as const;

type GroupKey = keyof VocabularyRelatedTerms;

const PARTS: { value: VocabularyPartOfSpeech; label: string }[] = [
  { value: "NOUN", label: "Danh từ" },
  { value: "VERB", label: "Động từ" },
  { value: "ADJECTIVE", label: "Tính từ" },
  { value: "ADVERB", label: "Trạng từ" },
  { value: "PREPOSITION", label: "Giới từ" },
  { value: "PHRASE", label: "Cụm từ" },
];

function termKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

interface RelatedTermsEditorProps {
  unitId: number;
  currentWordId?: number;
  value: VocabularyRelatedTerms;
  onChange: (value: VocabularyRelatedTerms) => void;
  disabled?: boolean;
}

export function VocabularyRelatedTermsEditor({ unitId, currentWordId, value, onChange, disabled }: RelatedTermsEditorProps) {
  const [activeGroup, setActiveGroup] = useState<GroupKey | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [draftMeaning, setDraftMeaning] = useState("");
  const [draftPart, setDraftPart] = useState<VocabularyPartOfSpeech | "">("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data: suggestions = [], isFetching, isError, error, refetch } = useQuery({
    queryKey: ["content", "vocabulary", "search-candidates", unitId, debouncedSearch],
    queryFn: async () => {
      const response = await contentService.searchVocabularyCandidates(unitId, debouncedSearch);
      return response.data ?? [];
    },
    enabled: activeGroup !== null && debouncedSearch.length >= 2 && Boolean(unitId),
    staleTime: 30_000,
  });

  function startAdd(group: GroupKey) {
    setActiveGroup(group);
    setSearch("");
    setDebouncedSearch("");
    setDraftMeaning("");
    setDraftPart("");
    setNotice("");
  }

  function add(term: VocabularyRelatedTerm) {
    if (!activeGroup) return;
    const normalized = term.term.trim().replace(/\s+/g, " ");
    if (!normalized || normalized.length > 120) {
      setNotice("Từ liên quan phải có từ 1 đến 120 ký tự.");
      return;
    }
    if (value[activeGroup].some((item) => termKey(item.term) === termKey(normalized))) {
      setNotice("Từ này đã có trong nhóm. Bạn có thể sửa thông tin ngay bên dưới.");
      return;
    }
    if (value[activeGroup].length >= 20) {
      setNotice("Mỗi nhóm chỉ chứa tối đa 20 từ liên quan.");
      return;
    }
    onChange({ ...value, [activeGroup]: [...value[activeGroup], { ...term, term: normalized }] });
    startAdd(activeGroup);
  }

  function changeItem(group: GroupKey, index: number, patch: Partial<VocabularyRelatedTerm>) {
    onChange({ ...value, [group]: value[group].map((item, idx) => idx === index ? { ...item, ...patch } : item) });
  }

  function removeItem(group: GroupKey, index: number) {
    onChange({ ...value, [group]: value[group].filter((_, idx) => idx !== index) });
  }

  return (
    <div className="space-y-3">
      {GROUPS.map(({ key, label, description }) => (
        <section key={key} className="rounded-xl border border-border bg-card p-3 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-body-sm font-bold text-foreground">{label} <span className="text-muted-foreground font-normal">({value[key].length})</span></h4>
              <p className="text-label text-muted-foreground">{description}</p>
            </div>
            <button type="button" disabled={disabled || value[key].length >= 20} onClick={() => startAdd(key)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-label font-semibold text-primary hover:bg-muted disabled:opacity-50">
              <Plus className="size-4" /> Thêm từ
            </button>
          </div>

          {value[key].length > 0 && (
            <ul className="space-y-2">
              {value[key].map((item, index) => (
                <li key={`${key}-${index}`} className="grid grid-cols-1 gap-2 rounded-lg bg-muted/50 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem_auto] sm:items-center">
                  <input type="text" value={item.term} disabled={disabled} maxLength={120} aria-label={`${label}: từ ${index + 1}`}
                    onChange={(e) => changeItem(key, index, { term: e.target.value })}
                    className="min-h-10 w-full rounded-md border border-input bg-background px-2 text-body-sm text-foreground" />
                  <input type="text" value={item.meaningVi ?? ""} disabled={disabled} maxLength={255} aria-label={`${label}: nghĩa từ ${index + 1}`}
                    placeholder="Nghĩa (tùy chọn)" onChange={(e) => changeItem(key, index, { meaningVi: e.target.value })}
                    className="min-h-10 w-full rounded-md border border-input bg-background px-2 text-body-sm text-foreground" />
                  <select value={item.partOfSpeech ?? ""} disabled={disabled} aria-label={`${label}: từ loại ${index + 1}`}
                    onChange={(e) => changeItem(key, index, { partOfSpeech: e.target.value ? e.target.value as VocabularyPartOfSpeech : null })}
                    className="min-h-10 w-full rounded-md border border-input bg-background px-2 text-label text-foreground">
                    <option value="">Từ loại</option>
                    {PARTS.map((part) => <option key={part.value} value={part.value}>{part.label}</option>)}
                  </select>
                  <button type="button" disabled={disabled} onClick={() => removeItem(key, index)} aria-label={`Xóa ${item.term || "từ liên quan"}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-md px-2 text-destructive hover:bg-destructive/10 disabled:opacity-50">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {activeGroup === key && (
            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} maxLength={120} disabled={disabled} autoFocus
                  onChange={(e) => { setSearch(e.target.value); setNotice(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add({ term: search, meaningVi: draftMeaning, partOfSpeech: draftPart || null }); } }}
                  placeholder="Tìm từ có sẵn hoặc nhập từ mới..."
                  aria-label={`Tìm hoặc thêm ${label.toLowerCase()}`}
                  className="min-h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-body-sm text-foreground outline-none focus:border-primary" />
              </div>
              {search.trim().length >= 2 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                  {isFetching && <p className="flex items-center gap-2 p-3 text-label text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Đang tìm kiếm...</p>}
                  {isError && (
                    <div className="flex items-center justify-between gap-2 p-3 text-label text-destructive">
                      {error instanceof Error ? error.message : "Không tìm được từ gợi ý."}
                      <button type="button" onClick={() => void refetch()} className="font-bold underline">Thử lại</button>
                    </div>
                  )}
                  {!isFetching && !isError && debouncedSearch.length >= 2 && suggestions.filter((item) => item.id !== currentWordId).length === 0 &&
                    <p className="p-3 text-label text-muted-foreground">Chưa có kết quả. Bạn có thể thêm trực tiếp bên dưới.</p>}
                  {!isFetching && !isError && suggestions.filter((item) => item.id !== currentWordId).map((candidate) => (
                    <button type="button" key={candidate.id} onClick={() => add({ term: candidate.word, meaningVi: candidate.meaningVi, partOfSpeech: candidate.partOfSpeech })}
                      className="flex min-h-10 w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-muted">
                      <span className="min-w-0"><span className="block truncate text-body-sm font-semibold text-foreground">{candidate.word}</span>
                        <span className="block truncate text-label text-muted-foreground">{candidate.meaningVi} · {candidate.unitName}</span></span>
                      <span className="shrink-0 text-label font-semibold text-primary">Chọn</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input value={draftMeaning} maxLength={255} disabled={disabled} placeholder="Nghĩa tiếng Việt (tùy chọn)"
                  aria-label="Nghĩa của từ mới" onChange={(e) => setDraftMeaning(e.target.value)}
                  className="min-h-10 rounded-lg border border-input bg-background px-3 text-body-sm text-foreground" />
                <select value={draftPart} disabled={disabled} aria-label="Từ loại của từ mới"
                  onChange={(e) => setDraftPart(e.target.value as VocabularyPartOfSpeech | "")}
                  className="min-h-10 rounded-lg border border-input bg-background px-3 text-body-sm text-foreground">
                  <option value="">Từ loại (tùy chọn)</option>
                  {PARTS.map((part) => <option key={part.value} value={part.value}>{part.label}</option>)}
                </select>
              </div>
              {notice && <p role="alert" className="text-label text-destructive">{notice}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setActiveGroup(null)} className="min-h-10 rounded-lg px-3 text-label font-semibold text-muted-foreground hover:bg-muted">Đóng</button>
                <button type="button" disabled={disabled || !search.trim()} onClick={() => add({ term: search, meaningVi: draftMeaning, partOfSpeech: draftPart || null })}
                  className="min-h-10 rounded-lg bg-primary px-3 text-label font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">
                  Thêm từ trực tiếp
                </button>
              </div>
              <p className="text-label text-muted-foreground">Từ được chọn hoặc nhập chỉ bổ sung nội dung cho Flashcard; không tạo VocabularyWord mới.</p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
