# Teacher Assignment Analysis — Business Specification

**Status:** ACTIVE / DRAFT FOR IMPLEMENTATION
**Owner/branch:** `feature/teacher-assignment-analysis`
**Last reviewed:** 2026-11-01
**Scope:** Teacher — analyze one Assignment after student Attempt results exist
**Primary route:** `/teacher/assignments/:assignmentId/results`

> This document defines the product contract for Teacher Assignment Analysis. It does not claim that the current sample Results UI or the current AssessmentAttempt runtime already satisfies the contract.

---

## 1. Purpose

Teacher needs one place to answer three questions about an Assignment:

1. **Monitor** — Who has started, submitted, timed out or is late?
2. **Evaluate** — How did students perform overall, by class and by question?
3. **Investigate** — What did a specific student answer, and which questions caused difficulty?

The feature is analysis of **one Assignment**. Cross-assignment reporting is out of scope.

---

## 2. Product boundary

The analysis hierarchy is:

```text
Teacher
└── Assignment
    ├── Overview
    │   ├── Assignment Summary
    │   ├── Progress Summary
    │   ├── Score Summary
    │   └── Class Comparison
    ├── Students
    │   └── Student Attempt Review
    └── Questions
        ├── Assignment Section grouping
        └── Question Analysis Detail
```

### Important distinction: Assignment Section vs Content Section

Assignment Section is the grouping created inside the Assignment Composition. It is **not** the Content Section under Unit.

Teacher Assignment Analysis answers:

> “Trong Assignment này, học sinh làm các Question như thế nào?”

It does not answer:

> “Học sinh yếu ở Content Section / Topic / Unit nào?”

Therefore MVP does **not** create Unit, Content Section or Topic analytics.

---

## 3. MVP scope

### Included

- Assignment Overview
- Progress monitoring
- Deadline / late state
- Score summary
- Simple Class Comparison table
- Student Results list
- Student filters
- Individual Attempt Review
- Question Analysis
- Question-type answer distributions
- Assignment Section grouping inside Question Analysis

### Explicitly excluded

- Cross-assignment analytics
- Teacher-wide student analytics
- Unit / Content Section / Topic analytics
- XP, badges or ranking
- Per-question active time
- AI prediction or intervention recommendation
- Advanced psychometrics
- Semantic clustering of free-text answers
- Class leaderboard / ranking
- Advanced report builder/export
- Teacher manual grading
- Editing a submitted Attempt

---

## 4. Source of truth

Teacher analytics must be generated from persisted backend data. The frontend must not reconstruct or re-grade the Assignment.

| Requirement | Source |
|---|---|
| Assigned students | Assignment recipient / class distribution snapshot |
| Not started | Assigned student with no AssessmentAttempt |
| Attempt status | AssessmentAttempt |
| Late state | Assignment due date + Attempt completion state/timestamps |
| Student class | Assignment recipient context / `classIdAtStart` |
| Question order/content | Immutable AssessmentAttempt snapshot |
| Student answer | Persisted Attempt answer payload |
| Correctness / partial result | Persisted grading / PartResult |
| Total score | Persisted Attempt grading result |
| Timing | Attempt timestamps |

Historical Attempt analysis must use the Attempt snapshot, never mutable current Question/Assignment content.

---

## 5. Dependency gate

Teacher Analysis depends on the formal Assignment Attempt runtime being complete enough to produce reliable persisted results.

Required before analytics are considered production-ready:

1. Submit finalization exists.
2. Timeout uses the same finalization path.
3. Automatic Question Engine grading runs from the immutable Attempt snapshot.
4. Per-part results are persisted.
5. Attempt total earned / possible points are persisted.
6. Attempt result access is stable.
7. Example questions are excluded from scored totals.

If those prerequisites are not complete, the UI may be developed against a contract/mock dataset, but the feature must not be presented as real analytics.

---

## 6. Attempt state and deadline state

Attempt lifecycle and deadline state are separate concepts.

### Attempt lifecycle

```text
IN_PROGRESS
SUBMITTED
TIMED_OUT
```

A student with no Attempt is represented as **NOT_STARTED** in the teacher roster; this does not require a fake Attempt row.

### Deadline state

```text
ON_TIME
LATE
OVERDUE
```

Rules:

- `TIMED_OUT` is an Attempt lifecycle state, not a synonym for `LATE`.
- A submitted Attempt may be `ON_TIME` or `LATE`.
- A student with no Attempt may become `OVERDUE` after the Assignment due time.
- Late/overdue must not mutate the Attempt lifecycle state.

---

## 7. Overview

### 7.1 Assignment Summary

Show:

- Assignment title
- Assignment status
- Due date/time
- Whole-attempt time limit, if configured
- Total possible scored points
- Number of assigned students

### 7.2 Progress Summary

Show counts for:

- Assigned
- Not started
- In progress
- Submitted
- Timed out
- Late

Also show submission progress as a count plus percentage.

The exact finalized/graded-rate metric should only be exposed once the backend grading/finalization contract is stable; the frontend must not invent its own definition.

### 7.3 Score Summary

Use only finalized, graded Attempts and exclude `isExample=true` items from the scored denominator.

Show:

- Average
- Median
- Highest
- Lowest
- Score distribution

Normalize score for comparison as:

```text
scorePercent = earnedPoints / possibleScoredPoints * 100
```

Rounding is presentation-only.

---

## 8. Class Comparison

Class Comparison **is part of MVP**, but it is intentionally a compact summary table, not a separate analytics dashboard.

Example:

| Lớp | Sĩ số giao | Tỉ lệ nộp | Điểm TB | Trung vị | Kết quả chung | % Đúng |
|---|---:|---:|---:|---:|---|---:|
| 6A1 | 24 | 13% (3) | 80% | 80% | … | 75% |

### Definitions

- **Lớp** — class associated with the Assignment recipient snapshot.
- **Sĩ số giao** — number of students assigned in that class, not number of Attempts.
- **Tỉ lệ nộp** — submitted count / assigned count; display both percentage and count.
- **Điểm TB** — average normalized score of finalized graded Attempts in that class.
- **Trung vị** — median normalized score of finalized graded Attempts in that class.
- **% Đúng** — fully-correct eligible question responses / eligible question responses.
- **Kết quả chung** — qualitative summary supplied by the backend contract once its thresholds are explicitly approved; frontend must not invent thresholds.

Rules:

- `TIMED_OUT` is not counted as Submitted.
- If an Assignment has only one class, Class Comparison may be omitted because it adds no comparison value.
- No class ranking, trend chart, class-by-question matrix or separate Class Analytics page in MVP.
- A class row may be used as a shortcut to filter the Students view by that class.

---

## 9. Students

Students is a paginated result list, not a second dashboard.

### Row fields

- Student
- Class
- Attempt status
- Deadline state
- Score
- Started at
- Submitted / finished at
- Duration
- View Attempt

### Filters

- Attempt status
- Deadline state
- Class, when Assignment targets multiple classes
- Student search
- Optional score range

### Important rule

Student list metrics are backend-derived. Frontend only renders returned values and applies presentation/filter state.

---

## 10. Individual Attempt Review

Teacher can open one student's Attempt in read-only mode.

### Header

- Student
- Assignment
- Class at Attempt start
- Attempt status
- Late state
- Started at
- Submitted / timed-out at
- Duration
- Total score

### Per-question review

Show:

- Question content from immutable snapshot
- Media/content blocks required for display
- Assignment Section context
- Student answer
- Correct answer when teacher authorization permits it
- Part/result status
- Earned points
- Possible points

The teacher cannot edit, re-submit or change the Attempt from this screen.

---

## 11. Question Analysis

Question Analysis answers:

> Which Questions are difficult, and how did students answer them?

Only finalized Attempts with persisted grading results participate.

### Question-level metrics

For each non-example Question:

- Attempt count
- Correct count
- Partial count
- Incorrect count
- Unanswered count
- Accuracy
- Score rate

Definitions:

```text
accuracy = fullyCorrectCount / eligibleQuestionAttemptCount * 100

scoreRate = sum(earnedPoints) / sum(possiblePoints) * 100
```

Partial is not counted as fully correct. Unanswered is shown separately but remains part of the response denominator unless the final grading contract explicitly defines an ineligible response.

### Assignment Section grouping

Questions may be grouped by their Assignment Section:

```text
Reading
  Q1
  Q2
  Q3

Vocabulary
  Q4
  Q5

Grammar
  Q6
  Q7
```

This grouping is navigation/context only. It is not a new analytics dimension with independent business rules.

---

## 12. Answer distribution by Question Type

Question Analysis should expose the answer distribution appropriate to the Question Engine type.

| Question type | Analysis |
|---|---|
| SINGLE_CHOICE | Distribution by selected option |
| MULTIPLE_CHOICE | Distribution by selected option/set as supported by the normalized result contract |
| TRUE_FALSE | True / False distribution |
| FILL_IN_BLANK | Normalized answer distribution |
| TYPE_ANSWER | Normalized answer distribution where meaningful |
| CLOZE | Blank-level performance/distribution |
| MATCHING | Distribution by selected stable Answer Pool entry |

Do not infer answer keys from mutable Question Bank data. Use the immutable Attempt snapshot and persisted grading/normalized result data.

---

## 13. Example Questions

`isExample=true` Questions are instructional examples, not scored assessment items.

They must be excluded from:

- Assignment score denominator
- Score distribution
- Student performance score
- Class Comparison score metrics
- Question accuracy / score-rate analytics
- Difficult-question statistics

They may still appear in Individual Attempt Review so the teacher can understand the student's submitted work.

---

## 14. Multi-class Assignment

An Assignment may target multiple Classes.

The analysis must preserve the class context that applied to the student at Attempt start.

Use class context for:

- Student filtering
- Class Comparison
- Individual Attempt Review

Do not infer class membership from the student's current class if the Attempt already has an immutable historical class context.

---

## 15. Student visibility vs Teacher visibility

Student-facing settings remain independent from Teacher Analytics:

- `show_score_after_submit`
- `show_answers_after_submit`
- `show_points_per_question`

These settings control what the student sees. They do not prevent an authorized teacher from using persisted grading results for Assignment Analysis.

Teacher Analytics must enforce teacher authorization independently from student result visibility.

---

## 16. Authorization

Every analytics endpoint must establish the Assignment as the authorization root.

Backend checks:

1. Assignment exists.
2. Current teacher is authorized to analyze it.
3. Student, when supplied, is within Assignment scope.
4. Attempt, when supplied, belongs to the Assignment.
5. Attempt, when supplied, belongs to the requested Student.

Never authorize by trusting `assignmentId`, `studentId` or `attemptId` independently.

---

## 17. Proposed API boundary

Exact controller naming should follow existing server conventions, but the logical boundary is:

```text
GET /teacher/assignments/{assignmentId}/analytics/overview
GET /teacher/assignments/{assignmentId}/analytics/students
GET /teacher/assignments/{assignmentId}/analytics/questions
GET /teacher/assignments/{assignmentId}/analytics/questions/{questionId}
GET /teacher/assignments/{assignmentId}/students/{studentId}/attempt
```

### API responsibilities

Backend owns:

- Dataset eligibility
- Authorization
- Submission/deadline classification
- Score aggregation
- Median calculation
- Accuracy calculation
- Class aggregation
- Question aggregation
- Snapshot/result resolution
- Pagination

Frontend owns:

- Layout
- Formatting
- Filtering controls and query state
- Loading/error/empty states
- Navigation
- Visualization of backend metrics

Frontend must not calculate authoritative analytics metrics.

---

## 18. Performance contract

Do not load the entire Assignment graph into the browser.

Recommended query boundaries:

```text
Overview        -> aggregate projection
Class comparison-> aggregate projection by class
Students        -> paginated projection
Questions       -> aggregate projection by question
Question detail -> lazy-loaded detail
Attempt review  -> one Attempt + required snapshot/results
```

Avoid:

```text
Assignment
 -> Students
 -> Attempts
 -> AttemptQuestions
 -> PartResults
```

as one frontend payload.

---

## 19. Frontend information architecture

Suggested structure:

```text
teacher/
└── assignments/
    └── results/
        ├── teacher-assignment-results-view.tsx
        ├── assignment-results-header.tsx
        ├── assignment-results-overview.tsx
        ├── assignment-progress-summary.tsx
        ├── assignment-score-summary.tsx
        ├── assignment-class-comparison.tsx
        ├── assignment-student-results.tsx
        ├── assignment-question-analysis.tsx
        ├── assignment-question-detail.tsx
        └── assignment-attempt-review.tsx
```

No `assignment-section-analysis.tsx` is required for MVP.

The existing `TeacherAssignmentResultsView` is treated as a **sample/prototype only**. It is not a business contract and must not be copied into the production architecture without reconciling its assumptions with this specification.

---

## 20. Navigation

```text
Teacher
└── Assignments
    └── Assignment
        └── Analyze / Results
            ├── Overview
            ├── Students
            └── Questions
```

Navigation path:

```text
Assignment
  -> Overview
  -> Class / Student
  -> Question
  -> Attempt
```

Class Comparison is a summary/filter affordance, not a separate Class Analytics product.

---

## 21. Data and historical integrity

Teacher analysis must remain stable for historical Attempts.

If an Assignment or source Question changes after an Attempt starts, the analysis of that Attempt continues to use:

- Attempt snapshot
- persisted submitted answer
- persisted grading result
- persisted point allocation
- Attempt class context

Never re-grade historical Attempts against current Question Bank content.

This follows the immutable Attempt snapshot contract and automatic scoring contract.

---

## 22. Non-goals / anti-patterns

Do not implement:

- Browser-side re-grading
- Teacher editing of historical answers
- Manual score override
- A second Question model specifically for analytics
- Analytics based on current Question Bank correctness
- Content Section / Topic analytics disguised as Assignment Section analytics
- Class leaderboard
- Per-question active-time tracking
- Arbitrary frontend thresholds for “Tốt / Khá / Cần cải thiện”
- Giant all-in-one results payload

---

## 23. Implementation sequence

### Phase A — Contract / backend prerequisite

1. Finish AssessmentAttempt submit.
2. Finish timeout finalization.
3. Finish automatic grading.
4. Persist PartResults and Attempt totals.
5. Verify example-question exclusion.
6. Verify historical snapshot integrity.

### Phase B — Analytics backend

1. Overview aggregate.
2. Class Comparison aggregate.
3. Students pagination/filtering.
4. Questions aggregate.
5. Question detail.
6. Individual Attempt Review.
7. Authorization and query-boundary tests.

### Phase C — Teacher UI

1. Replace sample dataset with API contracts.
2. Build Overview.
3. Build Students.
4. Build Questions.
5. Build Attempt Review.
6. Add loading/error/empty states.
7. Add browser regression coverage.

### Phase D — Verification

- Backend unit/integration tests
- Aggregation edge cases
- No-attempt / no-graded-data states
- Multi-class assignments
- Late and overdue states
- Timed-out attempts
- Example-only questions
- Partial-credit questions
- CLOZE blank-level results
- MATCHING stable pool-entry results
- Snapshot immutability
- Authorization / IDOR checks
- Frontend typecheck/lint/build
- Browser/E2E verification

---

## 24. Definition of Done

Teacher can answer, from one Assignment:

### Progress
- How many students were assigned?
- Who has not started?
- Who is in progress?
- Who submitted?
- Who timed out?
- Who is late/overdue?

### Score
- What is the average?
- What is the median?
- What are the highest and lowest results?
- How is the score distributed?

### Class
- How many students were assigned to each class?
- What is each class's submission rate?
- What are the class average and median?
- What is the class-level overall result?
- What is the class % correct?

### Student
- What did a particular student score?
- Were they late?
- How long did they take?
- What did they answer?

### Question
- Which Questions are difficult?
- How many were correct/partial/incorrect/unanswered?
- What answers/options were selected?
- How do CLOZE and MATCHING parts perform?

If any of the above requires the frontend to invent grading or aggregation logic, the backend contract is incomplete.

---

## 25. Open owner decisions before implementation

The following must be explicitly decided before coding the corresponding behavior:

1. Exact thresholds and labels for **Kết quả chung** in Class Comparison.
2. Exact definition of `eligibleQuestionAttemptCount` for accuracy when a response is structurally invalid or otherwise excluded by grading.
3. Whether the Students list exposes score filtering in MVP or postpones it until after the base list is validated.
4. Whether score distribution is a histogram, fixed buckets, or another compact presentation; this is a UI choice and must not change backend score semantics.

Until these are decided, backend contracts must not hard-code assumptions that belong to product policy.
