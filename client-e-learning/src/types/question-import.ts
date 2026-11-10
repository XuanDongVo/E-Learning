import type { CreateQuestionRequest } from "@/types/content";

/** Matches the Phase 1 Java CsvValidationResult DTO. Validation never writes to the database. */
export interface CsvImportError {
  rowNumber: number;
  field: string;
  code: string;
  message: string;
  rawValue: string | null;
}

export interface ValidImportedQuestion {
  rowNumber: number;
  question: CreateQuestionRequest;
}

export interface CsvValidationResult {
  fileName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  validQuestions: ValidImportedQuestion[];
  errors: CsvImportError[];
}
