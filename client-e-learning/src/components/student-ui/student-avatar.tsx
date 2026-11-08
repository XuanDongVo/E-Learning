"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/format";

/**
 * Read-only DiceBear avatar for Student UI.
 * The stored key is a validated style/seed, never an arbitrary remote URL.
 * Falls back to the student's initial when the key is absent or the image fails.
 */
const DICEBEAR_KEY =
  /^dicebear:(adventurer|bottts|lorelei|pixel-art|fun-emoji|big-smile|notionists|open-peeps|micah|thumbs):([^:/?#]{1,40})$/;

export function StudentAvatar({
  avatarKey,
  fullName,
  className,
}: {
  avatarKey: string | null | undefined;
  fullName: string;
  className?: string;
}) {
  const match = avatarKey?.match(DICEBEAR_KEY);
  const src = match
    ? `https://api.dicebear.com/9.x/${match[1]}/svg?seed=${encodeURIComponent(match[2])}`
    : null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src !== null && failedSrc !== src;

  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden", className)} aria-hidden="true">
      <span>{getInitials(fullName, 1) || "?"}</span>
      {showImage && (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  );
}
