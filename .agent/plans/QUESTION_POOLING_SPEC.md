# Question Pooling — Product and Technical Specification

**Status: PROPOSED — owner sign-off required before implementation**  
**Target:** Phase 7B / Assignment Composition  
**Authority:** Accepted ADRs 0023 (Question Engine), 0024 (Assignment Composition), 0025 (Assignment lock/snapshot semantics), and 0026 (automatic scoring). This proposal does not amend those ADRs.

## 1. Problem and terminology

A **Question Pool** is an Assignment Composition container that holds a set of eligible candidate questions and draws a configured number of them for an individual AssessmentAttempt. Different students may receive different questions while completing the same Assignment.

Keep these concepts separate:

- **Question Pool** (`QUESTION_POOL`, proposed): randomly selects question items from a candidate set for a formal Assignment attempt.
- **Existing Composition `POOL` block**: the accepted Composition contract describes this as an answer-entry pool for MATCHING. Do not silently overload that discriminator to mean Question Pooling.
- **Question Bank**: reusable authoring/content source. This proposal does not create a new QuestionSpec type or change Question Bank semantics.
- **Activity selection strategy**: Activity runtime behavior governed by existing Activity contracts; it is not reused as the Assignment pool mechanism.

The Question Engine continues to own question parsing, validation, normalization, and grading. Composition owns the pool container, candidates, ordering, and Assignment-specific scoring settings.

## 2. Proposed v1 scope

### Included

1. A teacher can add a Question Pool container to an Assignment section.
2. The teacher adds or imports Assignment-owned question copies as pool candidates.
3. The teacher configures `drawCount` (K), where K is at least 1 and no greater than the eligible candidate count (N).
4. At official attempt start, the server draws exactly K distinct candidates without replacement and randomizes the selected questions' display order.
5. The server persists the exact draw and its immutable QuestionSpecs/scoring settings in the AssessmentAttempt snapshot.
6. Every student attempt has its own draw. A draw cannot be changed by refreshing, navigating away and back, retrying autosave, submitting, or timing out.
7. Student runtime exposes only the K selected questions, never the unselected candidates or their answer keys.
8. Teacher Preview performs a non-persistent sample draw, labels it as a preview, and does not reserve questions or affect a real attempt.

### Explicitly out of scope for v1

- A global, reusable first-class QuestionPool entity shared across Assignments.
- Live references to mutable Question Bank questions at attempt time; candidate membership uses independent Assignment-owned question copies.
- Nested Question Pools, pools inside pools, weighted selection, adaptive/difficulty-based selection, quotas by type/topic, or cross-pool de-duplication algorithms.
- A student-selectable draw or client-supplied random seed.
- Resampling after an attempt has started.
- Changes to Activity selection-strategy semantics.
- Changing the existing Composition `POOL` block's meaning without a separate accepted ADR.

## 3. Composition model

Proposed logical shape:

```text
Assignment
└── Section (ordered)
    └── QUESTION_POOL item (has its own section position)
        ├── candidate question member (stable member position)
        ├── candidate question member
        └── ... N candidates
```

The pool is a container item, not a QuestionSpec subtype. Each candidate references a Question owned by the Assignment. A candidate must not simultaneously appear as a standalone scored item or belong to another Question Pool in the same Assignment. This avoids duplicate exposure and ambiguous point accounting in v1.

Example Composition DTO shape (illustrative, not a shipped API contract):

```json
{
  "kind": "QUESTION_POOL",
  "position": 3,
  "drawCount": 2,
  "selectionMode": "RANDOM_WITHOUT_REPLACEMENT",
  "shuffleSelectedOrder": true,
  "members": [
    {
      "position": 1,
      "questionId": 201,
      "possiblePoints": 1,
      "required": true,
      "isExample": false
    },
    {
      "position": 2,
      "questionId": 202,
      "possiblePoints": 1,
      "required": true,
      "isExample": false
    }
  ]
}
```

The JSON is a design illustration only. Final field names must match the reviewed Composition DTO conventions; do not add a parallel API solely for this feature.

### Ordering rules

- The pool container occupies one persisted Composition position.
- Its selected questions render at that location in the order recorded in the attempt snapshot.
- Candidate editor order is persisted for stable authoring/preview, but is not the student order when randomized selection is enabled.
- Never infer question order from question IDs, database return order, or insertion order.

## 4. Selection and snapshot semantics

1. On the first valid AssessmentAttempt start, the server loads the Assignment's locked Composition and validates the pool.
2. Inside the same transaction that creates the attempt snapshot, the server draws K unique candidate members uniformly without replacement and shuffles their display order.
3. Persist at minimum: pool item identity, configured draw count, selected candidate/member IDs, final selected order, the selected immutable QuestionSpecs, per-item/part points and flags, snapshot schema version, QuestionSpec/grading/normalization versions, and selection-algorithm version. Preserve candidate-set identity/provenance where the snapshot design supports it.
4. Persist the selected draw before returning the first student runtime payload. The attempt must never be re-drawn after a partial failure; start should be idempotent for the same student/Assignment under the existing one-official-attempt policy.
5. Autosave, refresh, timeout, submission, result review, and analytics read the saved attempt snapshot; none may query live candidates to reconstruct or change the draw.
6. Assignment authoring locks after the first AssessmentAttempt starts, as required by ADR 0025. Changes to pool membership, draw count, candidate content, order, points, or pool configuration require cloning the Assignment.
7. The draw must be server-owned and unbiased. Client-supplied candidate IDs, selected question IDs, or random seeds are never authoritative.

If the attempt is created but snapshot creation fails, the transaction must roll back or enter an explicit recoverable server state; never expose an attempt with a missing or partially generated draw.

## 5. Candidate validation and readiness

A Question Pool is ready only when all of these hold:

- `drawCount >= 1` and `drawCount <= candidateCount`.
- Candidate members are unique, owned by the same Assignment, supported by the active Question Engine contract, and definition-ready.
- Candidate Question IDs are not used outside the pool or in a second pool in the same Assignment.
- No candidate is an example item.
- All candidates have the same aggregate `possiblePoints` so the Assignment's total possible score does not depend on which questions happen to be drawn. The common points value must be greater than zero.
- Candidate-specific part allocations, where applicable to CLOZE/MATCHING, sum exactly to that candidate's aggregate points. The total remains equal across pool candidates; each selected candidate's allocation is snapshotted.
- The Assignment's complete Composition still satisfies existing target, schedule, status, supported-type, timer, and total-score readiness rules.

Proposed v1 permits different supported QuestionSpec types in one pool only when each candidate is individually valid and has the same aggregate possible points. There are no type/topic/difficulty quotas. This equal-point rule stabilizes the score denominator, but does not guarantee equivalent difficulty; teacher guidance should recommend comparable content and difficulty.

Drafts may contain incomplete pools and should return actionable readiness findings. Publishing/start must reject an invalid pool server-side; frontend-only validation is insufficient.

## 6. Scoring, submission, and analytics

- Pool possible points contribute `drawCount × commonCandidatePossiblePoints`; unselected candidates do not contribute.
- Only selected questions are graded or counted as unanswered for that attempt.
- Existing automatic scoring rules in ADR 0026 apply to each selected question. Compound part outcomes and weighted points are persisted using the existing Question Engine/AssessmentAttempt contracts.
- An unselected candidate is **not** an unanswered question.
- Teacher analytics report each candidate's exposure count and outcomes among attempts in which it was selected. Question accuracy denominator is the number of times that candidate was actually presented, with unanswered selected questions reported separately.
- Assignment-level score denominator uses only selected scored questions/parts plus other selected/non-example scored Composition items.
- Student in-progress DTOs exclude unselected candidates, correctness, accepted answers, normalized values, answer keys, and hidden explanations. Post-submit reveal still obeys `show_score_after_submit` and `show_answers_after_submit` independently.

## 7. API and UI contract boundaries

Use the existing Assignment Composition read/write contract for authoring once its DTO schema supports the new discriminator. Use the existing AssessmentAttempt start/read/answer/submit contract for runtime. Do not invent a public QuestionPool CRUD endpoint or ship these routes before request/response schemas and authorization are reviewed.

### Assignment Builder

The Builder must support:

- Create/delete a Question Pool container and reorder it with other Composition items.
- Configure `drawCount`.
- Add/remove and reorder candidate questions; import from the Question Bank only by creating an Assignment-owned copy.
- Show `K selected per attempt`, current `N candidates`, and readiness messages such as `Add at least K valid questions` and `Candidates must have the same total points`.
- Show each candidate's type, prompt summary, points, completeness status, and remove action.
- Preview one simulated draw without persisting it or changing candidate membership.
- Loading, empty, error, invalid-draft, save-success, disabled/locked, and responsive states. After the first official attempt starts, the pool is read-only along with the rest of the Assignment.

### Student runtime

- Display only the drawn K questions in persisted draw order at the pool's Composition location.
- Preserve the same draw across refresh/reload and all answer-save operations.
- Render each question through its canonical QuestionSpec student renderer.
- Do not reveal that other candidates exist or send their content to the browser.
- Preserve the normal Assignment timer, submit, timeout, score visibility, and answer reveal contracts.

## 8. Acceptance criteria

- [ ] The Builder round-trips `QUESTION_POOL`, draw count, candidate membership, positions, and per-candidate points through the real Composition API.
- [ ] Publishing fails when K is zero, K exceeds N, candidates are incomplete/duplicated/not Assignment-owned, a candidate is used in multiple places, examples are included, or candidate point totals differ.
- [ ] A start creates exactly K distinct candidates and a randomized selected order on the server.
- [ ] Concurrent/retried start for the same student/Assignment creates one official attempt and one persistent draw.
- [ ] Refresh, answer autosave, submit, timeout, and result review never re-draw.
- [ ] The attempt snapshot retains the selected immutable QuestionSpecs and scoring configuration even if source Question Bank data changes.
- [ ] Unselected questions do not affect score denominator, unanswered counts, accuracy denominator, or student payloads.
- [ ] Analytics denominator is exposure-based and includes the selected-but-unanswered case.
- [ ] Student leakage tests prove unselected candidates, answer keys, correctness, and normalized values are never exposed before permitted reveal.
- [ ] Assignment lock and clone behavior cover pool configuration and members.
- [ ] Backend unit/integration tests and frontend lint/typecheck/build plus end-to-end Builder → start → refresh → submit → analytics checks pass.

## 9. Owner decisions required before this becomes normative

The following are proposed defaults, not accepted decisions:

1. **Candidate source:** Assignment-owned copies imported from the Question Bank (recommended for v1, consistent with ADR 0024's independent ownership model), not a live reusable global pool.
2. **Random order:** draw K without replacement and randomize the selected display order for every new official attempt.
3. **Point fairness:** require the same aggregate possible points for every candidate in a pool; allow mixed supported question types without quotas.
4. **Duplicate policy:** a candidate may belong to only one location in an Assignment and cannot also appear as a standalone scored item.
5. **Analytics:** report candidate performance only over attempts where the candidate was selected; unselected means not exposed, not unanswered.

Once approved, record the product decision in a new ADR and align the active Phase 7 spec, Composition architecture, API contract, migrations, UI blueprint, and implementation checklist before coding.
