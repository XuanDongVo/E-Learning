"use client";

import Link from "next/link";
import { Check, Coins, Flame, Headphones, Image as ImageIcon, RotateCcw, Star, Timer, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const blueBtn =
  "text-practice-light bg-practice-blue shadow-[0_2px_0_var(--color-practice-blue-dark)] hover:text-practice-light hover:bg-practice-blue-dark";
const paperBtn =
  "text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] hover:bg-practice-light hover:text-practice-ink";

type Q = {
  word: string;
  prompt?: string;
  type: string;
  options: readonly string[];
  correct: number;
  media?: { image?: string; audio?: string };
};

export function PracticeResult({
  questions,
  answers,
  mode,
  seconds,
  onRetry,
}: {
  questions: Q[];
  answers: Record<number, number>;
  mode: string;
  seconds: number;
  onRetry: () => void;
}) {
  const results = questions.map((q, i) => ({ q, picked: answers[i], ok: answers[i] === q.correct }));
  const correct = results.filter((r) => r.ok).length;
  const score = Math.round((correct / questions.length) * 100) / 10;
  let streak = 0, best = 0;
  results.forEach((r) => { streak = r.ok ? streak + 1 : 0; best = Math.max(best, streak); });
  const xp = correct * 10 + best * 5 + (mode === "Try Hard" ? 20 : 0);
  const stars = score >= 9 ? 3 : score >= 6 ? 2 : score > 0 ? 1 : 0;
  const stats = [
    { icon: Check, label: "Câu đúng", value: `${correct}/${questions.length}` },
    { icon: Flame, label: "Chuỗi đúng dài nhất", value: `${best}` },
    { icon: Timer, label: "Thời gian", value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` },
    { icon: Coins, label: "XP nhận được", value: `+${xp}` },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-practice-good-soft text-practice-good">
          <Trophy size={28} />
        </span>
        <h1 className="text-2xl font-extrabold">Hoàn thành luyện tập!</h1>
        <p className="mt-1 text-sm">Chế độ {mode} · {questions.length} câu hỏi</p>
        <div className="mt-3 flex justify-center gap-1">
          {[0, 1, 2].map((s) => (
            <Star
              key={s}
              size={30}
              className={s < stars ? "text-practice-yellow" : "text-practice-subtle/40"}
              fill={s < stars ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className="mt-2 text-5xl font-extrabold text-practice-blue">
          {score.toFixed(1)}<span className="text-xl text-practice-subtle">/10</span>
        </p>
        <p className="mt-2 inline-flex rounded-full bg-practice-hint px-3 py-1 text-sm font-extrabold text-practice-blue-dark">
          Tổng thưởng: +{xp} XP
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border-2 border-practice-border bg-practice-light p-3 text-center">
            <s.icon size={18} className="mx-auto text-practice-blue" />
            <p className="mt-1 text-lg font-extrabold">{s.value}</p>
            <p className="text-[11px] text-practice-subtle">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-2 font-extrabold">Chi tiết câu hỏi &amp; đáp án</h2>
        <ol className="space-y-2">
          {results.map(({ q, picked, ok }, i) => (
            <li
              key={i}
              className={`rounded-2xl border-2 bg-practice-light p-3 ${ok ? "border-practice-good/40" : "border-practice-bad/40"}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full ${ok ? "bg-practice-good-soft text-practice-good" : "bg-practice-bad-soft text-practice-bad"}`}
                >
                  {ok ? <Check size={15} /> : <X size={15} />}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-bold">
                    Câu {i + 1}. {q.prompt ?? `Từ "${q.word}" có nghĩa nào?`}{" "}
                    {q.media?.image && <ImageIcon size={13} className="inline" />}{" "}
                    {q.media?.audio && <Headphones size={13} className="inline" />}
                  </p>
                  <p className="mt-1">
                    <span className="text-practice-subtle">Bạn chọn: </span>
                    <span className={ok ? "font-semibold text-practice-good" : "font-semibold text-practice-bad"}>
                      {picked === undefined ? "Bỏ qua" : `${String.fromCharCode(65 + picked)}. ${q.options[picked]}`}
                    </span>
                  </p>
                  {!ok && (
                    <p>
                      <span className="text-practice-subtle">Đáp án đúng: </span>
                      <span className="font-semibold text-practice-good">
                        {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
                      </span>
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-practice-subtle">{ok ? "+10 XP" : "0 XP"}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Button className={blueBtn} onClick={onRetry}>
          <RotateCcw size={16} />
          Luyện tập lại
        </Button>
        <Button asChild variant="outline" className={paperBtn}>
          <Link href="/activities">Về Hoạt động</Link>
        </Button>
      </div>
    </div>
  );
}