"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Volume2,
  X,
} from "lucide-react";
import type { QuestionPreviewData } from "@/types/question-preview";

export function QuestionPreviewModal({
  title,
  questions,
  initialIndex = 0,
  onClose,
}: {
  title: string;
  questions: QuestionPreviewData[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const activeQuestion = questions[currentIndex] ?? questions[0];

  const total = questions.length;
  const imageMedia = activeQuestion?.media.find((m) => m.kind === "image");
  const audioMedia = activeQuestion?.media.find((m) => m.kind === "audio");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-3 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Top Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/80 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-light text-primary">
              <FileText size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">Study & Practice Preview Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary">
              {currentIndex + 1} / {total} Questions
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_260px]">
          {/* Left Column: Question Content Display */}
          <div className="flex flex-col min-h-0 overflow-y-auto p-5 sm:p-6 divide-y divide-border">
            <div className="pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wide text-primary uppercase">
                  Question {currentIndex + 1}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Type: {activeQuestion?.type} · Difficulty: {activeQuestion?.difficulty}
                </span>
              </div>

              {/* Media Display Container (Image + Audio) */}
              {(imageMedia || audioMedia) && (
                <div className="mb-4 space-y-3 rounded-xl border border-border bg-muted/50 p-3.5">
                  {imageMedia && (
                    <div className="flex justify-center">
                      <img
                        src={imageMedia.url || "/student.png"}
                        alt={imageMedia.name}
                        className="max-h-56 rounded-lg object-contain border border-border shadow-sm"
                        onError={(e) => {
                          // Fallback placeholder if blob URL unavailable
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/600x300/e2e8f0/475569?text=Image+Preview";
                        }}
                      />
                    </div>
                  )}

                  {audioMedia && (
                    <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-primary-light/60 p-2.5">
                      <Volume2 size={20} className="text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {audioMedia.name}
                        </p>
                        <audio
                          controls
                          src={audioMedia.url}
                          className="mt-1 h-8 w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Question Prompt */}
              <p className="text-base font-bold text-foreground leading-relaxed">
                {activeQuestion?.text || (
                  <span className="text-muted-foreground italic">No question prompt entered...</span>
                )}
              </p>

              {/* Choices / Answers */}
              <div className="mt-5 space-y-2.5">
                {(activeQuestion?.type === "SINGLE_CHOICE" ||
                  activeQuestion?.type === "MULTIPLE_CHOICE") && (
                  <div className="space-y-2">
                    {activeQuestion.options.map((opt) => {
                      const isCorrect = activeQuestion.correctOptionIds.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                            isCorrect
                              ? "border-primary bg-primary-light/60 font-semibold text-foreground shadow-sm"
                              : "border-border bg-card text-foreground hover:border-primary/40"
                          }`}
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                              isCorrect
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="min-w-0 flex-1">
                            {opt.text || <span className="text-muted-foreground italic">Option text...</span>}
                          </span>
                          {isCorrect && (
                            <CheckCircle2 size={16} className="text-primary shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeQuestion?.type === "TRUE_FALSE" && (
                  <div className="grid grid-cols-2 gap-3">
                    {(["TRUE", "FALSE"] as const).map((val) => {
                      const isCorrect = activeQuestion.trueFalseAnswer === val;
                      return (
                        <div
                          key={val}
                          className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold ${
                            isCorrect
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-card text-slate-600"
                          }`}
                        >
                          {val}
                          {isCorrect && <CheckCircle2 size={16} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {(activeQuestion?.type === "FILL_IN_BLANK" ||
                  activeQuestion?.type === "TYPE_ANSWER") && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Accepted Answers:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeQuestion.acceptedAnswers.map((ans, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-success/30 bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
                        >
                          {ans || "—"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation if available */}
              {activeQuestion?.explanation && (
                <div className="mt-5 rounded-xl border border-warm/40 bg-warm-soft/50 p-4">
                  <p className="text-xs font-bold text-foreground uppercase">Explanation</p>
                  <p className="mt-1 text-xs text-foreground leading-relaxed">
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40"
              >
                <ArrowLeft size={14} /> Previous
              </button>

              <button
                disabled={currentIndex >= total - 1}
                onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-indigo-700 disabled:opacity-40 shadow-sm"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: TOEIC / Study4 Style Question Navigator */}
          <div className="flex flex-col min-h-0 border-l border-border bg-muted/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Questions
            </h3>

            <div className="grid min-h-0 flex-1 grid-cols-4 gap-2 overflow-y-auto content-start">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const isReady = q.complete;

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/50"
                        : isReady
                        ? "border border-success/30 bg-success-soft text-success hover:bg-success-soft"
                        : "border border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {idx + 1}
                    {isReady && !isActive && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-success-soft0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 border-t border-border pt-3 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-primary" /> Current Question
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-100 border border-success/40" /> Answered / Ready
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-card border border-border" /> Incomplete
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
