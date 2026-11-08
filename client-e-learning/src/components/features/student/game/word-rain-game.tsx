"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GamePlayWord, WordAnswerResult, FinishGameSessionResponse } from "@/types/vocabulary-game";
import { soundEffects } from "./sound-effects";
import { studentGameService } from "@/services/student/student-game.service";
import { FullscreenGameContainer } from "./fullscreen-game-container";
import { GameResultModal } from "./game-result-modal";
import { CloudRain, Sparkles, Volume2 } from "lucide-react";

interface WordRainGameProps {
  sessionId: number;
  unitName: string;
  words: GamePlayWord[];
  mode: "PRACTICE" | "CHALLENGE";
  onReplay: () => void;
}

interface CanvasRaindrop {
  id: string;
  wordObj: GamePlayWord;
  cleanWord: string;
  meaningVi: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  wobblePhase: number;
  typed: string;
  isLocked: boolean;
  isCompleted: boolean;
  isLanded: boolean;
  landedTimer: number;
  alpha: number;
  shakeOffset: number;
  themeColor: { bg1: string; bg2: string; border: string; glow: string };
}

interface WaterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isBubble?: boolean;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

interface Firefly {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  color: string;
}

interface RainDrizzle {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

interface LotusPad {
  relX: number;
  radius: number;
  phaseOffset: number;
  hasFlower: boolean;
}

const DROP_THEMES = [
  { bg1: "#0e4b6e", bg2: "#072b42", border: "#38bdf8", glow: "rgba(56, 189, 248, 0.4)" }, // Aqua Cyan
  { bg1: "#4c1d95", bg2: "#2e1065", border: "#c084fc", glow: "rgba(192, 132, 252, 0.4)" }, // Mystical Purple
  { bg1: "#065f46", bg2: "#064e3b", border: "#34d399", glow: "rgba(52, 211, 153, 0.4)" }, // Emerald Green
  { bg1: "#854d0e", bg2: "#451a03", border: "#fde047", glow: "rgba(253, 224, 71, 0.4)" }, // Warm Amber
];

const LANES = [0.22, 0.5, 0.78]; // Non-overlapping comfortable vertical columns

export function WordRainGame({
  sessionId,
  unitName,
  words,
  mode,
  onReplay,
}: WordRainGameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [startTime] = useState<number>(() => Date.now());
  const [completedCount, setCompletedCount] = useState(0);
  const [result, setResult] = useState<FinishGameSessionResponse | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // References for 60fps delta-time game loop without React re-render hitching
  const dropsRef = useRef<CanvasRaindrop[]>([]);
  const queueRef = useRef<GamePlayWord[]>([...words]);
  const answersRef = useRef<WordAnswerResult[]>([]);
  const particlesRef = useRef<WaterParticle[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const starsRef = useRef<Star[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const drizzleRef = useRef<RainDrizzle[]>([]);
  const lotusPadsRef = useRef<LotusPad[]>([
    { relX: 0.15, radius: 28, phaseOffset: 0, hasFlower: true },
    { relX: 0.38, radius: 24, phaseOffset: 1.8, hasFlower: false },
    { relX: 0.65, radius: 32, phaseOffset: 3.2, hasFlower: true },
    { relX: 0.88, radius: 26, phaseOffset: 4.5, hasFlower: false },
  ]);

  const isGameOverRef = useRef(false);
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  const isMutedRef = useRef(isMuted);

  scoreRef.current = score;
  comboRef.current = combo;
  isMutedRef.current = isMuted;

  // Relaxed, comfortable speed: ~28-35s from top to pond
  const baseSpeed = mode === "CHALLENGE" ? 0.46 : 0.36;

  // Initialize dreamy environment (Stars, Fireflies, Drizzle)
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 55; i++) {
      stars.push({
        x: Math.random() * 1920,
        y: Math.random() * 700,
        radius: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.03 + 0.015,
      });
    }
    starsRef.current = stars;

    const flies: Firefly[] = [];
    for (let i = 0; i < 16; i++) {
      flies.push({
        x: Math.random() * 1920,
        y: Math.random() * 500 + 350,
        radius: Math.random() * 2 + 1.2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? "#38bdf8" : "#fef08a",
      });
    }
    firefliesRef.current = flies;

    const drizz: RainDrizzle[] = [];
    for (let i = 0; i < 35; i++) {
      drizz.push({
        x: Math.random() * 1920,
        y: Math.random() * 900,
        length: Math.random() * 14 + 8,
        speed: Math.random() * 2.2 + 2.0,
        alpha: Math.random() * 0.25 + 0.08,
      });
    }
    drizzleRef.current = drizz;
  }, []);

  // Finish session handler
  const finishSession = useCallback(async () => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const finalAnswers = answersRef.current;
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
        gameType: "WORD_RAIN",
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

  // Spawn a new crystal raindrop
  const trySpawnDrop = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const activeDrops = dropsRef.current.filter((d) => !d.isCompleted && !d.isLanded);
    if (activeDrops.length >= 3) return; // Keep max 3 drops on screen for clean visibility

    const width = containerRef.current?.clientWidth || 960;
    const occupiedLanes = new Set(
      activeDrops.map((d) => {
        let nearest = 0;
        let minDist = 9999;
        LANES.forEach((l, idx) => {
          const dist = Math.abs(d.x - l * width);
          if (dist < minDist) {
            minDist = dist;
            nearest = idx;
          }
        });
        return nearest;
      })
    );

    const availableLanes = [0, 1, 2].filter((i) => !occupiedLanes.has(i));
    const chosenIndex =
      availableLanes.length > 0
        ? availableLanes[Math.floor(Math.random() * availableLanes.length)]
        : Math.floor(Math.random() * LANES.length);

    const nextWordObj = queueRef.current.shift();
    if (!nextWordObj) return;

    const clean = nextWordObj.word.toLowerCase();
    const slotCount = clean.replace(/ /g, "").length;
    // Comfortable spacious width
    const capsuleWidth = Math.max(200, slotCount * 38 + 56);
    const capsuleHeight = 90;
    const laneCenterX = LANES[chosenIndex] * width;
    const targetX = Math.max(capsuleWidth / 2 + 25, Math.min(width - capsuleWidth / 2 - 25, laneCenterX));

    const theme = DROP_THEMES[Math.floor(Math.random() * DROP_THEMES.length)];

    const newDrop: CanvasRaindrop = {
      id: `${nextWordObj.id}-${Date.now()}-${Math.random()}`,
      wordObj: nextWordObj,
      cleanWord: clean,
      meaningVi: nextWordObj.meaningVi,
      x: targetX,
      y: -capsuleHeight - 20,
      width: capsuleWidth,
      height: capsuleHeight,
      speedY: baseSpeed + (Math.random() * 0.04 - 0.02),
      wobblePhase: Math.random() * Math.PI * 2,
      typed: "",
      isLocked: false,
      isCompleted: false,
      isLanded: false,
      landedTimer: 0,
      alpha: 1,
      shakeOffset: 0,
      themeColor: theme,
    };

    dropsRef.current.push(newDrop);
  }, [baseSpeed]);

  // Main 60FPS High-Performance Delta-Time Canvas Loop (ZERO ctx.shadowBlur!)
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

    // Initial drop spawn
    trySpawnDrop();
    setTimeout(() => trySpawnDrop(), 1600);

    let lastSpawnTime = Date.now();
    let lastFrameTime = performance.now();
    let wavePhase = 0;

    // Helper: smooth rounded rectangle
    const drawRoundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    // Splash burst generator
    const spawnSplashCelebration = (x: number, y: number, isSuccess: boolean) => {
      const count = isSuccess ? 32 : 18;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isSuccess ? 2.5 : 1.0),
          size: Math.random() * 3.5 + 1.5,
          color: isSuccess
            ? ["#38bdf8", "#fde047", "#34d399", "#f472b6", "#a855f7"][Math.floor(Math.random() * 5)]
            : "#fbbf24",
          alpha: 1,
          decay: Math.random() * 0.025 + 0.018,
          isBubble: Math.random() > 0.5,
        });
      }
    };

    // 60FPS Game Loop
    const loop = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      // Normal delta-time clamping (around 1.0 at 60fps)
      const dt = Math.min(Math.max(elapsed / 16.667, 0.5), 2.2);

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const waterY = height - 68; // Level of lotus pond
      const now = Date.now();

      wavePhase += 0.025 * dt;

      // Periodic drop spawn
      if (now - lastSpawnTime > 2800 && queueRef.current.length > 0) {
        trySpawnDrop();
        lastSpawnTime = now;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // ==========================================
      // 1. SKY BACKGROUND (Magical Dreamy Twilight)
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#080d1a");
      skyGrad.addColorStop(0.35, "#0d1b2e");
      skyGrad.addColorStop(0.75, "#0b253a");
      skyGrad.addColorStop(1, "#041522");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 2. CRESCENT MOON & MOONLIGHT GLOW (Lightweight)
      // ==========================================
      const moonX = width - 110;
      const moonY = 85;
      const moonR = 26;

      // Soft ambient moonlight corona (No shadowBlur!)
      const moonCorona = ctx.createRadialGradient(moonX, moonY, moonR * 0.6, moonX, moonY, moonR * 3.5);
      moonCorona.addColorStop(0, "rgba(253, 224, 71, 0.16)");
      moonCorona.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
      moonCorona.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = moonCorona;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon Shape
      ctx.save();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      // Cutout for crescent
      ctx.fillStyle = "#0c182b";
      ctx.beginPath();
      ctx.arc(moonX + 11, moonY - 6, moonR * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // 3. TWINKLING STARS
      // ==========================================
      ctx.fillStyle = "#ffffff";
      for (const st of starsRef.current) {
        st.phase += st.speed * dt;
        const currentAlpha = 0.3 + 0.5 * Math.sin(st.phase);
        ctx.globalAlpha = Math.max(0.1, currentAlpha);
        ctx.beginPath();
        ctx.arc(st.x % width, st.y, st.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ==========================================
      // 4. PARALLAX RAIN DRIZZLE
      // ==========================================
      ctx.strokeStyle = "rgba(125, 211, 252, 0.4)";
      ctx.lineWidth = 1.2;
      for (const d of drizzleRef.current) {
        d.y += d.speed * dt;
        d.x -= d.speed * 0.15 * dt;
        if (d.y > waterY) {
          d.y = 20;
          d.x = Math.random() * (width + 100);
        }
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.15, d.y + d.length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ==========================================
      // 5. FLUFFY RAIN CLOUDS AT TOP (Stylized Puffy Clouds)
      // ==========================================
      ctx.save();
      const cloudGrad = ctx.createLinearGradient(0, 0, 0, 80);
      cloudGrad.addColorStop(0, "rgba(30, 41, 59, 0.95)");
      cloudGrad.addColorStop(0.7, "rgba(15, 23, 42, 0.88)");
      cloudGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = cloudGrad;

      // Puffy cloud arcs across top
      const cloudPuffs = Math.ceil(width / 90) + 1;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      for (let p = 0; p <= cloudPuffs; p++) {
        const cx = p * 90;
        const cy = 25 + Math.sin(p * 1.3 + wavePhase * 0.3) * 8;
        ctx.quadraticCurveTo(cx - 45, cy + 30, cx, cy + 10);
      }
      ctx.lineTo(width + 40, 0);
      ctx.closePath();
      ctx.fill();

      // Cloud lower rim highlight
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // ==========================================
      // 6. FIREFLIES DANCING
      // ==========================================
      for (const f of firefliesRef.current) {
        f.phase += 0.03 * dt;
        f.x += (f.vx + Math.sin(f.phase) * 0.4) * dt;
        f.y += (f.vy + Math.cos(f.phase) * 0.3) * dt;
        if (f.x < 0) f.x = width;
        if (f.x > width) f.x = 0;
        if (f.y < waterY - 300) f.y = waterY - 50;
        if (f.y > waterY - 10) f.y = waterY - 150;

        const pulse = 0.5 + 0.5 * Math.sin(f.phase);
        ctx.globalAlpha = 0.4 + 0.5 * pulse;
        // Firefly glow halo
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * (1.8 + pulse), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ==========================================
      // 7. WATER RIPPLES ON POND
      // ==========================================
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += 1.6 * dt;
        rp.alpha -= 0.016 * dt;
        if (rp.alpha <= 0 || rp.radius > rp.maxRadius) {
          ripples.splice(i, 1);
        } else {
          ctx.save();
          ctx.strokeStyle = rp.color;
          ctx.globalAlpha = rp.alpha;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rp.radius * 2.2, rp.radius * 0.65, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ==========================================
      // 8. WATER PARTICLES & SPLASHES
      // ==========================================
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.14 * dt; // gravity
        p.alpha -= p.decay * dt;
        if (p.alpha <= 0) {
          parts.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          if (p.isBubble) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ==========================================
      // 9. UPDATE & DRAW FALLING CRYSTAL RAINDROPS
      // ==========================================
      const drops = dropsRef.current;
      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];

        if (!drop.isLanded && !drop.isCompleted) {
          drop.wobblePhase += 0.03 * dt;
          drop.y += drop.speedY * dt;

          if (drop.shakeOffset > 0) {
            drop.shakeOffset = Math.max(0, drop.shakeOffset - 0.8 * dt);
          }

          // Contact with lake water surface
          if (drop.y + drop.height >= waterY) {
            drop.isLanded = true;
            drop.landedTimer = 95; // Reveal answer for ~1.6s

            ripplesRef.current.push({
              x: drop.x,
              y: waterY,
              radius: 12,
              maxRadius: 85,
              alpha: 0.95,
              color: "#fbbf24",
            });

            spawnSplashCelebration(drop.x, waterY, false);

            if (!isMutedRef.current) {
              soundEffects.playWaterChime();
              soundEffects.speakWord(drop.cleanWord);
            }
            setCombo(1);

            answersRef.current.push({
              wordId: drop.wordObj.id,
              firstTryCorrect: false,
              attemptsCount: 2,
              responseTimeMs: 0,
            });

            setCompletedCount((c) => c + 1);
          }
        } else if (drop.isLanded) {
          drop.landedTimer -= 1 * dt;
          if (drop.landedTimer <= 20) {
            drop.alpha = Math.max(0, drop.landedTimer / 20);
          }
          if (drop.landedTimer <= 0) {
            drops.splice(i, 1);
            trySpawnDrop();
            if (dropsRef.current.length === 0 && queueRef.current.length === 0) {
              void finishSession();
            }
            continue;
          }
        } else if (drop.isCompleted) {
          drop.alpha -= 0.05 * dt;
          if (drop.alpha <= 0) {
            drops.splice(i, 1);
            trySpawnDrop();
            if (dropsRef.current.length === 0 && queueRef.current.length === 0) {
              void finishSession();
            }
            continue;
          }
        }

        // --- Render Raindrop ---
        ctx.save();
        ctx.globalAlpha = drop.alpha;

        const shakeX = drop.shakeOffset > 0 ? Math.sin(drop.shakeOffset * 8) * 6 : 0;
        const drawX = drop.x + shakeX;
        const left = drawX - drop.width / 2;
        const top = drop.y;

        // 9A. TARGET BEAM (Starlight guide when locked)
        if (drop.isLocked && !drop.isLanded && !drop.isCompleted) {
          ctx.save();
          // Vertical gentle spotlight beam
          const beamGrad = ctx.createLinearGradient(0, 0, 0, top);
          beamGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
          beamGrad.addColorStop(1, "rgba(56, 189, 248, 0.18)");
          ctx.fillStyle = beamGrad;
          ctx.fillRect(left - 8, 0, drop.width + 16, top);

          // Lock-on badge with soft double border
          ctx.fillStyle = "#0284c7";
          drawRoundRect(ctx, drawX - 68, top - 28, 136, 22, 11);
          ctx.fill();
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("✦ ĐANG GÕ TỪ NÀY ✦", drawX, top - 17);
          ctx.restore();
        }

        // 9B. TEARDROP CREST AT TOP
        ctx.save();
        ctx.translate(drawX, top + 1);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = drop.isLanded
          ? "#f59e0b"
          : drop.isLocked
          ? "#0284c7"
          : drop.themeColor.bg1;
        ctx.fillRect(-7, -7, 14, 14);
        ctx.strokeStyle = drop.isLanded
          ? "#fde047"
          : drop.isLocked
          ? "#38bdf8"
          : drop.themeColor.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(-7, -7, 14, 14);
        ctx.restore();

        // 9C. CRYSTAL DROPLET BODY (Layered stroke for lag-free glow)
        if (drop.isLocked || drop.isLanded) {
          // Fast zero-cost glow halo using layered alpha stroke!
          ctx.save();
          ctx.strokeStyle = drop.isLanded ? "rgba(253, 224, 71, 0.25)" : "rgba(56, 189, 248, 0.25)";
          ctx.lineWidth = 8;
          drawRoundRect(ctx, left - 2, top - 2, drop.width + 4, drop.height + 4, 24);
          ctx.stroke();
          ctx.restore();
        }

        // Droplet Capsule Gradient
        const cardGrad = ctx.createLinearGradient(0, top, 0, top + drop.height);
        if (drop.isLanded) {
          cardGrad.addColorStop(0, "rgba(245, 158, 11, 0.45)");
          cardGrad.addColorStop(0.5, "rgba(180, 83, 9, 0.88)");
          cardGrad.addColorStop(1, "rgba(120, 53, 15, 0.95)");
        } else if (drop.isLocked) {
          cardGrad.addColorStop(0, "rgba(14, 116, 144, 0.65)");
          cardGrad.addColorStop(0.5, "rgba(8, 47, 73, 0.9)");
          cardGrad.addColorStop(1, "rgba(3, 31, 51, 0.95)");
        } else {
          cardGrad.addColorStop(0, "rgba(255, 255, 255, 0.16)");
          cardGrad.addColorStop(0.3, drop.themeColor.bg1 + "cc");
          cardGrad.addColorStop(1, drop.themeColor.bg2 + "fa");
        }

        ctx.fillStyle = cardGrad;
        drawRoundRect(ctx, left, top, drop.width, drop.height, 22);
        ctx.fill();

        // Capsule Border
        ctx.strokeStyle = drop.isLanded
          ? "#fde047"
          : drop.isLocked
          ? "#38bdf8"
          : drop.themeColor.border;
        ctx.lineWidth = drop.isLocked ? 2.5 : 1.8;
        ctx.stroke();

        // Specular highlight crescent at top-left
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.ellipse(left + 26, top + 12, 18, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 9D. VIETNAMESE MEANING TEXT (Clear, friendly, high-contrast)
        ctx.save();
        ctx.fillStyle = drop.isLanded ? "#fef08a" : "#ffffff";
        ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(drop.meaningVi, drawX, top + 24);
        ctx.restore();

        // 9E. LETTER PEARL SLOTS
        if (drop.isLanded) {
          // If landed, reveal English word and phonetic hint
          ctx.save();
          ctx.fillStyle = "#fde047";
          ctx.font = "bold 15px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `${drop.wordObj.word} ${drop.wordObj.pronunciation ? `(${drop.wordObj.pronunciation})` : ""}`,
            drawX,
            top + 60
          );
          ctx.restore();
        } else {
          // Normal state: draw glowing letter pearl slots
          const letters = drop.cleanWord.split("");
          const slotW = 30;
          const slotH = 36;
          const gap = 5;
          const totalSlotsW = letters.length * slotW + (letters.length - 1) * gap;
          const startSlotX = drawX - totalSlotsW / 2;

          letters.forEach((char, idx) => {
            const isTyped = idx < drop.typed.length;
            const isNext = drop.isLocked && idx === drop.typed.length;
            const slotX = startSlotX + idx * (slotW + gap);
            const slotY = top + 44;

            if (char === " ") {
              // Word gap indicator
              ctx.save();
              ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
              ctx.fillRect(slotX + 10, slotY + slotH - 4, 10, 2);
              ctx.restore();
              return;
            }

            ctx.save();
            if (isTyped) {
              // TYPED LETTER: Bright golden pearl
              ctx.fillStyle = "rgba(253, 224, 71, 0.35)";
              drawRoundRect(ctx, slotX, slotY, slotW, slotH, 8);
              ctx.fill();
              ctx.strokeStyle = "#fde047";
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.fillStyle = "#ffffff";
              ctx.font = "900 16px system-ui, sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(drop.typed[idx].toUpperCase(), slotX + slotW / 2, slotY + slotH / 2);
            } else if (isNext) {
              // NEXT LETTER TO TYPE: Pulsing cyan cue
              const pulse = 0.5 + 0.5 * Math.sin(currentTime * 0.008);
              ctx.fillStyle = `rgba(56, 189, 248, ${0.15 + pulse * 0.15})`;
              drawRoundRect(ctx, slotX, slotY, slotW, slotH, 8);
              ctx.fill();
              ctx.strokeStyle = "#38bdf8";
              ctx.lineWidth = 2;
              ctx.stroke();

              // Pulsing indicator cursor
              ctx.fillStyle = "#38bdf8";
              ctx.fillRect(slotX + slotW / 2 - 5, slotY + slotH - 6, 10, 2);
            } else {
              // UNTYPED SLOT: Soft translucent bead
              ctx.fillStyle = drop.isLocked
                ? "rgba(15, 23, 42, 0.6)"
                : "rgba(255, 255, 255, 0.08)";
              drawRoundRect(ctx, slotX, slotY, slotW, slotH, 8);
              ctx.fill();
              ctx.strokeStyle = drop.isLocked
                ? "rgba(56, 189, 248, 0.35)"
                : "rgba(255, 255, 255, 0.2)";
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Frosted center placeholder dot
              ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
              ctx.beginPath();
              ctx.arc(slotX + slotW / 2, slotY + slotH / 2, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });
        }

        ctx.restore();
      }

      // ==========================================
      // 10. LIVING LOTUS POND AT BOTTOM (Thơ mộng, tươi đẹp)
      // ==========================================
      ctx.save();
      // Double sinusoidal undulating water wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 15) {
        const wy =
          waterY +
          Math.sin(x * 0.008 + wavePhase) * 4 +
          Math.sin(x * 0.018 - wavePhase * 1.2) * 2.5;
        if (x === 0) ctx.lineTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      // Deep turquoise lake gradient
      const lakeGrad = ctx.createLinearGradient(0, waterY, 0, height);
      lakeGrad.addColorStop(0, "rgba(14, 116, 144, 0.88)");
      lakeGrad.addColorStop(0.35, "rgba(12, 74, 110, 0.95)");
      lakeGrad.addColorStop(1, "rgba(4, 27, 44, 0.98)");
      ctx.fillStyle = lakeGrad;
      ctx.fill();

      // Luminous Water Horizon Line
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Floating Lotus Leaves & Flowers (Lá Sen & Hoa Sen)
      for (const pad of lotusPadsRef.current) {
        const padX = pad.relX * width;
        const waveH = Math.sin(padX * 0.008 + wavePhase + pad.phaseOffset) * 4;
        const padY = waterY + waveH + 10;

        // Lotus Pad (Lá Sen Xanh)
        ctx.save();
        ctx.translate(padX, padY);
        ctx.fillStyle = "#059669"; // Emerald leaf
        ctx.beginPath();
        // Circle with characteristic lotus notch cut
        ctx.arc(0, 0, pad.radius, 0.25, Math.PI * 2 - 0.25);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Vein details on leaf
        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
        ctx.lineWidth = 1;
        for (let a = 0.5; a < Math.PI * 2; a += 0.9) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * (pad.radius - 4), Math.sin(a) * (pad.radius - 4));
          ctx.stroke();
        }

        // Lotus Flower (Hoa Sen Hồng Thơ Mộng)
        if (pad.hasFlower) {
          ctx.save();
          ctx.translate(6, -6);
          // Petals
          ctx.fillStyle = "#f472b6";
          for (let petal = 0; petal < 6; petal++) {
            const rot = (petal * Math.PI) / 3;
            ctx.save();
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.ellipse(0, -9, 4, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          // Center golden stamen
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }
      ctx.restore();

      // ==========================================
      // 11. FLOATING SCORE / COMBO TEXTS
      // ==========================================
      const floatings = floatingTextsRef.current;
      for (let i = floatings.length - 1; i >= 0; i--) {
        const ft = floatings[i];
        ft.y -= 1.3 * dt;
        ft.alpha -= 0.02 * dt;
        ft.scale = Math.min(1.2, ft.scale + 0.015 * dt);

        if (ft.alpha <= 0) {
          floatings.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.font = `bold ${Math.round(20 * ft.scale)}px system-ui, sans-serif`;
          ctx.fillStyle = ft.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }
      }

      ctx.restore(); // Final pop of scale(dpr, dpr)

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [baseSpeed, finishSession, trySpawnDrop]);

  // Click / Tap on Raindrop to Target and Lock!
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOverRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const activeDrops = dropsRef.current.filter((d) => !d.isCompleted && !d.isLanded);
    for (const d of activeDrops) {
      const left = d.x - d.width / 2;
      const top = d.y;
      if (
        clickX >= left &&
        clickX <= left + d.width &&
        clickY >= top &&
        clickY <= top + d.height
      ) {
        // Unlock all others, lock this drop!
        activeDrops.forEach((item) => (item.isLocked = false));
        d.isLocked = true;
        if (!isMutedRef.current) {
          soundEffects.playPop();
          soundEffects.speakWord(d.cleanWord);
        }
        break;
      }
    }
  };

  // Physical Keyboard Listener (Instant feedback, target locking, zero lag!)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOverRef.current) return;

      const activeDrops = dropsRef.current.filter((d) => !d.isCompleted && !d.isLanded);
      if (activeDrops.length === 0) return;

      const lockedDrop = activeDrops.find((d) => d.isLocked);

      // Backspace: erase last typed letter, or unlock if empty
      if (e.key === "Backspace") {
        if (lockedDrop) {
          lockedDrop.typed = lockedDrop.typed.slice(0, -1);
          if (lockedDrop.typed.length === 0) {
            lockedDrop.isLocked = false;
          }
        }
        return;
      }

      // Only handle single-character keys
      if (e.key.length !== 1) return;
      const char = e.key.toLowerCase();

      // 1. If a drop is ALREADY LOCKED:
      if (lockedDrop) {
        const nextChar = lockedDrop.cleanWord[lockedDrop.typed.length];
        if (nextChar === " " && char !== " ") {
          // Auto skip space if next char matches
          if (char === lockedDrop.cleanWord[lockedDrop.typed.length + 1]) {
            lockedDrop.typed += " " + char;
            if (!isMutedRef.current) soundEffects.playPop();
          } else {
            lockedDrop.shakeOffset = 10;
            if (!isMutedRef.current) soundEffects.playWrong();
            return;
          }
        } else if (char === nextChar) {
          lockedDrop.typed += char;
          if (!isMutedRef.current) soundEffects.playPop();
        } else {
          // Wrong key typed
          lockedDrop.shakeOffset = 10;
          if (!isMutedRef.current) soundEffects.playWrong();
          return;
        }

        // Check if word completed!
        if (lockedDrop.typed === lockedDrop.cleanWord) {
          lockedDrop.isCompleted = true;

          // Water celebration explosion
          const cx = lockedDrop.x;
          const cy = lockedDrop.y + lockedDrop.height / 2;
          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            particlesRef.current.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2.5,
              size: Math.random() * 3.5 + 1.5,
              color: ["#38bdf8", "#fde047", "#34d399", "#f472b6"][Math.floor(Math.random() * 4)],
              alpha: 1,
              decay: Math.random() * 0.02 + 0.02,
              isBubble: true,
            });
          }

          floatingTextsRef.current.push({
            x: cx,
            y: cy - 20,
            text: `+${10 * comboRef.current} XP!`,
            color: "#fde047",
            alpha: 1,
            scale: 1,
          });

          if (!isMutedRef.current) {
            soundEffects.playWaterChime();
            soundEffects.playSplash();
            soundEffects.speakWord(lockedDrop.cleanWord);
          }

          setScore((s) => s + 10 * comboRef.current);
          setCombo((c) => Math.min(c + 1, 8));

          answersRef.current.push({
            wordId: lockedDrop.wordObj.id,
            firstTryCorrect: true,
            attemptsCount: 1,
            responseTimeMs: 0,
          });

          setCompletedCount((c) => c + 1);
        }
        return;
      }

      // 2. If NO DROP IS LOCKED: find drop starting with this letter to lock-on!
      const candidateDrop = activeDrops.find((d) => d.cleanWord.startsWith(char));
      if (candidateDrop) {
        candidateDrop.isLocked = true;
        candidateDrop.typed = char;
        if (!isMutedRef.current) soundEffects.playPop();

        // Edge case: single letter word
        if (candidateDrop.typed === candidateDrop.cleanWord) {
          candidateDrop.isCompleted = true;

          if (!isMutedRef.current) {
            soundEffects.playWaterChime();
            soundEffects.playSplash();
            soundEffects.speakWord(candidateDrop.cleanWord);
          }

          setScore((s) => s + 10 * comboRef.current);
          setCombo((c) => Math.min(c + 1, 8));

          answersRef.current.push({
            wordId: candidateDrop.wordObj.id,
            firstTryCorrect: true,
            attemptsCount: 1,
            responseTimeMs: 0,
          });

          setCompletedCount((c) => c + 1);
        }
      } else {
        if (!isMutedRef.current) soundEffects.playWrong();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <FullscreenGameContainer
      title="🌧️ Cơn mưa Từ vựng"
      unitName={unitName}
      currentWordIndex={completedCount}
      totalWords={words.length}
      score={score}
      combo={combo}
      isMuted={isMuted}
      onToggleMute={() => setIsMuted(!isMuted)}
    >
      <div
        ref={containerRef}
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[#080d1a] notranslate select-none cursor-pointer"
        translate="no"
      >
        {/* Top Floating Guidance & Remaining Word Banner */}
        <div className="pointer-events-none absolute top-3 left-0 right-0 z-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5 rounded-full bg-slate-900/80 border border-cyan-400/30 px-5 py-2 text-xs font-medium text-cyan-200 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <CloudRain className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Gõ chữ cái đầu tiên (hoặc bấm chọn) để khóa giọt mưa • Hoàn thành từ trước khi chạm hồ</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 bg-slate-900/80 border border-amber-400/25 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-md">
              Còn lại: {queueRef.current.length + dropsRef.current.filter((d) => !d.isCompleted && !d.isLanded).length} từ
            </span>
          </div>
        </div>

        {/* 60FPS Silky Smooth Canvas Field with Click-to-lock support */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="h-full w-full touch-none"
        />

        {/* Bottom Atmospheric Tip */}
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-2 text-xs font-medium text-slate-300/80">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Hồ sen đêm thơ mộng • Gõ trực tiếp bằng bàn phím máy tính • Phím Backspace để xóa</span>
        </div>
      </div>

      {/* Game Result Modal */}
      {result && (
        <GameResultModal
          result={result}
          onReplay={() => {
            setResult(null); // Instantly close result modal!
            onReplay();
          }}
        />
      )}
    </FullscreenGameContainer>
  );
}
