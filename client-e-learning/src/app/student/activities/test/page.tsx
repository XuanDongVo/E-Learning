"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Headphones,
  Play,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PracticeSettings } from "./practice-setting";
import { PracticeResult } from "./practice-result";
import {
  QuestionNavigator,
  QuestionNavigatorSheet,
} from "./question-navigator";
import garden from "../../../../../public/assets/practice-garden.jpg";
import mascot from "../../../../../public/assets/practice-mascot.png";
import gardenScene from "../../../../../public/assets/practice-q-garden.jpg";
import { HintPanel } from "./hint-panel";

type Media = { image?: string; imageAlt?: string; audio?: string };

/* ---------- Tailwind class tokens (thay cho các class .practice-* trong CSS) ---------- */
const glassBtn =
  "text-practice-light bg-practice-blue/28 border-practice-light/30 hover:bg-practice-blue/65 hover:text-practice-light";
const paperBtn =
  "text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] hover:bg-practice-light hover:text-practice-ink";
const blueBtn =
  "text-practice-light bg-practice-blue shadow-[0_2px_0_var(--color-practice-blue-dark)] hover:text-practice-light hover:bg-practice-blue-dark";
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

const questions: {
  word: string;
  type: string;
  prompt?: string;
  options: readonly string[];
  correct: number;
  hint: string;
  media?: Media;
}[] = [
  {
    word: "back up",
    type: "phrase",
    options: [
      "hoàn thành thành công dù có khó khăn",
      "tình cờ gặp/tìm thấy",
      "lùi lại; xác nhận/ủng hộ; sao lưu dự phòng",
      "trả lại; mang/đưa về",
    ],
    correct: 2,
    hint: "Khi lưu một bản sao dữ liệu, bạn đang làm gì?",
  },
  {
    word: "water the plants",
    type: "picture",
    prompt: "Bạn nhỏ trong ảnh đang làm gì?",
    options: [
      "She is watering the plants.",
      "She is picking flowers.",
      "She is reading a book.",
      "She is cooking dinner.",
    ],
    correct: 0,
    hint: "Nhìn vào bình tưới trên tay bạn ấy.",
    media: {
      image: gardenScene.src,
      imageAlt: "Bạn nhỏ cầm bình tưới cây trong vườn",
    },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "give up",
    type: "listening",
    prompt: "Nghe đoạn audio và chọn nghĩa đúng của cụm từ được nhắc tới.",
    options: ["tặng quà", "thức dậy", "từ bỏ", "đưa lên"],
    correct: 2,
    hint: "Đừng làm điều này khi gặp một câu hỏi khó!",
    media: { audio: "Never give up when the question is hard." },
  },
  {
    word: "look after",
    type: "picture + listening",
    prompt: "Nghe câu mô tả, nhìn ảnh rồi chọn câu trả lời phù hợp nhất.",
    options: [
      "She looks after the garden every morning.",
      "She looks for her lost cat.",
      "She looks forward to the holiday.",
      "She looks back at the house.",
    ],
    correct: 0,
    hint: "Chăm sóc khu vườn mỗi sáng.",
    media: {
      image: gardenScene.src,
      imageAlt: "Bạn nhỏ chăm sóc vườn hoa",
      audio: "Every morning, she looks after the garden.",
    },
  },
];

export default function PracticePage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [hint, setHint] = useState(false);
  const [settings, setSettings] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState("Learning");
  const [background, setBackground] = useState("garden");
  const [complete, setComplete] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Đếm thời gian làm bài, dừng khi hoàn thành
  useEffect(() => {
    if (complete) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [complete]);

  // Chỉ tính các câu đã bấm "Kiểm tra" vào kết quả
  const checkedAnswers = Object.fromEntries(
    Object.entries(answers).filter(([k]) => checked[Number(k)]),
  ) as Record<number, number>;

  const retry = () => {
    setAnswers({});
    setChecked({});
    setIndex(0);
    setSeconds(0);
    setComplete(false);
    setHint(false);
  };
  const question = (questions[index] ?? questions[0])!;
  const selected = answers[index];
  const isChecked = checked[index] ?? false;
  const correctCount = questions.filter(
    (q, i) => checked[i] && answers[i] === q.correct,
  ).length;
  const reset = useCallback(() => {
    setAnswers((a) => {
      const next = { ...a };
      delete next[index];
      return next;
    });
    setChecked((c) => ({ ...c, [index]: false }));
    setHint(false);
  }, [index]);
  const tryHard = mode === "Try Hard";
  const canJump = (i: number) =>
    !tryHard ||
    i <=
      Math.max(
        0,
        ...Object.keys(checked)
          .filter((k) => checked[Number(k)])
          .map(Number)
          .map((n) => n + 1),
      );
  const move = useCallback(
    (delta: number) => {
      if (tryHard && delta < 0) return;
      setIndex((i) => Math.max(0, Math.min(questions.length - 1, i + delta)));
      setHint(false);
    },
    [tryHard],
  );
  const submit = useCallback(() => {
    if (selected !== undefined) setChecked((c) => ({ ...c, [index]: true }));
  }, [index, selected]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (settings || complete || navOpen) return;
      if (event.ctrlKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setHint(true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!tryHard || isChecked) move(1);
      } else if (event.key === "Escape") reset();
      else if (event.key === "Enter") {
        event.preventDefault();
        submit();
      } else if (/^[1-4]$/.test(event.key) && !isChecked)
        setAnswers((a) => ({ ...a, [index]: Number(event.key) - 1 }));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    settings,
    complete,
    navOpen,
    move,
    reset,
    submit,
    index,
    isChecked,
    tryHard,
  ]);
  function playAudio(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
  function speak() {
    if (muted || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(question.word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  const answerClass = (i: number) => {
    if (isChecked && i === question.correct) return answerCorrect;
    if (isChecked && selected === i) return answerWrong;
    if (!isChecked && selected === i) return answerSelected;
    return "";
  };

  const navProps = {
    questions,
    index,
    answers,
    checked,
    tryHard,
    isLocked: (i: number) => !canJump(i) || (tryHard && i < index),
    onSelect: (i: number) => {
      setIndex(i);
      setHint(false);
    },
  };

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
            asChild
            variant="outline"
            className={`${glassBtn} shrink-0 px-3`}
          >
            <Link href="/activities">
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </Link>
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
          <Button
            variant="outline"
            size="icon"
            className={`size-9 rounded-full bg-practice-paper border-practice-border hover:bg-practice-paper ${favorite ? "text-practice-yellow hover:text-practice-yellow" : "text-practice-subtle hover:text-practice-subtle"}`}
            aria-label="Đánh dấu câu hỏi"
            aria-pressed={favorite}
            onClick={() => setFavorite((v) => !v)}
          >
            <Star size={22} fill={favorite ? "currentColor" : "none"} />
          </Button>
          <Button
            variant="outline"
            aria-pressed={hint}
            className={`${hint ? "bg-practice-yellow text-practice-ink border-practice-yellow hover:bg-practice-yellow hover:text-practice-ink" : glassBtn} px-3`}
            onClick={() => setHint((v) => !v)}
          >
            <Lightbulb size={16} />
            <span className="hidden sm:inline">Gợi ý</span>
          </Button>
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-practice-yellow bg-practice-blue-dark text-lg font-extrabold text-practice-light ring-3 ring-practice-ink/40"
            title="Số câu trả lời đúng"
          >
            {correctCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className={`${glassBtn} hidden size-8 sm:inline-flex`}
            aria-label="Xem trợ giúp"
            onClick={() => {
              setSettings(true);
            }}
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
                
                {isChecked
                  ? selected === question.correct
                    ? "Giỏi quá! Việt Cường tự hào về bạn!"
                    : "Không sao đâu, mình thử lại nhé!"
                  : hint
                    ? "Việt Cường vừa gợi ý rồi, xem trong khung câu hỏi nhé!"
                    : "Thấy bạn suy nghĩ lâu Việt Cường cũng hồi hộp lây nè!"}
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
                  questions={questions}
                  answers={checkedAnswers}
                  mode={mode}
                  seconds={seconds}
                  onRetry={retry}
                />
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                      Câu {index + 1}/{questions.length}
                    </span>
                    {question.media?.image && (
                      <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1">
                        <ImageIcon size={13} />
                        Hình ảnh
                      </span>
                    )}
                    {question.media?.audio && (
                      <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1">
                        <Headphones size={13} />
                        Audio
                      </span>
                    )}
                  </div>
                  <h1 className="mb-4 text-xl font-extrabold leading-7">
                    {question.prompt ?? (
                      <>
                        Từ{" "}
                        <span className="text-practice-blue">
                          {question.word}
                        </span>{" "}
                        ({question.type}) có nghĩa nào sau đây?
                      </>
                    )}
                  </h1>
                  <HintPanel
                    open={hint && !isChecked}
                    text={question.hint}
                    onClose={() => setHint(false)}
                  />
                  {question.media && (
                    <div
                      className={`mb-5 grid gap-3 ${question.media.image && question.media.audio ? "sm:grid-cols-[1.4fr_1fr]" : ""}`}
                    >
                      {question.media.image && (
                        <figure className="overflow-hidden rounded-2xl border bg-card">
                          <img
                            src={question.media.image}
                            alt={question.media.imageAlt ?? ""}
                            width={1024}
                            height={640}
                            loading="lazy"
                            className="aspect-[16/10] w-full object-cover"
                          />
                        </figure>
                      )}
                      {question.media.audio && (
                        <div className="border bg-secondary text-secondary-foreground flex flex-col justify-center gap-3 rounded-2xl p-4">
                          <div className="flex items-center gap-3">
                            <Button
                              className={`${blueBtn} size-12 shrink-0 rounded-full`}
                              size="icon"
                              aria-label="Phát audio"
                              onClick={() => playAudio(question.media!.audio!)}
                            >
                              <Play size={20} />
                            </Button>
                            <div
                              className="flex h-10 flex-1 items-center gap-[3px]"
                              aria-hidden
                            >
                              {Array.from({ length: 28 }, (_, b) => (
                                <span
                                  key={b}
                                  className="w-1 rounded-full bg-practice-green"
                                  style={{ height: `${25 + ((b * 37) % 70)}%` }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>Nghe tối đa 3 lần</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => playAudio(question.media!.audio!)}
                            >
                              <RotateCcw size={12} />
                              Nghe lại
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, i) => (
                      <Button
                        key={`${index}-${i}`}
                        variant="outline"
                        className={`${answerBase} ${answerClass(i)} min-h-[74px] justify-start whitespace-normal gap-2 px-3 py-3 text-left text-sm font-normal leading-6`}
                        disabled={isChecked}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [index]: i }))
                        }
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-practice-border bg-practice-light text-sm text-practice-subtle">
                          {isChecked && i === question.correct ? (
                            <Check size={16} />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </span>
                        <span className="text-body-sm">{option}</span>
                      </Button>
                    ))}
                  </div>
                  <div aria-live="polite">
                    {isChecked && (
                      <p
                        className={`mt-4 text-sm font-bold ${selected === question.correct ? "text-practice-good" : "text-practice-bad"}`}
                      >
                        {selected === question.correct
                          ? "Chính xác! Bạn làm tốt lắm."
                          : `Đáp án đúng: ${String.fromCharCode(65 + question.correct)}. ${question.options[question.correct]}`}
                      </p>
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
            <Button
              variant="outline"
              size="icon"
              className={`${paperBtn} shrink-0`}
              aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              onClick={() => {
                setMuted((v) => !v);
                if (muted) speak();
              }}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            {!complete && (
              <QuestionNavigatorSheet {...navProps} onOpenChange={setNavOpen} />
            )}
          </div>
          {!complete && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                className={`${paperBtn} px-3`}
                disabled={index === 0 || tryHard}
                onClick={() => move(-1)}
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Câu trước</span>
              </Button>
              <Button
                variant="outline"
                className={`${paperBtn} px-3`}
                onClick={reset}
              >
                Làm lại
              </Button>
              {selected !== undefined && !isChecked ? (
                <Button
                  className={nextBtn}
                  onClick={() => {
                    submit();
                    speak();
                  }}
                >
                  Kiểm tra
                  <Check size={16} />
                </Button>
              ) : (
                <Button
                  className={nextBtn}
                  disabled={tryHard && !isChecked}
                  onClick={() => {
                    if (index === questions.length - 1) setComplete(true);
                    else move(1);
                  }}
                >
                  {index === questions.length - 1 ? "Hoàn thành" : "Câu tiếp"}
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          )}
        </footer>
      </div>
      <PracticeSettings
        open={settings}
        onOpenChange={setSettings}
        background={background}
        onBackgroundChange={setBackground}
      />
    </section>
  );
}