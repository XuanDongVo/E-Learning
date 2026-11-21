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

## Current placements (revised after the original rollout)

Pipo remains only where feedback is helpful, not as the main artwork of an editorial header:

| UI | Role |
|---|---|
| Vocabulary Study / Review completion | Feedback after completing a learning/review queue |
| Activity Result | Honest status feedback; milestone only on confirmed level-up |
| Assignment Intro / Result | Contextual instructions and neutral result feedback |

Student Learning Hub, Units Index, Unit Detail and Knowledge Library **no longer render Pipo in page headers**. They use first-party original SVG scenes or authentic Unit cover artwork. Leaderboard also uses its own original podium SVG.

## Preference and layout stability

The Navbar toggle (desktop and mobile) was removed by request. `PipoProvider` no longer restores a localStorage `off` value which could strand the mascot in a disabled state with no visible way to re-enable it. The internal `toggle()` API remains for source compatibility, not for Navbar UI.

The `Pipo` outer wrapper now reserves the exact intrinsic width/aspect ratio of the character before mood/blink updates. `PipoCharacter` fills that reserved box, so changes in facial expression do not shift surrounding text. This is distinct from optional small, motion-safe celebration animation.

## Visual rules

- Student-scoped styles: `src/styles/student/mascot-scenes.css`.
- Student palette, ink borders, paper speech bubble and restrained pop-shadow.
- Pipo character SVG remains the same; no third-party artwork, mascot library or asset package.
- Decorative sticker never contains mandatory learning guidance.
- Do not infer a student's confidence or ability from a low score. Do not imply XP/streak completion without a confirmed result.
- Respect reduced-motion preference; existing Pipo blink and bounce logic remains controlled by `prefers-reduced-motion`.

## Manual regression checks

1. Verify header artwork is SVG (not Pipo) on `/student`, `/student/units`, `/student/units/3`, `/student/knowledge` and `/student/leaderboard`, desktop and mobile.
2. Confirm no Pipo display toggle exists in Student Navbar (desktop/mobile).
3. Confirm Pipo layout is stable in Vocabulary and Activity/Assignment result pages during blinking/mood updates.
4. Finish Vocabulary learning and a due Review queue. Check no completion claim is made while working through a card.
5. Complete, Game-Over and Abandon Activity sessions. Confirm the three feedback messages are distinct and nonmisleading.
6. Level-up: only confirmed Activity receipt `levelAfter > levelBefore` is a milestone; XP pending/error shows ordinary feedback.
7. Inspect Assignment Intro, started timed attempt, submitted result and timed-out result. Pipo must not obscure the timed attempt or scores.
8. Check keyboard/focus, hover on toggle, screen reader text and `prefers-reduced-motion`; Teacher pages remain unchanged.
9. Run `cd client-e-learning && npm test -- student-mascot-scene.test.tsx`, `npx tsc --noEmit` and `npm run lint` before merging.

> **Verification:** This change was committed via the GitHub connector. Local Node build, browser regression tests and TypeScript checks were not executed in that environment.
