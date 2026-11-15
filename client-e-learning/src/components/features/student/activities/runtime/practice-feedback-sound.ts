"use client";

// Small synthesized feedback tones; no external audio asset or network request.
let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    context ??= new window.AudioContext();
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

export function unlockPracticeAudio() {
  void audio();
}

export function playPracticeFeedback(correct: boolean) {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = correct ? [523.25, 659.25, 783.99] : [294, 246.94];
  notes.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + index * (correct ? 0.085 : 0.115);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(correct ? 0.14 : 0.09, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  });
}
