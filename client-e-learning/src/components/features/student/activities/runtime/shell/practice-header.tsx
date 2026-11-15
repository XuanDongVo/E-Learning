"use client";

import {
  ArrowLeft,
  CircleHelp,
  Clock3,
  Heart,
  Lightbulb,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PracticeController } from "../controller/use-practice-controller";

const quietButton = "student-control student-control--quiet";

export function PracticeHeader({
  controller,
}: {
  controller: PracticeController;
}) {
  const {
    complete,
    finish,
    hintAvailable,
    hintOpen,
    hinting,
    index,
    leave,
    questions,
    requestHint,
    secondsLeft,
    session,
    setSettings,
    tryHard,
  } = controller;
  if (!session) return null;

  return (
    <header className="flex items-center gap-3 max-sm:gap-2">
      <Button
        variant="outline"
        className={`${quietButton} shrink-0 px-3`}
        onClick={leave}
        disabled={finish.isPending}
      >
        <ArrowLeft size={16} />
        <span>{finish.isPending ? "Đang thoát…" : "Quay lại"}</span>
      </Button>
      <div
        className="h-2.5 min-w-6 flex-1 overflow-hidden rounded-full bg-primary-foreground/25"
        role="progressbar"
        aria-label="Tiến độ luyện tập"
        aria-valuenow={index + 1}
        aria-valuemin={0}
        aria-valuemax={questions.length}
      >
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>
      {hintAvailable ? (
        <Button
          variant="outline"
          aria-pressed={hintOpen}
          aria-busy={hinting}
          disabled={hinting}
          className={`${hintOpen ? "border-accent bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground" : quietButton} px-3`}
          onClick={requestHint}
        >
          <Lightbulb size={16} />
          <span className={hinting ? "" : "hidden sm:inline"}>
            {hinting ? "Đang mở gợi ý…" : "Gợi ý"}
          </span>
        </Button>
      ) : null}
      {tryHard && !complete ? (
        <div className="flex shrink-0 items-center gap-3 rounded-full bg-foreground/25 px-3 py-1.5 text-sm font-extrabold text-primary-foreground">
          {secondsLeft !== undefined ? (
            <span
              className={`flex items-center gap-1 ${secondsLeft <= 5 ? "text-accent" : ""}`}
            >
              <Clock3 size={14} /> {secondsLeft}s
            </span>
          ) : null}
          <span
            className="flex items-center gap-1"
            aria-label={`Còn ${session.lives ?? 0} mạng`}
          >
            <Heart size={14} className="fill-current" /> {session.lives ?? 0}
          </span>
        </div>
      ) : null}
      <span
        className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-accent bg-foreground/25 text-lg font-extrabold text-primary-foreground ring-3 ring-foreground/40"
        title="Số câu trả lời đúng"
      >
        {session.finalCorrectCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        className={`${quietButton} hidden size-8 sm:inline-flex`}
        aria-label="Xem trợ giúp"
        onClick={() => setSettings(true)}
      >
        <CircleHelp size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${quietButton} shrink-0 outline-2 outline-offset-[3px] outline-primary-foreground/65`}
        aria-label="Cài đặt trò chơi"
        onClick={() => setSettings(true)}
      >
        <SlidersHorizontal size={19} />
      </Button>
    </header>
  );
}
