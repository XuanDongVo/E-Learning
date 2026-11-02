import { Check, CheckCircle2, CircleDashed, MinusCircle, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type {
  AttemptResultAnswerKey,
  AttemptResultQuestionResponse,
  AttemptResultQuestionStatus,
  JsonRecord,
} from "@/types/student/assignment-attempt";
import { cn } from "@/lib/utils";

export type ReviewStatus = "CORRECT" | "PARTIAL" | "INCORRECT" | "UNANSWERED";
export type FilterType = "all" | ReviewStatus;

export const STATUS_CONFIG: Record<
  ReviewStatus,
  {
    icon: typeof Check;
    text: string;
    soft: string;
    bar: string;
    cell: string;
  }
> = {
  CORRECT: {
    icon: CheckCircle2,
    text: "text-success",
    soft: "border-success/30 bg-success/10",
    bar: "border-l-success",
    cell: "border-success bg-success text-success-foreground",
  },
  PARTIAL: {
    icon: MinusCircle,
    text: "text-warning-foreground",
    soft: "border-warning/40 bg-warning/10",
    bar: "border-l-warning",
    cell: "border-warning bg-warning/70 text-foreground",
  },
  INCORRECT: {
    icon: XCircle,
    text: "text-destructive",
    soft: "border-destructive/30 bg-destructive/10",
    bar: "border-l-destructive",
    cell: "border-destructive bg-destructive text-destructive-foreground",
  },
  UNANSWERED: {
    icon: CircleDashed,
    text: "text-muted-foreground",
    soft: "border-border bg-muted",
    bar: "border-l-muted-foreground/40",
    cell: "border-dashed border-muted-foreground/60 bg-card text-muted-foreground p-0",
  },
};

export function mapStatus(status: AttemptResultQuestionStatus): ReviewStatus {
  if (status === "PARTIALLY_CORRECT") return "PARTIAL";
  return status;
}

export function questionSnapshot(question: AttemptResultQuestionResponse): JsonRecord {
  return question.questionSnapshot ?? {};
}

export function snapshotText(snapshot: JsonRecord, key: string): string | null {
  return typeof snapshot[key] === "string" ? snapshot[key] : null;
}

export function snapshotChoices(snapshot: JsonRecord): Array<{ key: string; text: string }> {
  const choices = snapshot.choices;
  if (!Array.isArray(choices)) return [];
  return choices.flatMap((choice) => {
    if (!choice || typeof choice !== "object") return [];
    const row = choice as Record<string, unknown>;
    return typeof row.key === "string" && typeof row.text === "string"
      ? [{ key: row.key, text: row.text }]
      : [];
  });
}

export function formatAnswerPayload(payload: JsonRecord | null): string[] {
  if (!payload) return [];
  if (typeof payload.selectedKey === "string" && payload.selectedKey) return [payload.selectedKey];
  if (Array.isArray(payload.selectedKeys)) return payload.selectedKeys.map(String);
  if (payload.value !== undefined && payload.value !== null && String(payload.value).trim()) {
    return [String(payload.value)];
  }
  if (payload.values && typeof payload.values === "object") {
    return Object.entries(payload.values as Record<string, unknown>).map(
      ([key, value]) => `(${key}) ${value == null ? "—" : String(value)}`,
    );
  }
  return [];
}

export function formatAnswerKey(answerKey: AttemptResultAnswerKey | null): string[] {
  if (!answerKey) return [];
  if (Array.isArray(answerKey.answers)) {
    return answerKey.answers
      .map((answer) => String(answer.rawValue ?? answer.normalizedValue ?? ""))
      .filter(Boolean);
  }
  if (Array.isArray(answerKey.options)) {
    return answerKey.options
      .filter((option) => option.correct)
      .map((option) => option.key ?? "")
      .filter(Boolean);
  }
  return [];
}

export function formatWhen(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

export function formatDuration(start: string | null | undefined, end: string | null | undefined): string {
  if (!start || !end) return "—";
  const diffSeconds = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000));
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function points(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/\.?0+$/, "");
}

export function percentDisplay(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0;
  const number = Number(value);
  return number <= 1 ? Math.round(number * 100) : Math.round(number);
}

export function formatRichMarkup(text: string): ReactNode {
  return text.split(/(\[\[.+?\]\]|\{\{.+?\}\})/g).map((part, index) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      return <u key={index} className="underline decoration-2 underline-offset-4">{part.slice(2, -2)}</u>;
    }
    if (part.startsWith("{{") && part.endsWith("}}")) {
      return (
        <span key={index} className="mx-1 inline-flex min-w-8 items-center justify-center rounded border border-dashed border-primary/50 bg-primary/5 px-1.5 py-0.5 text-xs font-semibold text-primary">
          ({part.slice(2, -2)})
        </span>
      );
    }
    return part;
  });
}

export function ScoreRing({ percent, label }: { percent: number; label: string }) {
  const bounded = Math.max(0, Math.min(100, percent));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const tone = bounded >= 80 ? "text-success" : bounded >= 50 ? "text-primary" : "text-warning";

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          className={cn(tone, "transition-all duration-700 ease-out")}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - bounded / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-bold tabular-nums">{percent}%</div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ status, label }: { status: ReviewStatus; label: string }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", config.soft, config.text)}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}
