# Teacher list toolbar audit

Date: 2026-11-20  
Scope: active Teacher routes and their rendered feature components.  
Page type: operational list / management workspace.

## Screen brief

- User: Teacher managing reusable learning content, classes, students and delivery records.
- Job: search, narrow and act on a list without losing the current feature context.
- Hierarchy: search first, filters second, primary action at the trailing edge.
- Responsive rule: controls stack at narrow widths; filters may wrap from `sm`; search/actions share the first row and filters use a full-width second row from `lg`; only at `2xl`, after accounting for the Teacher sidebar, does the toolbar become an 18rem search / flexible filters / trailing actions row. The page itself must never scroll horizontally.
- Visual rule: retain Calm Classroom tokens and existing controls. The shared layer owns only the containing surface, alignment and gaps.

## Inventory

| # | Page/component | File | Type | Search | Filters | Actions | Recommendation |
|---|---|---|---|---|---|---|---|
| 1 | Classes | `app/[locale]/teacher/classes/page.tsx` via `classes-toolbar.tsx` | Standalone | Yes | Grade | Create | Migrate wrapper |
| 2 | Students | `students/students-toolbar.tsx` | Standalone | Yes | Class, Grade, account, no-class | Reset, add | Migrate wrapper |
| 3 | Knowledge Notes | `knowledge-notes/knowledge-note-management.tsx` | Inline | Yes | Grade, status, Topic link | Reset, create | Migrate |
| 4 | Activities | `activities/activity-workspace.tsx` | Inline | Yes | Grade, Unit, status | Create | Migrate |
| 5 | Assignments | `app/[locale]/teacher/assignments/page.tsx` | Inline | Yes | Status | Guide, create, disabled import | Migrate |
| 6 | Global question banks | `content/global-question-bank-list.tsx` | Inline | Yes | Grade, Unit, Section, Topic, archived | Search, reset | Migrate |
| 7 | Question-bank questions | `content/question-bank-detail.tsx` | Inline | Yes | Type, difficulty, completeness | Clear search | Migrate |
| 8 | Class students | `classes/class-students/class-students-panel.tsx` | Inline | Yes | No | Add student | Migrate |
| 9 | Unit vocabulary | `content/components/unit-vocabulary-section.tsx` | Inline | Yes | Status | Header owns import/create | Migrate filter row |
| 10 | Assignment-analysis students | `assignments/analysis/students/students-panel.tsx` | Inline | Yes | Lifecycle chips | Sort label | Keep independent: compact analysis subtab, not a page-level management toolbar |
| 11 | Assignment-analysis questions | `assignments/analysis/questions/questions-panel.tsx` | Inline | No | Sort and difficulty | Outcome legend | Keep independent: legend and analytical controls form one specialized unit |
| 12 | Student-detail assignments | `students/assignments/student-assignments-view.tsx` | Inline | No | Status | No | Keep independent: section heading and compact segmented filter are coupled |

## Counts

- Active Teacher list toolbars: 12
- Standalone toolbar components: 2
- Inline toolbars: 10
- Migrated to `TeacherListToolbar`: 9
- Intentionally independent: 3

Excluded from the count: the unused `AssignmentFilters`, unused analysis `StudentsFilters`, `ContentToolbar` (page-header/action responsibility), Content Explorer search, modal searches, editor controls and the TipTap formatting toolbar.
