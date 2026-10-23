# Screens and Routes

**Purpose:** concise screen inventory only. Detailed interaction requirements belong in the relevant UI blueprint; implementation state belongs in `.agent/CURRENT_STATE.md`.

## Teacher routes

- `/teacher`: dashboard; metrics must not be fabricated and some areas remain mock/future work.
- `/teacher/classes`: class management.
- `/teacher/students`: student management.
- `/teacher/content`: Content Explorer and hierarchy.
- `/teacher/content/units/:unitId`: Unit workspace.
- `/teacher/content/sections/:sectionId`: Section workspace.
- `/teacher/content/topics/:topicId`: Topic and Question Bank management.
- `/teacher/content/question-banks`: global Question Bank list under Content.
- `/teacher/content/question-banks/:bankId`: Question Bank detail / Question Manager.
- `/teacher/content/questions/:questionId`: Question Editor; bank/source context may be supplied through query parameters.
- `/teacher/activities`: Activity authoring and readiness.
- `/teacher/assignments`: Assignment list and authoring entry point; canonical Builder route and redirects must be checked in the current router.

## Student routes

Student dashboard, units, assignments and progress have historically contained mock/placeholder areas. Do not label them fully implemented without a current source and browser audit. ActivitySession runner/result/review is separate from the not-yet-implemented formal AssessmentAttempt runner.

## Cross-screen contracts

- Activity belongs to Unit; Draft may be incomplete; publish requires server READY validation.
- Practice has no timer, one retry and optional Question hint. Try Hard time limit is per question.
- Multiple Activity strategies require a start-time choice; ActivitySession stores the concrete strategy.
- Assignment time limit applies to the whole attempt. `show_score_after_submit` and `show_answers_after_submit` are independent settings.
- AssignmentQuestion has no product-order position. Composition section/item/member positions define order; no ordering behavior should be described as "server order" unless verified against the Composition API.
- GameTemplate and Topic formula/reference sheet remain deferred.

Use `ui/QUESTION_BANK_QUESTION_MANAGEMENT_BLUEPRINT.md` for Content UI behavior and `ui/UI_ARCHITECTURE_GUIDELINES.md` for shared design/accessibility rules.
