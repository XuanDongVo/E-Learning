"use client";

import Link from "next/link";
import { Check, Lightbulb, RotateCcw, Target, Timer, Trophy, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivitySession } from "@/types/activity-session";
import { formatAnswer, splitKeys } from "@/utils/practice-utils";

const blueBtn =
  "text-practice-light bg-practice-blue shadow-[0_2px_0_var(--color-practice-blue-dark)] hover:text-practice-light hover:bg-practice-blue-dark";
const paperBtn =
  "text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] hover:bg-practice-light hover:text-practice-ink";

export type RevealedAnswer = { correctAnswer?: string; explanation?: string };

export function PracticeResult({
  unitId,
  session,
  picks,
  revealed,
  onRetry,
}: {
  unitId: number;
  session: ActivitySession;
  picks: Record<number, string[]>;
  revealed: Record<number, RevealedAnswer>;
  onRetry: () => void;
}) {
  const provisional = session.score == null;
  const score = Math.round(
    provisional ? (session.finalCorrectCount / Math.max(1, session.totalQuestions)) * 100 : Number(session.score),
  );
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : score > 0 ? 1 : 0;
  const seconds =
    session.completedAt && session.startedAt
      ? Math.max(0, Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000))
      : undefined;
  const title =
    session.status === "GAME_OVER"
      ? "Hết mạng rồi!"
      : session.status === "ABANDONED"
        ? "Bạn đã nộp bài khi chưa làm hết"
        : "Hoàn thành luyện tập!";

  const stats = [
    { icon: Check, label: "Câu đúng (cuối cùng)", value: `${session.finalCorrectCount}/${session.totalQuestions}` },
    { icon: Target, label: "Đúng ngay lần đầu", value: `${session.firstCorrectCount}` },
    { icon: Lightbulb, label: "Gợi ý đã dùng", value: `${session.hintUsedCount}` },
    ...(seconds === undefined
      ? []
      : [{ icon: Timer, label: "Thời gian", value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` }]),
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-practice-good-soft text-practice-good">
          <Trophy size={28} />
        </span>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm">
          Chế độ {session.mode === "LEARNING" ? "Luyện tập" : "Thử thách"} · {session.totalQuestions} câu hỏi
        </p>
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
          {score}
          <span className="text-xl text-practice-subtle">%</span>
        </p>
        {provisional && (
          <p className="mt-1 text-xs font-semibold text-practice-subtle">
            Điểm tạm tính · lượt chưa hoàn thành không được lưu vào thống kê
          </p>
        )}
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
          {session.questions.map((q, i) => {
            const ok = q.finalCorrect === true;
            const picked = picks[q.id];
            const reveal = revealed[q.id];
            const correctText = reveal?.correctAnswer
              ? formatAnswer(q, q.type === "TRUE_FALSE" || q.options.length > 0 ? splitKeys(reveal.correctAnswer) : [reveal.correctAnswer])
              : "";
            return (
              <li
                key={q.id}
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
                      Câu {i + 1}. {q.content}
                    </p>
                    <p className="mt-1">
                      <span className="text-practice-subtle">Bạn chọn: </span>
                      <span className={ok ? "font-semibold text-practice-good" : "font-semibold text-practice-bad"}>
                        {picked?.length ? formatAnswer(q, picked) : "Bỏ qua"}
                      </span>
                    </p>
                    {!ok && correctText && (
                      <p>
                        <span className="text-practice-subtle">Đáp án đúng: </span>
                        <span className="font-semibold text-practice-good">{correctText}</span>
                      </p>
                    )}
                    {!ok && reveal?.explanation && <p className="mt-1 text-practice-subtle">{reveal.explanation}</p>}
                  </div>
                  <span className="text-xs font-bold text-practice-subtle">
                    {q.hintUsed ? "Có dùng gợi ý" : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Button className={blueBtn} onClick={onRetry}>
          <RotateCcw size={16} />
          Luyện tập lại
        </Button>
        <Button asChild variant="outline" className={paperBtn}>
          <Link href={`/student/units/${unitId}`}>Về Unit</Link>
        </Button>
      </div>
    </div>
  );
}