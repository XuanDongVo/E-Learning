# Restore student-paper.tsx

File was accidentally corrupted during automated edit.

## Quick restore (from known-good commit + apply fix)

```bash
git fetch origin
git checkout feature/student-assignment-attempt

# 1) Restore full file from last good commit (before corruption)
git show 1875574676367d2cf65e0f405af0f41ab394d823:client-e-learning/src/components/features/student/assignment-attempt/student-paper.tsx \
  > client-e-learning/src/components/features/student/assignment-attempt/student-paper.tsx

# 2) Apply the intended fix (remove scroll tracking)
# See commits / ask agent for the exact diff:
# - Remove activeId state + IntersectionObserver
# - goToQuestion only does scrollIntoView
# - Nav buttons: no active ring from scroll spy
```

## What the fix should do

1. Question map: click -> jump only (no scroll spy / active tracking)
2. `use-attempt-fullscreen.ts` is already fixed on this branch (double-count leave)
