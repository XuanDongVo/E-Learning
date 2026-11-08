# Definition of Done

## Module gate
[ ] Real backend contract verified
[ ] Frontend integrated
[ ] No permanent mock data
[ ] Loading/error/empty states handled
[ ] Validation handled
[ ] TypeScript passes
[ ] ESLint passes
[ ] Relevant tests pass
[ ] Build passes
[ ] Responsive behavior checked
[ ] Accessibility checked

## Student visual-design gate (for Student UI changes)
[ ] Canonical Indie Illustrated Scrapbook design rules read and followed
[ ] No alternative Student palette, font system or one-off design language introduced
[ ] Visual rules implemented through approved tokens/components, not hard-coded per page
[ ] Teacher appearance and shared components unaffected by Student styles
[ ] Theme scope, portals/toasts, focus, contrast, mobile and reduced-motion checked when relevant
[ ] Live data not replaced by fabricated achievements/progress

## Knowledge-base contract gate
[ ] Accepted ADRs reflected in active specs/domain/UI
[ ] Superseded requirements removed from executable sections
[ ] AssignmentQuestion has no position; Composition section/item/member positions define product ordering
[ ] Assignment uses show_score_after_submit for immediate score display and show_answers_after_submit independently for answer/explanation reveal
[ ] Assignment scoring is automatic on submit/timeout; each scored question defaults to 1 point and teachers can customize possible points
[ ] Try Hard timer is per question
[ ] Multiple Activity strategies require student choice
[ ] GameTemplate is deferred
[ ] Topic formula/reference sheet is deferred
[ ] Question hint is optional
[ ] Preview status is explicit

Documentation-only work must not claim implementation gates passed.
