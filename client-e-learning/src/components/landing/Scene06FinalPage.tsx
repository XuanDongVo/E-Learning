"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import {
  AuthSessionInfo,
  LANDING_ROUTES,
  resolvePrimaryCtaRoute,
} from "@/config/landing-routes";
import { sounds } from "./sound-effects";

interface Scene06FinalPageProps {
  session?: AuthSessionInfo;
  onNavigateSection?: (anchor: string) => void;
}

export default function Scene06FinalPage({
  session,
  onNavigateSection,
}: Scene06FinalPageProps) {
  const primaryCta = resolvePrimaryCtaRoute(session);

  const handleAnchor = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string
  ) => {
    if (onNavigateSection) {
      e.preventDefault();
      sounds.playPageTurn();
      onNavigateSection(anchor);
    }
  };

  return (
    <section
      id="bat-dau"
      aria-labelledby="scene06-heading"
      className="relative mx-auto mt-16 mb-12 max-w-[1380px] px-3 sm:mt-24 sm:px-6"
    >
      {/* Khung trang sách cuối mở hoàn toàn dẫn tới chân trời */}
      <div className="relative overflow-hidden rounded-[32px] bg-parchment-light ink-border-lg p-6 sm:p-10 lg:p-14">
        <div
          aria-hidden="true"
          className="washi-tape pointer-events-none absolute -top-3 left-1/2 z-20 h-7 w-36 -translate-x-1/2 rotate-1 shadow-sm"
        />

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Cột thông điệp kết: Trang tiếp theo là của bạn */}
          <div className="flex flex-col items-start text-left lg:col-span-6">
            <span className="inline-block rounded-full bg-star-light px-4 py-1.5 font-landing-mono text-xs font-bold text-ink ink-border-sm shadow-ink-sm">
              CÂU CHUYỆN TIẾP THEO ĐANG CHỜ BẠN
            </span>

            <h2
              id="scene06-heading"
              className="mt-4 font-landing-page-display text-4xl font-bold text-ink sm:text-5xl lg:text-[56px] leading-[1.12]"
            >
              Trang tiếp theo là của bạn.
            </h2>

            <p className="mt-4 max-w-lg font-sans text-base font-semibold leading-relaxed text-ink-muted sm:text-lg">
              Một bài học mới, một thử thách mới và thêm một điều thú vị để khám
              phá. Hành trình tiếng Anh của bạn bắt đầu từ đây.
            </p>

            {/* Cặp nút CTA cuối trang (Không hiển thị "Đăng ký miễn phí" theo đúng quy tắc) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={primaryCta.href}
                onClick={() => sounds.playWoodClick()}
                className="group inline-flex items-center gap-3 rounded-2xl bg-terracotta px-7 py-4 font-landing-page-display text-2xl tracking-wide text-parchment-light ink-border shadow-ink transition-all duration-200 hover:-translate-y-1 hover:shadow-ink-lg active:translate-y-0"
              >
                <span>Bắt đầu hành trình</span>
                <ArrowRight className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href={LANDING_ROUTES.studentLogin}
                onClick={() => sounds.playWoodClick()}
                className="inline-flex items-center gap-2 rounded-2xl bg-parchment-warm px-6 py-4 font-landing-page-display text-2xl tracking-wide text-ink ink-border shadow-ink-sm transition-all duration-200 hover:-translate-y-1 hover:bg-star-light hover:shadow-ink active:translate-y-0"
              >
                <span>Đăng nhập</span>
              </a>
            </div>

            {/* Các sticker thu nhỏ từ những chặng hành trình trước */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                "✦ Grade • Unit • Topic",
                "✦ Learning & Try Hard Mode",
                "✦ Bubble Pop & Word Rain",
                "✦ XP • Level • Streak",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-xl bg-parchment-warm px-3.5 py-1.5 font-landing-hand text-lg font-bold text-ink ink-border-sm shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Cột minh họa: Cuốn sách mở phẳng với con đường tới chân trời & nhân vật học sinh */}
          <div className="relative flex items-center justify-center lg:col-span-6">
            <svg
              aria-hidden="true"
              viewBox="0 0 620 420"
              className="h-auto w-full max-w-[580px] drop-shadow-[8px_12px_0px_rgba(38,30,25,0.2)]"
              fill="none"
            >
              {/* Mặt trời mọc ấm áp trên chân trời xa */}
              <circle
                cx="310"
                cy="145"
                r="68"
                fill="#F2B84B"
                stroke="#261E19"
                strokeWidth="3.5"
                strokeDasharray="6 5"
              />

              {/* Ngôi sao lấp lánh trên bầu trời */}
              <polygon
                points="170,95 175,107 188,108 178,116 181,128 170,121 159,128 162,116 152,108 165,107"
                fill="#F2B84B"
                stroke="#261E19"
                strokeWidth="2.5"
                className="animate-star-twinkle"
              />
              <polygon
                points="455,88 460,100 473,101 463,109 466,121 455,114 444,121 447,109 437,101 450,100"
                fill="#F2B84B"
                stroke="#261E19"
                strokeWidth="2.5"
                className="animate-star-twinkle"
              />

              {/* Cuốn sách mở phẳng hoàn toàn */}
              <path
                d="M55 245 L310 265 L565 245 L590 375 L310 395 L30 375 Z"
                fill="#375940"
                stroke="#261E19"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M72 232 C160 222, 245 234, 310 256 C375 234, 460 222, 548 232 L570 362 C475 352, 385 362, 310 382 C235 362, 145 352, 50 362 Z"
                fill="#FAF6EC"
                stroke="#261E19"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Đồi giấy mở ra hai bên trang sách */}
              <path
                d="M78 320 Q180 245 310 298 Q440 245 542 320 L554 358 L66 358 Z"
                fill="#DCE8D8"
                stroke="#261E19"
                strokeWidth="3"
              />

              {/* Con đường dẫn đến chân trời */}
              <path
                d="M265 375 C280 330, 300 295, 310 255"
                stroke="#F2B84B"
                strokeWidth="34"
                strokeLinecap="round"
              />
              <path
                d="M265 375 C280 330, 300 295, 310 255"
                stroke="#261E19"
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* Nhân vật học sinh nhỏ đeo ba lô bước vào hành trình */}
              <g transform="translate(282, 266)">
                {/* Ba lô nhỏ màu cam */}
                <rect
                  x="6"
                  y="28"
                  width="18"
                  height="24"
                  rx="5"
                  fill="#D96B43"
                  stroke="#261E19"
                  strokeWidth="2.8"
                />
                {/* Thân áo xanh ngọc */}
                <path
                  d="M18 26 L38 26 L42 56 L14 56 Z"
                  fill="#4F7A5A"
                  stroke="#261E19"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                {/* Đầu & Mũ phiêu lưu màu vàng */}
                <circle
                  cx="28"
                  cy="14"
                  r="11"
                  fill="#FAF6EC"
                  stroke="#261E19"
                  strokeWidth="2.8"
                />
                <path
                  d="M14 11 C18 2, 38 2, 42 11 Z"
                  fill="#F2B84B"
                  stroke="#261E19"
                  strokeWidth="2.8"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Footer tối giản bên dưới trang sách cuối */}
        <footer className="mt-14 border-t-2 border-dashed border-ink/25 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="font-landing-page-display text-2xl font-bold text-ink">E-Learning</span>
              <span className="font-landing-mono text-xs text-ink-muted">
                • Mỗi bài học là một chuyến phiêu lưu.
              </span>
            </div>

            <nav
              aria-label="Liên kết cuối trang"
              className="flex flex-wrap items-center gap-5 font-sans text-sm font-bold text-ink-muted"
            >
              <a
                href={LANDING_ROUTES.anchors.hero}
                onClick={(e) => handleAnchor(e, LANDING_ROUTES.anchors.hero)}
                className="transition-colors hover:text-terracotta"
              >
                Trang chủ
              </a>
              <a
                href={LANDING_ROUTES.anchors.explore}
                onClick={(e) => handleAnchor(e, LANDING_ROUTES.anchors.explore)}
                className="transition-colors hover:text-terracotta"
              >
                Khám phá
              </a>
              <a
                href={LANDING_ROUTES.anchors.games}
                onClick={(e) => handleAnchor(e, LANDING_ROUTES.anchors.games)}
                className="transition-colors hover:text-terracotta"
              >
                Trò chơi
              </a>
              <a
                href={LANDING_ROUTES.anchors.rewards}
                onClick={(e) => handleAnchor(e, LANDING_ROUTES.anchors.rewards)}
                className="transition-colors hover:text-terracotta"
              >
                Thành tích
              </a>
              <a
                href={LANDING_ROUTES.teacherLogin}
                className="transition-colors hover:text-terracotta"
              >
                Dành cho giáo viên
              </a>
              <a
                href={LANDING_ROUTES.studentLogin}
                className="transition-colors hover:text-terracotta"
              >
                Đăng nhập
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </section>
  );
}
