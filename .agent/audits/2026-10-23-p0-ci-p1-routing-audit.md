# P0 CI Recovery and P1 Locale Routing Audit

Date: 2026-10-23
Branch: `refactor/teacher-content-ui-routing`

## P0 — CI failures addressed

- Removed the teacher content sidebar state update from an effect. Expansion now follows the current content route by default and can still be manually toggled.
- Replaced the internal class breadcrumb anchor with the locale-aware navigation `Link`.
- Removed the search-draft synchronization effect from the global question-bank browser. The draft is derived from the current URL query until the user edits it.
- Fixed the backend publish-readiness test's Mockito stub to call `findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(10L)` with its required argument.

## P1 — Routing changes made

- AuthGuard builds the login return target from the route and current query string, using the locale-aware router.
- Login only accepts an internal `next` path (leading slash, not protocol-relative, and no backslash); otherwise it falls back to the role-specific landing page. Locale remains explicitly applied.
- Migrated internal links to `@/i18n/navigation` across teacher content detail/toolbars, activity workspace/editor, class/student navigation, and student unit/activity/dashboard components.
- Migrated router calls to the locale-aware router in activity workspace/editor, assignment builder header, and student practice runner.
- Existing locale contract remains `/vi` and `/en` with `localePrefix: "always"`; API endpoints were not changed.

## Validation status

- Code changes are committed to this branch.
- The previously observed GitHub Actions run failed on the old head `8219ea7819f3fdeb645a2b1437e0d89cec246d1d`. That result does not validate the fixes above.
- Frontend lint, frontend tests/build, and backend tests still require a new CI run against the current branch head. No green result is claimed here.

## Remaining routing audit checks

- Finish the repository-wide scan for any remaining direct `next/link` imports or `next/navigation` router mutations in localized routes.
- Exercise locale switching on nested content/editor routes with query parameters.
- Verify login/logout and role mismatch redirects in both locales.
- Verify active sidebar state for nested content routes and browser back/forward query changes.
