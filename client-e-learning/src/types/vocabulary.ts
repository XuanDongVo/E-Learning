export interface VocabularyWord {
  id: number;
  unitId: number;
  unitName?: string;
  word: string;
  meaningVi: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  exampleSentence?: string | null;
  exampleMeaningVi?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyWordRequest {
  word: string;
  meaningVi: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleMeaningVi?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  audioUrl?: string;
  imageUrl?: string;
}

export interface UpdateVocabularyWordRequest {
  word: string;
  meaningVi: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleMeaningVi?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: "ACTIVE" | "INACTIVE";
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

