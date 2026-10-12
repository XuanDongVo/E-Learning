# Domain Model

## Core
User, Class, ClassMember, Grade, Unit, ClassUnit, Section, Topic, QuestionBank, Question, Activity, ActivityBank, ActivitySession, ActivitySessionQuestion, Assignment, AssignmentTarget, AssignmentQuestion, AssessmentAttempt, AssessmentAttemptQuestion, Answer, XPTransaction.

GameTemplate is deferred and is not a current core entity.

## Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.

## Activity
Activity -> ActivityBank -> QuestionBank -> Question.
Activity is configuration only; it does not store student runtime state.

## ActivitySession
Activity -> ActivitySession -> ActivitySessionQuestion.
ActivitySession is one repeatable runtime session. It stores concrete mode/strategy and aggregate result. ActivitySessionQuestion freezes selected question/order. Detailed Activity answer history is not persisted.

## Assignment
Assignment -> AssignmentQuestion -> Question.
Assignment is independent of Activity and QuestionBank.
AssignmentQuestion has only assignment_id and question_id.
Order is question_id ascending.
Assignment stores show_answers_after_submit and optional whole-attempt time_limit_seconds.

## AssessmentAttempt
Assignment -> AssessmentAttempt -> AssessmentAttemptQuestion -> Answer.
AssessmentAttempt is the intended formal Assignment runtime, separate from ActivitySession, but it is deferred and not implemented in the audited codebase (Phase 7 Scope B).


## Question Engine status

The canonical Question Engine architecture is proposed in ADR 0023 / `.agent/architecture/question-engine-v1.md`. Do not model QuestionSpec, QuestionSnapshot or QuestionTypeHandler as existing persisted/core implementation until the proposal is accepted and implemented.
