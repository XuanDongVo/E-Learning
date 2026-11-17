"use client";

// Short synthesized audio cues, without external files or network requests.
// Create/resume the context from the submit gesture so browser autoplay policies
// do not silence the later async server response.
let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    context ??= new window.AudioContext();
    return context;
  } catch {
    return null;
  }
}

export function unlockPracticeAudio(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
}

function emitTone(ctx: AudioContext, frequency: number, at: number, duration: number, gainAmount: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(gainAmount, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.01);
}

export function playPracticeFeedback(correct: boolean): void {
  const ctx = getContext();
  if (!ctx) return;
  const play = () => {
    if (ctx.state !== "running") return;
    const start = ctx.currentTime + 0.015;
    try {
      if (correct) {
        [523.25, 659.25, 783.99].forEach((note, index) => {
          emitTone(ctx, note, start + index * 0.09, 0.19, 0.16);
        });
      } else {
        // Two clearly audible descending notes for wrong answers; gentler than
        // an error buzzer, but distinct from the ascending success chime.
        emitTone(ctx, 392, start, 0.23, 0.2);
        emitTone(ctx, 196, start + 0.16, 0.3, 0.19);
      }
    } catch {
      // Audio is decorative; never affect answering or session state.
    }
  };
  if (ctx.state === "running") {
    play();
  } else if (ctx.state === "suspended") {
    void ctx.resume().then(play).catch(() => {});
  }
}
