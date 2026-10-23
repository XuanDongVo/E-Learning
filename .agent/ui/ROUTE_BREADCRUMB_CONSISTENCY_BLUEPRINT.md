# Route & Breadcrumb Consistency Blueprint

## Status

Partial implementation recorded on `refactor/teacher-content-ui-routing`; the acceptance checklist remains unchecked, so route/breadcrumb behavior is NOT fully verified.

## Goal

A teacher must be able to move between Content Explorer, Global Question Banks, a Question Bank, and a Question Editor without losing the current bank context or being forced back through Content Explorer.

Question Editor behavior itself is out of scope. This blueprint only defines the route context around it.

## Canonical route model

```text
/teacher/content
  Content Explorer

/teacher/content/units/:unitId
  Unit

/teacher/content/sections/:sectionId
  Section

/teacher/content/topics/:topicId
  Topic

/teacher/content/question-banks
  Global Question Banks

/teacher/content/question-banks/:bankId
  Question Bank Detail

/teacher/content/questions/:questionId?bankId=:bankId&bankName=:bankName&source=:source
  Question Editor
```

The Question Editor remains under the existing `/teacher/content/questions/:questionId` route. `bankId` is explicit route context, not a replacement for `questionId`.

## Navigation contract

### Content Explorer → Question Bank → Question Editor

```text
Content
  → Unit
    → Section
      → Topic
        → Question Bank
          → Edit Question
```

Opening an editor from a bank adds `bankId` to the question URL. Therefore Cancel/Save can return directly to that bank.

### Global Question Banks → Question Bank → Question Editor

```text
Question Banks
  → Grade / Unit / Section / Topic
    → Question Bank
      → Edit Question
```

The bank route carries `source=global`. The bank breadcrumb therefore starts at `Question Banks` rather than incorrectly starting at `Content`.

### Direct Question Editor URL

If an editor URL has no `bankId`, the editor breadcrumb resolves the question first, then resolves its Question Bank and hierarchy. The bank ID can therefore be recovered from the current question data.

## Breadcrumb contract

### Question Bank Detail opened from Content Explorer

```text
Content / Unit / Section / Topic / Question Bank
```

Links:

- Content → `/teacher/content`
- Unit → `/teacher/content/units/:unitId`
- Section → `/teacher/content/sections/:sectionId`
- Topic → `/teacher/content/topics/:topicId`
- Question Bank → current page

### Question Bank Detail opened from Global Question Banks

```text
Question Banks / Unit / Section / Topic / Question Bank
```

The first breadcrumb links to `/teacher/content/question-banks`.

### Question Editor

```text
Content / Unit / Section / Topic / Question Bank / Edit Question
```

Each resolved hierarchy item is a real link. `Edit Question` is the current-page label.

## Query parameters

| Parameter | Purpose |
|---|---|
| `bankId` | Explicit Question Bank context for the Question Editor. |
| `bankName` | Lightweight display context while the editor loads. |
| `source=global` | Indicates that the bank was opened from Global Question Banks. |
| `mode=bulk-create` | Existing bank bulk-create flow. |
| `mode=import` | Existing import flow. |

Only `source=global` and the existing editor context parameters are introduced by this routing slice. No new business data is stored in the URL.

## Cancel / Save behavior

The route controller resolves a bank in this order:

1. Explicit `nextId` when the caller provides a bank ID.
2. `bankId` from the current Question Editor URL.
3. Current route ID when the current route itself is a Question Bank.
4. Existing Content fallback only when no bank context can be resolved.

This prevents the previous failure mode where `onNavigate("bank")` without an ID sent the teacher to `/teacher/content`.

## Scope guardrails

- Do not change Question Editor form behavior, autosave, payloads, validation, or persistence.
- Do not introduce a second Question Editor route.
- Do not duplicate Question Bank data into route state.
- Do not use browser history as the only return mechanism.
- Keep breadcrumbs as deterministic links based on the current entity hierarchy.
- Global Question Banks remains the only global bank list; Question Bank Detail remains the bank-specific workspace.

## Validation checklist

- [ ] Content Explorer → Topic → Bank → Edit → Cancel returns to the same bank.
- [ ] Content Explorer → Topic → Bank → Edit → Save returns to the same bank.
- [ ] Global Question Banks → Bank → Edit → Cancel returns to the same bank.
- [ ] Global Question Banks → Bank → Edit → Save returns to the same bank.
- [ ] Question Editor breadcrumb contains Unit, Section, Topic and Question Bank.
- [ ] Bank breadcrumb contains Unit, Section and Topic.
- [ ] Direct Question Editor URL without `bankId` resolves its bank from question data.
- [ ] Browser refresh preserves the editor's bank context.
- [ ] Browser Back/Forward does not require manually rebuilding the Content hierarchy.
- [ ] Question Editor source files show no unintended functional changes.
