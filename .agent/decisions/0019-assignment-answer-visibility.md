# 0019 — Assignment answer visibility

**Status: Accepted; score visibility is separately defined by ADR 0026**

## Decision
- `show_answers_after_submit` is a boolean on Assignment, default TRUE.
- TRUE: after submission, the student may see the correct answers and explanations.
- FALSE: the student may see the submission/result state but not correct answers or explanations.
- This flag controls answer/explanation visibility only. It does not control whether the score is calculated or shown.
- ADR 0026 adds `show_score_after_submit` (default TRUE), which independently controls whether the automatically calculated score is displayed immediately after submission.
- Server calculates and persists official score on submit/timeout regardless of whether it is shown.
- The two settings are independent; the in-progress student payload never exposes correctness flags, answer keys or hidden explanations.
