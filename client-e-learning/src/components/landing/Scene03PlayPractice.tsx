"use client";

import React, { useState } from "react";
import { LANDING_ROUTES } from "@/config/landing-routes";
import { sounds } from "./sound-effects";

interface BubbleWord {
  id: string;
  word: string;
  meaning: string;
  x: string;
  y: string;
  color: string;
}

const INITIAL_BUBBLES: BubbleWord[] = [
  {
    id: "b1",
    word: "Adventure",
    meaning: "Chuyến phiêu lưu",
    x: "8%",
    y: "14%",
    color: "#F9DF94",
  },
  {
    id: "b2",
    word: "Curious",
    meaning: "Tò mò, ham học hỏi",
    x: "54%",
    y: "12%",
    color: "#DCE8D8",
  },
  {
    id: "b3",
    word: "Journey",
    meaning: "Hành trình",
    x: "26%",
    y: "44%",
    color: "#F8DCD2",
  },
  {
    id: "b4",
    word: "Brilliant",
    meaning: "Rực rỡ, xuất sắc",
    x: "62%",
    y: "48%",
    color: "#FAF6EC",
  },
  {
    id: "b5",
    word: "Treasure",
    meaning: "Kho báu tri thức",
    x: "14%",
    y: "70%",
    color: "#FBE5E0",
  },
];

interface RainWord {
  id: string;
  word: string;
  meaning: string;
  left: string;
  delay: string;
}

const RAIN_WORDS: RainWord[] = [
  {
    id: "r1",
    word: "Moonlight",
    meaning: "Ánh trăng huyền ảo",
    left: "10%",
    delay: "0s",
  },
  {
    id: "r2",
    word: "Blossom",
    meaning: "Đóa hoa sen nở",
    left: "35%",
    delay: "1.1s",
  },
  {
    id: "r3",
    word: "Breeze",
    meaning: "Làn gió đêm nhẹ",
    left: "60%",
    delay: "0.5s",
  },
  {
    id: "r4",
    word: "Harmony",
    meaning: "Sự thanh bình, hài hòa",
    left: "82%",
    delay: "1.7s",
  },
];

export default function Scene03PlayPractice() {
  const [poppedIds, setPoppedIds] = useState<string[]>([]);
  const [lastPopped, setLastPopped] = useState<BubbleWord | null>(null);
  const [selectedRain, setSelectedRain] = useState<RainWord>(RAIN_WORDS[0]);
  const [rippleAnim, setRippleAnim] = useState(false);

  const handlePopBubble = (bubble: BubbleWord) => {
    if (!poppedIds.includes(bubble.id)) {
      sounds.playBubblePop();
      setPoppedIds((prev) => [...prev, bubble.id]);
      setLastPopped(bubble);
    }
  };

  const handleResetBubbles = () => {
    sounds.playWoodClick();
    setPoppedIds([]);
    setLastPopped(null);
  };

  const handleSelectRain = (item: RainWord) => {
    sounds.playWaterChime();
    setSelectedRain(item);
    setRippleAnim(true);
    setTimeout(() => setRippleAnim(false), 800);
  };

  return (
    <section
      id="tro-choi"
      aria-labelledby="scene03-heading"
      className="relative mx-auto mt-16 max-w-[1380px] px-3 sm:mt-24 sm:px-6"
    >
      <div className="relative overflow-hidden rounded-[32px] bg-parchment-warm ink-border-lg p-6 sm:p-10 lg:p-14">
        {/* Header của Section */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-star-light px-4 py-1.5 font-mono text-xs font-bold text-ink ink-border-sm shadow-ink-sm">
            HỌC MÀ CHƠI, CHƠI MÀ HỌC
          </span>
          <h2
            id="scene03-heading"
            className="mt-4 font-display text-3xl font-bold text-ink sm:text-5xl"
          >
            Thử thách bản thân theo cách thú vị hơn.
          </h2>
          <p className="mt-4 font-sans text-base font-semibold leading-relaxed text-ink-muted sm:text-lg">
            Luyện từ vựng, phản xạ và khả năng ghi nhớ thông qua những mini-game
            tiếng Anh tương tác trực tiếp với ngân hàng từ vựng thật.
          </p>
        </div>

        {/* Hai trang sách mở chứa 2 thế giới trò chơi: Bubble Pop & Word Rain */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* TRANG SÁCH TRÁI: GAME 01 — BUBBLE POP */}
          <article className="relative flex flex-col justify-between rounded-3xl bg-parchment-light p-6 ink-border shadow-ink transition-transform duration-200 hover:-translate-y-1 sm:p-8">
            <div
              aria-hidden="true"
              className="washi-tape pointer-events-none absolute -top-3 left-8 h-6 w-28 -rotate-3 shadow-sm"
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-lg bg-star px-3 py-1 font-mono text-xs font-bold text-ink ink-border-sm">
                  GAME 01 • BẮN BÓNG TỪ VỰNG
                </span>
                <span className="font-hand text-lg font-bold text-terracotta">
                  Chạm vào bong bóng để làm vỡ!
                </span>
              </div>

              <h3 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
                Bubble Pop
              </h3>
              <p className="mt-2 font-sans text-sm font-semibold leading-relaxed text-ink-muted sm:text-base">
                Các bong bóng từ vựng bồng bềnh trôi nhẹ. Bắn trúng bóng từ vựng
                theo yêu cầu để kích hoạt hiệu ứng nổ pháo hoa giấy và thu thập
                điểm thưởng XP.
              </p>

              {/* Khung tương tác thử nghiệm Bubble Pop */}
              <div className="relative mt-5 h-72 w-full overflow-hidden rounded-2xl bg-parchment-warm/85 ink-border-sm p-4">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 notebook-lines opacity-45"
                />

                {INITIAL_BUBBLES.map((b, index) => {
                  const isPopped = poppedIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      style={{ left: b.x, top: b.y }}
                      className="absolute z-10 transition-transform duration-200"
                    >
                      {!isPopped ? (
                        <button
                          type="button"
                          onClick={() => handlePopBubble(b)}
                          style={{
                            backgroundColor: b.color,
                            animationDelay: `${index * 0.45}s`,
                          }}
                          className="animate-float-slow group flex items-center gap-1.5 rounded-full px-4 py-2.5 font-display text-lg font-bold text-ink ink-border-sm shadow-ink-sm transition-transform hover:scale-115 active:scale-90"
                        >
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full bg-white/90 border border-ink"
                          />
                          <span>{b.word}</span>
                        </button>
                      ) : (
                        <div className="animate-scale-in flex items-center gap-1.5 rounded-xl border-2 border-dashed border-ink/40 bg-parchment-light/95 px-3 py-1 font-hand text-base font-bold text-terracotta shadow-sm">
                          <span>✨ {b.word}:</span>
                          <span className="text-ink">{b.meaning}</span>
                          <span className="rounded bg-star-light px-1 text-xs text-ink">+10 XP</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Khi người dùng đã nổ hết bong bóng */}
                {poppedIds.length === INITIAL_BUBBLES.length && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-parchment-light/95 p-4 text-center backdrop-blur-sm">
                    <span className="text-4xl animate-bounce">🎉</span>
                    <p className="mt-2 font-display text-2xl font-bold text-ink">
                      Tuyệt vời! Bạn đã mở khóa toàn bộ từ vựng mẫu!
                    </p>
                    <button
                      type="button"
                      onClick={handleResetBubbles}
                      className="mt-3 rounded-xl bg-star px-4 py-2 font-display text-lg font-bold text-ink ink-border-sm transition-transform hover:scale-105"
                    >
                      Thổi bong bóng mới 🫧
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Thanh trạng thái micro-interaction */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-parchment-warm px-4 py-2.5 ink-border-sm">
              <span className="font-sans text-xs font-bold text-ink">
                {lastPopped
                  ? `Vừa chọn: "${lastPopped.word}" — ${lastPopped.meaning}`
                  : "Bản xem trước tương tác thực tế (không lưu điểm giả)."}
              </span>
              {poppedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetBubbles}
                  className="font-mono text-xs font-bold text-terracotta underline hover:text-ink"
                >
                  Chơi lại
                </button>
              )}
            </div>
          </article>

          {/* TRANG SÁCH PHẢI: GAME 02 — WORD RAIN */}
          <article className="relative flex flex-col justify-between rounded-3xl bg-[#1B2936] p-6 text-parchment-light ink-border shadow-ink transition-transform duration-200 hover:-translate-y-1 sm:p-8">
            <div
              aria-hidden="true"
              className="washi-tape-sage pointer-events-none absolute -top-3 right-8 h-6 w-28 rotate-3 shadow-sm"
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-lg bg-sage px-3 py-1 font-mono text-xs font-bold text-parchment-light ink-border-sm">
                  GAME 02 • MƯA TỪ HỒ SEN
                </span>
                <span className="font-hand text-lg font-bold text-star">
                  Chạm giọt mưa từ vựng đang rơi!
                </span>
              </div>

              <h3 className="mt-3 font-display text-3xl font-bold text-star-light sm:text-4xl">
                Word Rain
              </h3>
              <p className="mt-2 font-sans text-sm font-semibold leading-relaxed text-parchment-warm/90 sm:text-base">
                Khung cảnh hồ sen ban đêm êm đềm với những hạt mưa tinh thể mang
                chữ cái rơi từ đám mây. Gõ phím hoặc chạm chính xác trước khi giọt
                mưa hòa vào mặt hồ.
              </p>

              {/* Khung mô phỏng tương tác Word Rain Hồ Sen Ban Đêm */}
              <div className="relative mt-5 h-72 w-full overflow-hidden rounded-2xl border-2 border-ink bg-gradient-to-b from-[#131D27] via-[#1C2C3B] to-[#253D4E] p-4">
                {/* Ánh trăng lưỡi liềm vẽ tay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3 right-5 h-10 w-10 rounded-full border-2 border-ink bg-star shadow-[0_0_20px_rgba(242,184,75,0.5)]"
                />

                {/* Các giọt mưa từ vựng tương tác */}
                <div className="relative z-10 grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                  {RAIN_WORDS.map((item) => {
                    const isSelected = selectedRain.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectRain(item)}
                        style={{ animationDelay: item.delay }}
                        className={`animate-float-slow flex flex-col items-center rounded-2xl border-2 border-ink px-3 py-2.5 transition-all hover:scale-105 active:scale-95 ${
                          isSelected
                            ? "bg-star text-ink shadow-ink-sm scale-105 font-bold"
                            : "bg-[#FAF6EC]/95 text-ink"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold uppercase text-terracotta">
                          💧 Giọt mưa
                        </span>
                        <span className="mt-0.5 font-display text-lg">
                          {item.word}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Thẻ nghĩa từ vựng nổi ở giữa hồ sen */}
                <div className="relative z-10 mt-4 rounded-xl bg-parchment-light/95 p-2.5 text-center text-ink ink-border-sm">
                  <span className="font-hand text-lg font-bold text-terracotta">
                    🌸 Nghĩa từ vựng:{" "}
                  </span>
                  <span className="font-sans text-sm font-bold text-ink">
                    {selectedRain.meaning}
                  </span>
                </div>

                {/* Mặt nước hồ sen với lá sen và gợn sóng lan tỏa */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 600 130"
                  className="pointer-events-none absolute bottom-0 left-0 w-full"
                  fill="none"
                >
                  {/* Vòng sóng nước lan toả */}
                  <ellipse
                    cx="300"
                    cy="104"
                    rx={rippleAnim ? 230 : 180}
                    ry={rippleAnim ? 22 : 16}
                    stroke="#F2B84B"
                    strokeWidth="2.5"
                    strokeDasharray="8 6"
                    opacity={rippleAnim ? 0.9 : 0.55}
                    className="transition-all duration-700"
                  />
                  <ellipse
                    cx="300"
                    cy="104"
                    rx="110"
                    ry="10"
                    stroke="#DCE8D8"
                    strokeWidth="2"
                    opacity="0.8"
                  />

                  {/* Lá sen xanh ngọc bên trái */}
                  <path
                    d="M45 96 C45 78, 125 74, 155 92 L105 98 L145 106 C115 118, 45 114, 45 96 Z"
                    fill="#375940"
                    stroke="#261E19"
                    strokeWidth="3"
                  />

                  {/* Đóa hoa sen hồng nở bên phải */}
                  <path
                    d="M440 98 C440 80, 520 76, 555 94 L500 100 L545 108 C510 120, 440 116, 440 98 Z"
                    fill="#375940"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                  <polygon
                    points="495,78 505,60 515,78 505,86"
                    fill="#EFA89A"
                    stroke="#261E19"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>

            {/* Chân trang Word Rain */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#14202B] px-4 py-2.5 border border-ink/40">
              <span className="font-mono text-xs font-bold text-star-light">
                Đang lắng nghe giọt: &ldquo;{selectedRain.word}&rdquo;
              </span>
              <span className="font-sans text-xs font-bold text-sage-light">
                Hồ sen 60 FPS • Không lag
              </span>
            </div>
          </article>
        </div>

        {/* Nút CTA lớn dẫn vào Đấu trường Mini-game thực tế */}
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <a
            href={LANDING_ROUTES.studentGames}
            onClick={() => sounds.playWoodClick()}
            className="group inline-flex items-center gap-3 rounded-2xl bg-terracotta px-8 py-4 font-display text-2xl tracking-wide text-parchment-light ink-border shadow-ink transition-all duration-200 hover:-translate-y-1 hover:shadow-ink-lg active:translate-y-0"
          >
            <span>Vào đấu trường trò chơi tiếng Anh</span>
            <span className="text-2xl transition-transform duration-200 group-hover:rotate-12">
              🎮
            </span>
          </a>
          <span className="mt-3 font-hand text-lg font-bold text-ink-muted">
            Kết nối trực tiếp với ngân hàng từ vựng từng Unit do thầy cô tạo
          </span>
        </div>
      </div>
    </section>
  );
}
