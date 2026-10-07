# Screens and routes

Factual map of the Next.js routes (`client-e-learning/src/app`) as of 2026-10-07. Status key:
**Real** = calls the backend. **Static/Mock** = fake data. **Placeholder** = empty page.

## Teacher (`/teacher/...`)

| Route | Purpose | Data | Status |
|---|---|---|---|
| `/teacher` | Overview dashboard | Hardcoded numbers | Static (violates "no fake metrics") |
| `/teacher/classes`, `/teacher/classes/[classId]/students` | Class list, edit, archive, members | API | Real |
| `/teacher/students`, `/teacher/students/[studentId]` | Student list with filters, detail, lock/unlock | API | Real |
| `/teacher/grades` | Grade management | API | Real |
| `/teacher/content` | Unit → Section → Topic → QuestionBank → Question, media | API | Real |
| `/teacher/activities`, `/new`, `/[id]`, `/[id]/edit` | Activity CRUD, sources, readiness, publish | API | Real (preview missing) |
| `/teacher/assignments`, `/[id]`, `/[id]/questions/create` | Assignment CRUD, manual question authoring | API | Real (readiness, recipients preview, progress shell missing) |

## Student (`/student/...`)

| Route | Purpose | Data | Status |
|---|---|---|---|
| `/login` | Login for both roles | API | Real |
| `/student/profile` | Own profile and guardians | API | Real |
| `/student` | Dashboard | `src/mock` via `dashboard.service.ts` | Mock |
| `/student/units` | Browse Units and Activities | none | Placeholder |
| `/student/assignments` | Assigned work | none | Placeholder |
| `/student/progress` | Progress and leaderboard | none | Placeholder |

Missing entirely: the Attempt runtime (play Activity / take Assignment), result screen, XP and ranking screens.
Teacher navigation and the core workflow are described in `UI_ARCHITECTURE_GUIDELINES.md`.
