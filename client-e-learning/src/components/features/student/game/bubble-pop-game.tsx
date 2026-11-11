"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GamePlayWord, WordAnswerResult, FinishGameSessionResponse, PronunciationAccent } from "@/types/vocabulary-game";
import { soundEffects } from "./sound-effects";
import { studentGameService } from "@/services/student/student-game.service";
import { FullscreenGameContainer } from "./fullscreen-game-container";
import { GameResultModal } from "./game-result-modal";
import { Volume2, Crosshair, Sparkles } from "lucide-react";

interface BubblePopGameProps {
  accent: PronunciationAccent;
  sessionId: number;
  unitName: string;
  words: GamePlayWord[];
  onReplay: () => void;
}

interface CanvasBubble {
  id: string;
  word: string;
  isTarget: boolean;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  color: string;
  border: string;
  glow: string;
  wobblePhase: number;
  isRevealedAsCorrect?: boolean;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  targetBubbleId: string | null;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface FloatingScore {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
}

const BUBBLE_PALETTES = [
  { color: "#06b6d4", border: "#67e8f9", glow: "#22d3ee" }, // Cyan
  { color: "#8b5cf6", border: "#c084fc", glow: "#a855f7" }, // Purple
  { color: "#10b981", border: "#6ee7b7", glow: "#34d399" }, // Emerald
  { color: "#f59e0b", border: "#fde68a", glow: "#fbbf24" }, // Amber
  { color: "#ec4899", border: "#fbcfe8", glow: "#f472b6" }, // Pink
  { color: "#3b82f6", border: "#93c5fd", glow: "#60a5fa" }, // Blue
];

export function BubblePopGame({
  accent,
  sessionId,
  unitName,
  words,
  onReplay,
}: BubblePopGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [startTime] = useState<number>(() => Date.now());
  const [result, setResult] = useState<FinishGameSessionResponse | null>(null);

  const currentWord = words[currentIndex];

  // Canvas and game loop references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // References to keep game loop 60fps without React re-render lag
  const mouseRef = useRef<{ x: number; y: number }>({ x: 400, y: 500 });
  const shipRef = useRef<{ x: number; tilt: number; muzzleTimer: number }>({
    x: 400,
    tilt: 0,
    muzzleTimer: 0,
  });

  const bubblesRef = useRef<CanvasBubble[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const floatScoresRef = useRef<FloatingScore[]>([]);
  const starsRef = useRef<Star[]>([]);

  const answersHistoryRef = useRef<WordAnswerResult[]>([]);
  const isRevealingAnswerRef = useRef<boolean>(false);
  const nextTargetWordToSpawnRef = useRef<string | null>(null);
  const distractorPoolRef = useRef<string[]>([]);

  const currentWordRef = useRef<GamePlayWord>(currentWord);
  const currentIndexRef = useRef<number>(currentIndex);
  const scoreRef = useRef<number>(score);
  const comboRef = useRef<number>(combo);
  const isMutedRef = useRef<boolean>(isMuted);

  currentWordRef.current = currentWord;
  currentIndexRef.current = currentIndex;
  scoreRef.current = score;
  comboRef.current = combo;
  isMutedRef.current = isMuted;

  // Initialize stars for background
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.5 + 0.25,
      });
    }
    starsRef.current = stars;
  }, []);

  // Prepare full distractor pool from current unit
  useEffect(() => {
    const pool = new Set<string>();
    words.forEach((w) => {
      pool.add(w.word);
      w.distractors.forEach((d) => pool.add(d));
    });
    distractorPoolRef.current = Array.from(pool);
  }, [words]);

  const getRandomDistractor = useCallback((excludeWord?: string): string => {
    const pool = distractorPoolRef.current.filter((w) => w !== excludeWord);
    if (pool.length === 0) return "star";
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  // Finish session
  const finishSession = useCallback(async () => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const finalAnswers = answersHistoryRef.current;
    try {
      const res = await studentGameService.finishSession(sessionId, {
        timeSpentSeconds: durationSeconds,
        answers: finalAnswers,
      });
      if (res.data) setResult(res.data);
    } catch {
      setResult({
        sessionId,
        unitId: 0,
        unitName,
        gameType: "BUBBLE_POP",
        accent: "UK",
        totalWords: words.length,
        firstTryCorrect: finalAnswers.filter((a) => a.firstTryCorrect).length,
        accuracyPercentage: Math.round(
          (finalAnswers.filter((a) => a.firstTryCorrect).length / words.length) * 100
        ),
        totalScore: scoreRef.current,
        earnedXp: 15,
        timeSpentSeconds: durationSeconds,
        wordsMastered: [],
        wordsToReview: [],
      });
    }
  }, [sessionId, startTime, unitName, words.length]);

  // Initial setup of 4 to 5 bubbles (run once at start)
  useEffect(() => {
    const target = words[0];
    if (!target) return;

    const width = containerRef.current?.clientWidth || 800;
    // Exactly 4 to 5 bubbles as requested
    const count = width > 950 ? 5 : 4;
    const r = Math.min(52, Math.max(46, width / 20)); // Bigger bubbles (~96-104px diameter)

    const initialBubbles: CanvasBubble[] = [];
    // Ensure 1 bubble is the target
    const targetSlot = Math.floor(Math.random() * count);

    for (let i = 0; i < count; i++) {
      const isTarget = i === targetSlot;
      const palette = BUBBLE_PALETTES[i % BUBBLE_PALETTES.length];
      const wordText = isTarget
        ? target.word
        : target.distractors[i % target.distractors.length] || getRandomDistractor(target.word);

      initialBubbles.push({
        id: `${wordText}-${i}-${Date.now()}`,
        word: wordText,
        isTarget,
        x: (width / (count + 1)) * (i + 1) + (Math.random() * 20 - 10),
        y: Math.random() * 220 + 20, // Staggered vertical start
        radius: r,
        speedY: Math.random() * 0.12 + 0.34, // Gentle slow fall speed (0.34 - 0.46 px/frame)
        speedX: (Math.random() - 0.5) * 0.2,
        color: palette.color,
        border: palette.border,
        glow: palette.glow,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }

    bubblesRef.current = initialBubbles;
  }, [getRandomDistractor, words]);

  // Seamless Question Advance: Refreshes question WITHOUT wiping or morphing surrounding bubbles!
  const advanceToNextWordSeamless = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= words.length) {
      void finishSession();
      return;
    }

    const nextWord = words[nextIndex];
    currentWordRef.current = nextWord;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex); // Updates top question banner

    const bubbles = bubblesRef.current;
    // Check if next target word is already on screen in one of the falling bubbles
    const existingTargetBubble = bubbles.find((b) => b.word === nextWord.word);

    if (existingTargetBubble) {
      bubbles.forEach((b) => {
        b.isTarget = b.id === existingTargetBubble.id;
        b.isRevealedAsCorrect = false;
      });
      nextTargetWordToSpawnRef.current = null;
    } else {
      // Clear target status from current bubbles (they keep falling with their own words!)
      bubbles.forEach((b) => {
        b.isTarget = false;
        b.isRevealedAsCorrect = false;
      });
      // Queue the next target word to enter naturally from the top of the screen
      nextTargetWordToSpawnRef.current = nextWord.word;

      // If all existing bubbles are already in the lower half (y > 220), spawn a bubble immediately at top
      const allLow = bubbles.every((b) => b.y > 220);
      if (allLow && bubbles.length < 5) {
        const width = containerRef.current?.clientWidth || 800;
        const palette = BUBBLE_PALETTES[Math.floor(Math.random() * BUBBLE_PALETTES.length)];
        const r = Math.min(52, Math.max(46, width / 20));
        bubbles.push({
          id: `${nextWord.word}-${Date.now()}`,
          word: nextWord.word,
          isTarget: true,
          x: Math.random() * (width - 140) + 70,
          y: -50,
          radius: r,
          speedY: Math.random() * 0.12 + 0.34,
          speedX: (Math.random() - 0.5) * 0.2,
          color: palette.color,
          border: palette.border,
          glow: palette.glow,
          wobblePhase: Math.random() * Math.PI * 2,
        });
        nextTargetWordToSpawnRef.current = null;
      }
    }
  }, [finishSession, words]);

  // Precision Laser firing directly at targeted bubble
  const firePrecisionLaser = useCallback((targetBubble: CanvasBubble | null, clickX?: number, clickY?: number) => {
    if (isRevealingAnswerRef.current) return;

    const ship = shipRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const destX = targetBubble ? targetBubble.x : clickX !== undefined ? clickX : mouseRef.current.x;
    const destY = targetBubble ? targetBubble.y : clickY !== undefined ? clickY : 0;

    // Trigger muzzle flash
    ship.muzzleTimer = 6;

    const dx = destX - ship.x;
    const dy = destY - (rect.height - 50);
    const angle = Math.atan2(dy, dx);
    const speed = 24; // Fast precision laser
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    bulletsRef.current.push(
      {
        id: `${Date.now()}-1`,
        x: ship.x - 18,
        y: rect.height - 50,
        targetBubbleId: targetBubble ? targetBubble.id : null,
        targetX: destX,
        targetY: destY,
        vx,
        vy,
        color: "#38bdf8",
      },
      {
        id: `${Date.now()}-2`,
        x: ship.x + 18,
        y: rect.height - 50,
        targetBubbleId: targetBubble ? targetBubble.id : null,
        targetX: destX,
        targetY: destY,
        vx,
        vy,
        color: "#38bdf8",
      }
    );

    if (!isMutedRef.current) {
      soundEffects.playLaser();
    }
  }, []);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    // Initial ship center
    shipRef.current.x = (containerRef.current?.clientWidth || 800) / 2;
    mouseRef.current.x = shipRef.current.x;

    // Sparkling Particle Burst on Hit
    const spawnExplosion = (x: number, y: number, isTarget: boolean, wordText: string) => {
      const count = isTarget ? 36 : 14;
      const colors = isTarget
        ? ["#38bdf8", "#fde047", "#f43f5e", "#a855f7", "#ffffff"]
        : ["#f87171", "#fb923c", "#cbd5e1"];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isTarget ? Math.random() * 7 + 2 : Math.random() * 4 + 1;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          isStar: isTarget && Math.random() > 0.4,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        });
      }

      if (isTarget) {
        // Shockwave ring
        shockwavesRef.current.push({
          x,
          y,
          radius: 12,
          maxRadius: 95,
          color: "#38bdf8",
          alpha: 1,
        });

        // Floating score popup
        const currentCombo = comboRef.current;
        floatScoresRef.current.push({
          x,
          y: y - 10,
          text: `+${10 * currentCombo} XP`,
          color: "#fde047",
          alpha: 1,
        });

        if (!isMutedRef.current) {
          soundEffects.playExplosion();
          soundEffects.speakWord(wordText, accent);
        }
      } else {
        if (!isMutedRef.current) {
          soundEffects.playWrong();
        }
      }
    };

    // Helper: draw 4-point sparkling star
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      rot: number,
      color: string,
      alpha: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        c.lineTo(Math.cos((i * Math.PI) / 2) * size * 2, Math.sin((i * Math.PI) / 2) * size * 2);
        c.lineTo(
          Math.cos(((i + 0.5) * Math.PI) / 2) * (size * 0.4),
          Math.sin(((i + 0.5) * Math.PI) / 2) * (size * 0.4)
        );
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    // 60FPS Game Loop
    const loop = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Clear background
      ctx.fillStyle = "#04040d";
      ctx.fillRect(0, 0, width, height);

      // 2. Stars drifting downward
      for (const star of starsRef.current) {
        star.y += star.speed;
        if (star.y > height) star.y = 0;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x % width, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 3. Smooth Spaceship Mouse Tracking (Lerp, silky smooth, no jumping!)
      const ship = shipRef.current;
      const targetX = Math.max(35, Math.min(width - 35, mouseRef.current.x));
      const diffX = targetX - ship.x;
      ship.x += diffX * 0.2; // Smooth 60fps easing
      ship.tilt = Math.max(-0.25, Math.min(0.25, diffX * 0.008));

      // 4. Update and Draw Precision Bullets
      const bullets = bulletsRef.current;
      const bubbles = bubblesRef.current;

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (b.targetBubbleId) {
          const targetBubble = bubbles.find((bb) => bb.id === b.targetBubbleId);
          if (targetBubble) {
            const dx = targetBubble.x - b.x;
            const dy = targetBubble.y - b.y;
            const dist = Math.hypot(dx, dy);

            // Reached target bubble!
            if (dist <= 26) {
              spawnExplosion(targetBubble.x, targetBubble.y, targetBubble.isTarget, targetBubble.word);

              if (targetBubble.isTarget) {
                // HIT CORRECT ANSWER!
                setScore((s) => s + 10 * comboRef.current);
                setCombo((c) => Math.min(c + 1, 8));

                answersHistoryRef.current.push({
                  wordId: currentWordRef.current.id,
                  firstTryCorrect: true,
                  attemptsCount: 1,
                  responseTimeMs: 0,
                });

                // ONLY this bubble is removed/recycled to top! Surrounding bubbles keep falling!
                targetBubble.y = -60;
                targetBubble.x = Math.random() * (width - 120) + 60;
                targetBubble.isTarget = false;
                targetBubble.word = getRandomDistractor();

                // Advance question seamlessly
                setTimeout(() => {
                  advanceToNextWordSeamless();
                }, 400);
              } else {
                // HIT WRONG ANSWER: Reveal correct answer & advance question
                isRevealingAnswerRef.current = true;
                setCombo(1);

                answersHistoryRef.current.push({
                  wordId: currentWordRef.current.id,
                  firstTryCorrect: false,
                  attemptsCount: 1,
                  responseTimeMs: 0,
                });

                // Respawn ONLY the hit wrong bubble
                targetBubble.y = -60;
                targetBubble.x = Math.random() * (width - 120) + 60;

                // Illuminate the correct bubble with golden beacon halo
                const correctBubble = bubbles.find((bb) => bb.isTarget);
                if (correctBubble) {
                  correctBubble.isRevealedAsCorrect = true;
                  if (!isMutedRef.current) {
                    soundEffects.speakWord(correctBubble.word, accent);
                  }
                }

                // After 1.3s learning reveal, advance question seamlessly
                setTimeout(() => {
                  if (correctBubble) {
                    correctBubble.isRevealedAsCorrect = false;
                  }
                  isRevealingAnswerRef.current = false;
                  advanceToNextWordSeamless();
                }, 1300);
              }

              bullets.splice(i, 1);
              continue;
            } else {
              b.vx = (dx / dist) * 24;
              b.vy = (dy / dist) * 24;
              b.x += b.vx;
              b.y += b.vy;
            }
          } else {
            b.x += b.vx;
            b.y += b.vy;
          }
        } else {
          b.x += b.vx;
          b.y += b.vy;
        }

        // Draw laser bolt
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 0.8, b.y - b.vy * 0.8);
        ctx.stroke();
        ctx.restore();

        if (b.y < -20 || b.y > height + 20 || b.x < -20 || b.x > width + 20) {
          bullets.splice(i, 1);
        }
      }

      // 5. Update and Draw Falling Bubbles (Clean, unhurried, spacious)
      let hoveredId: string | null = null;
      let minCursorDist = 999;
      for (const b of bubbles) {
        const d = Math.hypot(b.x - mouseRef.current.x, b.y - mouseRef.current.y);
        if (d <= b.radius + 12 && d < minCursorDist) {
          minCursorDist = d;
          hoveredId = b.id;
        }
      }

      for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        bubble.wobblePhase += 0.025;
        bubble.y += bubble.speedY; // Gentle, smooth fall speed
        bubble.x += Math.sin(bubble.wobblePhase) * 0.35 + bubble.speedX;

        // Keep inside bounds
        if (bubble.x < bubble.radius + 15) bubble.x = bubble.radius + 15;
        if (bubble.x > width - bubble.radius - 15) bubble.x = width - bubble.radius - 15;

        // Handle bubble falling past bottom
        if (bubble.y > height - 40) {
          if (bubble.isTarget && !bubble.isRevealedAsCorrect && !isRevealingAnswerRef.current) {
            // Target bubble reached bottom without being shot!
            // Reveal correct answer and advance question
            bubble.isRevealedAsCorrect = true;
            isRevealingAnswerRef.current = true;

            if (!isMutedRef.current) {
              soundEffects.playWrong();
              soundEffects.speakWord(bubble.word, accent);
            }

            answersHistoryRef.current.push({
              wordId: currentWordRef.current.id,
              firstTryCorrect: false,
              attemptsCount: 1,
              responseTimeMs: 0,
            });

            setTimeout(() => {
              bubble.isRevealedAsCorrect = false;
              bubble.y = -60;
              bubble.x = Math.random() * (width - 120) + 60;
              bubble.isTarget = false;
              bubble.word = getRandomDistractor();
              isRevealingAnswerRef.current = false;
              advanceToNextWordSeamless();
            }, 1300);
          } else if (!bubble.isRevealedAsCorrect) {
            // Distractor bubble fell past bottom: respawn at top!
            bubble.y = -60;
            bubble.x = Math.random() * (width - 120) + 60;

            // If a new target word is queued to enter from top, assign it here!
            if (nextTargetWordToSpawnRef.current) {
              bubble.word = nextTargetWordToSpawnRef.current;
              bubble.isTarget = true;
              nextTargetWordToSpawnRef.current = null;
            } else {
              bubble.word = getRandomDistractor(currentWordRef.current.word);
              bubble.isTarget = false;
            }
          }
        }

        // Draw Bubble Glass Sphere
        ctx.save();
        ctx.translate(bubble.x, bubble.y);

        const isHovered = hoveredId === bubble.id;
        const isRevealed = bubble.isRevealedAsCorrect;

        // Special golden beacon halo when revealed
        if (isRevealed) {
          const pulseR = bubble.radius + 10 + Math.sin(Date.now() * 0.01) * 5;
          ctx.strokeStyle = "rgba(253, 224, 71, 0.4)";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // Badge above bubble
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.roundRect(-55, -bubble.radius - 26, 110, 22, 11);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("★ ĐÁP ÁN ĐÚNG ★", 0, -bubble.radius - 15);
        } else if (isHovered) {
          // Hover Targeting Reticle
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, bubble.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Radial gradient sphere
        const grad = ctx.createRadialGradient(
          -bubble.radius * 0.3,
          -bubble.radius * 0.3,
          bubble.radius * 0.1,
          0,
          0,
          bubble.radius
        );
        grad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
        grad.addColorStop(0.5, isRevealed ? "rgba(245, 158, 11, 0.55)" : `${bubble.color}35`);
        grad.addColorStop(1, isRevealed ? "rgba(217, 119, 6, 0.95)" : `${bubble.color}90`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        // Border ring
        ctx.strokeStyle = isRevealed ? "#fde047" : bubble.border;
        ctx.lineWidth = isRevealed ? 3.5 : 2;
        ctx.stroke();

        // Specular highlight crescent
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.ellipse(
          -bubble.radius * 0.35,
          -bubble.radius * 0.35,
          bubble.radius * 0.28,
          bubble.radius * 0.15,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Large, Clear English Word Text (Easy to read!)
        ctx.fillStyle = isRevealed ? "#fffbeb" : "#ffffff";
        ctx.font = bubble.word.length > 9
          ? "bold 15px system-ui, -apple-system, sans-serif"
          : "bold 17px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bubble.word, 0, 1);

        ctx.restore();
      }

      // 6. Draw Shockwaves
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 3.5;
        sw.alpha -= 0.04;
        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
        } else {
          ctx.save();
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = sw.alpha;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 7. Draw Sparkling Explosion Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          if (p.isStar) {
            drawStar(ctx, p.x, p.y, p.size, p.rotation, p.color, p.alpha);
          } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // 8. Draw Floating Score Popups
      const floatScores = floatScoresRef.current;
      for (let i = floatScores.length - 1; i >= 0; i--) {
        const fs = floatScores[i];
        fs.y -= 1.2;
        fs.alpha -= 0.02;
        if (fs.alpha <= 0) {
          floatScores.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = fs.alpha;
          ctx.fillStyle = fs.color;
          ctx.font = "900 16px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(fs.text, fs.x, fs.y);
          ctx.restore();
        }
      }

      // 9. Draw Spaceship at Bottom (Silky smooth, responsive, tilt angle)
      const shipY = height - 44;
      ctx.save();
      ctx.translate(ship.x, shipY);
      ctx.rotate(ship.tilt);

      // Aiming Guide Line
      ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(0, -height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Thruster Exhaust Flame (animated pulse)
      const flameHeight = 12 + Math.random() * 6;
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-7, 18);
      ctx.lineTo(0, 18 + flameHeight);
      ctx.lineTo(7, 18);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.moveTo(-3, 18);
      ctx.lineTo(0, 18 + flameHeight * 0.6);
      ctx.lineTo(3, 18);
      ctx.closePath();
      ctx.fill();

      // Muzzle flash when firing
      if (ship.muzzleTimer > 0) {
        ship.muzzleTimer--;
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(-18, -16, 5, 0, Math.PI * 2);
        ctx.arc(18, -16, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Left Wing & Cannon
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-24, 14);
      ctx.lineTo(-32, 10);
      ctx.lineTo(-12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(-20, -16, 3, 14);

      // Right Wing & Cannon
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(24, 14);
      ctx.lineTo(32, 10);
      ctx.lineTo(12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(17, -16, 3, 14);

      // Central Hull
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(9, 6);
      ctx.lineTo(6, 18);
      ctx.lineTo(-6, 18);
      ctx.lineTo(-9, 6);
      ctx.closePath();
      ctx.fill();

      // Cockpit Window
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.ellipse(0, -6, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(-1, -8, 1.2, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore();

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [advanceToNextWordSeamless, getRandomDistractor]);

  // Handle Mouse movement on Canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  };

  // Handle Click / Tap: Precision Locking onto clicked bubble
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bubbles = bubblesRef.current;
    let clickedBubble: CanvasBubble | null = null;
    let minDist = 999;

    bubbles.forEach((b) => {
      const d = Math.hypot(b.x - clickX, b.y - clickY);
      if (d <= b.radius + 14 && d < minDist) {
        minDist = d;
        clickedBubble = b;
      }
    });

    firePrecisionLaser(clickedBubble, clickX, clickY);
  };

  // Keyboard Spacebar to shoot at hovered bubble
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const bubbles = bubblesRef.current;
        let targeted: CanvasBubble | null = null;
        let minDist = 999;

        bubbles.forEach((b) => {
          const d = Math.hypot(b.x - mouseRef.current.x, b.y - mouseRef.current.y);
          if (d <= b.radius + 20 && d < minDist) {
            minDist = d;
            targeted = b;
          }
        });

        firePrecisionLaser(targeted);
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        mouseRef.current.x = Math.max(40, mouseRef.current.x - 25);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        const w = containerRef.current?.clientWidth || 800;
        mouseRef.current.x = Math.min(w - 40, mouseRef.current.x + 25);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [firePrecisionLaser]);

  return (
    <FullscreenGameContainer
      title="🚀 Chiến hạm Bắn từ"
      unitName={unitName}
      currentWordIndex={currentIndex}
      totalWords={words.length}
      score={score}
      combo={combo}
      isMuted={isMuted}
      onToggleMute={() => setIsMuted(!isMuted)}
    >
      <div
        ref={containerRef}
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[#04040d] notranslate select-none cursor-crosshair"
        translate="no"
      >
        {/* Top HUD: Target Meaning & Pronunciation */}
        <div className="pointer-events-none absolute top-3 left-0 right-0 z-20 flex flex-col items-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 border border-cyan-400/30 px-5 py-1 text-xs font-bold text-slate-300 shadow-lg backdrop-blur-md">
            <Crosshair className="h-4 w-4 text-cyan-400 animate-spin" />
            <span className="uppercase tracking-wider text-[11px] text-cyan-300 font-extrabold">
              Bắn trúng bong bóng có nghĩa là:
            </span>
          </div>

          <div className="pointer-events-auto mt-2 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-6 py-2.5 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {currentWord?.meaningVi}
            </h2>
            <button
              type="button"
              onClick={() => soundEffects.speakWord(currentWord?.word || "", accent)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Nghe phát âm từ tiếng Anh"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 60FPS Arcade Canvas Field */}
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="h-full w-full touch-none"
        />

        {/* Bottom Tip Guidance */}
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400/90">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Trỏ chuột vào bóng để khóa mục tiêu chính xác • Bắn sai sẽ hiện đáp án đúng để học</span>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <GameResultModal
          result={result}
          onReplay={() => {
            setResult(null);
            onReplay();
          }}
        />
      )}
    </FullscreenGameContainer>
  );
}
