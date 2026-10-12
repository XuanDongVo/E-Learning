# Domain Model

## Core
User, Class, ClassMember, Grade, Unit, ClassUnit, Section, Topic, QuestionBank, Question, Activity, ActivityBank, ActivitySession, ActivitySessionQuestion, Assignment, AssignmentTarget, AssignmentQuestion, AssignmentComposition, AssignmentCompositionSection, AssignmentCompositionItem, AssessmentAttempt, AssessmentAttemptQuestion, Answer, AttemptPartGrade, XPTransaction.
GameTemplate is deferred.

## Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.

## Question Engine
QuestionSpec is a discriminated type-specific semantic model shared by Question Bank, Assignment, Activity and runtime projections. Types: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING and CLOZE. FILL_IN_BLANK keeps existing single-answer-position semantics; CLOZE is multi-blank. QuestionSpec does not own Assignment order or point allocation.

## ActivitySession
Activity -> ActivitySession -> ActivitySessionQuestion. Stores concrete mode/strategy and aggregate results. It must persist a full immutable QuestionSnapshot per selected question. Detailed Activity answer/part history is not persisted. Activity edits are allowed; current sessions remain on their started snapshot and new sessions use the latest revision. Abandon legacy IN_PROGRESS sessions before enforcing full snapshots.

## Assignment Composition
Assignment -> ordered Composition sections -> ordered items/content blocks -> Assignment-owned Question or grouped members. Composition owns section/item/member order; AssignmentQuestion remains a position-free ownership association. V1 blocks: INSTRUCTIONS, PASSAGE, image MEDIA and POOL; nested blocks/audio deferred. Assignment item configuration includes points, required and isExample; these are not Question Bank fields. All Assignment submissions are teacher-reviewed in v1; no AUTO/MANUAL selector exists.

## AssessmentAttempt
Assignment -> AssessmentAttempt -> immutable ordered composition/question snapshot -> Answer + teacher-reviewed per-part result. One official attempt per student. Whole-attempt server timer; timeout auto-submits into pending review. Persist normalized submitted values at answer intake for analytics, never expose in-progress. Once any attempt starts, hard-lock the Assignment; clone to change it. ActivitySession and AssessmentAttempt remain separate.
