# Domain Model

## Core
User, Class, ClassMember, Grade, Unit, ClassUnit, Section, Topic, QuestionBank, Question, Activity, ActivityBank, Assignment, AssignmentTarget, AssignmentQuestion, Attempt, AttemptQuestion, Answer, XPTransaction.

GameTemplate is deferred and is not a current core entity.

## Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.

## Activity
Activity -> ActivityBank -> QuestionBank -> Question.
Activity is Unit-scoped and stores source/distribution/available strategies/mode/lives/per-question timer/lifecycle.
It does not store student question selections, answers, runtime timer state or Assignment links.
Attempt stores concrete mode and selection_strategy.

## Assignment
Assignment -> AssignmentQuestion -> Question.
Assignment is independent of Activity and QuestionBank.
AssignmentQuestion has only assignment_id and question_id.
Order is question_id ascending.
Assignment stores show_answers_after_submit and optional whole-attempt time_limit_seconds.

## Attempt
Attempt -> AttemptQuestion -> Answer.
Attempt belongs to exactly one Activity run or Assignment attempt.
AttemptQuestion.position is runtime snapshot order.
