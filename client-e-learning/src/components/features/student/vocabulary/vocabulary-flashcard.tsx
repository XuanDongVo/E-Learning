"use client";

import { useEffect, useState } from "react";
import {
  Volume2,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

interface VocabularyFlashcardProps {
  card: StudentVocabularyStudyCard;
  revealed: boolean;
  onReveal: () => void;
  /** Thống kê số lượng để hiển thị dưới chân thẻ (tùy chọn) */
  stats?: {
    newCount?: number;
    learnedCount?: number;
    reviewCount?: number;
  };
  /** Callback khi người dùng chuyển mode học phụ */
  onSelectMode?: (mode: string) => void;
}

/** Chuyển enum PartOfSpeech sang dạng viết tắt có ngoặc: (v), (n), (adj)... */
function formatPartOfSpeech(pos?: string | null): string {
  if (!pos) return "";
  const map: Record<string, string> = {
    VERB: "v",
    NOUN: "n",
    ADJECTIVE: "adj",
    ADVERB: "adv",
    PREPOSITION: "prep",
    CONJUNCTION: "conj",
    PHRASE: "phr",
    PHRASAL_VERB: "phr v",
    IDIOM: "idiom",
  };
  const normalized = pos.toUpperCase();
  return map[normalized] ? `(${map[normalized]})` : `(${pos.toLowerCase()})`;
}

const STUDY_MODES = [
  { id: "word", label: "Từ" },
  { id: "quiz", label: "Trắc nghiệm" },
  { id: "typing", label: "Gõ từ" },
  { id: "pronounce", label: "Phát âm" },
  { id: "collocation_1", label: "Cụm" },
  { id: "collocation_2", label: "Cụm" },
  { id: "sentence", label: "Câu" },
  { id: "make_sentence", label: "Đặt câu" },
];

export function VocabularyFlashcard({
  card,
  revealed,
  onReveal,
  stats = { newCount: 37, learnedCount: 0, reviewCount: 0 },
  onSelectMode,
}: VocabularyFlashcardProps) {
  const [activeMode, setActiveMode] = useState("word");
  const [imageFailed, setImageFailed] = useState(false);
  const [isEnglishFirst, setIsEnglishFirst] = useState(true);
  const [activeAudio, setActiveAudio] = useState<"UK" | "US" | null>(null);

  const hasImage = Boolean(card.imageUrl && !imageFailed);
  const posFormatted = formatPartOfSpeech(card.partOfSpeech);

  const groups = [
    { label: "Họ từ", items: card.relatedTerms?.wordFamilies ?? [] },
    { label: "Đồng nghĩa", items: card.relatedTerms?.synonyms ?? [] },
    { label: "Trái nghĩa", items: card.relatedTerms?.antonyms ?? [] },
  ];

  // Lắng nghe phím Space để lật thẻ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chỉ kích hoạt khi không gõ vào ô input/textarea
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        onReveal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onReveal]);

  const handleSpeak = (type: "UK" | "US") => {
    setActiveAudio(type);
    speakVocabulary(card.word, type);
    setTimeout(() => setActiveAudio(null), 1200);
  };

  // Phiên âm mặc định nếu thiếu
  const ukPhonetic = card.pronunciationUk || card.pronunciationUs || "";
  const usPhonetic = card.pronunciationUs || card.pronunciationUk || "";

  return (
    <div className="mx-auto w-full max-w-2xl select-none space-y-4">
      {/* ================= KHỐI THẺ CHÍNH (ẢNH 8) ================= */}
      <article
        onClick={onReveal}
        className="relative flex min-h-[380px] cursor-pointer flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md sm:min-h-[420px] sm:p-8"
        role="region"
        aria-label="Thẻ ghi nhớ từ vựng"
      >
        {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG (TOP BAR) */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"
          onClick={(e) => e.stopPropagation()} // Không kích hoạt lật thẻ khi bấm thanh công cụ
        >
          {/* Nhóm các chế độ học (Pills) */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs font-medium">
            {STUDY_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setActiveMode(mode.id);
                  onSelectMode?.(mode.id);
                }}
                className={`rounded-full px-3 py-1 transition-all ${
                  activeMode === mode.id
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Các công cụ góc phải */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setIsEnglishFirst((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Đổi chiều ngôn ngữ thẻ"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-slate-500" />
              <span>{isEnglishFirst ? "Anh – Việt" : "Việt – Anh"}</span>
            </button>

            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600"
              title="Đánh dấu đã thuộc"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500"
              title="Báo cáo lỗi từ này"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. NỘI DUNG TRUNG TÂM */}
        <div className="my-auto py-8 text-center">
          {!revealed ? (
            /* ================= MẶT TRƯỚC ================= */
            <div className="flex flex-col items-center justify-center space-y-5">
              {/* Từ vựng + Loại từ */}
              <div className="flex items-baseline justify-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  {card.word}
                </h2>
                {posFormatted && (
                  <span className="text-lg font-normal text-slate-400 sm:text-xl">
                    {posFormatted}
                  </span>
                )}
              </div>

              {/* Hai dòng phát âm (UK loa xanh, US loa đỏ) */}
              <div
                className="space-y-2 pt-2 text-sm text-slate-600 font-mono"
                onClick={(e) => e.stopPropagation()}
              >
                {/* UK: Loa xanh dương */}
                <button
                  type="button"
                  onClick={() => handleSpeak("UK")}
                  className="group flex items-center justify-center gap-2 rounded-lg px-3 py-1 transition-colors hover:bg-slate-100"
                  title="Nghe phát âm UK"
                >
                  <Volume2
                    className={`h-4 w-4 text-blue-500 transition-transform group-hover:scale-110 ${
                      activeAudio === "UK" ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="text-slate-700">/{ukPhonetic}/</span>
                </button>

                {/* US: Loa đỏ */}
                <button
                  type="button"
                  onClick={() => handleSpeak("US")}
                  className="group flex items-center justify-center gap-2 rounded-lg px-3 py-1 transition-colors hover:bg-slate-100"
                  title="Nghe phát âm US"
                >
                  <Volume2
                    className={`h-4 w-4 text-rose-500 transition-transform group-hover:scale-110 ${
                      activeAudio === "US" ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="text-slate-700">/{usPhonetic}/</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= MẶT SAU (KHI ĐÃ LẬT) ================= */
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.word} {posFormatted}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {card.meaningVi}
                  </h3>
                </div>

                {hasImage && (
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={card.imageUrl!}
                      alt={`Minh họa ${card.word}`}
                      onError={() => setImageFailed(true)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Câu ví dụ song ngữ */}
              {card.exampleSentence && (
                <div className="rounded-xl bg-slate-50/80 p-3.5 space-y-1 text-sm border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ví dụ
                  </p>
                  <p className="text-slate-800 italic leading-relaxed">
                    {card.exampleSentence}
                  </p>
                  {card.exampleMeaningVi && (
                    <p className="text-xs text-slate-500">{card.exampleMeaningVi}</p>
                  )}
                </div>
              )}

              {/* Nhóm từ liên quan: Họ từ / Đồng nghĩa / Trái nghĩa */}
              {groups
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <div key={group.label} className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-400">{group.label}:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item, idx) => (
                        <span
                          key={`${group.label}-${item.term}-${idx}`}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700"
                        >
                          <strong>{item.term}</strong>
                          {item.meaningVi ? ` (${item.meaningVi})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 3. DÒNG NHẮC NHỞ DƯỚI ĐÁY THẺ */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400 transition-colors hover:text-slate-600 sm:text-sm">
            {revealed ? "Nhấn vào thẻ để quay lại mặt trước" : "Nhấn để xem nghĩa"}
          </p>
        </div>
      </article>

      {/* ================= KHỐI PHÍM TẮT & THỐNG KÊ (DƯỚI THẺ) ================= */}
      <div className="flex flex-col items-center justify-center gap-2 pt-1 text-center text-xs font-medium text-slate-500">
        <span className="text-slate-400">Space: lật thẻ</span>

        <div className="flex items-center gap-4 pt-1 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <strong className="text-blue-600 font-bold">{stats.newCount ?? 0}</strong> Từ mới
          </span>
          <span className="flex items-center gap-1.5">
            <strong className="text-blue-600 font-bold">{stats.learnedCount ?? 0}</strong> Đã học
          </span>
          <span className="flex items-center gap-1.5">
            <strong className="text-amber-500 font-bold">{stats.reviewCount ?? 0}</strong> Ôn tập
          </span>
        </div>
      </div>
    </div>
  );
}
