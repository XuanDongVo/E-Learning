# Pipo as a contextual Student learning companion

Implemented in branch `feature/guided-reasoning-v1` (2026-11-21).

## Purpose and usage

Pipo is an original in-repository SVG mascot. It is **not** a chatbot, a floating assistant, or a source of learning results. The feature that owns a page also owns its text and verified learning state.

`StudentMascotScene` lives at:
`client-e-learning/src/components/student-ui/visuals/pipo/student-mascot-scene.tsx`.

Usage:

```tsx
<StudentMascotScene
  variant="guide"
  mood="wave"
  prop="book"
  message="Cùng khám phá Unit này nhé!"
/>
```

Accepted variants:
- `guide` — introduction and orientation on a non-immersive page.
- `feedback` — a contextual message after a real submitted/completed action.
- `milestone` — a verified milestone (never speculative streak, XP or level).
- `presentation="sticker"` — decorative Pipo only; no speech bubble or hidden educational content.

Available sizes: `compact` / `medium`. Existing Pipo moods, colors and props remain supported. The mascot illustration is `aria-hidden`; the optional, visible text is ordinary accessible document content.

## Current placements

| UI | Placement | Condition |
|---|---|---|
| Unit Detail | Short guide in hero | No custom `mascotSlot` supplied |
| Knowledge Library | Reading Pipo in desktop artwork, compact guide on mobile | Library hero |
| Vocabulary Study | After last item of new-word queue | At least one learned word |
| Vocabulary Review | After a review queue has finished | Nonzero completed review session |
| Activity Result | Feedback below result overview | Terminal session result |
| Activity Result | Badge-bearing milestone | Only if server-confirmed `levelAfter > levelBefore` on completed session |
| Assignment Intro | Guide under assignment status | Intro only (never overlays the timed attempt) |
| Assignment Result | Neutral contextual feedback | Submitted/timed out, without disclosing hidden grades |

The existing Learning Hub and Units List Pipo artwork is retained.

## User preference

`PipoProvider` is mounted in the **Student layout only**, preserving the existing `learnup-mascot` localStorage preference. The Student Navbar exposes an accessible toggle on desktop and in the mobile drawer. Turning it off removes all new scenes without leaving unused layout gaps; the toggle remains accessible to turn it back on.

The design intentionally does **not** add mascot overlays on question cards, flashcards, assessment attempt timers, the editor or Teacher pages.

## Visual rules

- Student-scoped styles: `src/styles/student/mascot-scenes.css`.
- Student palette, ink borders, paper speech bubble and restrained pop-shadow.
- Pipo character SVG remains the same; no third-party artwork, mascot library or asset package.
- Decorative sticker never contains mandatory learning guidance.
- Do not infer a student's confidence or ability from a low score. Do not imply XP/streak completion without a confirmed result.
- Respect reduced-motion preference; existing Pipo blink and bounce logic remains controlled by `prefers-reduced-motion`.

## Manual regression checks

1. Open Student `/student`, `/student/units`, `/student/units/3`, `/student/knowledge`; verify Pipo in the intended positions on desktop and 360px mobile.
2. Disable Pipo from desktop Student Navbar; navigate through Student pages and reload. Confirm scenes remain hidden while text actions, progress and page layout remain intact.
3. Re-enable Pipo in the mobile menu and verify new scenes return.
4. Finish Vocabulary learning and a due Review queue. Check no completion claim is made while working through a card.
5. Complete, Game-Over and Abandon Activity sessions. Confirm the three feedback messages are distinct and nonmisleading.
6. Level-up: only confirmed Activity receipt `levelAfter > levelBefore` is a milestone; XP pending/error shows ordinary feedback.
7. Inspect Assignment Intro, started timed attempt, submitted result and timed-out result. Pipo must not obscure the timed attempt or scores.
8. Check keyboard/focus, hover on toggle, screen reader text and `prefers-reduced-motion`; Teacher pages remain unchanged.
9. Run `cd client-e-learning && npm test -- student-mascot-scene.test.tsx`, `npx tsc --noEmit` and `npm run lint` before merging.

> **Verification:** This change was committed via the GitHub connector. Local Node build, browser regression tests and TypeScript checks were not executed in that environment.
