/** Existing Pipo identity: moods and growth stages are stable domain-facing props. */
export const PIPO_LINES = [
  "Small steps count. You've got this!",
  "A little English, a little progress.",
  "Your next adventure is one click away.",
  "I'm rooting for you!",
  "Take your time. Learning isn't a race.",
  "New words, new possibilities!",
  "Mistakes help us learn.",
  "One activity can make a difference.",
  "Ready when you are!",
  "Look how far you've come!",
  "A fresh start is always welcome.",
  "Let's make today a learning day!",
] as const;

export type PipoMood = "idle" | "happy" | "cheer" | "oops" | "think" | "sleepy" | "wave" | "celebrate";
export type MascotColor = "primary" | "learning" | "accent" | "success" | "teal" | "pink" | "warm";
export type PipoStage = 1 | 2 | 3 | 4;
export type PipoProp = "book" | "pencil" | "badge";
