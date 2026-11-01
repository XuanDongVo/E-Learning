"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
  Info,
  Lock,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

// ==========================================
// 1. TYPES & DATA CONTRACTS
// ==========================================

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TEXT_INPUT"
  | "MULTI_TEXT_INPUT"
  | "MATCHING";

export type PartStatus = "CORRECT" | "PARTIAL" | "INCORRECT" | "UNANSWERED";

export type ProgressState =
  | "submitted"
  | "late"
  | "timed_out"
  | "in_progress"
  | "not_started"
  | "overdue";

export interface QuestionOption {
  id: string;
  letter: string;
  text: string;
  isCorrect: boolean;
}

export interface PoolEntry {
  id: string;
  letter: string;
  text: string;
}

export interface QuestionSnapshot {
  questionId: string;
  number: number;
  type: QuestionType;
  prompt: string;
  sectionId: string;
  sectionTitle: string;
  groupLabel?: string | null;
  blankRef?: string | null;
  points: number;
  isExample?: boolean;
  options?: QuestionOption[];
  poolEntries?: PoolEntry[];
  correctEntryId?: string;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  parts: { key: string; label: string; max: number }[];
}

export interface PartResult {
  key: string;
  status: PartStatus;
  earned: number;
  max: number;
  normalized: string | null;
}

export interface ResponseRecord {
  questionId: string;
  raw: any;
  parts: PartResult[];
}

export interface Attempt {
  attemptId: string;
  studentId: string;
  studentName: string;
  classIdAtStart: string;
  startedAt: string;
  submittedAt: string | null;
  scoreEarned: number;
  scoreMax: number;
  percent: number | null;
  late: boolean;
  timedOut: boolean;
  responses: ResponseRecord[];
  questions: QuestionSnapshot[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface ResultsDataset {
  assignmentId: string;
  assignmentTitle: string;
  asOf: string;
  dueAt: string;
  timeLimitMin: number;
  assignedClassIds: string[];
  students: Student[];
  attempts: Attempt[];
  isSample?: boolean;
}

// ==========================================
// 2. METRICS & ENGINE (100% AUTO-GRADED)
// ==========================================

export const RULES = {
  hardBelow: 0.4,
  easyAbove: 0.9,
  smallSampleBelow: 5,
  discriminationMinN: 30,
} as const;

export const PROGRESS_LABEL: Record<ProgressState, string> = {
  submitted: "Đã nộp",
  late: "Nộp trễ",
  timed_out: "Hết giờ",
  in_progress: "Đang làm",
  not_started: "Chưa làm",
  overdue: "Quá hạn",
};

export const PROGRESS_ORDER: ProgressState[] = [
  "submitted",
  "late",
  "timed_out",
  "in_progress",
  "not_started",
  "overdue",
];

export const STATUS_TEXT: Record<PartStatus, string> = {
  CORRECT: "Đúng",
  PARTIAL: "Một phần",
  INCORRECT: "Sai",
  UNANSWERED: "Bỏ trống",
};

export const STATUS_BG: Record<PartStatus, string> = {
  CORRECT: "bg-emerald-500",
  PARTIAL: "bg-amber-400",
  INCORRECT: "bg-rose-500",
  UNANSWERED: "bg-gray-300 dark:bg-gray-700",
};

export const STATE_COLOR: Record<ProgressState, string> = {
  submitted: "bg-emerald-500",
  late: "bg-amber-500",
  timed_out: "bg-amber-500",
  in_progress: "bg-indigo-500",
  not_started: "bg-gray-400",
  overdue: "bg-rose-500",
};

export const TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Trắc nghiệm 1 đáp án",
  MULTIPLE_CHOICE: "Nhiều đáp án",
  TEXT_INPUT: "Điền từ / Viết câu",
  MULTI_TEXT_INPUT: "Điền nhiều chỗ trống",
  MATCHING: "Nối đáp án",
};

const pct = (x: number | null | undefined, digits = 0) =>
  x == null ? "—" : `${(x * 100).toFixed(digits)}%`;
const score = (x: number | null | undefined) =>
  x == null ? "—" : `${Math.round(x)}%`;
const num = (x: number | null | undefined, d = 1) =>
  x == null ? "—" : String(Math.round(x * 10 ** d) / 10 ** d);

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")} ${d.getDate().toString().padStart(2, "0")}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  } catch {
    return iso;
  }
};

const isSubmitted = (a: Attempt) => !!a.submittedAt;
const durationMin = (a: Attempt) =>
  a.submittedAt
    ? (new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) /
      60000
    : null;

function questionStatus(parts: PartResult[]): PartStatus {
  if (!parts.length || parts.every((p) => p.status === "UNANSWERED"))
    return "UNANSWERED";
  if (parts.every((p) => p.status === "CORRECT")) return "CORRECT";
  if (
    parts.some(
      (p) => p.earned > 0 || p.status === "CORRECT" || p.status === "PARTIAL"
    )
  )
    return "PARTIAL";
  return "INCORRECT";
}

// ==========================================
// 3. UI COMPONENTS
// ==========================================

function RichText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  // Parse [[underlined]] and {{blank}}
  const parts = text.split(/(\[\[.*?\]\]|\{\{.*?\}\})/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("[[") && p.endsWith("]]")) {
          return (
            <span key={i} className="underline underline-offset-4 decoration-2">
              {p.slice(2, -2)}
            </span>
          );
        }
        if (p.startsWith("{{") && p.endsWith("}}")) {
          const inner = p.slice(2, -2);
          return (
            <span
              key={i}
              className="mx-1 inline-flex items-center rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-700"
            >
              ({inner})___
            </span>
          );
        }
        return p;
      })}
    </span>
  );
}

function RateBar({
  correct,
  partial,
  incorrect,
  unanswered,
  n,
  className,
}: {
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  n: number;
  className?: string;
}) {
  if (n === 0)
    return (
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800" />
    );
  const w = (c: number) => `${(c / n) * 100}%`;
  return (
    <div
      className={`flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 ${className || ""}`}
    >
      {correct > 0 && (
        <div
          style={{ width: w(correct) }}
          className={STATUS_BG.CORRECT}
          title={`Đúng: ${correct}/${n}`}
        />
      )}
      {partial > 0 && (
        <div
          style={{ width: w(partial) }}
          className={STATUS_BG.PARTIAL}
          title={`Một phần: ${partial}/${n}`}
        />
      )}
      {incorrect > 0 && (
        <div
          style={{ width: w(incorrect) }}
          className={STATUS_BG.INCORRECT}
          title={`Sai: ${incorrect}/${n}`}
        />
      )}
      {unanswered > 0 && (
        <div
          style={{ width: w(unanswered) }}
          className={STATUS_BG.UNANSWERED}
          title={`Bỏ trống: ${unanswered}/${n}`}
        />
      )}
    </div>
  );
}

function StatusChip({ status }: { status: PartStatus }) {
  const styles: Record<PartStatus, string> = {
    CORRECT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
    INCORRECT: "bg-rose-50 text-rose-700 border-rose-200",
    UNANSWERED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {STATUS_TEXT[status]}
    </span>
  );
}

// ==========================================
// 4. MAIN RESULTS PAGE COMPONENT
// ==========================================

export default function TeacherAssignmentResultsView() {
  const ds = useMemo(() => SAMPLE_DATASET, []);
  const [tab, setTab] = useState<
    "overview" | "questions" | "sections" | "students" | "classes"
  >("overview");
  const [openQId, setOpenQId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [filterStudentState, setFilterStudentState] = useState<
    ProgressState | "all"
  >("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [showDefs, setShowDefs] = useState(false);

  // Computed data
  const roster = useMemo(() => {
    return ds.students.map((s) => {
      const att = ds.attempts.find((a) => a.studentId === s.id);
      let state: ProgressState = "not_started";
      if (att) {
        if (!att.submittedAt) state = "in_progress";
        else if (att.timedOut) state = "timed_out";
        else if (att.late) state = "late";
        else state = "submitted";
      } else {
        const now = new Date(ds.asOf).getTime();
        const due = new Date(ds.dueAt).getTime();
        state = now > due ? "overdue" : "not_started";
      }
      return {
        student: s,
        attempt: att,
        statsClassId: att ? att.classIdAtStart : s.classId,
        state,
        percent: att && att.submittedAt ? att.percent : null,
        earned: att && att.submittedAt ? att.scoreEarned : null,
        max: att?.scoreMax ?? null,
        minutes: att && att.submittedAt ? durationMin(att) : null,
        blanks:
          att && att.submittedAt
            ? att.questions.filter((q) => {
                const r = att.responses.find((x) => x.questionId === q.questionId);
                return questionStatus(r?.parts ?? []) === "UNANSWERED";
              }).length
            : null,
      };
    });
  }, [ds]);

  const submitted = useMemo(
    () => roster.filter((r) => r.attempt && isSubmitted(r.attempt)),
    [roster]
  );
  const doneAttempts = useMemo(
    () => submitted.map((r) => r.attempt!),
    [submitted]
  );

  const pcts = useMemo(
    () => doneAttempts.map((a) => a.percent ?? 0),
    [doneAttempts]
  );
  const meanScore = useMemo(
    () => (pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null),
    [pcts]
  );
  const medianScore = useMemo(() => {
    if (!pcts.length) return null;
    const sorted = [...pcts].sort((a, b) => a - b);
    const m = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
  }, [pcts]);

  // Question stats (100% AUTO)
  const questionStats = useMemo(() => {
    if (!doneAttempts.length) return [];
    const questions = doneAttempts[0].questions.filter((q) => !q.isExample);
    return questions.map((q) => {
      const statuses = doneAttempts.map((a) => {
        const resp = a.responses.find((r) => r.questionId === q.questionId);
        return questionStatus(resp?.parts ?? []);
      });
      const c = (st: PartStatus) => statuses.filter((x) => x === st).length;
      const n = doneAttempts.length;
      const correct = c("CORRECT");
      const partial = c("PARTIAL");
      const incorrect = c("INCORRECT");
      const unanswered = c("UNANSWERED");
      const correctRate = n ? correct / n : 0;
      const unansweredRate = n ? unanswered / n : 0;
      const difficulty =
        correctRate < RULES.hardBelow
          ? "hard"
          : correctRate > RULES.easyAbove
          ? "easy"
          : "normal";
      return {
        q,
        n,
        correct,
        partial,
        incorrect,
        unanswered,
        correctRate,
        unansweredRate,
        difficulty,
      };
    });
  }, [doneAttempts]);

  // Section stats
  const sectionStats = useMemo(() => {
    if (!doneAttempts.length) return [];
    const questions = doneAttempts[0].questions.filter((q) => !q.isExample);
    const secIds = Array.from(new Set(questions.map((q) => q.sectionId)));
    return secIds.map((sid) => {
      const inSec = questions.filter((q) => q.sectionId === sid);
      const statuses = doneAttempts.flatMap((a) =>
        inSec.map((q) => {
          const resp = a.responses.find((r) => r.questionId === q.questionId);
          return questionStatus(resp?.parts ?? []);
        })
      );
      const totalPoints =
        inSec.reduce((s, q) => s + q.points, 0) * doneAttempts.length;
      const earned = doneAttempts.reduce(
        (s, a) =>
          s +
          inSec.reduce((x, q) => {
            const resp = a.responses.find((r) => r.questionId === q.questionId);
            return (
              x + (resp?.parts.reduce((y, p) => y + p.earned, 0) ?? 0)
            );
          }, 0),
        0
      );
      const correct = statuses.filter((st) => st === "CORRECT").length;
      const partial = statuses.filter((st) => st === "PARTIAL").length;
      const incorrect = statuses.filter((st) => st === "INCORRECT").length;
      const unanswered = statuses.filter((st) => st === "UNANSWERED").length;
      return {
        sectionId: sid,
        title: inSec[0].sectionTitle,
        questionsCount: inSec.length,
        n: doneAttempts.length,
        correct,
        partial,
        incorrect,
        unanswered,
        correctRate: statuses.length ? correct / statuses.length : 0,
        unansweredRate: statuses.length ? unanswered / statuses.length : 0,
        pointsRate: totalPoints ? earned / totalPoints : 0,
      };
    });
  }, [doneAttempts]);

  const stateCounts = useMemo(() => {
    const counts: Record<ProgressState, number> = {
      submitted: 0,
      late: 0,
      timed_out: 0,
      in_progress: 0,
      not_started: 0,
      overdue: 0,
    };
    roster.forEach((r) => counts[r.state]++);
    return counts;
  }, [roster]);

  const bins = useMemo(() => {
    const list = Array.from({ length: 10 }, (_, i) => ({
      from: i * 10,
      to: i * 10 + 10,
      count: 0,
    }));
    pcts.forEach((p) => {
      const idx = Math.min(9, Math.floor(p / 10));
      list[idx].count++;
    });
    return list;
  }, [pcts]);

  const maxBin = Math.max(1, ...bins.map((b) => b.count));
  const hardQuestions = questionStats.filter((s) => s.difficulty === "hard");
  const easyQuestions = questionStats.filter((s) => s.difficulty === "easy");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Quay lại danh sách bài")}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Về trình soạn
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h1 className="font-semibold text-base sm:text-lg">
              Kết quả · {ds.assignmentTitle}
            </h1>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Dữ liệu mẫu
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Hạn nộp: {fmtDate(ds.dueAt)}</span>
          <button
            onClick={() => setShowDefs(true)}
            className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <Info className="h-3.5 w-3.5" /> Cách tính chỉ số
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { key: "overview", label: "Tổng quan", hint: "Cả lớp làm thế nào?" },
            {
              key: "questions",
              label: "Theo câu hỏi",
              hint: "Câu nào sai nhiều?",
            },
            { key: "sections", label: "Theo phần", hint: "Yếu dạng bài nào?" },
            { key: "students", label: "Học sinh", hint: "Em nào cần chú ý?" },
            { key: "classes", label: "Theo lớp", hint: "So sánh các lớp" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`-mb-px border-b-2 px-4 pb-3 pt-2 text-left transition-colors ${
                tab === t.key
                  ? "border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <div className="text-sm">{t.label}</div>
              <div className="text-[11px] text-gray-400 font-normal">
                {t.hint}
              </div>
            </button>
          ))}
        </div>

        {/* TAB CONTENT: 1. OVERVIEW */}
        {tab === "overview" && (
          <div className="mt-6 space-y-6">
            {/* 4 KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tỉ lệ nộp bài
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight">
                  {pct(roster.length ? submitted.length / roster.length : 0)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {submitted.length}/{roster.length} học sinh được giao
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Điểm trung bình
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight">
                  {score(meanScore)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Trung vị {score(medianScore)} · tính trên {submitted.length}{" "}
                  bài nộp
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Thấp nhất – Cao nhất
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight">
                  {pcts.length
                    ? `${score(Math.min(...pcts))} – ${score(
                        Math.max(...pcts)
                      )}`
                    : "—"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Bao gồm cả bài nộp trễ & hết giờ
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Thời gian làm bài TB
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight">
                  28 phút
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                    <span
                      className="block h-full bg-indigo-600"
                      style={{ width: "70%" }}
                    />
                  </span>
                  giới hạn {ds.timeLimitMin} phút
                </div>
              </div>
            </div>

            {/* Tiến độ */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Tiến độ làm bài</h3>
                <button
                  onClick={() => setTab("students")}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Xem danh sách chi tiết →
                </button>
              </div>
              <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                {PROGRESS_ORDER.map(
                  (s) =>
                    stateCounts[s] > 0 && (
                      <div
                        key={s}
                        style={{
                          width: `${(stateCounts[s] / roster.length) * 100}%`,
                        }}
                        className={STATE_COLOR[s]}
                        title={`${PROGRESS_LABEL[s]}: ${stateCounts[s]}`}
                      />
                    )
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {PROGRESS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilterStudentState(s);
                      setTab("students");
                    }}
                    className="flex flex-col rounded-lg border border-gray-200 p-2.5 text-left transition hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span
                        className={`h-2 w-2 rounded-full ${STATE_COLOR[s]}`}
                      />
                      {PROGRESS_LABEL[s]}
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {stateCounts[s]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Phân bố điểm & Câu cần chú ý */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Phân bố điểm số</h3>
                  <span className="text-xs text-gray-500">
                    n = {submitted.length} bài đã nộp
                  </span>
                </div>
                <div className="mt-6 flex h-40 items-end gap-2">
                  {bins.map((b) => (
                    <div
                      key={b.from}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                    >
                      <span className="text-xs font-medium text-gray-500">
                        {b.count || ""}
                      </span>
                      <div
                        className={`w-full rounded-t transition-all ${
                          b.from < 50
                            ? "bg-rose-400/80 hover:bg-rose-500"
                            : "bg-indigo-500/80 hover:bg-indigo-600"
                        }`}
                        style={{
                          height: `${(b.count / maxBin) * 100}%`,
                          minHeight: b.count ? 6 : 0,
                        }}
                        title={`${b.from}–${b.to}%: ${b.count} học sinh`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2 border-t border-gray-100 pt-2 text-[11px] text-gray-400">
                  {bins.map((b) => (
                    <span key={b.from} className="flex-1 text-center">
                      {b.from}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Cột đỏ: điểm dưới 50%. Điểm trung bình cả lớp:{" "}
                  <strong>{num(meanScore)}%</strong>.
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
                <h3 className="font-semibold text-sm">Câu hỏi cần chú ý</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                      Đúng dưới {RULES.hardBelow * 100}% — Cần ôn lại (
                      {hardQuestions.length})
                    </div>
                    <div className="mt-2 space-y-1">
                      {hardQuestions.map((q) => (
                        <button
                          key={q.q.questionId}
                          onClick={() => {
                            setTab("questions");
                            setOpenQId(q.q.questionId);
                          }}
                          className="flex w-full items-center justify-between rounded p-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span className="font-medium text-indigo-600">
                            Câu {q.q.number}
                          </span>
                          <span className="truncate px-2 text-gray-600 dark:text-gray-300 max-w-[160px]">
                            {q.q.prompt}
                          </span>
                          <span className="font-bold text-rose-600">
                            {pct(q.correctRate)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Đúng trên {RULES.easyAbove * 100}% — Rất tốt (
                      {easyQuestions.length})
                    </div>
                    <div className="mt-2 space-y-1">
                      {easyQuestions.slice(0, 3).map((q) => (
                        <button
                          key={q.q.questionId}
                          onClick={() => {
                            setTab("questions");
                            setOpenQId(q.q.questionId);
                          }}
                          className="flex w-full items-center justify-between rounded p-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span className="font-medium text-indigo-600">
                            Câu {q.q.number}
                          </span>
                          <span className="truncate px-2 text-gray-600 dark:text-gray-300 max-w-[160px]">
                            {q.q.prompt}
                          </span>
                          <span className="font-bold text-emerald-600">
                            {pct(q.correctRate)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. QUESTIONS (100% AUTO, NO MANUAL) */}
        {tab === "questions" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="text-xs text-gray-500">
                Toàn bộ câu hỏi được hệ thống <strong>chấm tự động</strong> dựa
                trên chuẩn so khớp đáp án. Bấm vào từng câu để xem phân bố trả
                lời.
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />{" "}
                  Đúng
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Một
                  phần
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Sai
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gray-300" /> Bỏ
                  trống
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/70 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800/40">
                  <tr>
                    <th className="w-10 px-3 py-3" />
                    <th className="w-14 py-3">Câu</th>
                    <th className="py-3">Nội dung câu hỏi</th>
                    <th className="hidden w-36 py-3 sm:table-cell">Dạng câu</th>
                    <th className="w-44 py-3">Kết quả</th>
                    <th className="w-20 py-3 text-right">% Đúng</th>
                    <th className="w-20 py-3 text-right">Bỏ trống</th>
                    <th className="w-24 px-4 py-3 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {questionStats.map((st) => {
                    const isOpen = openQId === st.q.questionId;
                    return (
                      <Fragment key={st.q.questionId}>
                        <tr
                          onClick={() =>
                            setOpenQId(isOpen ? null : st.q.questionId)
                          }
                          className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                            isOpen ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          <td className="px-3 py-3 text-gray-400">
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </td>
                          <td className="py-3 font-bold text-indigo-600">
                            Câu {st.q.number}
                          </td>
                          <td className="py-3 pr-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              <RichText text={st.q.prompt} />
                            </div>
                            <div className="text-xs text-gray-400">
                              {st.q.sectionTitle}
                            </div>
                          </td>
                          <td className="hidden py-3 text-xs text-gray-500 sm:table-cell">
                            {TYPE_LABEL[st.q.type]}
                          </td>
                          <td className="py-3 pr-4">
                            <RateBar
                              correct={st.correct}
                              partial={st.partial}
                              incorrect={st.incorrect}
                              unanswered={st.unanswered}
                              n={st.n}
                            />
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {pct(st.correctRate)}
                          </td>
                          <td className="py-3 text-right text-gray-400">
                            {pct(st.unansweredRate)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {st.difficulty === "hard" && (
                              <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                Khó
                              </span>
                            )}
                            {st.difficulty === "easy" && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                Quá dễ
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Mở rộng chi tiết phân bố đáp án */}
                        {isOpen && (
                          <tr className="bg-gray-50/60 dark:bg-gray-900/40">
                            <td colSpan={8} className="px-8 py-4">
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Phân bố lựa chọn */}
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Lựa chọn của học sinh
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    {st.q.options?.map((opt) => {
                                      const pickCount = doneAttempts.filter(
                                        (a) => {
                                          const resp = a.responses.find(
                                            (r) =>
                                              r.questionId === st.q.questionId
                                          );
                                          return resp?.raw === opt.id;
                                        }
                                      ).length;
                                      return (
                                        <div
                                          key={opt.id}
                                          className="flex items-center gap-3 text-xs"
                                        >
                                          <span
                                            className={`font-bold w-5 ${
                                              opt.isCorrect
                                                ? "text-emerald-600"
                                                : "text-gray-500"
                                            }`}
                                          >
                                            {opt.letter}.
                                          </span>
                                          <span className="flex-1 truncate">
                                            {opt.text}
                                            {opt.isCorrect && (
                                              <span className="ml-2 font-semibold text-emerald-600">
                                                ✓ Đúng
                                              </span>
                                            )}
                                          </span>
                                          <div className="flex w-36 items-center gap-2">
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                              <div
                                                className={`h-full ${
                                                  opt.isCorrect
                                                    ? "bg-emerald-500"
                                                    : "bg-rose-400"
                                                }`}
                                                style={{
                                                  width: `${
                                                    st.n
                                                      ? (pickCount / st.n) *
                                                        100
                                                      : 0
                                                  }%`,
                                                }}
                                              />
                                            </div>
                                            <span className="w-6 text-right font-mono">
                                              {pickCount}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {st.q.type === "TEXT_INPUT" && (
                                      <div className="text-xs text-gray-600">
                                        Đáp án chấp nhận:{" "}
                                        <span className="font-semibold text-emerald-600">
                                          {st.q.acceptedAnswers?.join(" / ")}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Đáp án sai phổ biến */}
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Lỗi sai phổ biến (đã gộp biến thể)
                                  </div>
                                  <div className="mt-3 space-y-1.5">
                                    <div className="flex items-center justify-between rounded border border-gray-200 bg-white p-2 text-xs dark:border-gray-800 dark:bg-gray-800">
                                      <span className="font-mono text-rose-600">
                                        “is playing”
                                      </span>
                                      <span className="text-gray-400">
                                        6 học sinh nhầm chia số ít
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded border border-gray-200 bg-white p-2 text-xs dark:border-gray-800 dark:bg-gray-800">
                                      <span className="font-mono text-rose-600">
                                        “play”
                                      </span>
                                      <span className="text-gray-400">
                                        3 học sinh quên đuôi -ing
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 3. SECTIONS */}
        {tab === "sections" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold text-sm">
                Kết quả theo từng phần của đề bài
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Phần nào có % đúng thấp hơn mức trung bình cả lớp cần được lưu ý
                bổ trợ kiến thức.
              </p>
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3">Phần</th>
                      <th className="w-20 py-3 text-right">Số câu</th>
                      <th className="w-56 px-4 py-3">Phân bố kết quả</th>
                      <th className="w-24 py-3 text-right">% Đúng</th>
                      <th className="w-24 py-3 text-right">% Điểm đạt</th>
                      <th className="w-24 px-4 py-3 text-right">Bỏ trống</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sectionStats.map((sec) => (
                      <tr key={sec.sectionId} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 font-medium">{sec.title}</td>
                        <td className="py-3.5 text-right font-mono">
                          {sec.questionsCount}
                        </td>
                        <td className="px-4 py-3.5">
                          <RateBar
                            correct={sec.correct}
                            partial={sec.partial}
                            incorrect={sec.incorrect}
                            unanswered={sec.unanswered}
                            n={sec.n * sec.questionsCount}
                          />
                        </td>
                        <td className="py-3.5 text-right font-semibold">
                          {pct(sec.correctRate)}
                        </td>
                        <td className="py-3.5 text-right font-medium text-indigo-600">
                          {pct(sec.pointsRate)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-gray-400 font-mono">
                          {pct(sec.unansweredRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 4. STUDENTS */}
        {tab === "students" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên học sinh…"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="h-9 w-60 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>
                <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-medium dark:border-gray-800 dark:bg-gray-900">
                  {(["all", ...PROGRESS_ORDER] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStudentState(st)}
                      className={`rounded px-2.5 py-1 ${
                        filterStudentState === st
                          ? "bg-indigo-600 text-white"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {st === "all" ? "Tất cả" : PROGRESS_LABEL[st]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Hiển thị <strong>{roster.length}</strong> học sinh
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Học sinh</th>
                    <th className="py-3">Lớp</th>
                    <th className="py-3">Trạng thái</th>
                    <th className="py-3 text-right">Điểm</th>
                    <th className="py-3 text-right">%</th>
                    <th className="py-3 text-right">So với TB</th>
                    <th className="py-3 text-right">Thời gian</th>
                    <th className="py-3 text-right">Bỏ trống</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {roster
                    .filter(
                      (r) =>
                        (filterStudentState === "all" ||
                          r.state === filterStudentState) &&
                        r.student.name
                          .toLowerCase()
                          .includes(searchStudent.toLowerCase())
                    )
                    .map((row) => (
                      <tr
                        key={row.student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                          {row.student.name}
                        </td>
                        <td className="py-3 text-gray-500">{row.statsClassId}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5 text-xs">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                STATE_COLOR[row.state]
                              }`}
                            />
                            {PROGRESS_LABEL[row.state]}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">
                          {row.earned != null
                            ? `${num(row.earned)}/${num(row.max)}`
                            : "—"}
                        </td>
                        <td
                          className={`py-3 text-right font-bold ${
                            row.percent != null && row.percent < 50
                              ? "text-rose-600"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {score(row.percent)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {row.percent != null && meanScore != null ? (
                            <span
                              className={
                                row.percent >= meanScore
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }
                            >
                              {row.percent >= meanScore ? "+" : ""}
                              {Math.round(row.percent - meanScore)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {row.minutes ? `${Math.round(row.minutes)} ph` : "—"}
                        </td>
                        <td className="py-3 text-right font-mono text-gray-400">
                          {row.blanks ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.attempt ? (
                            <button
                              onClick={() => setSelectedStudent(row)}
                              className="flex items-center gap-1 ml-auto rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-600" /> Xem
                              bài
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Chưa làm
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 5. CLASSES */}
        {tab === "classes" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold text-sm">So sánh giữa các lớp</h3>
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3">Lớp</th>
                      <th className="py-3 text-right">Sĩ số giao</th>
                      <th className="py-3 text-right">Tỉ lệ nộp</th>
                      <th className="py-3 text-right">Điểm TB</th>
                      <th className="py-3 text-right">Trung vị</th>
                      <th className="w-56 px-4 py-3">Kết quả chung</th>
                      <th className="px-4 py-3 text-right">% Đúng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-indigo-600">
                        6A1
                      </td>
                      <td className="py-3 text-right font-mono">24</td>
                      <td className="py-3 text-right font-mono">
                        {pct(submitted.length / 24)}{" "}
                        <span className="text-xs text-gray-400">
                          ({submitted.length})
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold">
                        {score(meanScore)}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {score(medianScore)}
                      </td>
                      <td className="px-4 py-3">
                        <RateBar
                          correct={18}
                          partial={3}
                          incorrect={2}
                          unanswered={1}
                          n={24}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        75%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DRAWER: XEM CHI TIẾT BÀI LÀM CỦA HỌC SINH */}
      {selectedStudent && selectedStudent.attempt && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    {selectedStudent.student.name}
                  </h2>
                  <span className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                    <Lock className="h-3 w-3" /> Chỉ đọc
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Lớp {selectedStudent.statsClassId} · Bắt đầu lúc{" "}
                  {fmtDate(selectedStudent.attempt.startedAt)}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thống kê bài thi của em */}
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
              <div>
                <div className="text-xs text-gray-500">Điểm đạt được</div>
                <div className="mt-1 text-xl font-bold text-indigo-600">
                  {num(selectedStudent.attempt.scoreEarned)}/
                  {num(selectedStudent.attempt.scoreMax)} (
                  {score(selectedStudent.attempt.percent)})
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">So với TB lớp</div>
                <div className="mt-1 text-xl font-bold">
                  {selectedStudent.percent != null && meanScore != null
                    ? `${
                        selectedStudent.percent >= meanScore ? "+" : ""
                      }${Math.round(selectedStudent.percent - meanScore)}%`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Thời gian làm</div>
                <div className="mt-1 text-xl font-bold">
                  {selectedStudent.minutes
                    ? `${Math.round(selectedStudent.minutes)} phút`
                    : "—"}
                </div>
              </div>
            </div>

            {/* Chi tiết từng câu hỏi */}
            <div className="mt-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Chi tiết bài làm từng câu
              </h3>
              {selectedStudent.attempt.questions.map((q: QuestionSnapshot) => {
                const resp = selectedStudent.attempt.responses.find(
                  (r: ResponseRecord) => r.questionId === q.questionId
                );
                const st = questionStatus(resp?.parts ?? []);
                const earned =
                  resp?.parts.reduce((s: number, p: PartResult) => s + p.earned, 0) ?? 0;

                return (
                  <div
                    key={q.questionId}
                    className="rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-indigo-600">
                          Câu {q.number}.
                        </span>{" "}
                        <RichText text={q.prompt} className="font-medium" />
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusChip status={st} />
                        <span className="text-xs font-mono text-gray-500">
                          {num(earned)}/{num(q.points)} điểm
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800/40 sm:grid-cols-2">
                      <div>
                        <span className="text-gray-500">Em trả lời: </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {resp?.raw
                            ? String(resp.raw)
                            : "(Bỏ trống không trả lời)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Đáp án đúng: </span>
                        <span className="font-semibold text-emerald-600">
                          {q.type === "SINGLE_CHOICE"
                            ? q.options?.find((o) => o.isCorrect)?.text
                            : q.acceptedAnswers?.join(" / ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐỊNH NGHĨA CHỈ SỐ */}
      {showDefs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-bold text-base">Công thức tính toán chỉ số</h3>
              <button
                onClick={() => setShowDefs(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <div className="border-b border-gray-100 pb-2">
                <strong className="text-gray-900 dark:text-gray-100">
                  Tỉ lệ nộp bài:
                </strong>{" "}
                Số bài đã nộp / Tổng số học sinh được giao đề.
              </div>
              <div className="border-b border-gray-100 pb-2">
                <strong className="text-gray-900 dark:text-gray-100">
                  Tỉ lệ đúng từng câu:
                </strong>{" "}
                Số học sinh làm đúng hoàn toàn / Số bài đã nộp (câu bỏ trống tính ở
                mẫu số).
              </div>
              <div className="border-b border-gray-100 pb-2">
                <strong className="text-gray-900 dark:text-gray-100">
                  Ngưỡng cảnh báo độ khó:
                </strong>{" "}
                Đúng dưới 40% được gắn cờ <strong>Khó</strong>, trên 90% gắn cờ{" "}
                <strong>Quá dễ</strong>.
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">
                  Chấm điểm 100% tự động:
                </strong>{" "}
                Tất cả câu trắc nghiệm và câu điền từ/viết câu đều được hệ thống so
                khớp tự động sau khi chuẩn hóa khoảng trắng và viết hoa/thường.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. MOCK DATASET (100% AUTO-GRADED, 24 STUDENTS)
// ==========================================

const SAMPLE_DATASET: ResultsDataset = {
  assignmentId: "asg_grade6_unit1",
  assignmentTitle: "English 6 - Unit 1: My New School",
  asOf: "2026-10-23T08:00:00+07:00",
  dueAt: "2026-10-22T21:00:00+07:00",
  timeLimitMin: 40,
  assignedClassIds: ["6A1"],
  isSample: true,
  students: [
    { id: "s1", name: "Nguyễn Minh Anh", classId: "6A1" },
    { id: "s2", name: "Trần Gia Bảo", classId: "6A1" },
    { id: "s3", name: "Lê Khánh Chi", classId: "6A1" },
    { id: "s4", name: "Phạm Đức Duy", classId: "6A1" },
    { id: "s5", name: "Hoàng Thu Hà", classId: "6A1" },
    { id: "s6", name: "Vũ Quang Huy", classId: "6A1" },
    { id: "s7", name: "Đặng Ngọc Hân", classId: "6A1" },
    { id: "s8", name: "Bùi Tuấn Khang", classId: "6A1" },
    { id: "s9", name: "Đỗ Phương Linh", classId: "6A1" },
    { id: "s10", name: "Ngô Bảo Long", classId: "6A1" },
    { id: "s11", name: "Dương Thảo My", classId: "6A1" },
    { id: "s12", name: "Lý Hoàng Nam", classId: "6A1" },
    { id: "s13", name: "Trịnh Yến Nhi", classId: "6A1" },
    { id: "s14", name: "Mai Anh Phúc", classId: "6A1" },
    { id: "s15", name: "Đinh Minh Quân", classId: "6A1" },
    { id: "s16", name: "Hồ Như Quỳnh", classId: "6A1" },
    { id: "s17", name: "Phan Thanh Sơn", classId: "6A1" },
    { id: "s18", name: "Tạ Minh Tâm", classId: "6A1" },
    { id: "s19", name: "Cao Thu Trang", classId: "6A1" },
    { id: "s20", name: "Lâm Gia Tuệ", classId: "6A1" },
    { id: "s21", name: "Chu Hải Đăng", classId: "6A1" },
    { id: "s22", name: "Kiều Bảo Ngọc", classId: "6A1" },
    { id: "s23", name: "Tôn Đức Thịnh", classId: "6A1" },
    { id: "s24", name: "Võ Khánh Vy", classId: "6A1" },
  ],
  attempts: [
    {
      attemptId: "att_1",
      studentId: "s1",
      studentName: "Nguyễn Minh Anh",
      classIdAtStart: "6A1",
      startedAt: "2026-10-20T19:00:00+07:00",
      submittedAt: "2026-10-20T19:32:00+07:00",
      scoreEarned: 9.5,
      scoreMax: 10,
      percent: 95,
      late: false,
      timedOut: false,
      questions: [
        {
          questionId: "q1",
          number: 1,
          type: "SINGLE_CHOICE",
          prompt: "Choose the word whose underlined part is pronounced differently: [[ea]]",
          sectionId: "sec1",
          sectionTitle: "I. Pronunciation",
          points: 1,
          options: [
            { id: "o1", letter: "A", text: "t[[ea]]cher", isCorrect: false },
            { id: "o2", letter: "B", text: "br[[ea]]kfast", isCorrect: true },
            { id: "o3", letter: "C", text: "m[[ea]]t", isCorrect: false },
            { id: "o4", letter: "D", text: "r[[ea]]d", isCorrect: false },
          ],
          parts: [{ key: "main", label: "", max: 1 }],
        },
        {
          questionId: "q2",
          number: 2,
          type: "TEXT_INPUT",
          prompt: "Look! The students {{1}} (play) football in the school yard.",
          sectionId: "sec2",
          sectionTitle: "II. Verb Tenses",
          points: 1,
          acceptedAnswers: ["are playing"],
          parts: [{ key: "main", label: "", max: 1 }],
        },
        {
          questionId: "q3",
          number: 3,
          type: "TEXT_INPUT",
          prompt: "Rewrite: English is Nam's favourite subject. → Nam's favourite ...",
          sectionId: "sec3",
          sectionTitle: "III. Sentence Rewriting",
          points: 1,
          acceptedAnswers: [
            "Nam's favourite subject is English",
            "Nam's favourite subject is English.",
          ],
          parts: [{ key: "main", label: "", max: 1 }],
        },
      ],
      responses: [
        {
          questionId: "q1",
          raw: "o2",
          parts: [
            {
              key: "main",
              status: "CORRECT",
              earned: 1,
              max: 1,
              normalized: "B",
            },
          ],
        },
        {
          questionId: "q2",
          raw: "are playing",
          parts: [
            {
              key: "main",
              status: "CORRECT",
              earned: 1,
              max: 1,
              normalized: "are playing",
            },
          ],
        },
        {
          questionId: "q3",
          raw: "Nam's favourite subject is English",
          parts: [
            {
              key: "main",
              status: "CORRECT",
              earned: 1,
              max: 1,
              normalized: "nam's favourite subject is english",
            },
          ],
        },
      ],
    },
    {
      attemptId: "att_2",
      studentId: "s2",
      studentName: "Trần Gia Bảo",
      classIdAtStart: "6A1",
      startedAt: "2026-10-21T20:00:00+07:00",
      submittedAt: "2026-10-21T20:38:00+07:00",
      scoreEarned: 6.5,
      scoreMax: 10,
      percent: 65,
      late: false,
      timedOut: false,
      questions: [
        {
          questionId: "q1",
          number: 1,
          type: "SINGLE_CHOICE",
          prompt: "Choose the word whose underlined part is pronounced differently: [[ea]]",
          sectionId: "sec1",
          sectionTitle: "I. Pronunciation",
          points: 1,
          options: [
            { id: "o1", letter: "A", text: "t[[ea]]cher", isCorrect: false },
            { id: "o2", letter: "B", text: "br[[ea]]kfast", isCorrect: true },
            { id: "o3", letter: "C", text: "m[[ea]]t", isCorrect: false },
            { id: "o4", letter: "D", text: "r[[ea]]d", isCorrect: false },
          ],
          parts: [{ key: "main", label: "", max: 1 }],
        },
        {
          questionId: "q2",
          number: 2,
          type: "TEXT_INPUT",
          prompt: "Look! The students {{1}} (play) football in the school yard.",
          sectionId: "sec2",
          sectionTitle: "II. Verb Tenses",
          points: 1,
          acceptedAnswers: ["are playing"],
          parts: [{ key: "main", label: "", max: 1 }],
        },
        {
          questionId: "q3",
          number: 3,
          type: "TEXT_INPUT",
          prompt: "Rewrite: English is Nam's favourite subject. → Nam's favourite ...",
          sectionId: "sec3",
          sectionTitle: "III. Sentence Rewriting",
          points: 1,
          acceptedAnswers: [
            "Nam's favourite subject is English",
            "Nam's favourite subject is English.",
          ],
          parts: [{ key: "main", label: "", max: 1 }],
        },
      ],
      responses: [
        {
          questionId: "q1",
          raw: "o2",
          parts: [
            {
              key: "main",
              status: "CORRECT",
              earned: 1,
              max: 1,
              normalized: "B",
            },
          ],
        },
        {
          questionId: "q2",
          raw: "is playing",
          parts: [
            {
              key: "main",
              status: "INCORRECT",
              earned: 0,
              max: 1,
              normalized: "is playing",
            },
          ],
        },
        {
          questionId: "q3",
          raw: "Nam favourite subject is English",
          parts: [
            {
              key: "main",
              status: "INCORRECT",
              earned: 0,
              max: 1,
              normalized: "nam favourite subject is english",
            },
          ],
        },
      ],
    },
    {
      attemptId: "att_3",
      studentId: "s3",
      studentName: "Lê Khánh Chi",
      classIdAtStart: "6A1",
      startedAt: "2026-10-22T21:15:00+07:00",
      submittedAt: "2026-10-22T21:45:00+07:00",
      scoreEarned: 8.0,
      scoreMax: 10,
      percent: 80,
      late: true,
      timedOut: false,
      questions: [
        {
          questionId: "q1",
          number: 1,
          type: "SINGLE_CHOICE",
          prompt: "Choose the word whose underlined part is pronounced differently: [[ea]]",
          sectionId: "sec1",
          sectionTitle: "I. Pronunciation",
          points: 1,
          options: [
            { id: "o1", letter: "A", text: "t[[ea]]cher", isCorrect: false },
            { id: "o2", letter: "B", text: "br[[ea]]kfast", isCorrect: true },
            { id: "o3", letter: "C", text: "m[[ea]]t", isCorrect: false },
            { id: "o4", letter: "D", text: "r[[ea]]d", isCorrect: false },
          ],
          parts: [{ key: "main", label: "", max: 1 }],
        },
        {
          questionId: "q2",
          number: 2,
          type: "TEXT_INPUT",
          prompt: "Look! The students {{1}} (play) football in the school yard.",
          sectionId: "sec2",
          sectionTitle: "II. Verb Tenses",
          points: 1,
          acceptedAnswers: ["are playing"],
          parts: [{ key: "main", label: "", max: 1 }],
        },
        {
          questionId: "q3",
          number: 3,
          type: "TEXT_INPUT",
          prompt: "Rewrite: English is Nam's favourite subject. → Nam's favourite ...",
          sectionId: "sec3",
          sectionTitle: "III. Sentence Rewriting",
          points: 1,
          acceptedAnswers: [
            "Nam's favourite subject is English",
            "Nam's favourite subject is English.",
          ],
          parts: [{ key: "main", label: "", max: 1 }],
        },
      ],
      responses: [
        {
          questionId: "q1",
          raw: "o2",
          parts: [
            {
              key: "main",
              status: "CORRECT",
              earned: 1,
              max: 1,
              normalized: "B",
            },
          ],
        },
        {
          questionId: "q2",
          raw: "are playing",
          parts: [
            {
              key: "main",
              status: "CORRECT",
              earned: 1,
              max: 1,
              normalized: "are playing",
            },
          ],
        },
        {
          questionId: "q3",
          raw: "Nam's favourite is English",
          parts: [
            {
              key: "main",
              status: "INCORRECT",
              earned: 0,
              max: 1,
              normalized: "nam's favourite is english",
            },
          ],
        },
      ],
    },
  ],
};
