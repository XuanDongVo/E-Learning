"use client";

import { useEffect, useState, type RefObject } from "react";
import type { KnowledgeOutlineItem } from "@/components/features/knowledge-note/knowledge-note-document";

export function calculateReadingPercent(start: number, end: number, position: number): number {
  if (![start, end, position].every(Number.isFinite) || end <= start) return 0;
  return Math.max(0, Math.min(100, Math.round(((position - start) / (end - start)) * 100)));
}

/**
 * Session-only reader progress. No localStorage, XP or server-side claims.
 * Use one passive scroll listener with requestAnimationFrame throttling.
 */
export function useKnowledgeReadingProgress(
  elementRef: RefObject<HTMLDivElement | null>,
  outline: KnowledgeOutlineItem[],
  noteId: number,
) {
  const [progress, setProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  useEffect(() => {
    const reader = elementRef.current;
    if (!reader) return;
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const rect = reader.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const end = start + reader.scrollHeight;
      const position = window.scrollY + Math.min(window.innerHeight * .4, 300);
      const next = rect.bottom <= window.innerHeight * .95
        ? 100 : calculateReadingPercent(start, end, position);
      setProgress(current => current === next ? current : next);
      const first = outline.find(item => item.id);
      let active = first?.id ?? null;
      for (const item of outline) {
        const heading = item.id ? document.getElementById(item.id) : null;
        if (heading && reader.contains(heading) && heading.getBoundingClientRect().top <= 150) {
          active = item.id;
        }
      }
      setActiveHeadingId(current => current === active ? current : active);
    };

    const onScroll = () => {
      if (frame != null) return;
      frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame != null) window.cancelAnimationFrame(frame);
    };
  }, [elementRef, outline, noteId]);

  return { progress, activeHeadingId };
}
