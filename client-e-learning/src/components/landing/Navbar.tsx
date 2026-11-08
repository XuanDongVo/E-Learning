"use client";

import React, { useState } from "react";
import {
  AuthSessionInfo,
  LANDING_ROUTES,
  resolvePrimaryCtaRoute,
} from "@/config/landing-routes";
import { sounds } from "./sound-effects";

interface NavbarProps {
  session?: AuthSessionInfo;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Navbar({ session, onNavigateSection }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const authCta = resolvePrimaryCtaRoute(session);

  const toggleSound = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    sounds.enabled = nextState;
    if (nextState) {
      sounds.playWoodClick();
    }
  };

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string
  ) => {
    if (onNavigateSection) {
      e.preventDefault();
      sounds.playPageTurn();
      onNavigateSection(anchor);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-[1380px] px-3 sm:px-6">
      <nav
        aria-label="Điều hướng chính"
        className="flex items-center justify-between rounded-2xl bg-parchment-light/95 px-4 py-3 ink-border backdrop-blur-md transition-shadow hover:shadow-ink sm:px-6"
      >
        {/* Logo E-Learning - Cuốn sách mở với nét mực Saltwake */}
        <a
          href={LANDING_ROUTES.anchors.hero}
          onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.hero)}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-star ink-border-sm transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
            <svg
              aria-hidden="true"
              viewBox="0 0 36 36"
              className="h-7 w-7 text-ink"
              fill="none"
            >
              <path
                d="M5 9.5C5 8.1 6.1 7 7.5 7H16C17.1 7 18 7.9 18 9V28C18 26.9 17.1 26 16 26H7.5C6.1 26 5 24.9 5 23.5V9.5Z"
                fill="#FAF6EC"
                stroke="#261E19"
                strokeWidth="2.5"
              />
              <path
                d="M31 9.5C31 8.1 29.9 7 28.5 7H20C18.9 7 18 7.9 18 9V28C18 26.9 18.9 26 20 26H28.5C29.9 26 31 24.9 31 23.5V9.5Z"
                fill="#F2B84B"
                stroke="#261E19"
                strokeWidth="2.5"
              />
              <path
                d="M9 12H14M9 16H14M22 12H27M22 16H26"
                stroke="#261E19"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Ruy băng đánh dấu trang vàng cam buông xuống */}
              <path
                d="M18 9V24L20 22L22 24V9"
                fill="#D96B43"
                stroke="#261E19"
                strokeWidth="1.5"
              />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold leading-none tracking-wide text-ink transition-colors group-hover:text-terracotta">
              E-Learning
            </span>
            <span className="font-mono text-[11px] font-bold text-ink-muted">
              The Learning Storybook
            </span>
          </div>
        </a>

        {/* Menu điều hướng trên Desktop */}
        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          <a
            href={LANDING_ROUTES.anchors.hero}
            onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.hero)}
            className="font-sans text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:text-terracotta"
          >
            Trang chủ
          </a>
          <a
            href={LANDING_ROUTES.anchors.explore}
            onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.explore)}
            className="font-sans text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:text-terracotta"
          >
            Khám phá
          </a>
          <a
            href={LANDING_ROUTES.anchors.games}
            onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.games)}
            className="font-sans text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:text-terracotta"
          >
            Trò chơi
          </a>
          <a
            href={LANDING_ROUTES.anchors.rewards}
            onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.rewards)}
            className="font-sans text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:text-terracotta"
          >
            Thành tích
          </a>

          {/* Nút bật/tắt âm thanh thủ công Web Audio */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundActive ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed border-ink/40 bg-parchment-warm/80 px-2.5 py-1 text-xs font-bold text-ink transition-all hover:border-ink hover:bg-star-light active:scale-95"
          >
            <span className="text-sm">{soundActive ? "🔔" : "🔕"}</span>
            <span className="font-mono text-[11px]">{soundActive ? "Âm thanh: Bật" : "Âm thanh: Tắt"}</span>
          </button>

          <a
            href={LANDING_ROUTES.teacherLogin}
            className="rounded-lg border-2 border-dashed border-ink/60 bg-parchment-warm/90 px-3.5 py-1.5 font-mono text-xs font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-star-light hover:shadow-ink-sm"
          >
            Dành cho giáo viên
          </a>

          <a
            href={
              session?.isAuthenticated
                ? authCta.href
                : LANDING_ROUTES.studentLogin
            }
            className="rounded-xl bg-terracotta px-4.5 py-2 font-display text-lg tracking-wide text-parchment-light ink-border-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-ink active:translate-y-0"
          >
            {session?.isAuthenticated ? authCta.label : "Đăng nhập"}
          </a>
        </div>

        {/* Nút mở menu trên Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Bật tắt âm thanh"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-parchment-warm ink-border-sm text-base"
          >
            {soundActive ? "🔔" : "🔕"}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-parchment-warm ink-border-sm"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-ink"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <path d="M6 6L18 18M6 18L18 6" />
              ) : (
                <path d="M4 7H20M4 12H20M4 17H15" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Ngăn menu sổ tay trên Mobile */}
      {mobileOpen && (
        <div className="mt-2 rounded-2xl bg-parchment-light p-4 ink-border shadow-ink-lg md:hidden">
          <div className="flex flex-col gap-3">
            <a
              href={LANDING_ROUTES.anchors.hero}
              onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.hero)}
              className="rounded-lg px-3 py-2 font-sans text-base font-bold text-ink hover:bg-parchment-warm"
            >
              Trang chủ
            </a>
            <a
              href={LANDING_ROUTES.anchors.explore}
              onClick={(e) =>
                handleAnchorClick(e, LANDING_ROUTES.anchors.explore)
              }
              className="rounded-lg px-3 py-2 font-sans text-base font-bold text-ink hover:bg-parchment-warm"
            >
              Khám phá
            </a>
            <a
              href={LANDING_ROUTES.anchors.games}
              onClick={(e) => handleAnchorClick(e, LANDING_ROUTES.anchors.games)}
              className="rounded-lg px-3 py-2 font-sans text-base font-bold text-ink hover:bg-parchment-warm"
            >
              Trò chơi
            </a>
            <a
              href={LANDING_ROUTES.anchors.rewards}
              onClick={(e) =>
                handleAnchorClick(e, LANDING_ROUTES.anchors.rewards)
              }
              className="rounded-lg px-3 py-2 font-sans text-base font-bold text-ink hover:bg-parchment-warm"
            >
              Thành tích & Bảng xếp hạng
            </a>
            <hr className="border-dashed border-ink/25" />
            <a
              href={LANDING_ROUTES.teacherLogin}
              className="rounded-xl border-2 border-dashed border-ink bg-parchment-warm px-4 py-2.5 text-center font-mono text-sm font-bold text-ink"
            >
              Dành cho giáo viên
            </a>
            <a
              href={
                session?.isAuthenticated
                  ? authCta.href
                  : LANDING_ROUTES.studentLogin
              }
              className="rounded-xl bg-terracotta px-4 py-2.5 text-center font-display text-xl text-parchment-light ink-border-sm"
            >
              {session?.isAuthenticated ? authCta.label : "Đăng nhập"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
