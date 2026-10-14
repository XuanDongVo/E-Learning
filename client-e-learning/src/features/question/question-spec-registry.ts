import type { QuestionSpec, QuestionType } from "@/types/question";

export type QuestionSpecValidator = (spec: QuestionSpec) => string[];

const commonErrors = (spec: QuestionSpec): string[] =>
  spec.content.trim() ? [] : ["content.required"];

const validators: Record<QuestionType, QuestionSpecValidator> = {
  SINGLE_CHOICE: (spec) => {
    if (spec.type !== "SINGLE_CHOICE") return ["question.type.invalid"];
    const errors = commonErrors(spec);
    if (spec.choices.length < 2) errors.push("options.minimum");
    if (spec.choices.some((choice) => !choice.text.trim())) {
      errors.push("options.content.required");
    }
    if (!spec.choices.some((choice) => choice.id === spec.correctChoiceKey)) {
      errors.push("options.single_correct.required");
    }
    return errors;
  },
  MULTIPLE_CHOICE: (spec) => {
    if (spec.type !== "MULTIPLE_CHOICE") return ["question.type.invalid"];
    const errors = commonErrors(spec);
    if (spec.choices.length < 2) errors.push("options.minimum");
    if (spec.choices.some((choice) => !choice.text.trim())) {
      errors.push("options.content.required");
    }
    if (spec.correctChoiceKeys.length === 0) {
      errors.push("options.multiple_correct.required");
    }
    return errors;
  },
  TRUE_FALSE: commonErrors,
  FILL_IN_BLANK: (spec) => {
    if (spec.type !== "FILL_IN_BLANK") return ["question.type.invalid"];
    return [
      ...commonErrors(spec),
      ...(spec.content.includes("____") ? [] : ["content.blank_marker.required"]),
      ...(spec.acceptedAnswers.some((answer) => answer.trim())
        ? []
        : ["answers.required"]),
    ];
  },
  TYPE_ANSWER: (spec) => {
    if (spec.type !== "TYPE_ANSWER") return ["question.type.invalid"];
    return [
      ...commonErrors(spec),
      ...(spec.acceptedAnswers.some((answer) => answer.trim())
        ? []
        : ["answers.required"]),
    ];
  },
  MATCHING: (spec) => {
    if (spec.type !== "MATCHING") return ["question.type.invalid"];
    const errors = commonErrors(spec);
    if (spec.items.length === 0 || spec.answerPool.length === 0) {
      errors.push("matching.entries.required");
    }
    if (spec.pairs.length !== spec.items.length) {
      errors.push("matching.pairs.incomplete");
    }
    return errors;
  },
  CLOZE: (spec) => {
    if (spec.type !== "CLOZE") return ["question.type.invalid"];
    const errors = commonErrors(spec);
    if (spec.blanks.length === 0) errors.push("cloze.blanks.required");
    if (spec.blanks.some((blank) => blank.acceptedAnswers.length === 0)) {
      errors.push("cloze.answers.required");
    }
    return errors;
  },
};

export const questionSpecRegistry = {
  validate(spec: QuestionSpec): string[] {
    return validators[spec.type](spec);
  },
  validator(type: QuestionType): QuestionSpecValidator {
    return validators[type];
  },
};
