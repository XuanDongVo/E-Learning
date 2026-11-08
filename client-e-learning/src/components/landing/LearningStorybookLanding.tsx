"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { LANDING_ROUTES } from "@/config/landing-routes";
import { useOptionalAuth } from "@/components/auth/auth-provider";
import CustomInkCursor from "./CustomInkCursor";
import Navbar from "./Navbar";
import Scene01HeroBook from "./Scene01HeroBook";
import Scene02ExploreWorld from "./Scene02ExploreWorld";
import Scene03PlayPractice from "./Scene03PlayPractice";
import Scene04RewardsScrapbook from "./Scene04RewardsScrapbook";
import Scene06FinalPage from "./Scene06FinalPage";

interface LearningStorybookLandingProps {
  /** Truyền thông tin phiên đăng nhập thực tế từ Server/Auth Context nếu có */
  role?: import("@/types/auth").UserRole | null;
}

export default function LearningStorybookLanding({ role: providedRole }: LearningStorybookLandingProps) {
  const auth = useOptionalAuth();
  const role = providedRole ?? auth?.user?.role;
  const [heroProgress, setHeroProgress] = useState<number>(0);
  const [tabHidden, setTabHidden] = useState<boolean>(false);
  const isAnimatingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Dừng hoặc giảm animation khi tab không hiển thị
  useEffect(() => {
    const handleVisibilityChange = () => {
      setTabHidden(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Đồng bộ tiến trình chuẩn hóa 0 -> 1 khi cuộn trang (có thể đảo chiều khi quay lại đầu trang)
  useEffect(() => {
    const onScroll = () => {
      if (isAnimatingRef.current) return;
      const scrollY = window.scrollY;
      const threshold = Math.min(window.innerHeight * 0.65, 480);
      const nextProgress = Math.min(1, Math.max(0, scrollY / threshold));
      setHeroProgress(Number(nextProgress.toFixed(3)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Chuyển cảnh mở sách có trọng lượng trong ~2.0 giây (mục tiêu 1.8 - 2.4 giây) khi nhấn "Khám phá ngay"
  const handleTriggerOpenBook = useCallback(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setHeroProgress(1);
      const exploreEl = document.querySelector(LANDING_ROUTES.anchors.explore);
      exploreEl?.scrollIntoView({ behavior: "auto" });
      return;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    isAnimatingRef.current = true;
    const startProgress = heroProgress < 0.95 ? heroProgress : 0;
    const duration = 2050; // 2.05 giây (nằm trong khoảng 1.8 - 2.4 giây)
    const startTime = performance.now();

    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(rawT);
      const current = startProgress + (1 - startProgress) * eased;
      setHeroProgress(Number(current.toFixed(3)));

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        isAnimatingRef.current = false;
        const exploreEl = document.querySelector(LANDING_ROUTES.anchors.explore);
        exploreEl?.scrollIntoView({ behavior: "smooth" });
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, [heroProgress]);

  const handleNavigateSection = useCallback((anchor: string) => {
    const target = document.querySelector(anchor);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div
      className={
        tabHidden
          ? "tab-hidden min-h-screen parchment-surface text-ink font-sans selection:bg-star-light selection:text-ink"
          : "min-h-screen parchment-surface text-ink font-sans selection:bg-star-light selection:text-ink"
      }
    >
      {/* Custom Ink Cursor cho thiết bị có chuột chính xác */}
      <CustomInkCursor />

      {/* Thanh điều hướng tối giản */}
      <Navbar
        role={role}
        onNavigateSection={handleNavigateSection}
      />

      {/* Nội dung chính gồm các Scene (Bỏ Scene 05 theo đúng yêu cầu) */}
      <main>
        {/* SCENE 01 — THE CLOSED STORYBOOK */}
        <Scene01HeroBook
          progress={heroProgress}
          onTriggerOpenBook={handleTriggerOpenBook}
          onSetManualProgress={(val) => setHeroProgress(val)}
          role={role}
        />

        {/* SCENE 02 — EXPLORE THE LEARNING WORLD */}
        <Scene02ExploreWorld />

        {/* SCENE 03 — PLAY & PRACTICE (Bubble Pop & Word Rain) */}
        <Scene03PlayPractice />

        {/* SCENE 04 — REWARDS & MOTIVATION (XP, Level, Streak, Bảng xếp hạng) */}
        <Scene04RewardsScrapbook />

        {/* SCENE 05 — A SPACE FOR TEACHERS: Đã lược bỏ theo yêu cầu "(bỏ không triển khai )" */}

        {/* SCENE 06 — THE FINAL PAGE */}
        <Scene06FinalPage
          role={role}
          onNavigateSection={handleNavigateSection}
        />
      </main>
    </div>
  );
}
