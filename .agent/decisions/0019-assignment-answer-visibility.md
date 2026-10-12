# 0019 — Assignment post-submit answer visibility

**Status: Accepted; score visibility is separately defined by ADR 0026**

## Decision
- `show_answers_after_submit` is a boolean on Assignment, default TRUE.
- TRUE: after submission, the student may see correct answers and explanations according to the published review policy.
- FALSE: the student may see submission/result status but not correct answers or explanations.
- This setting controls answer/explanation visibility only. It does not control whether the score is calculated or shown.
- ADR 0026 adds `show_score_after_submit` (default TRUE), which separately controls whether the automatically calculated score is displayed immediately after submission.
- The server always calculates/persists official score at submit/timeout. The two display flags are independent.
- Student in-progress endpoints never expose correctness/answer keys or hidden explanations.
