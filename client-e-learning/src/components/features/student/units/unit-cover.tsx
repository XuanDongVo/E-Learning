"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UnitCoverProps {
  /** Số thứ tự hiển thị trên khung dự phòng, ví dụ "01". */
  label: string;
  name: string;
  coverUrl?: string | null;
  className?: string;
  labelClassName?: string;
}

/** Ảnh bìa Unit; không có ảnh (hoặc ảnh lỗi) thì hiện khung dự phòng cùng kích thước. */
export function UnitCover({ label, name, coverUrl, className, labelClassName }: UnitCoverProps) {
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

  return (
    <div className={cn("flex items-center justify-center bg-primary-light", className)} aria-hidden="true">
      <span className={cn("text-5xl font-extrabold text-primary", labelClassName)}>{label}</span>
    </div>
  );
}

export const unitLabel = (displayOrder: number) => String(displayOrder).padStart(2, "0");
