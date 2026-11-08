"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  AuthSessionInfo,
  resolvePrimaryCtaRoute,
} from "@/config/landing-routes";
import { sounds } from "./sound-effects";

interface Scene01HeroBookProps {
  progress: number;
  onTriggerOpenBook: () => void;
  onSetManualProgress?: (value: number) => void;
  session?: AuthSessionInfo;
}

export default function Scene01HeroBook({
  progress,
  onTriggerOpenBook,
  onSetManualProgress,
  session,
}: Scene01HeroBookProps) {
  const primaryCta = resolvePrimaryCtaRoute(session);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Mouse Parallax Tilt như Saltwake
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHoveringBook, setIsHoveringBook] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      x: Number((x * 7).toFixed(2)),
      y: Number((-y * 7).toFixed(2)),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHoveringBook(false);
  }, []);

  // Tính toán tỷ lệ chuyển cảnh vật lý
  const clamp = (val: number, min = 0, max = 1) =>
    Math.min(max, Math.max(min, val));

  const coverOpenRatio = clamp((progress - 0.05) / 0.45);
  const pageSpreadScale = 1 + clamp((progress - 0.2) / 0.55) * 0.22;
  const worldPopRatio = clamp((progress - 0.35) / 0.55);
  const heroTextFade = clamp(1 - progress * 1.15);
  const heroTextShiftY = -progress * 48;

  const handleMilestoneClick = (val: number) => {
    sounds.playPageTurn();
    onSetManualProgress?.(val);
  };

  return (
    <section
      id="trang-chu"
      aria-label="Mở trang sách, bắt đầu hành trình"
      className="relative mx-auto mt-4 max-w-[1380px] px-3 sm:px-6"
    >
      {/* Khung lớn phong cách Saltwake với viền mực đậm và góc bo tròn */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[660px] overflow-hidden rounded-[32px] bg-parchment-light ink-border-lg p-6 sm:p-10 lg:min-h-[760px] lg:p-14"
      >
        {/* Nền giấy kẻ ngang mờ thủ công */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 notebook-lines opacity-60"
        />

        {/* Washi Tape trang trí phong cách Scrapbook */}
        <div
          aria-hidden="true"
          className="washi-tape pointer-events-none absolute -top-2 left-12 z-20 h-7 w-28 -rotate-6 rounded-sm shadow-md"
        />
        <div
          aria-hidden="true"
          className="washi-tape-sage pointer-events-none absolute -bottom-2 right-16 z-20 h-7 w-32 rotate-3 rounded-sm shadow-md"
        />

        {/* Bố cục 2 cột: Tiêu đề bên trái | Cuốn sách trung tâm & Thế giới Pop-up bên phải */}
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Cột trái: Headline & Kêu gọi hành động */}
          <div
            className="flex flex-col items-start text-left lg:col-span-5"
            style={{
              opacity: Math.max(0.18, heroTextFade),
              transform: `translate3d(0, ${heroTextShiftY}px, 0)`,
              transition: "transform 140ms ease-out, opacity 140ms ease-out",
            }}
          >
            {/* Huy hiệu Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-star-light px-4 py-1.5 ink-border-sm shadow-ink-sm">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full bg-terracotta animate-pulse"
              />
              <span className="font-mono text-xs font-bold tracking-wider text-ink uppercase">
                KHÁM PHÁ THẾ GIỚI TIẾNG ANH
              </span>
            </div>

            {/* H1 chính chuẩn SEO */}
            <h1 className="font-display text-4xl leading-[1.12] text-ink sm:text-5xl lg:text-[62px]">
              Mở trang sách,
              <br />
              <span className="relative inline-block text-terracotta">
                bắt đầu hành trình.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 280 18"
                  className="mt-1 w-full"
                  fill="none"
                >
                  <path
                    d="M3 13C68 4 185 5 277 14"
                    stroke="#261E19"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Đoạn mô tả tự nhiên */}
            <p className="mt-5 max-w-md font-sans text-base leading-relaxed font-semibold text-ink-muted sm:text-lg">
              Học tiếng Anh theo cách của bạn. Khám phá bài học, vượt qua thử
              thách và biến mỗi lần luyện tập thành một chuyến phiêu lưu kỳ thú.
            </p>

            {/* Cặp nút hành động chính */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href={primaryCta.href}
                onClick={() => sounds.playWoodClick()}
                className="group inline-flex items-center gap-3 rounded-2xl bg-terracotta px-6 py-3.5 font-display text-xl tracking-wide text-parchment-light ink-border shadow-ink transition-all duration-200 hover:-translate-y-1 hover:shadow-ink-lg active:translate-y-0"
              >
                <span>Bắt đầu học</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => {
                  sounds.playPageTurn();
                  onTriggerOpenBook();
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-parchment-warm px-6 py-3.5 font-display text-xl tracking-wide text-ink ink-border shadow-ink-sm transition-all duration-200 hover:-translate-y-1 hover:bg-star-light hover:shadow-ink active:translate-y-0"
              >
                <span>Mở sách ngay</span>
                <span className="text-xl">📖</span>
              </button>
            </div>

            {/* Gợi ý cuộn chuột phong cách viết tay */}
            <div className="mt-6 flex items-center gap-2.5 text-ink-muted">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-star-light animate-bounce"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 text-ink"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M10 4v12M5 11l5 5 5-5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="font-hand text-xl font-bold text-ink">
                Cuộn xuống hoặc nhấn để mở sách
              </span>
            </div>
          </div>

          {/* Cột phải: Khung minh họa 3D Cuốn sách sống động & Thế giới Papercraft */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-7">
            {/* Các vật phẩm nổi xung quanh (bút chì, tẩy, chữ cái, nhãn dán XP) với hiệu ứng Parallax */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-5 left-2 z-20 hidden sm:block transition-transform duration-150 ease-out"
              style={{
                transform: `translate3d(${tilt.x * 2.2}px, ${tilt.y * 2.2}px, 0) rotate(-7deg)`,
              }}
            >
              <div className="rounded-xl bg-star-light px-3.5 py-1.5 ink-border-sm shadow-ink-sm">
                <span className="font-display text-base font-bold text-ink">
                  A • B • C • Vocabulary
                </span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 right-6 z-20 transition-transform duration-150 ease-out"
              style={{
                transform: `translate3d(${-tilt.x * 2}px, ${-tilt.y * 2}px, 0) rotate(6deg)`,
              }}
            >
              <div className="rounded-xl bg-sage-light px-3.5 py-1.5 ink-border-sm shadow-ink-sm animate-star-twinkle">
                <span className="font-hand text-lg font-bold text-sage-dark">
                  ★ +100 XP Quest
                </span>
              </div>
            </div>

            {/* Sân khấu 3D Cuốn sách */}
            <div
              onClick={() => {
                sounds.playPageTurn();
                onTriggerOpenBook();
              }}
              onMouseEnter={() => setIsHoveringBook(true)}
              onMouseLeave={() => setIsHoveringBook(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  sounds.playPageTurn();
                  onTriggerOpenBook();
                }
              }}
              aria-label="Mở cuốn sách thế giới học tập"
              data-interactive="true"
              className="group relative w-full max-w-[680px] cursor-pointer select-none transition-transform duration-300 ease-out"
              style={{
                perspective: "1200px",
                transform: `scale(${pageSpreadScale}) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              }}
            >
              <svg
                viewBox="0 0 720 500"
                className="h-auto w-full drop-shadow-[10px_14px_0px_rgba(38,30,25,0.25)] transition-transform duration-300"
                fill="none"
              >
                {/* Bóng đổ giấy mềm mại dưới cuốn sách */}
                <ellipse
                  cx="360"
                  cy="436"
                  rx={260 + coverOpenRatio * 50}
                  ry={36 + coverOpenRatio * 8}
                  fill="#DFD0B0"
                  stroke="#261E19"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                />

                {/* Bút chì thủ công nghiêng bên trái */}
                <g
                  className="animate-pencil-tilt"
                  style={{
                    transformOrigin: "100px 390px",
                    transform: `translate3d(${-coverOpenRatio * 28 + tilt.x * 1.5}px, ${tilt.y * 1.5}px, 0)`,
                  }}
                >
                  <rect
                    x="42"
                    y="370"
                    width="125"
                    height="22"
                    rx="4"
                    transform="rotate(-18 42 370)"
                    fill="#F2B84B"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                  <polygon
                    points="160,332 184,335 167,353"
                    fill="#F6EFE0"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                  <polygon points="177,334 184,335 179,340" fill="#261E19" />
                  <rect
                    x="30"
                    y="374"
                    width="18"
                    height="22"
                    rx="3"
                    transform="rotate(-18 30 374)"
                    fill="#EFA89A"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                </g>

                {/* Cục tẩy & Mảnh giấy nháp ghi chú bên phải */}
                <g
                  style={{
                    transform: `translate3d(${coverOpenRatio * 25 - tilt.x * 1.5}px, ${-tilt.y * 1.5}px, 0)`,
                  }}
                >
                  <rect
                    x="585"
                    y="382"
                    width="66"
                    height="38"
                    rx="6"
                    transform="rotate(14 585 382)"
                    fill="#FAF6EC"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                  <rect
                    x="585"
                    y="382"
                    width="28"
                    height="38"
                    rx="4"
                    transform="rotate(14 585 382)"
                    fill="#4F7A5A"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                  {/* Chữ ghi chú nhỏ trên giấy */}
                  <line
                    x1="620"
                    y1="395"
                    x2="642"
                    y2="400"
                    stroke="#261E19"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="622"
                    y1="404"
                    x2="638"
                    y2="408"
                    stroke="#261E19"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>

                {/* =========================================================
                   PHẦN 1: BÌA CỨNG PHÍA SAU KHI SÁCH MỞ HOÀN TOÀN
                   ========================================================= */}
                <path
                  d="M100 188 L360 212 L620 188 L646 398 L360 422 L74 398 Z"
                  fill="#375940"
                  stroke="#261E19"
                  strokeWidth="3.5"
                />

                {/* Gáy sách bọc da nâu chắc chắn */}
                <path
                  d="M346 210 L374 210 L374 424 L346 424 Z"
                  fill="#261E19"
                />

                {/* Các lớp trang giấy dày xếp chồng bên trái */}
                <path
                  d="M106 195 L352 215 L352 414 L106 394 Z"
                  fill="#EDE2CA"
                  stroke="#261E19"
                  strokeWidth="2.5"
                />
                <path
                  d="M112 191 L352 213 L352 410 L112 388 Z"
                  fill="#F6EFE0"
                  stroke="#261E19"
                  strokeWidth="2.5"
                />

                {/* Các lớp trang giấy dày xếp chồng bên phải */}
                <path
                  d="M368 215 L614 195 L614 394 L368 414 Z"
                  fill="#EDE2CA"
                  stroke="#261E19"
                  strokeWidth="2.5"
                />
                <path
                  d="M368 213 L608 191 L608 388 L368 410 Z"
                  fill="#F6EFE0"
                  stroke="#261E19"
                  strokeWidth="2.5"
                />

                {/* =========================================================
                   PHẦN 2: THẾ GIỚI MINH HỌA POP-UP (NỔI LÊN KHI MỞ SÁCH)
                   ========================================================= */}
                <g
                  style={{
                    opacity: worldPopRatio,
                    transform: `translate3d(0, ${(1 - worldPopRatio) * 45}px, 0) scale(${0.85 + worldPopRatio * 0.15})`,
                    transformOrigin: "360px 300px",
                    transition: "opacity 200ms ease-out, transform 200ms ease-out",
                  }}
                >
                  {/* Đồi giấy tri thức xanh ngọc lớp xa */}
                  <path
                    d="M150 310 Q240 230 350 290 Q460 220 570 310 L570 360 L150 360 Z"
                    fill="#DCE8D8"
                    stroke="#261E19"
                    strokeWidth="3"
                  />

                  {/* Đồi giấy tri thức xanh lá lớp gần */}
                  <path
                    d="M180 340 Q290 270 360 320 Q440 265 540 345 L540 375 L180 375 Z"
                    fill="#7FA682"
                    stroke="#261E19"
                    strokeWidth="3"
                  />

                  {/* Con đường nét đứt uốn lượn xuyên qua trang sách */}
                  <path
                    d="M210 365 Q290 315 360 338 T510 330"
                    stroke="#D96B43"
                    strokeWidth="4"
                    strokeDasharray="9 7"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Ngọn Hải Đăng / Học Viện Tri Thức ở trung tâm */}
                  <g transform="translate(332, 205)">
                    {/* Tháp học viện */}
                    <polygon
                      points="16,10 38,10 44,70 10,70"
                      fill="#FAF6EC"
                      stroke="#261E19"
                      strokeWidth="3"
                    />
                    {/* Các sọc cam ngọn hải đăng */}
                    <polygon points="17,25 37,25 39,38 15,38" fill="#D96B43" />
                    <polygon points="13,52 41,52 44,65 10,65" fill="#D96B43" />
                    {/* Mái chóp học viện */}
                    <polygon
                      points="27,-8 48,10 6,10"
                      fill="#F2B84B"
                      stroke="#261E19"
                      strokeWidth="3"
                    />
                    {/* Ngôi sao tri thức trên đỉnh tháp */}
                    <circle cx="27" cy="-12" r="5" fill="#F2B84B" stroke="#261E19" strokeWidth="2" />
                    {/* Vệt hào quang xoay nhẹ */}
                    <path
                      d="M-40 0 L15 15 L-35 30 Z"
                      fill="rgba(242, 184, 75, 0.35)"
                      className="animate-pulse"
                    />
                    <path
                      d="M95 0 L40 15 L90 30 Z"
                      fill="rgba(242, 184, 75, 0.35)"
                      className="animate-pulse"
                    />
                  </g>

                  {/* Khinh khí cầu từ vựng lơ lửng trên bầu trời */}
                  <g
                    transform="translate(485, 120)"
                    className="animate-float-slow"
                  >
                    {/* Quả cầu giấy sọc vàng - cam */}
                    <ellipse
                      cx="30"
                      cy="30"
                      rx="26"
                      ry="30"
                      fill="#F2B84B"
                      stroke="#261E19"
                      strokeWidth="3"
                    />
                    <path
                      d="M20 2 Q30 30 20 58 M40 2 Q30 30 40 58"
                      stroke="#D96B43"
                      strokeWidth="3"
                      fill="none"
                    />
                    {/* Dây treo và giỏ khinh khí cầu */}
                    <line x1="18" y1="58" x2="22" y2="70" stroke="#261E19" strokeWidth="2" />
                    <line x1="42" y1="58" x2="38" y2="70" stroke="#261E19" strokeWidth="2" />
                    <rect
                      x="20"
                      y="70"
                      width="20"
                      height="12"
                      rx="2"
                      fill="#8B5A2B"
                      stroke="#261E19"
                      strokeWidth="2.5"
                    />
                    {/* Chữ Vocab bay ra */}
                    <text
                      x="62"
                      y="26"
                      fill="#261E19"
                      fontFamily="Patrick Hand, cursive"
                      fontSize="17"
                      fontWeight="bold"
                    >
                      Vocabulary!
                    </text>
                  </g>

                  {/* Đám mây chữ cái Hello & Learn bên trái */}
                  <g transform="translate(130, 110)">
                    <path
                      d="M20 30C20 18 32 10 45 12C52 2 70 2 80 12C94 10 106 20 104 34C102 46 92 50 80 50H32C24 50 20 42 20 30Z"
                      fill="#FAF6EC"
                      stroke="#261E19"
                      strokeWidth="3"
                    />
                    <text
                      x="38"
                      y="35"
                      fill="#261E19"
                      fontFamily="Caveat, cursive"
                      fontSize="20"
                      fontWeight="bold"
                    >
                      Hello ~
                    </text>
                  </g>
                </g>

                {/* =========================================================
                   PHẦN 3: BÌA SÁCH GẤP TRƯỚC (CHUYỂN ĐỘNG THEO TIẾN TRÌNH 0 -> 1)
                   Khi progress = 0: Bìa sách đóng kín sang trọng
                   Khi progress > 0: Bìa sách xoay mở sang trái
                   ========================================================= */}
                <g
                  style={{
                    transformOrigin: "360px 300px",
                    transform: `rotateY(${-coverOpenRatio * 175}deg)`,
                    transition: "transform 220ms ease-out",
                  }}
                >
                  {/* Bìa sách mặt trước màu xanh sẫm phủ họa tiết */}
                  <path
                    d="M360 190 L616 170 L642 396 L360 420 Z"
                    fill="#375940"
                    stroke="#261E19"
                    strokeWidth="3.5"
                  />

                  {/* Khung nhãn vàng ánh kim trên bìa sách */}
                  <rect
                    x="410"
                    y="225"
                    width="170"
                    height="130"
                    rx="12"
                    fill="#F2B84B"
                    stroke="#261E19"
                    strokeWidth="3"
                  />
                  <rect
                    x="420"
                    y="235"
                    width="150"
                    height="110"
                    rx="8"
                    fill="#FAF6EC"
                    stroke="#261E19"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                  />

                  {/* Chữ in trên bìa sách */}
                  <text
                    x="495"
                    y="268"
                    textAnchor="middle"
                    fill="#261E19"
                    fontFamily="Patrick Hand, cursive"
                    fontSize="25"
                    fontWeight="bold"
                  >
                    THE LEARNING
                  </text>
                  <text
                    x="495"
                    y="298"
                    textAnchor="middle"
                    fill="#D96B43"
                    fontFamily="Patrick Hand, cursive"
                    fontSize="27"
                    fontWeight="bold"
                  >
                    STORYBOOK
                  </text>

                  {/* Biểu tượng cuốn sách và ngôi sao chạm nổi */}
                  <path
                    d="M475 320 Q495 312 515 320"
                    stroke="#261E19"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="495,310 498,317 505,318 500,323 501,330 495,326 489,330 490,323 485,318 492,317"
                    fill="#F2B84B"
                    stroke="#261E19"
                    strokeWidth="1.5"
                  />
                </g>
              </svg>

              {/* Huy hiệu hướng dẫn nhấp mở sách khi hover */}
              <div
                className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-parchment-light px-4 py-1.5 ink-border-sm shadow-ink transition-all duration-200 ${
                  isHoveringBook ? "scale-105 opacity-100" : "opacity-90"
                }`}
              >
                <span className="font-hand text-base font-bold text-ink">
                  {progress < 0.3
                    ? "✨ Nhấp vào cuốn sách để mở thế giới học tập"
                    : "📖 Tiến trình mở sách: " + Math.round(progress * 100) + "%"}
                </span>
              </div>
            </div>

            {/* Thanh trượt điều khiển thủ công các Chương học (Timeline Scrubber) */}
            <div className="mt-6 flex w-full max-w-[580px] flex-col items-center gap-2 rounded-2xl bg-parchment-warm/75 p-3.5 ink-border-sm">
              <div className="flex w-full items-center justify-between text-xs font-bold text-ink-muted">
                <button
                  type="button"
                  onClick={() => handleMilestoneClick(0)}
                  className={`font-mono transition-colors hover:text-terracotta ${
                    progress < 0.25 ? "text-terracotta font-extrabold" : ""
                  }`}
                >
                  I. Khép sách
                </button>
                <button
                  type="button"
                  onClick={() => handleMilestoneClick(0.35)}
                  className={`font-mono transition-colors hover:text-terracotta ${
                    progress >= 0.25 && progress < 0.65
                      ? "text-terracotta font-extrabold"
                      : ""
                  }`}
                >
                  II. Mở bìa
                </button>
                <button
                  type="button"
                  onClick={() => handleMilestoneClick(0.75)}
                  className={`font-mono transition-colors hover:text-terracotta ${
                    progress >= 0.65 && progress < 0.95
                      ? "text-terracotta font-extrabold"
                      : ""
                  }`}
                >
                  III. Hiện thế giới
                </button>
                <button
                  type="button"
                  onClick={() => handleMilestoneClick(1)}
                  className={`font-mono transition-colors hover:text-terracotta ${
                    progress >= 0.95 ? "text-terracotta font-extrabold" : ""
                  }`}
                >
                  IV. Trọn vẹn
                </button>
              </div>

              {/* Thanh trượt kéo mở trang sách có trọng lượng */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={progress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onSetManualProgress?.(val);
                }}
                aria-label="Kéo thanh trượt để mở hoặc đóng trang sách"
                className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-parchment-deep accent-terracotta"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
