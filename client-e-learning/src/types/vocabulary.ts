export type VocabularyPartOfSpeech = "NOUN" | "VERB" | "ADJECTIVE" | "ADVERB" | "PREPOSITION" | "PHRASE";
export type VocabularyDifficulty = "EASY" | "MEDIUM" | "HARD";
export type VocabularyStatus = "ACTIVE" | "INACTIVE";

export interface VocabularyWord {
  id: number;
  unitId: number;
  unitName?: string;
  word: string;
  meaningVi: string;
  pronunciationUk?: string | null;
  pronunciationUs?: string | null;
  partOfSpeech?: VocabularyPartOfSpeech | null;
  exampleSentence?: string | null;
  exampleMeaningVi?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  difficulty: VocabularyDifficulty;
  displayOrder: number;
  status: VocabularyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyWordRequest {
  word: string;
  meaningVi: string;
  pronunciationUk?: string;
  pronunciationUs?: string;
  partOfSpeech?: VocabularyPartOfSpeech;
  exampleSentence?: string;
  exampleMeaningVi?: string;
  difficulty?: VocabularyDifficulty;
  audioUrl?: string;
  imageUrl?: string;
}

export interface UpdateVocabularyWordRequest {
  word: string;
  meaningVi: string;
  pronunciationUk?: string;
  pronunciationUs?: string;
  partOfSpeech?: VocabularyPartOfSpeech;
  exampleSentence?: string;
  exampleMeaningVi?: string;
  difficulty?: VocabularyDifficulty;
  status?: VocabularyStatus;
  audioUrl?: string;
  imageUrl?: string;
}

export interface BulkCreateVocabularyWordsRequest {
  words: CreateVocabularyWordRequest[];
}

export interface ReorderVocabularyRequest {
  items: {
    id: number;
    displayOrder: number;
  }[];
}

