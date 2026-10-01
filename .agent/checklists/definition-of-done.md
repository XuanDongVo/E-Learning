# Definition of Done

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

### Module validation gate

Before moving to the next module, confirm:

```text
[ ] Real backend contract verified
[ ] Frontend integrated with backend
[ ] No permanent mock data
[ ] Loading handled
[ ] Error handled
[ ] Empty state handled when applicable
[ ] Validation handled
[ ] TypeScript passes
[ ] ESLint passes
[ ] Relevant tests pass
[ ] Build passes when applicable
[ ] Responsive behavior checked
```

---

## Before Finishing a Task

Verify:

- The requested feature works.
- Existing behavior is preserved.
- The implementation matches the agreed domain architecture.
- No UI-only fields were invented that have no domain/API meaning.
- No backend-only fields are exposed without a clear UI purpose.
- No unnecessary files were changed.
- No duplicate logic was introduced.
- No debug logs remain.
- TypeScript/ESLint/tests/build pass when applicable.
- The implementation follows the existing architecture.
- The module completion gate is satisfied before moving to the next module.

In the final response, briefly report:

- What changed
- Current module/phase completed
- Files affected
- API changes
- Validation performed
- Any remaining issue or assumption

When a multi-module request is intentionally not fully implemented because the current phase is incomplete, explicitly state which phase was completed and stop there.

---
