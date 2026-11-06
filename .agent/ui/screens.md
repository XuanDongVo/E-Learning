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

- `/student`: Learning Hub with live Student Units and a compact seven-day Streak + XP Level progress region. Not a leaderboard/KPI wall.
- `/student/units`: searchable Unit explorer.
- `/student/units/:unitId`: Sections/Topics and published Activity choices.
- `/student/assignments`: independent teacher-assigned work.
- `/student/progress`: placeholder; not a live analytics page.
- `/student/rewards`: dedicated Leaderboard preview with clearly labeled mock ranking/Hall of Fame/feed. Streak/Level move to Student Home; rankings are not live.
- `/student/profile`: student profile.

See `ui/STUDENT_LEARNING_HUB_BLUEPRINT.md` for the active Home/Units/Unit Detail contract.
ActivitySession runner/result/review is separate from the formal AssessmentAttempt runtime.
The Activity Result reward receipt is server-authored and shows committed XP
only: Question XP, Completion Bonus, total earned, Lifetime XP and Level change.
It has explicit loading, retryable error, abandoned and legacy/no-reward states;
there is no in-progress XP counter.

## Cross-screen contracts

- Activity belongs to Unit; Draft may be incomplete; publish requires server READY validation.
- Practice has no timer, one retry and optional Question hint. Try Hard time limit is per question.
- Multiple Activity strategies require a start-time choice; ActivitySession stores the concrete strategy.
- Assignment time limit applies to the whole attempt. `show_score_after_submit` and `show_answers_after_submit` are independent settings.
- AssignmentQuestion has no product-order position. Composition section/item/member positions define order; no ordering behavior should be described as "server order" unless verified against the Composition API.
- GameTemplate and Topic formula/reference sheet remain deferred.

Use `ui/QUESTION_BANK_QUESTION_MANAGEMENT_BLUEPRINT.md` for Content UI behavior and `ui/UI_ARCHITECTURE_GUIDELINES.md` for shared design/accessibility rules.
