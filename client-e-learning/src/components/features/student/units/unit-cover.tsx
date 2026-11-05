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

/**
 * Ảnh bìa Unit; không có ảnh (hoặc ảnh lỗi) thì hiển thị số Unit rõ ràng.
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

  // Bìa dự phòng trung tính, không ngụ ý có hình minh họa thật.
  return (
    <div
      className={cn(
        "relative flex select-none flex-col items-center justify-center overflow-hidden bg-learning-soft",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-learning">Unit</span>
        <span
          className={cn(
            "text-5xl font-extrabold tracking-tight text-learning",
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
