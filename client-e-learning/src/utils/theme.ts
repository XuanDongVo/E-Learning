import type {
  BaseTone,
  ColorTone,
  DifficultyTone,
  SemanticTone,
} from "@/types/theme";

export const colorToneClasses: Record<ColorTone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  mint: "bg-emerald-50 text-emerald-600",
  teal: "bg-teal-50 text-teal-600",
  pink: "bg-pink-50 text-pink-600",
  gray: "bg-slate-100 text-slate-500",
};

export const semanticToneClasses: Record<SemanticTone, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-secondary-hover",
  accent: "bg-accent-light text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-blue-600",
  default: "bg-slate-100 text-slate-600",
};

export const difficultyToneClasses: Record<DifficultyTone, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-rose-50 text-rose-600",
};

export const baseToneClasses: Record<BaseTone, string> = {
  ...colorToneClasses,
  ...semanticToneClasses,
  ...difficultyToneClasses,
};
