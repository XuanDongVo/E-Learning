"use client";

import type { MockOutcome } from "../mock-data";

export type DistItem = {
  key: string;
  label: string;
  count: number;
  correct: boolean;
};

export type BlankDist = {
  blankKey: string;
  blankLabel: string;
  answers: DistItem[];
  blankCount: number;
};

export type QuestionDistribution = {
  kind: "OPTIONS" | "TEXT" | "CLOZE" | "MATCHING" | "UNKNOWN";
  options?: DistItem[];
  textAnswers?: DistItem[];
  blanks?: BlankDist[];
  matchPairs?: BlankDist[];
  unansweredCount: number;
  sampleSize: number;
};

function CountBar({ count, max, correct }: { count: number; max: number; correct?: boolean }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex min-w-[8rem] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${correct ? "bg-emerald-500" : "bg-rose-400"}`}
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className="w-6 tabular-nums text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

function OptionList({
  title,
  items,
  unanswered,
  sampleSize,
}: {
  title: string;
  items: DistItem[];
  unanswered: number;
  sampleSize: number;
}) {
  const max = Math.max(...items.map((i) => i.count), unanswered, 1);
  return (
    <div className="space-y-2 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.key} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 text-sm">
            <span className="font-semibold text-muted-foreground">{item.key}</span>
            <span>
              {item.label}{" "}
              {item.correct ? (
                <span className="text-xs font-medium text-emerald-600">✓ đúng</span>
              ) : null}
            </span>
            <CountBar count={item.count} max={max} correct={item.correct} />
          </li>
        ))}
        <li className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 text-sm text-muted-foreground">
          <span>—</span>
          <span>Bỏ trống</span>
          <CountBar count={unanswered} max={max} />
        </li>
      </ul>
      <p className="text-[11px] text-muted-foreground">n = {sampleSize}</p>
    </div>
  );
}

function TextList({
  items,
  unanswered,
  sampleSize,
}: {
  items: DistItem[];
  unanswered: number;
  sampleSize: number;
}) {
  const max = Math.max(...items.map((i) => i.count), unanswered, 1);
  return (
    <div className="space-y-2 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Câu trả lời học sinh (top)
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có câu trả lời.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.key} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
              <span>
                <span className="font-medium">{item.label}</span>{" "}
                {item.correct ? (
                  <span className="text-xs font-medium text-emerald-600">✓ đúng</span>
                ) : null}
              </span>
              <CountBar count={item.count} max={max} correct={item.correct} />
            </li>
          ))}
          <li className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm text-muted-foreground">
            <span>Bỏ trống</span>
            <CountBar count={unanswered} max={max} />
          </li>
        </ul>
      )}
      <p className="text-[11px] text-muted-foreground">n = {sampleSize}</p>
    </div>
  );
}

function BlankGroups({
  title,
  blanks,
  sampleSize,
}: {
  title: string;
  blanks: BlankDist[];
  sampleSize: number;
}) {
  return (
    <div className="space-y-4 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {blanks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có dữ liệu phân bố.</p>
      ) : (
        blanks.map((b) => {
          const max = Math.max(...b.answers.map((a) => a.count), b.blankCount, 1);
          return (
            <div key={b.blankKey} className="rounded-lg border border-border/60 p-3">
              <p className="mb-2 text-sm font-medium">{b.blankLabel}</p>
              <ul className="space-y-1.5">
                {b.answers.map((a) => (
                  <li key={a.key} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                    <span>
                      {a.label}{" "}
                      {a.correct ? (
                        <span className="text-xs font-medium text-emerald-600">✓ đúng</span>
                      ) : null}
                    </span>
                    <CountBar count={a.count} max={max} correct={a.correct} />
                  </li>
                ))}
                <li className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm text-muted-foreground">
                  <span>Bỏ trống</span>
                  <CountBar count={b.blankCount} max={max} />
                </li>
              </ul>
            </div>
          );
        })
      )}
      <p className="text-[11px] text-muted-foreground">n = {sampleSize}</p>
    </div>
  );
}

/** Renders expand body according to question type / distribution kind. */
export function QuestionDistributionPanel({
  questionType,
  distribution,
}: {
  questionType: string;
  distribution: QuestionDistribution | null | undefined;
}) {
  if (!distribution) {
    return (
      <div className="px-3 py-3 text-sm text-muted-foreground">
        Chưa có phân bố đáp án cho câu này.
      </div>
    );
  }

  const kind = distribution.kind || inferKind(questionType);

  switch (kind) {
    case "OPTIONS":
      return (
        <OptionList
          title={
            questionType === "MULTIPLE_CHOICE"
              ? "Số em chọn từng phương án (có thể chọn nhiều)"
              : "Số em chọn từng phương án"
          }
          items={distribution.options ?? []}
          unanswered={distribution.unansweredCount}
          sampleSize={distribution.sampleSize}
        />
      );
    case "TEXT":
      return (
        <TextList
          items={distribution.textAnswers ?? []}
          unanswered={distribution.unansweredCount}
          sampleSize={distribution.sampleSize}
        />
      );
    case "CLOZE":
      return (
        <BlankGroups
          title="Từng chỗ trống"
          blanks={distribution.blanks ?? []}
          sampleSize={distribution.sampleSize}
        />
      );
    case "MATCHING":
      return (
        <BlankGroups
          title="Từng cặp nối"
          blanks={distribution.matchPairs ?? []}
          sampleSize={distribution.sampleSize}
        />
      );
    default:
      return (
        <div className="px-3 py-3 text-sm text-muted-foreground">
          Loại câu {questionType} chưa hỗ trợ xem phân bố chi tiết.
        </div>
      );
  }
}

function inferKind(questionType: string): QuestionDistribution["kind"] {
  switch (questionType) {
    case "SINGLE_CHOICE":
    case "TRUE_FALSE":
    case "MULTIPLE_CHOICE":
      return "OPTIONS";
    case "TYPE_ANSWER":
    case "FILL_IN_BLANK":
      return "TEXT";
    case "CLOZE":
      return "CLOZE";
    case "MATCHING":
      return "MATCHING";
    default:
      return "UNKNOWN";
  }
}

export function outcomeFromCounts(q: {
  correctCount: number;
  partialCount: number;
  incorrectCount: number;
  unansweredCount: number;
  attemptCount: number;
}): MockOutcome {
  const n = Math.max(q.attemptCount, 1);
  return {
    correct: Math.round((100 * q.correctCount) / n),
    partial: Math.round((100 * q.partialCount) / n),
    incorrect: Math.round((100 * q.incorrectCount) / n),
    blank: Math.round((100 * q.unansweredCount) / n),
  };
}
