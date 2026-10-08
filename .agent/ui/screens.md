# Screens and routes

## Teacher
- /teacher: dashboard, currently mock.
- /teacher/classes: real.
- /teacher/students: real.
- /teacher/content: real Unit -> Section -> Topic -> QuestionBank -> Question flow.
- /teacher/activities: real core CRUD/readiness; preview contract tracked.
- /teacher/assignments: real core CRUD/question authoring; no reorder UI.

Activity editor:
- Unit scope.
- Draft can save incomplete.
- Try Hard time label = seconds per question.
- Practice = no timer, immediate feedback, one retry, optional hint.
- Practice = no timer, immediate feedback, one retry, optional hint.
- Selection strategies are configured options; concrete selection is stored on ActivitySession.
- No GameTemplate control.
- Preview is a real action once endpoint implementation is complete.

Assignment editor:
- Whole-attempt time limit.
- Show answers after submit.
- No position/reorder controls.
- Questions displayed in server order.

Question Editor: optional Hint, max 500 chars.
Topic Editor: no formula/reference sheet field currently.

## Student
/student dashboard is mock; /student/units, /student/assignments, /student/progress are placeholders.
Phase 7 adds an ActivitySession runner/result/review first; the AssessmentAttempt runner is a separate later scope.

All runtime controls must be touch-friendly and keyboard accessible.
