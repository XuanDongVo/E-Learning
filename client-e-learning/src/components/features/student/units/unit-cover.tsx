"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface UnitCoverProps {
  /** Số thứ tự hiển thị trên khung dự phòng, ví dụ "01". */
  label: string;
  name: string;
  coverUrl?: string | null;
  className?: string;
  labelClassName?: string;
}

const TOPIC_ASSETS = [
  "/assets/vocabulary/gardening.svg",
  "/assets/vocabulary/music.svg",
  "/assets/vocabulary/recycle.svg",
  "/assets/vocabulary/chess.svg",
  "/assets/vocabulary/healthy.svg",
  "/assets/vocabulary/helmet.svg",
  "/assets/vocabulary/omelette.svg",
];

export function getVocabularyTopicVisual(code: string | number, name: string): string {
  const text = `${code} ${name}`.toLowerCase();
  if (text.includes("garden") || text.includes("plant") || text.includes("flower") || text.includes("vườn")) {
    return "/assets/vocabulary/gardening.svg";
  }
  if (text.includes("music") || text.includes("art") || text.includes("âm nhạc") || text.includes("song")) {
    return "/assets/vocabulary/music.svg";
  }
  if (text.includes("recycle") || text.includes("green") || text.includes("môi trường") || text.includes("rác") || text.includes("community")) {
    return "/assets/vocabulary/recycle.svg";
  }
  if (text.includes("chess") || text.includes("game") || text.includes("cờ") || text.includes("play") || text.includes("hobbies") || text.includes("hobby")) {
    return "/assets/vocabulary/chess.svg";
  }
  if (text.includes("health") || text.includes("fit") || text.includes("sức khỏe") || text.includes("sport") || text.includes("living")) {
    return "/assets/vocabulary/healthy.svg";
  }
  if (text.includes("helmet") || text.includes("traffic") || text.includes("giao thông") || text.includes("mũ") || text.includes("school") || text.includes("visit")) {
    return "/assets/vocabulary/helmet.svg";
  }
  if (text.includes("food") || text.includes("egg") || text.includes("omelette") || text.includes("nấu") || text.includes("món") || text.includes("drink")) {
    return "/assets/vocabulary/omelette.svg";
  }

  const num = parseInt(String(code).replace(/\D/g, ""), 10);
  if (!isNaN(num) && num > 0) {
    return TOPIC_ASSETS[(num - 1) % TOPIC_ASSETS.length];
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TOPIC_ASSETS.length;
  return TOPIC_ASSETS[index];
}

/**
 * Ảnh bìa Unit; có ảnh server thì hiển thị ảnh server, không có thì hiển thị
 * minh họa chủ đề SVG chuẩn từ kho /assets/vocabulary/.
 */
export function UnitCover({
  label,
  name,
  coverUrl,
  className,
  labelClassName,
}: UnitCoverProps) {
  const [failed, setFailed] = useState(false);
  const visualSrc = (!failed && coverUrl) ? coverUrl : getVocabularyTopicVisual(label, name);

  return (
    <div
      className={cn(
        "relative flex select-none flex-col items-center justify-center overflow-hidden bg-secondary/40 border-b border-border p-3",
        className
      )}
      aria-hidden="true"
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={visualSrc}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md border border-border/80 bg-background/90 px-2 py-0.5 shadow-2xs backdrop-blur-xs">
        <span className={cn("student-meta font-extrabold text-foreground", labelClassName)}>
          Unit {label}
        </span>
      </div>
    </div>
  );
}

export const unitLabel = (code: string | number) => String(code).padStart(2, "0");
