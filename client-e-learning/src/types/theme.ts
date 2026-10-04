export type ColorTone =
  | "blue"
  | "green"
  | "orange"
  | "amber"
  | "violet"
  | "mint"
  | "teal"
  | "pink"
  | "gray";

export type SemanticTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "default";

export type DifficultyTone = "easy" | "medium" | "hard";

export type BaseTone = ColorTone | SemanticTone | DifficultyTone;
