"use client";

import { useState } from "react";
import Image from "next/image";
import { RotateCcw, Volume2 } from "lucide-react";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import type { VocabularyPartOfSpeech, VocabularyRelatedTerms } from "@/types/vocabulary";

interface VocabularyFlashcardPreviewProps {
  word: string;
  meaningVi: string;
  pronunciationUk: string;
  pronunciationUs: string;
  partOfSpeech: VocabularyPartOfSpeech | "";
  exampleSentence: string;
  exampleMeaningVi: string;
  imageUrl: string;
  relatedTerms: VocabularyRelatedTerms;
}

export function VocabularyFlashcardPreview(props: VocabularyFlashcardPreviewProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="space-y-3" aria-label="Xem trước Flashcard">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-body-sm font-bold text-foreground">Xem trước Flashcard</h3>
          <p className="text-label text-muted-foreground">Dữ liệu đang nhập · chưa lưu</p>
        </div>
        <button type="button" onClick={() => setFlipped((previous) => !previous)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-label font-semibold text-primary hover:bg-muted">
          <RotateCcw className="size-4" /> {flipped ? "Xem mặt trước" : "Lật xem nghĩa"}
        </button>
      </div>
      <div className="min-h-64 rounded-2xl border-2 border-ink bg-card p-5 shadow-pop">
        {!flipped ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            {props.imageUrl && (
              <div className="relative h-32 w-44 overflow-hidden rounded-xl border border-border bg-muted">
                <Image src={props.imageUrl} alt={`Hình minh họa ${props.word || "từ vựng"}`} fill unoptimized className="object-contain" />
              </div>
            )}
            <div>
              <h4 className="text-2xl font-black text-foreground">{props.word.trim() || "Từ tiếng Anh"}</h4>
              {props.partOfSpeech && <p className="text-label font-semibold text-muted-foreground">{props.partOfSpeech.toLowerCase()}</p>}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {(["UK", "US"] as const).map((accent) => (
                <button type="button" key={accent} onClick={() => speakVocabulary(props.word, accent)}
                  disabled={!props.word.trim()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-label text-primary hover:bg-muted disabled:opacity-40">
                  <Volume2 className="size-4" /> {accent}: {accent === "UK" ? (props.pronunciationUk || "—") : (props.pronunciationUs || "—")}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h4 className="text-xl font-black text-foreground">{props.meaningVi.trim() || "Nghĩa tiếng Việt"}</h4>
            {props.exampleSentence && (
              <blockquote className="rounded-lg bg-muted/50 p-3 text-body-sm text-foreground">
                <p className="italic">{props.exampleSentence}</p>
                {props.exampleMeaningVi && <p className="mt-1 text-label text-muted-foreground">{props.exampleMeaningVi}</p>}
              </blockquote>
            )}
            <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {([
                { key: "wordFamilies", label: "Họ từ" },
                { key: "synonyms", label: "Đồng nghĩa" },
                { key: "antonyms", label: "Trái nghĩa" },
              ] as const).map(({ key, label }) => (
                <div key={key} className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-label font-bold text-muted-foreground">{label}</p>
                  {props.relatedTerms[key].length === 0 ? <span className="text-label text-muted-foreground">Chưa có</span> :
                    <ul className="space-y-1">{props.relatedTerms[key].map((item, index) => (
                      <li key={`${key}-${index}`} className="text-label text-foreground">
                        <span className="font-bold">{item.term || "—"}</span>
                        {item.partOfSpeech && <span className="text-muted-foreground"> ({item.partOfSpeech.toLowerCase()})</span>}
                        {item.meaningVi && <span className="block text-muted-foreground">{item.meaningVi}</span>}
                      </li>
                    ))}</ul>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
