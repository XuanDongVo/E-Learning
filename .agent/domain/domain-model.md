# Domain Model

## Core
User, Class, ClassMember, Grade, Unit, ClassUnit, Section, Topic, QuestionBank, Question, Activity, ActivityBank, ActivitySession, ActivitySessionQuestion, Assignment, AssignmentTarget, AssignmentQuestion, AssignmentComposition, AssignmentCompositionSection, AssignmentCompositionItem, AssessmentAttempt, AssessmentAttemptQuestion, Answer, AttemptPartGrade, XPTransaction.
GameTemplate is deferred.

## Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.

## Question Engine
QuestionSpec is a discriminated type-specific semantic model shared by Question Bank, Assignment, Activity and runtime projections. Types: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING and CLOZE. FILL_IN_BLANK keeps existing single-answer-position semantics; CLOZE is multi-blank. QuestionSpec does not own Assignment order or point allocation.

## ActivitySession
Activity -> ActivitySession -> ActivitySessionQuestion. Stores concrete mode/strategy and aggregate results. It must persist a full immutable QuestionSnapshot per selected question. Detailed Activity answer/part history is not persisted. Abandon legacy IN_PROGRESS sessions before enforcing full snapshots.

## Assignment Composition
Assignment -> ordered Composition sections -> ordered items/content blocks -> Assignment-owned Question or grouped members. Composition owns section/item/member order; AssignmentQuestion remains a position-free ownership association. V1 blocks: INSTRUCTIONS, PASSAGE, image MEDIA and POOL; nested blocks/audio deferred. Assignment item configuration includes points, required, gradingMode and isExample; these are not Question Bank fields.

## AssessmentAttempt
Assignment -> AssessmentAttempt -> immutable ordered composition/question snapshot -> Answer + per-part grading result. One official attempt per student. Whole-attempt server timer; timeout auto-submits. Persist normalized submitted values for analytics, never expose in-progress. ActivitySession and AssessmentAttempt remain separate.
