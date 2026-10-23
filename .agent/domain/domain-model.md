# Domain Model

## Core
User, Class, ClassMember, Grade, Unit, ClassUnit, Section, Topic, QuestionBank, Question, Activity, ActivityBank, ActivitySession, ActivitySessionQuestion, Assignment, AssignmentQuestion, AssignmentComposition, AssignmentCompositionSection, AssignmentCompositionItem, AssessmentAttempt, AssessmentAttemptQuestion, Answer, AttemptPartGrade, XPTransaction.

Assignment stores one Grade relation and a concrete `class_ids` recipient snapshot; `AssignmentTarget` is not a current entity.
GameTemplate is deferred.

## Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.

## Question Engine
QuestionSpec is a discriminated type-specific semantic model shared by Question Bank, Assignment, Activity and runtime projections. Types: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING and CLOZE. FILL_IN_BLANK keeps existing single-answer-position semantics; CLOZE is multi-blank. QuestionSpec does not own Assignment order or point allocation.

## ActivitySession
Activity -> ActivitySession -> ActivitySessionQuestion. Stores concrete mode/strategy and aggregate results. It must persist a full immutable QuestionSnapshot per selected question. Detailed Activity answer/part history is not persisted. Activity edits are allowed; current sessions remain on their started snapshot and new sessions use the latest revision. Abandon legacy IN_PROGRESS sessions before enforcing full snapshots.

## Assignment Composition
Assignment -> ordered Composition sections -> ordered items/content blocks -> Assignment-owned Question or grouped members. Composition owns section/item/member order via persisted positions; AssignmentQuestion remains a position-free ownership association. question_id ASC is only the legacy backfill order. V1 blocks: INSTRUCTIONS, PASSAGE, image MEDIA and POOL; nested blocks/audio deferred. Assignment item configuration includes possiblePoints (default 1, teacher-editable per Assignment) and required/isExample; these are not Question Bank fields. Assignment submissions are automatically graded by Question Engine; there is no manual grading workflow or AUTO/MANUAL selector. show_score_after_submit and show_answers_after_submit independently govern display.

## AssessmentAttempt
Assignment -> AssessmentAttempt -> immutable ordered composition/question snapshot -> Answer + automatically calculated per-part result. One official attempt per student. Whole-attempt server timer; timeout auto-submits and scores. Persist normalized submitted values for analytics, never expose them in-progress. Once any attempt starts, hard-lock Assignment; clone to change it. ActivitySession and AssessmentAttempt remain separate.
