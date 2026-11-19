# Student Page Brief — copy into PR description or a task note

> Template governed by [Student UI Governance](../STUDENT_UI_GOVERNANCE.md). Complete **before** implementing a new Student page or material redesign. Small bugfixes may use a short inline Screen Brief instead. Remove instructional examples, do not commit fictional route/API facts as implemented features.

## A. Screen Brief (required)

- **Route / feature:** `/student/...`
- **User:** Student (who / at what step?)
- **User goal / success condition:** What real task must the learner finish?
- **Primary action / task:** 
- **Archetype:** Hub | Collection/Index | Detail | Workspace | Assessment/Immersive | Review/Result | Identity/Insights | Game Experience. **Why?**
- **Data source / existing contracts:** API/service/domain spec and no invented data
- **Page context / navigation:** Back target, parent route, continuation, existing route ownership

## B. Information structure & reuse (required)

- **What is first in viewport / priority order:**
- **Existing reference page(s):**
- **Existing shared patterns/components:** `StudentPageHeading`, `StudentCollectionPanel`, `StudentDataList`, `PaperSurface`, etc., if applicable
- **Any new pattern proposed?** Why existing ones do not work and where it will be reused (or N/A)
- **Feature-specific logic (must stay in feature):** filters / API / pagination / assessment / learning state

## C. Page Visual Brief (required for new page / material visual redesign)

- **Visual anchor and learning purpose:** Pipo | approved scene | feature-owned learning image | truthful data/identity visualization | none (focus exception with reason)
- **Existing asset ID or content media:** e.g. `scene.study-desk`; source and rights if new
- **Pipo mood / prop / placement:** only if useful; behavior when disabled
- **Composition:** desktop position / mobile 360–390px alternative or crop
- **Accessibility:** localized alt or decorative `alt=""`, text equivalent when semantic
- **Animation / reduced-motion / performance:** or N/A
- **Why this is not just decorative filler:**

## D. UI states and interaction (required as applicable)

| State / interaction | Expected copy/action/feedback (or N/A with reason) |
|---|---|
| Loading | |
| Empty | |
| Filtered-empty | |
| Error / retry | |
| Disabled / permission | |
| Success / completion | |
| Keyboard / focus / dialog | |

- **Responsive:** actual viewport checks 360, 390, 768, 1024, 1440px
- **Long Vietnamese text, touch targets >=44px, contrast:** 
- **Teacher/shared CSS/portal impact:** 

## E. Evidence & sign-off (fill before merge)

- **Screenshots or recorded observations:** desktop/mobile, important states (avoid personal data)
- **Tests actually run:** command + result + tested commit
- **Not executed / blockers:** 
- **Open UI/UX issues:** P0/P1/P2 and tracking
- **Reviewer decision:** Approved | Changes requested | Pending validation
- **Scope exclusions:** What intentionally remains unchanged?
