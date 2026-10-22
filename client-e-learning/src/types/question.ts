export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionMatchingMode = "CASE_INSENSITIVE_TRIM" | "CASE_SENSITIVE_TRIM";
export type TrueFalseAnswer = "TRUE" | "FALSE";
export type QuestionMediaKind = "image" | "audio";
export interface QuestionOptionDraft { id: string; text: string; }
export interface QuestionMediaDraft { id: string; name: string; kind: QuestionMediaKind; sizeLabel?: string; url?: string; }
export interface MatchingDraftDefinition { items: { key: string; prompt: string }[]; answerPool: string[]; expectedPairs: Record<string, string>; shuffleAnswers?: boolean; }
export interface ClozeDraftDefinition { segments: { text: string }[]; blanks: { key: string; acceptedAnswers: string[] }[]; caseSensitive?: boolean; }
export interface DraftQuestion {
  draftId: string; type: QuestionType; difficulty: QuestionDifficulty; text: string; options: QuestionOptionDraft[]; correctOptionIds: string[]; trueFalseAnswer: TrueFalseAnswer;
  acceptedAnswers: string[]; media: QuestionMediaDraft[]; explanation: string; hint?: string; matchingDefinition?: MatchingDraftDefinition; clozeDefinition?: ClozeDraftDefinition;
}
export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "TYPE_ANSWER" | "MATCHING" | "CLOZE";
export interface QuestionCommonSpec { content: string; difficulty: QuestionDifficulty; explanation?: string; hint?: string; media: QuestionMediaDraft[]; }
export interface SingleChoiceSpec extends QuestionCommonSpec { type: "SINGLE_CHOICE"; choices: QuestionOptionDraft[]; correctChoiceKey: string; }
export interface MultipleChoiceSpec extends QuestionCommonSpec { type: "MULTIPLE_CHOICE"; choices: QuestionOptionDraft[]; correctChoiceKeys: string[]; }
export interface TrueFalseSpec extends QuestionCommonSpec { type: "TRUE_FALSE"; expected: TrueFalseAnswer; }
export interface FillInBlankSpec extends QuestionCommonSpec { type: "FILL_IN_BLANK"; acceptedAnswers: string[]; matchingMode: QuestionMatchingMode; }
export interface TypeAnswerSpec extends QuestionCommonSpec { type: "TYPE_ANSWER"; acceptedAnswers: string[]; matchingMode: QuestionMatchingMode; }
export interface MatchingPairSpec { itemKey: string; answerKey: string; }
export interface MatchingSpec extends QuestionCommonSpec { type: "MATCHING"; items: { key: string; content: string }[]; answerPool: { key: string; content: string }[]; pairs: MatchingPairSpec[]; }
export interface ClozeBlankSpec { key: string; acceptedAnswers: string[]; }
export interface ClozeSpec extends QuestionCommonSpec { type: "CLOZE"; segments: { text: string; blankKey?: string }[]; blanks: ClozeBlankSpec[]; }
export type QuestionSpec = SingleChoiceSpec | MultipleChoiceSpec | TrueFalseSpec | FillInBlankSpec | TypeAnswerSpec | MatchingSpec | ClozeSpec;
export const questionTypeOptions: { value: QuestionType; label: string }[] = [
  { value: "SINGLE_CHOICE", label: "Single Choice" }, { value: "MULTIPLE_CHOICE", label: "Multiple Choice" }, { value: "TRUE_FALSE", label: "True / False" }, { value: "FILL_IN_BLANK", label: "Fill in the Blank" }, { value: "TYPE_ANSWER", label: "Type Answer" }, { value: "MATCHING", label: "Matching" }, { value: "CLOZE", label: "Cloze" },
];
export const questionDifficultyOptions: { value: QuestionDifficulty; label: string }[] = [
  { value: "EASY", label: "Easy" }, { value: "MEDIUM", label: "Medium" }, { value: "HARD", label: "Hard" },
];
