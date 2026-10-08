# Domain Model

## Core
User, Class, ClassMember, Grade, Unit, ClassUnit, Section, Topic, QuestionBank, Question, Activity, ActivityBank, ActivitySession, ActivitySessionQuestion, Assignment, AssignmentTarget, AssignmentQuestion, AssessmentAttempt, AssessmentAttemptQuestion, Answer, XPTransaction.

GameTemplate is deferred and is not a current core entity.

## Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.

## Activity
Activity -> ActivityBank -> QuestionBank -> Question.
Activity is Unit-scoped and stores source/distribution/available strategies/mode/lives/per-question timer/lifecycle.
Activity does not store student runtime state.

## ActivitySession
Activity -> ActivitySession -> ActivitySessionQuestion.
ActivitySession is one repeatable runtime practice session. It stores the concrete mode and selection strategy plus aggregate result/lifecycle state.
ActivitySessionQuestion freezes the selected question set/order.
Activity does not persist detailed answer history.

## Assignment
Assignment -> AssignmentQuestion -> Question.
Assignment is independent of Activity and QuestionBank.
AssignmentQuestion has only assignment_id and question_id.
Order is question_id ascending.
Assignment stores show_answers_after_submit and optional whole-attempt time_limit_seconds.

## AssessmentAttempt
Assignment -> AssessmentAttempt -> AssessmentAttemptQuestion -> Answer.
AssessmentAttempt is the formal Assignment runtime and is implemented separately from ActivitySession.
