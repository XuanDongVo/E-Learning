"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Heart,
  Lightbulb,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { activitySessionService } from "@/services/activity-session.service";
import type {
  ActivitySession,
  ActivitySessionMode,
  ActivitySessionQuestion,
  SelectionStrategy,
} from "@/types/activity-session";
import { PracticeSettings } from "./practice-setting";
import { PracticeResult } from "./practice-result";
import { PracticeStart } from "./practice-start";
import { QuestionNavigator, QuestionNavigatorSheet, type NavStatus } from "./question-navigator";
import { HintPanel, HintStatus } from "./hint-panel";
import { TYPE_LABEL, formatAnswer, isChoice, splitKeys, useSlow } from "@/utils/practice-utils";
import garden from "../../../../../public/assets/practice-garden.jpg";
import mascot from "../../../../../public/assets/practice-mascot.png";

/* ---------- Tailwind class tokens ---------- */
const glassBtn =
  "text-practice-light bg-practice-blue/28 border-practice-light/30 hover:bg-practice-blue/65 hover:text-practice-light";
const paperBtn =
  "text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] hover:bg-practice-light hover:text-practice-ink";
const nextBtn =
  "text-practice-ink bg-practice-yellow shadow-[0_3px_0_var(--color-practice-border)] hover:text-practice-ink hover:bg-[color-mix(in_oklch,var(--color-practice-yellow)_85%,var(--color-practice-light))]";
const card = "bg-practice-paper shadow-[0_6px_0_var(--color-practice-shadow)]";

const answerBase =
  "h-auto text-practice-ink bg-practice-light border-2 border-practice-border shadow-[0_3px_0_var(--color-practice-border)] enabled:hover:bg-practice-hint enabled:hover:border-practice-blue enabled:hover:shadow-[0_3px_0_var(--color-practice-blue-dark)] disabled:opacity-100";
const answerSelected =
  "bg-practice-hint border-practice-blue shadow-[0_3px_0_var(--color-practice-blue-dark)]";
const answerCorrect =
  "bg-practice-good-soft border-practice-good shadow-[0_3px_0_var(--color-practice-good)]";
const answerWrong =
  "bg-practice-bad-soft border-practice-bad shadow-[0_3px_0_var(--color-practice-bad)]";

type Feedback = {
  correct: boolean;
  retryAvailable: boolean;
  answerRevealed: boolean;
  correctAnswer?: string;
  explanation?: string;
};

/** Server chấm bằng key (A/B/…) cho câu chọn, bằng chuỗi cho TRUE/FALSE và câu nhập. */
const answerFor = (q: ActivitySessionQuestion, draft: string[]): string | string[] =>
  q.type === "MULTIPLE_CHOICE" ? draft : (draft[0] ?? "");

export function PracticeRunner({ activityId }: { activityId: number }) {
  const router = useRouter();

  // Lựa chọn trước khi bắt đầu
  const [mode, setMode] = useState<ActivitySessionMode>();
  const [strategy, setStrategy] = useState<SelectionStrategy>("RANDOM");

  // Dữ liệu session (nguồn sự thật là server)
  const [session, setSession] = useState<ActivitySession>();
  const [currentId, setCurrentId] = useState<number>();
  const [showResult, setShowResult] = useState(false);

  // Trạng thái cục bộ theo từng câu (key = questionId). Tách riêng khỏi `session`
  // để các response của server (hint, deadline…) không bao giờ ghi đè đáp án đang nhập.
  const [drafts, setDrafts] = useState<Record<number, string[]>>({});
  const [picks, setPicks] = useState<Record<number, string[]>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, Feedback>>({});
  const [hints, setHints] = useState<Record<number, string>>({});
  const [hintOpenFor, setHintOpenFor] = useState<number | null>(null);

  // UI
  const [settings, setSettings] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [background, setBackground] = useState("garden");
  const [now, setNow] = useState(() => Date.now());

  /* ---------- API ---------- */
  const options = useQuery({
    queryKey: ["activity-session-options", activityId],
    queryFn: () => activitySessionService.options(activityId),
  });
  const sessionOptions = options.data?.data ?? undefined;
  const effectiveMode =
    mode ?? (sessionOptions?.activityMode !== "BOTH" ? sessionOptions?.activityMode : undefined);
  const effectiveStrategy = sessionOptions?.selectionStrategies.includes(strategy)
    ? strategy
    : sessionOptions?.selectionStrategies[0];

  const start = useMutation({
    mutationFn: () => activitySessionService.start(activityId, effectiveMode, effectiveStrategy),
    onSuccess: (result) => {
      const data = result.data;
      if (!data) return;
      setSession(data);
      setCurrentId((data.questions.find((q) => !q.resolved) ?? data.questions[0])?.id);
      setDrafts({});
      setPicks({});
      setFeedbacks({});
      setHints({});
      setHintOpenFor(null);
      setShowResult(false);
    },
  });

  const answerMutation = useMutation({
    mutationFn: (v: { questionId: number; answer: string | string[]; draft: string[] }) =>
      activitySessionService.answer(session!.id, v.questionId, v.answer),
    onSuccess: (result, v) => {
      const data = result.data;
      if (!data) return;
      setSession(data.session);
      setFeedbacks((f) => ({
        ...f,
        [v.questionId]: {
          correct: data.correct,
          retryAvailable: data.retryAvailable,
          answerRevealed: data.answerRevealed,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
        },
      }));
      setPicks((p) => ({ ...p, [v.questionId]: v.draft }));
      // Chỉ xoá nháp SAU khi server đã nhận; nếu lỗi thì đáp án vẫn còn để thử lại.
      setDrafts((d) => ({ ...d, [v.questionId]: [] }));
    },
  });
  const { mutate: sendAnswer, isPending: answering } = answerMutation;

  const hintMutation = useMutation({
    mutationFn: (v: { questionId: number }) => activitySessionService.hint(session!.id, v.questionId),
    onSuccess: (result, v) => {
      const data = result.data;
      if (!data) return;
      setHints((h) => ({ ...h, [v.questionId]: data.hint }));
      setHintOpenFor(v.questionId);
      // Chỉ hợp nhất cờ "đã dùng gợi ý" + bộ đếm; KHÔNG thay cả session để tránh ghi đè
      // trạng thái mới hơn (ví dụ học sinh vừa nộp đáp án trong lúc chờ).
      setSession((s) =>
        s && {
          ...s,
          hintUsedCount: data.session.hintUsedCount,
          questions: s.questions.map((q) => (q.id === v.questionId ? { ...q, hintUsed: true } : q)),
        },
      );
    },
  });
  const { mutate: sendHint, isPending: hinting } = hintMutation;

  const finish = useMutation({
    mutationFn: () => activitySessionService.finish(session!.id),
    onSuccess: (result) => {
      if (result.data) setSession(result.data);
      setShowResult(true);
    },
  });

  const startSlow = useSlow(start.isPending);
  const answerSlow = useSlow(answering);
  const hintSlow = useSlow(hinting);

  /* ---------- Suy ra từ session ---------- */
  const questions = useMemo(() => session?.questions ?? [], [session]);
  const index = Math.max(0, questions.findIndex((q) => q.id === currentId));
  const question = questions[index];
  const tryHard = session?.mode === "TRY_HARD";
  const over = !!session && session.status !== "IN_PROGRESS";
  const complete = showResult;

  const draft = useMemo(() => (question && drafts[question.id]) || [], [question, drafts]);
  const feedback = question ? feedbacks[question.id] : undefined;
  const locked = !!question?.resolved;
  const hasDraft = question
    ? isChoice(question) || question.type === "TRUE_FALSE"
      ? draft.length > 0
      : (draft[0] ?? "").trim().length > 0
    : false;
  const canSubmit = !!question && !locked && !over && hasDraft && !answering;

  const hintAvailable =
    !!question && session?.mode === "LEARNING" && question.hasHint && !locked && !over && !complete;
  const hintText = question ? hints[question.id] : undefined;
  const hintOpen = !!question && !!hintText && hintOpenFor === question.id && !locked;
  const hintError =
    hintMutation.isError && hintMutation.variables?.questionId === question?.id
      ? hintMutation.error.message
      : undefined;

  const nextOpen =
    questions.find((q, i) => i > index && !q.resolved) ??
    questions.find((q) => !q.resolved && q.id !== question?.id);

  const secondsLeft =
    question?.deadlineAt && !locked
      ? Math.max(0, Math.ceil((new Date(question.deadlineAt).getTime() - now) / 1000))
      : undefined;

  const statuses: NavStatus[] = questions.map((q) =>
    q.resolved ? (q.finalCorrect ? "correct" : "wrong") : (drafts[q.id]?.length ?? 0) > 0 ? "picked" : "todo",
  );

  /* ---------- Hành vi ---------- */
  const goTo = useCallback((id: number) => setCurrentId(id), []);
  const goNext = useCallback(() => {
    if (nextOpen) goTo(nextOpen.id);
  }, [nextOpen, goTo]);
  const goPrev = useCallback(() => {
    const prev = questions[index - 1];
    if (!tryHard && prev) goTo(prev.id);
  }, [questions, index, tryHard, goTo]);

  const setDraft = useCallback(
    (qid: number, update: (current: string[]) => string[]) =>
      setDrafts((d) => ({ ...d, [qid]: update(d[qid] ?? []) })),
    [],
  );
  const pick = useCallback(
    (key: string) => {
      if (!question || locked || answering) return;
      setDraft(question.id, (cur) =>
        question.type === "MULTIPLE_CHOICE"
          ? cur.includes(key)
            ? cur.filter((k) => k !== key)
            : [...cur, key]
          : [key],
      );
    },
    [question, locked, answering, setDraft],
  );

  const submit = useCallback(() => {
    if (!question || !canSubmit) return;
    sendAnswer({ questionId: question.id, answer: answerFor(question, draft), draft });
  }, [question, canSubmit, sendAnswer, draft]);

  const reset = useCallback(() => {
    if (!question || locked || answering) return;
    setDraft(question.id, () => []);
  }, [question, locked, answering, setDraft]);

  /** Gợi ý: đã có nội dung → chỉ bật/tắt khung (server đã ghi nhận lượt dùng); chưa có → gọi API. */
  const requestHint = useCallback(() => {
    if (!question || !hintAvailable || hinting) return;
    if (hints[question.id]) {
      setHintOpenFor((id) => (id === question.id ? null : question.id));
      return;
    }
    sendHint({ questionId: question.id });
  }, [question, hintAvailable, hinting, hints, sendHint]);

  const leave = () => {
    if (!session || over || complete) {
      router.push("/student/activities");
      return;
    }
    if (window.confirm("Rời khỏi hoạt động? Lượt luyện tập hiện tại sẽ không được lưu hoặc tiếp tục.")) {
      finish.mutate();
    }
  };

  /** Nộp sớm: báo số câu đã làm / còn lại rồi mới gọi finish. */
  const submitEarly = () => {
    if (!session || over || complete || answering || finish.isPending) return;
    const total = questions.length;
    const done = questions.filter((q) => q.resolved).length;
    const unchecked = !locked && hasDraft ? "\nCâu đang chọn chưa được kiểm tra sẽ không được tính." : "";
    if (
      window.confirm(
        `Bạn đã hoàn thành ${done}/${total} câu, còn ${total - done} câu chưa làm.${unchecked}\n\nBạn có chắc muốn nộp bài ngay bây giờ không?`,
      )
    ) {
      finish.mutate();
    }
  };

  const retry = () => {
    setSession(undefined);
    setCurrentId(undefined);
    setShowResult(false);
    setDrafts({});
    setPicks({});
    setFeedbacks({});
    setHints({});
    setHintOpenFor(null);
    start.reset();
    answerMutation.reset();
    hintMutation.reset();
    finish.reset();
  };

  /* ---------- Effects ---------- */
  // Đồng hồ cho Try Hard
  useEffect(() => {
    if (!tryHard || over || complete) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [tryHard, over, complete]);

  // Try Hard: server chỉ gán deadline cho câu hiện tại khi GET session → lấy deadline của câu mới.
  const requestedDeadline = useRef<Set<number>>(new Set());
  const sessionId = session?.id;
  const questionId = question?.id;
  const needsDeadline = tryHard && !over && !!question && !question.resolved && !question.deadlineAt;
  useEffect(() => {
    if (!needsDeadline || !sessionId || questionId === undefined) return;
    if (requestedDeadline.current.has(questionId)) return;
    requestedDeadline.current.add(questionId);
    activitySessionService
      .get(sessionId)
      .then((result) => {
        const fresh = result.data?.questions.find((q) => q.id === questionId);
        if (!fresh?.deadlineAt) return;
        setSession((s) =>
          s && {
            ...s,
            questions: s.questions.map((q) => (q.id === questionId ? { ...q, deadlineAt: fresh.deadlineAt } : q)),
          },
        );
      })
      .catch(() => requestedDeadline.current.delete(questionId));
  }, [needsDeadline, sessionId, questionId]);

  // Phím tắt
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!session || settings || complete || navOpen) return;
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
        return;
      }
      if (typing) return;
      if (event.ctrlKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        requestHint();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!tryHard || locked) goNext();
      } else if (event.key === "Escape") {
        reset();
      } else if (/^[1-9]$/.test(event.key) && question) {
        const list = question.type === "TRUE_FALSE" ? ["TRUE", "FALSE"] : question.options.map((o) => o.key);
        const key = list[Number(event.key) - 1];
        if (key && (isChoice(question) || question.type === "TRUE_FALSE")) pick(key);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, settings, complete, navOpen, submit, requestHint, goPrev, goNext, reset, pick, tryHard, locked, question]);

  /* ---------- Màn hình bắt đầu ---------- */
  if (!session || !question) {
    return (
      <PracticeStart
        options={sessionOptions}
        loading={options.isLoading}
        loadError={options.isError ? options.error.message : undefined}
        onReload={() => options.refetch()}
        mode={effectiveMode}
        onModeChange={setMode}
        strategy={effectiveStrategy}
        onStrategyChange={setStrategy}
        starting={start.isPending}
        slow={startSlow}
        startError={start.isError ? start.error.message : undefined}
        onStart={() => start.mutate()}
      />
    );
  }

  /* ---------- Hiển thị câu hỏi ---------- */
  const choiceOptions =
    question.type === "TRUE_FALSE"
      ? [
          { key: "TRUE", content: "Đúng" },
          { key: "FALSE", content: "Sai" },
        ]
      : question.options;
  const upper = (keys: string[]) => keys.map((k) => k.toUpperCase());
  const submitted = picks[question.id] ?? [];
  const correctKeys = locked
    ? upper(question.finalCorrect ? submitted : splitKeys(feedback?.correctAnswer))
    : [];

  const answerClass = (key: string) => {
    if (locked) {
      if (correctKeys.includes(key.toUpperCase())) return answerCorrect;
      if (upper(submitted).includes(key.toUpperCase())) return answerWrong;
      return "";
    }
    return draft.includes(key) ? answerSelected : "";
  };

  const revealedText =
    feedback?.answerRevealed && feedback.correctAnswer
      ? formatAnswer(
          question,
          isChoice(question) || question.type === "TRUE_FALSE" ? splitKeys(feedback.correctAnswer) : [feedback.correctAnswer],
        )
      : "";

  const gameOver = session.status === "GAME_OVER";
  const finished = over && locked;
  const mascotText = finished
    ? gameOver
      ? "Bạn hết mạng rồi, nhưng đừng buồn! Cùng xem kết quả nhé!"
      : "Tuyệt vời! Bạn đã hoàn thành tất cả câu hỏi!"
    : feedback
    ? feedback.correct
      ? "Giỏi quá! Việt Cường tự hào về bạn!"
      : feedback.retryAvailable
        ? "Chưa đúng, bạn còn một lần thử nữa nhé!"
        : "Không sao đâu, mình cùng xem đáp án nhé!"
    : hintOpen
      ? "Việt Cường vừa gợi ý rồi, xem trong khung câu hỏi nhé!"
      : "Thấy bạn suy nghĩ lâu Việt Cường cũng hồi hộp lây nè!";

  const navProps = {
    statuses,
    index,
    tryHard,
    isLocked: (i: number) => tryHard && questions[i]?.id !== question.id,
    onSelect: (i: number) => {
      const target = questions[i];
      if (target) goTo(target.id);
    },
  };

  const showCheck = !locked && !over && hasDraft;
  const retryLabel = feedback?.retryAvailable ? "Thử lại" : "Kiểm tra";

  return (
    <section
      className="fixed inset-0 z-[45] overflow-y-auto bg-practice-blue text-practice-ink"
      aria-label="Luyện tập tiếng Anh"
    >
      <img
        src={garden.src}
        alt=""
        width={1920}
        height={1024}
        className={`fixed inset-0 h-full w-full object-cover ${background === "calm" ? "hue-rotate-[25deg] saturate-[0.65]" : ""}`}
      />
      <div className="relative mx-auto flex min-h-svh max-w-[880px] flex-col px-4 pb-5 pt-7 max-sm:pt-[18px] lg:max-w-[1140px]">
        <header className="flex items-center gap-3 max-sm:gap-2">
          <Button
            variant="outline"
            className={`${glassBtn} shrink-0 px-3`}
            onClick={leave}
            disabled={finish.isPending}
          >
            <ArrowLeft size={16} />
            <span>{finish.isPending ? "Đang thoát…" : "Quay lại"}</span>
          </Button>
          <div
            className="h-2.5 min-w-6 flex-1 overflow-hidden rounded-full bg-practice-light/22"
            role="progressbar"
            aria-label="Tiến độ luyện tập"
            aria-valuenow={index + 1}
            aria-valuemin={0}
            aria-valuemax={questions.length}
          >
            <div
              className="h-full rounded-full bg-practice-green transition-all"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>

          {hintAvailable && (
            <Button
              variant="outline"
              aria-pressed={hintOpen}
              aria-busy={hinting}
              disabled={hinting}
              className={`${hintOpen ? "bg-practice-yellow text-practice-ink border-practice-yellow hover:bg-practice-yellow hover:text-practice-ink" : glassBtn} px-3`}
              onClick={requestHint}
            >
              <Lightbulb size={16} />
              <span className={hinting ? "" : "hidden sm:inline"}>{hinting ? "Showing hint…" : "Gợi ý"}</span>
            </Button>
          )}

          {tryHard && !complete && (
            <div className="flex shrink-0 items-center gap-3 rounded-full bg-practice-blue-dark px-3 py-1.5 text-sm font-extrabold text-practice-light">
              {secondsLeft !== undefined && (
                <span className={`flex items-center gap-1 ${secondsLeft <= 5 ? "text-practice-yellow" : ""}`}>
                  <Clock3 size={14} /> {secondsLeft}s
                </span>
              )}
              <span className="flex items-center gap-1" aria-label={`Còn ${session.lives ?? 0} mạng`}>
                <Heart size={14} className="fill-current" /> {session.lives ?? 0}
              </span>
            </div>
          )}

          <span
            className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-practice-yellow bg-practice-blue-dark text-lg font-extrabold text-practice-light ring-3 ring-practice-ink/40"
            title="Số câu trả lời đúng"
          >
            {session.finalCorrectCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className={`${glassBtn} hidden size-8 sm:inline-flex`}
            aria-label="Xem trợ giúp"
            onClick={() => setSettings(true)}
          >
            <CircleHelp size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`${glassBtn} shrink-0 outline-2 outline-offset-[3px] outline-practice-light/65`}
            aria-label="Cài đặt trò chơi"
            onClick={() => setSettings(true)}
          >
            <SlidersHorizontal size={19} />
          </Button>
        </header>

        {/* Hàng chính: [mascot + câu hỏi] bên trái, [danh sách câu hỏi] bên phải */}
        <div
          className={
            complete
              ? "mt-6 flex flex-1 items-center justify-center py-4"
              : "mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_248px]"
          }
        >
          <div
            className={
              complete
                ? "w-full max-w-[760px]"
                : "grid items-start gap-5 sm:grid-cols-[140px_minmax(0,1fr)]"
            }
          >
            {!complete && (
              <aside className="flex items-center gap-3 max-sm:order-2 max-sm:justify-center sm:mt-11 sm:flex-col sm:gap-2">
                <div
                  className="relative rounded-[18px] bg-practice-paper px-3 py-3 text-center text-xs leading-5 shadow-[0_4px_0_var(--color-practice-border)] max-sm:max-w-[200px] after:absolute after:top-full after:left-[calc(50%-10px)] after:border-[10px] after:border-transparent after:border-t-practice-paper after:content-[''] max-sm:after:top-[calc(50%-10px)] max-sm:after:left-full max-sm:after:border-t-transparent max-sm:after:border-l-practice-paper"
                  aria-live="polite"
                >
                  {mascotText}
                </div>
                <img
                  src={mascot.src}
                  alt="Việt Cường đang cổ vũ bạn"
                  width={816}
                  height={816}
                  className="size-20 object-contain sm:size-32"
                />
              </aside>
            )}
            <div className={`${card} rounded-[24px] p-[18px] sm:p-5`}>
              {complete ? (
                <PracticeResult
                  session={session}
                  picks={picks}
                  revealed={Object.fromEntries(
                    Object.entries(feedbacks).map(([id, f]) => [
                      id,
                      f.answerRevealed ? { correctAnswer: f.correctAnswer, explanation: f.explanation } : {},
                    ]),
                  )}
                  onRetry={retry}
                />
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                      Câu {index + 1}/{questions.length}
                    </span>
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                      {TYPE_LABEL[question.type]}
                    </span>
                  </div>
                  <h1 className="mb-4 text-xl font-extrabold leading-7">{question.content}</h1>

                  <HintStatus
                    pending={hinting && hintMutation.variables?.questionId === question.id}
                    slow={hintSlow}
                    error={hintError}
                    onRetry={() => sendHint({ questionId: question.id })}
                  />
                  <HintPanel
                    open={hintOpen}
                    text={hintText ?? ""}
                    onClose={() => setHintOpenFor(null)}
                  />

                  {isChoice(question) || question.type === "TRUE_FALSE" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {choiceOptions.map((option, i) => (
                        <Button
                          key={`${question.id}-${option.key}`}
                          variant="outline"
                          className={`${answerBase} ${answerClass(option.key)} min-h-[74px] justify-start whitespace-normal gap-2 px-3 py-3 text-left text-sm font-normal leading-6`}
                          disabled={locked || answering}
                          aria-pressed={draft.includes(option.key)}
                          onClick={() => pick(option.key)}
                        >
                          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-practice-border bg-practice-light text-sm text-practice-subtle">
                            {locked && correctKeys.includes(option.key.toUpperCase()) ? (
                              <Check size={16} />
                            ) : (
                              String.fromCharCode(65 + i)
                            )}
                          </span>
                          <span className="text-body-sm">{option.content}</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <input
                      value={draft[0] ?? ""}
                      disabled={locked || answering}
                      onChange={(event) => setDraft(question.id, () => [event.target.value])}
                      aria-label="Đáp án của bạn"
                      placeholder="Nhập đáp án"
                      className="h-14 w-full rounded-2xl border-2 border-practice-border bg-practice-light px-4 text-base font-semibold shadow-[0_3px_0_var(--color-practice-border)] outline-none transition-colors focus:border-practice-blue disabled:opacity-70"
                    />
                  )}

                  <div aria-live="polite">
                    {answering && answerSlow && (
                      <p role="status" className="mt-4 text-sm font-semibold">
                        Máy chủ phản hồi chậm, đáp án của bạn đang được kiểm tra…
                      </p>
                    )}
                    {answerMutation.isError && !answering && (
                      <p role="alert" className="mt-4 text-sm font-bold text-practice-bad">
                        {answerMutation.error.message} Đáp án của bạn vẫn được giữ, hãy bấm Kiểm tra để thử lại.
                      </p>
                    )}
                    {finish.isError && (
                      <p role="alert" className="mt-4 text-sm font-bold text-practice-bad">
                        {finish.error.message}
                      </p>
                    )}
                    {feedback && (
                      <div className="mt-4 text-sm font-bold">
                        {feedback.correct ? (
                          <p className="text-practice-good">Chính xác! Bạn làm tốt lắm.</p>
                        ) : feedback.retryAvailable ? (
                          <p className="text-practice-bad">Chưa đúng. Bạn còn một lần thử lại.</p>
                        ) : (
                          <p className="text-practice-bad">
                            Chưa đúng.{revealedText && ` Đáp án đúng: ${revealedText}`}
                          </p>
                        )}
                        {feedback.answerRevealed && feedback.explanation && (
                          <p className="mt-1 font-normal text-practice-subtle">{feedback.explanation}</p>
                        )}
                      </div>
                    )}
                    {finished && (
                      <div
                        role="status"
                        className="mt-4 rounded-2xl border-2 border-practice-blue bg-practice-hint px-3.5 py-3 text-sm font-extrabold text-practice-ink"
                      >
                        {gameOver
                          ? "Bạn đã hết mạng. Bấm “Xem kết quả” để xem bài làm của mình."
                          : "🎉 Bạn đã hoàn thành bài luyện tập! Bấm “Hoàn thành” để xem kết quả."}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {!complete && <QuestionNavigator {...navProps} />}
        </div>

        <footer className="mt-auto flex items-center justify-between gap-3 ">
          <div className="flex items-center gap-2">
            {!complete && <QuestionNavigatorSheet {...navProps} onOpenChange={setNavOpen} />}
          </div>
          {!complete && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                className={`${paperBtn} px-3`}
                disabled={index === 0 || tryHard}
                onClick={goPrev}
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Câu trước</span>
              </Button>
              <Button
                variant="outline"
                className={`${paperBtn} px-3`}
                disabled={locked || answering || draft.length === 0}
                onClick={reset}
              >
                Làm lại
              </Button>
              {!over && (
                <Button
                  variant="outline"
                  className={`${paperBtn} px-3`}
                  disabled={answering || finish.isPending}
                  onClick={submitEarly}
                >
                  <Send size={14} />
                  {finish.isPending ? "Đang nộp…" : "Nộp bài"}
                </Button>
              )}
              {showCheck ? (
                <Button className={nextBtn} disabled={!canSubmit} onClick={submit}>
                  {answering ? "Đang kiểm tra…" : retryLabel}
                  <Check size={16} />
                </Button>
              ) : over && locked ? (
                <Button className={nextBtn} onClick={() => setShowResult(true)}>
                  {gameOver ? "Xem kết quả" : "Hoàn thành"}
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button className={nextBtn} disabled={(tryHard && !locked) || !nextOpen} onClick={goNext}>
                  Câu tiếp
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          )}
        </footer>
      </div>
      <PracticeSettings open={settings} onOpenChange={setSettings} background={background} onBackgroundChange={setBackground} />
    </section>
  );
}