"use client";

import React, { useState } from "react";
import {
  Star,
  Flame,
  Check,
  CheckCircle2,
  Crown,
  Medal,
} from "lucide-react";
import { sounds } from "./sound-effects";

export default function Scene04RewardsScrapbook() {
  const [xp, setXp] = useState(320);
  const [isStampedToday, setIsStampedToday] = useState(false);
  const [stampBounce, setStampBounce] = useState(false);

  // Tính level từ XP
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;

  const handleAddXp = (amount: number) => {
    sounds.playBubblePop();
    setXp((prev) => Math.min(600, prev + amount));
  };

  const handleStampToday = () => {
    sounds.playStampThud();
    setStampBounce(true);
    setIsStampedToday(true);
    setTimeout(() => setStampBounce(false), 500);
  };

  return (
    <section
      id="thanh-tich"
      aria-labelledby="scene04-heading"
      className="relative mx-auto mt-16 max-w-[1380px] px-3 sm:mt-24 sm:px-6"
    >
      <div className="relative overflow-hidden rounded-[32px] bg-parchment-light ink-border-lg p-6 sm:p-10 lg:p-14">
        {/* Washi tape trang trí góc sổ */}
        <div
          aria-hidden="true"
          className="washi-tape-blush pointer-events-none absolute -top-3 left-16 z-20 h-7 w-32 -rotate-3 shadow-sm"
        />

        {/* Tiêu đề Section */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blush-light px-4 py-1.5 font-mono text-xs font-bold text-ink ink-border-sm shadow-ink-sm">
            MỖI CỐ GẮNG ĐỀU ĐÁNG ĐƯỢC GHI NHẬN
          </span>
          <h2
            id="scene04-heading"
            className="mt-4 font-display text-3xl font-bold text-ink sm:text-5xl"
          >
            Tiến bộ từng chút, vui hơn mỗi ngày.
          </h2>
          <p className="mt-4 font-sans text-base font-semibold leading-relaxed text-ink-muted sm:text-lg">
            Mỗi lần hoàn thành hoạt động hợp lệ là một cơ hội để tích lũy kinh nghiệm,
            duy trì ngọn lửa thói quen và lưu giữ dấu ấn của riêng bạn.
          </p>
        </div>

        {/* Trang sổ Scrapbook mở ra gồm 3 tấm thẻ giấy Polaroid */}
        <div className="mt-12 grid grid-cols-1 gap-7 lg:grid-cols-3">
          {/* THẺ 01: XP & LEVEL TƯƠNG TÁC */}
          <article className="relative flex flex-col justify-between rounded-3xl bg-parchment-warm p-6 ink-border shadow-ink transition-all duration-200 hover:-translate-y-1 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-star px-3 py-1 font-mono text-xs font-bold text-ink ink-border-sm">
                  STICKER 01
                </span>
                <span
                  aria-hidden="true"
                  className="animate-star-twinkle inline-flex items-center gap-1 font-display text-2xl text-star-amber"
                >
                  <Star className="h-5 w-5 fill-star text-star-amber" /> Level {level}
                </span>
              </div>

              <h3 className="mt-4 font-display text-3xl font-bold text-ink">
                XP & Level
              </h3>
              <p className="mt-2 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                Nhận XP từ những hoạt động hợp lệ và theo dõi từng cột mốc trưởng
                thành của bản thân trên con đường chinh phục tiếng Anh.
              </p>

              {/* Thanh thước kẻ XP tương tác */}
              <div className="mt-6 rounded-2xl bg-parchment-light p-4 ink-border-sm shadow-sm">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-ink">
                  <span>KINH NGHIỆM: {xp} XP</span>
                  <span className="text-terracotta">
                    {level === 1
                      ? "Tập sự"
                      : level === 2
                      ? "Khám phá"
                      : level === 3
                      ? "Học giả trẻ"
                      : "Thám hiểm vĩ đại"}
                  </span>
                </div>

                {/* Thanh tiến độ vẽ tay */}
                <div className="relative mt-3 h-7 w-full overflow-hidden rounded-xl border-2 border-ink bg-parchment-warm">
                  <div
                    className="h-full bg-star transition-all duration-300"
                    style={{ width: `${Math.min(100, xpInCurrentLevel)}%` }}
                  />
                  {/* Đường kẻ gạch chéo thủ công */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #261E19 0, #261E19 1.5px, transparent 0, transparent 9px)",
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-muted font-bold">
                    Tiếp theo: {100 - xpInCurrentLevel} XP để lên Level {level + 1}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddXp(25)}
                      className="rounded-lg bg-star px-2.5 py-1 font-mono text-xs font-bold text-ink ink-border-sm transition-transform active:scale-90"
                    >
                      +25 XP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddXp(50)}
                      className="rounded-lg bg-terracotta px-2.5 py-1 font-mono text-xs font-bold text-parchment-light ink-border-sm transition-transform active:scale-90"
                    >
                      +50 XP
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 font-hand text-base font-bold text-ink-muted">
              * XP được tính theo quy tắc hoàn thành bài học thực tế trên hệ thống.
            </p>
          </article>

          {/* THẺ 02: STREAK DÁN TEM TƯƠNG TÁC */}
          <article className="relative flex flex-col justify-between rounded-3xl bg-parchment-warm p-6 ink-border shadow-ink transition-all duration-200 hover:-translate-y-1 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-terracotta px-3 py-1 font-mono text-xs font-bold text-parchment-light ink-border-sm">
                  STICKER 02
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-terracotta">
                  CHUỖI 5 NGÀY <Flame className="h-4 w-4 fill-terracotta text-terracotta" />
                </span>
              </div>

              <h3 className="mt-4 font-display text-3xl font-bold text-ink">
                Streak Mỗi Ngày
              </h3>
              <p className="mt-2 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                Duy trì chuỗi ngày liên tục luyện tập tiếng Anh để hình thành thói
                quen bền bỉ và mở khóa những phần thưởng độc quyền.
              </p>

              {/* Lịch tuần dán tem con dấu */}
              <div className="mt-6 rounded-2xl bg-parchment-light p-4 ink-border-sm shadow-sm">
                <span className="font-mono text-xs font-bold text-ink">
                  LỊCH ĐÓNG DẤU CHĂM CHỈ (TUẦN NÀY)
                </span>

                <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, idx) => {
                    const isDonePast = idx < 4;
                    const isToday = idx === 4;

                    return (
                      <div
                        key={day}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 border-2 ${
                          isDonePast
                            ? "bg-star-light border-ink text-ink"
                            : isToday && isStampedToday
                            ? "bg-terracotta-light border-terracotta text-terracotta font-bold"
                            : isToday
                            ? "bg-parchment-warm border-terracotta border-dashed animate-pulse"
                            : "bg-parchment-light border-ink/20 opacity-50"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold">{day}</span>
                        <span className="mt-1 flex items-center justify-center h-5 w-5">
                          {isDonePast ? (
                            <Check className="h-4 w-4 text-ink stroke-[2.5]" />
                          ) : isToday && isStampedToday ? (
                            <Flame className="h-4 w-4 text-terracotta fill-terracotta" />
                          ) : isToday ? (
                            <span className="h-2 w-2 rounded-full bg-terracotta animate-ping" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Nút đóng dấu ngày hôm nay */}
                <div className="mt-4 flex flex-col items-center">
                  {!isStampedToday ? (
                    <button
                      type="button"
                      onClick={handleStampToday}
                      className="group inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2 font-display text-lg font-bold text-parchment-light ink-border-sm shadow-ink-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Đóng dấu hôm nay!</span>
                    </button>
                  ) : (
                    <div
                      className={`inline-flex items-center gap-2 rounded-xl bg-star-light px-4 py-2 font-hand text-xl font-bold text-ink ink-border-sm ${
                        stampBounce ? "animate-bounce" : ""
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5 text-terracotta" />
                      <span>Đã điểm danh thành công chuỗi 5 ngày!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 font-hand text-base font-bold text-ink-muted">
              * Biến việc học thành thói quen niềm vui mỗi ngày.
            </p>
          </article>

          {/* THẺ 03: BẢNG XẾP HẠNG & BỤC VINH QUANG */}
          <article className="relative flex flex-col justify-between rounded-3xl bg-parchment-warm p-6 ink-border shadow-ink transition-all duration-200 hover:-translate-y-1 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-sage px-3 py-1 font-mono text-xs font-bold text-parchment-light ink-border-sm">
                  STICKER 03
                </span>
                <span className="font-mono text-xs font-bold text-sage-dark">
                  BẢNG VINH DANH
                </span>
              </div>

              <h3 className="mt-4 font-display text-3xl font-bold text-ink">
                Bảng Xếp Hạng
              </h3>
              <p className="mt-2 font-sans text-sm font-semibold leading-relaxed text-ink-muted">
                Cùng các bạn trong lớp thi đua học tập, hoàn thành thử thách để
                bước lên bục vinh quang của tuần.
              </p>

              {/* Bục vinh quang 3 vị trí vẽ tay */}
              <div className="mt-6 rounded-2xl bg-parchment-light p-4 ink-border-sm shadow-sm">
                <div className="flex items-end justify-center gap-3 pt-4">
                  {/* Hạng 2 (Bạc) */}
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center animate-float-slow">
                      <Medal className="h-6 w-6 text-slate-400 fill-slate-300" />
                    </span>
                    <span className="font-display text-base font-bold text-ink">
                      Minh Anh
                    </span>
                    <div className="mt-1 flex h-20 w-16 items-center justify-center rounded-t-xl bg-slate-200 border-2 border-ink font-display text-2xl font-bold text-ink shadow-sm">
                      2
                    </div>
                  </div>

                  {/* Hạng 1 (Vàng) */}
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center animate-bounce">
                      <Crown className="h-7 w-7 text-star fill-star" />
                    </span>
                    <span className="font-display text-base font-bold text-terracotta">
                      Gia Huy
                    </span>
                    <div className="mt-1 flex h-28 w-20 items-center justify-center rounded-t-xl bg-star border-2 border-ink font-display text-3xl font-bold text-ink shadow-sm">
                      1
                    </div>
                  </div>

                  {/* Hạng 3 (Đồng) */}
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center animate-float-slow">
                      <Medal className="h-6 w-6 text-amber-700 fill-amber-600" />
                    </span>
                    <span className="font-display text-base font-bold text-ink">
                      Bảo Ngọc
                    </span>
                    <div className="mt-1 flex h-14 w-16 items-center justify-center rounded-t-xl bg-amber-200 border-2 border-ink font-display text-xl font-bold text-ink shadow-sm">
                      3
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="font-mono text-xs font-bold text-ink-muted">
                    Xếp hạng cập nhật hàng tuần theo lớp
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 font-hand text-base font-bold text-ink-muted">
              * Khám phá bảng xếp hạng lớp học và cá nhân trong mục Tiến trình.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
