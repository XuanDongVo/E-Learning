"use client";

import React, { useState } from "react";
import {
  Compass,
  BookOpen,
  Zap,
  RotateCw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Pin,
  Heart,
  Sparkles,
  Flame,
} from "lucide-react";
import { sounds } from "./sound-effects";

interface SampleQuestion {
  id: number;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

const QUESTION_BANK_SAMPLES: SampleQuestion[] = [
  {
    id: 1,
    topic: "Grade 6 • Unit 2 • My House • Topic: Rooms & Furniture",
    prompt: "Where do we usually cook meals for the family?",
    options: ["In the kitchen", "In the attic", "On the roof", "In the garage"],
    correctIndex: 0,
    hint: "Từ vựng chỉ căn phòng ấm cúng có bếp nấu và tủ lạnh.",
  },
  {
    id: 2,
    topic: "Grade 7 • Unit 4 • Music & Arts • Topic: Musical Instruments",
    prompt: "She plays the _____ very well in the school club.",
    options: ["acoustic guitar", "paintbrush", "portrait", "museum"],
    correctIndex: 0,
    hint: "Chọn danh từ chỉ nhạc cụ dây duy nhất trong 4 đáp án.",
  },
  {
    id: 3,
    topic: "Grade 8 • Unit 1 • Leisure Time • Topic: Free-time Activities",
    prompt: "My brother enjoys _____ origami with colorful paper.",
    options: ["making", "playing", "going", "riding"],
    correctIndex: 0,
    hint: "Cụm cố định với nghệ thuật gấp giấy Nhật Bản: make origami.",
  },
];

export default function Scene02ExploreWorld() {
  const [selectedMode, setSelectedMode] = useState<"learning" | "tryhard">(
    "learning"
  );
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hearts, setHearts] = useState(3);

  const currentQuestion = QUESTION_BANK_SAMPLES[questionIdx];

  const handleDrawNewQuestion = () => {
    sounds.playPageTurn();
    setSelectedOption(null);
    setShowHint(false);
    setQuestionIdx((prev) => (prev + 1) % QUESTION_BANK_SAMPLES.length);
  };

  const handleSelectOption = (idx: number) => {
    sounds.playWoodClick();
    setSelectedOption(idx);
    if (selectedMode === "tryhard" && idx !== currentQuestion.correctIndex) {
      setHearts((prev) => Math.max(0, prev - 1));
    }
  };

  const handleToggleMode = (mode: "learning" | "tryhard") => {
    sounds.playStampThud();
    setSelectedMode(mode);
    setSelectedOption(null);
    setShowHint(false);
    if (mode === "tryhard") {
      setHearts(3);
    }
  };

  return (
    <section
      id="kham-pha"
      aria-labelledby="scene02-heading"
      className="relative mx-auto mt-16 max-w-[1380px] px-3 sm:mt-24 sm:px-6"
    >
      {/* Khung phong cảnh giấy mở ra từ trang sách */}
      <div className="relative overflow-hidden rounded-[32px] bg-parchment-light ink-border-lg p-6 sm:p-10 lg:p-14">
        {/* Washi tape đính trên đỉnh trang */}
        <div
          aria-hidden="true"
          className="washi-tape pointer-events-none absolute -top-2 right-20 z-20 h-7 w-36 rotate-2 shadow-sm"
        />

        {/* Phần mở đầu Section */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-sage-light px-4 py-1.5 font-mono text-xs font-bold text-sage-dark ink-border-sm shadow-ink-sm">
            MỖI BÀI HỌC LÀ MỘT KHÁM PHÁ MỚI
          </span>
          <h2
            id="scene02-heading"
            className="mt-4 font-display text-3xl font-bold text-ink sm:text-5xl"
          >
            Hôm nay, bạn muốn khám phá điều gì?
          </h2>
          <p className="mt-4 font-sans text-base font-semibold leading-relaxed text-ink-muted sm:text-lg">
            Chọn chủ đề bạn yêu thích, luyện tập với nhiều dạng câu hỏi và khám
            phá kiến thức theo nhịp độ của riêng mình.
          </p>
        </div>

        {/* Con đường vẽ tay nối 3 biển chỉ dẫn (Không khóa tuyến tính) */}
        <div className="relative mt-12">
          <svg
            aria-hidden="true"
            viewBox="0 0 1100 110"
            className="pointer-events-none absolute top-1/2 left-0 hidden w-full -translate-y-1/2 lg:block"
            fill="none"
          >
            <path
              d="M70 65 C290 10, 460 115, 560 55 C680 0, 860 105, 1030 45"
              stroke="#261E19"
              strokeWidth="3.5"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
          </svg>

          {/* Ba biển chỉ dẫn phong cách mộc mạc thủ công */}
          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {/* Biển 1: Khám phá theo chủ đề */}
            <div className="group relative rounded-2xl bg-parchment-warm p-6 ink-border shadow-ink transition-all duration-200 hover:-translate-y-1.5 hover:rotate-[-1.5deg] hover:shadow-ink-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-star-light ink-border-sm shadow-ink-sm">
                  <Compass className="h-6 w-6 text-ink" />
                </span>
                <span className="font-mono text-xs font-bold text-ink-muted">
                  PHÂN CẤP RÕ RÀNG
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                Khám phá theo chủ đề
              </h3>
              <p className="mt-3 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                Nội dung tiếng Anh được tổ chức mạch lạc theo khối lớp (Grade 6–8),
                Unit, Section và từng Topic cụ thể để học sinh dễ dàng tra cứu.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-parchment-light px-2.5 py-1 font-mono text-xs font-bold text-ink border border-ink/30">
                  Grade 6 • 7 • 8
                </span>
                <span className="rounded-lg bg-parchment-light px-2.5 py-1 font-mono text-xs font-bold text-ink border border-ink/30">
                  Unit & Topic
                </span>
              </div>
            </div>

            {/* Biển 2: Luyện tập đa dạng */}
            <div className="group relative rounded-2xl bg-parchment-warm p-6 ink-border shadow-ink transition-all duration-200 hover:-translate-y-1.5 hover:rotate-[1.5deg] hover:shadow-ink-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-light ink-border-sm shadow-ink-sm">
                  <BookOpen className="h-6 w-6 text-ink" />
                </span>
                <span className="font-mono text-xs font-bold text-ink-muted">
                  NGÂN HÀNG CÂU HỎI
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                Luyện tập đa dạng
              </h3>
              <p className="mt-3 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                Các Activity được tạo từ kho câu hỏi phong phú. Mỗi lượt luyện tập
                tự động chọn tập câu hỏi linh hoạt, giúp bạn không bị nhàm chán.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-parchment-light px-2.5 py-1 font-mono text-xs font-bold text-ink border border-ink/30">
                  Trắc nghiệm
                </span>
                <span className="rounded-lg bg-parchment-light px-2.5 py-1 font-mono text-xs font-bold text-ink border border-ink/30">
                  Điền từ
                </span>
                <span className="rounded-lg bg-parchment-light px-2.5 py-1 font-mono text-xs font-bold text-ink border border-ink/30">
                  Nối cặp
                </span>
              </div>
            </div>

            {/* Biển 3: Hai cách thử sức */}
            <div className="group relative rounded-2xl bg-parchment-warm p-6 ink-border shadow-ink transition-all duration-200 hover:-translate-y-1.5 hover:rotate-[-1deg] hover:shadow-ink-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta-light ink-border-sm shadow-ink-sm">
                  <Zap className="h-6 w-6 text-ink" />
                </span>
                <span className="font-mono text-xs font-bold text-ink-muted">
                  CHẾ ĐỘ THỬ THÁCH
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                Hai cách thử sức
              </h3>
              <p className="mt-3 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                Linh hoạt lựa chọn nhịp học phù hợp với bạn: học tập thong thả với
                gợi ý, hoặc thử thách bản thân với giới hạn thời gian và số lượt sai.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-sage-light px-2.5 py-1 font-mono text-xs font-bold text-sage-dark border border-sage/40">
                  Learning Mode
                </span>
                <span className="rounded-lg bg-terracotta-light px-2.5 py-1 font-mono text-xs font-bold text-terracotta-dark border border-terracotta/40">
                  Try Hard Mode
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
           HỘP TƯƠNG TÁC THỬ NGHIỆM: LEARNING MODE VS TRY HARD MODE
           ========================================================= */}
        <div className="mt-12 rounded-2xl bg-parchment p-6 ink-border shadow-ink sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-dashed border-ink/25 pb-5 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs font-bold tracking-wider text-terracotta uppercase">
                BẢN XEM TRƯỚC HOẠT ĐỘNG THỰC TẾ
              </span>
              <h4 className="mt-1 font-display text-2xl font-bold text-ink">
                Trải nghiệm câu hỏi luyện tập tương tác
              </h4>
            </div>

            {/* Nút chuyển đổi chế độ thủ công */}
            <div className="inline-flex rounded-xl bg-parchment-deep p-1.5 ink-border-sm">
              <button
                type="button"
                onClick={() => handleToggleMode("learning")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-display text-base font-bold transition-all ${
                  selectedMode === "learning"
                    ? "bg-sage text-parchment-light ink-border-sm shadow-sm"
                    : "text-ink hover:text-sage-dark"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Learning Mode</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode("tryhard")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-display text-base font-bold transition-all ${
                  selectedMode === "tryhard"
                    ? "bg-terracotta text-parchment-light ink-border-sm shadow-sm"
                    : "text-ink hover:text-terracotta"
                }`}
              >
                <Flame className="h-4 w-4" />
                <span>Try Hard Mode</span>
              </button>
            </div>
          </div>

          {/* Nội dung câu hỏi xem trước */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-ink-muted">
              <span className="rounded bg-parchment-warm px-3 py-1 font-mono border border-ink/20">
                {currentQuestion.topic}
              </span>
              <div className="flex items-center gap-3">
                {selectedMode === "tryhard" ? (
                  <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-terracotta">
                    <span>Mạng sống:</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-4 w-4 ${
                            i < hearts
                              ? "fill-terracotta text-terracotta"
                              : "text-ink/30"
                          }`}
                        />
                      ))}
                    </span>
                    <span>({hearts}/3)</span>
                  </div>
                ) : (
                  <span className="font-mono text-xs font-bold text-sage">
                    Không giới hạn thời gian & lượt sai
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleDrawNewQuestion}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-parchment-warm px-3 py-1 font-mono text-xs font-bold text-ink border border-ink/30 transition-all hover:bg-star-light active:scale-95"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Đổi câu hỏi khác</span>
                </button>
              </div>
            </div>

            {/* Câu hỏi */}
            <p className="mt-4 font-sans text-xl font-bold text-ink">
              {currentQuestion.prompt}
            </p>

            {/* Các phương án lựa chọn */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let btnStyle = "bg-parchment-light text-ink hover:bg-star-light";
                if (isSelected) {
                  if (isCorrect) {
                    btnStyle = "bg-sage-light text-sage-dark border-sage font-bold";
                  } else {
                    btnStyle =
                      "bg-terracotta-light text-terracotta-dark border-terracotta font-bold";
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`flex items-center justify-between rounded-xl p-3.5 text-left font-sans text-base font-semibold border-2 border-ink transition-all ${btnStyle}`}
                  >
                    <span>
                      {String.fromCharCode(65 + idx)}. {opt}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-sm font-bold">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-sage-dark" />
                            <span>Chính xác!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-terracotta-dark" />
                            <span>Chưa đúng</span>
                          </>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Phần gợi ý trong Learning Mode */}
            {selectedMode === "learning" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sage-light/60 p-3.5 border border-sage/40">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-sage-dark shrink-0" />
                  <span className="font-sans text-sm font-semibold text-sage-dark">
                    {showHint
                      ? currentQuestion.hint
                      : "Bạn đang ở Learning Mode. Có thể mở gợi ý nếu cần trợ giúp."}
                  </span>
                </div>
                {!showHint && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWoodClick();
                      setShowHint(true);
                    }}
                    className="font-mono text-xs font-bold text-sage-dark underline hover:text-ink"
                  >
                    Xem gợi ý
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
           NOTE SCRAPBOOK: QUY TẮC ĐỘC LẬP GIỮA ACTIVITY VÀ ASSIGNMENT
           ========================================================= */}
        <div className="relative mt-10 rounded-2xl bg-star-light/50 p-6 ink-border shadow-ink-sm">
          <div
            aria-hidden="true"
            className="washi-tape-blush pointer-events-none absolute -top-3 left-8 h-6 w-32 -rotate-3"
          />
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-star ink-border-sm">
              <Pin className="h-5 w-5 text-ink" />
            </span>
            <div className="flex flex-col">
              <h4 className="font-display text-xl font-bold text-ink">
                Lưu ý quan trọng: Activity và Assignment là hai khái niệm độc lập
              </h4>
              <p className="mt-2 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                <strong className="text-sage-dark">Activity</strong> là hoạt động
                luyện tập tự do, có thể làm lại nhiều lần với câu hỏi ngẫu nhiên từ
                ngân hàng đề mà không bị khóa tuyến tính. Trong khi đó,{" "}
                <strong className="text-terracotta">Assignment</strong> là bài tập
                chính thức do giáo viên giao với lịch nộp bài, thời hạn và quy tắc
                chấm điểm xác định.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
