export type GameType = "BUBBLE_POP" | "WORD_RAIN";
export type GameMode = "PRACTICE" | "CHALLENGE";
export type PronunciationAccent = "US" | "UK";

export interface GameGrade {
  id: number;
  code: string;
  name: string;
}

export interface GameUnitSummary {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  coverMediaId?: number | null;
  coverUrl?: string | null;
  displayOrder: number;
  vocabularyCount: number;
}

export interface GamePlayWord {
  id: number;
  word: string;
  meaningVi: string;
  pronunciationUk?: string | null;
  pronunciationUs?: string | null;
  partOfSpeech?: string | null;
  exampleSentence?: string | null;
  exampleMeaningVi?: string | null;
  imageUrl?: string | null;
  distractors: string[];
}

export interface StartGameSessionRequest {
  unitId: number;
  gameType: GameType;
  mode?: GameMode;
  accent?: PronunciationAccent;
}

export interface StartGameSessionResponse {
  sessionId: number;
  unitId: number;
  unitName: string;
  unitCode: string;
  gameType: GameType;
  mode: GameMode;
  accent: PronunciationAccent;
  words: GamePlayWord[];
}

export interface WordAnswerResult {
  wordId: number;
  firstTryCorrect: boolean;
  attemptsCount: number;
  responseTimeMs: number;
}

export interface FinishGameSessionRequest {
  timeSpentSeconds: number;
  answers: WordAnswerResult[];
}

export interface WordSummary {
  id: number;
  word: string;
  meaningVi: string;
  pronunciationUk?: string | null;
  pronunciationUs?: string | null;
  firstTryCorrect: boolean;
}

export interface FinishGameSessionResponse {
  sessionId: number;
  unitId: number;
  unitName: string;
  gameType: GameType;
  accent: PronunciationAccent;
  totalWords: number;
  firstTryCorrect: number;
  accuracyPercentage: number;
  totalScore: number;
  earnedXp: number;
  timeSpentSeconds: number;
  wordsMastered: WordSummary[];
  wordsToReview: WordSummary[];
}

