"use client";

import React, { useEffect, useState } from "react";

interface InkRipple {
  id: number;
  x: number;
  y: number;
}

export default function CustomInkCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<InkRipple[]>([]);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!finePointer || reducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest(
            'a, button, input, [role="button"], [data-interactive="true"]'
          )
        );
        setHovered(isInteractive);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
      }, 600);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Vòng tròn mực đen theo con trỏ */}
      <div
        className="fixed top-0 left-0 rounded-full border-2 border-ink transition-transform duration-150 ease-out"
        style={{
          width: hovered ? 44 : 26,
          height: hovered ? 44 : 26,
          backgroundColor: hovered
            ? "rgba(242, 184, 75, 0.18)"
            : "rgba(38, 30, 25, 0.04)",
          transform: `translate3d(${pos.x - (hovered ? 22 : 13)}px, ${
            pos.y - (hovered ? 22 : 13)
          }px, 0)`,
        }}
      />
      {/* Chấm mực trung tâm */}
      <div
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-ink"
        style={{
          transform: `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`,
        }}
      />
      {/* Vòng mực lan ra khi click */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="fixed rounded-full border-2 border-ink animate-ink-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: 28,
            height: 28,
          }}
        />
      ))}
    </div>
  );
}
