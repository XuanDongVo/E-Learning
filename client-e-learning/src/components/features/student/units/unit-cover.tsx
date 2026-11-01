"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnitCoverProps {
  /** Số thứ tự hiển thị trên khung dự phòng, ví dụ "01". */
  label: string;
  name: string;
  coverUrl?: string | null;
  className?: string;
  labelClassName?: string;
}

/** 
 * Ảnh bìa Unit; không có ảnh (hoặc ảnh lỗi) thì hiển thị khung bìa số bài học phong cách Tactile.
 */
export function UnitCover({
  label,
  name,
  coverUrl,
  className,
  labelClassName,
}: UnitCoverProps) {
  const [failed, setFailed] = useState(false);

  if (coverUrl && !failed) {
    return (
      <div className={cn("relative overflow-hidden bg-info-soft", className)}>
        <Image
          src={coverUrl}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  // Khung bìa dự phòng thiết kế dạng khối chữ số lớn vui tươi
  return (
    <div
      className={cn(
        "relative flex select-none flex-col items-center justify-center overflow-hidden border-b-2 border-border bg-gradient-to-br from-primary-soft via-secondary to-primary-soft/40",
        className
      )}
      aria-hidden="true"
    >
      {/* Hoạ tiết vòng tròn mờ trang trí nền */}
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border-2 border-primary/15 bg-primary/5" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full border-2 border-primary/10 bg-primary/5" />

      {/* Số thứ tự Unit nổi bật */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-primary/80">
          <Sparkles className="h-3 w-3" />
          Unit
        </span>
        <span
          className={cn(
            "text-5xl sm:text-6xl font-black tracking-tight text-primary drop-shadow-xs",
            labelClassName
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export const unitLabel = (code: string | number) => String(code).padStart(2, "0");
