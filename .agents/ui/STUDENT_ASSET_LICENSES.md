# Student Asset Rights & Attribution Register — Phase 3A

Date: 2026-11-19. This file is a release gate for **asset usage**, not general legal advice.

## Approved phase 3 assets

The original SVG artwork created directly in this project's Phase 3 change (the 9 assets listed in STUDENT_ASSET_INVENTORY.md) is authored for this repository; no third-party source material or external font is embedded in these files. Registry `source: "in-repo-original"`, `license: "project-original"`, `attributionRequired: false`, `status: "approved"`. `project-original` is an internal provenance label, **not** an external SPDX license or a claim that older project files have been relicensed.

Pipo is an **existing repository character**; its original character rights, designer attribution and provenance should be confirmed by the project owner. Phase 3 only reuses/refactors existing character geometry and adds no new externally sourced Pipo likeness.

All older art, photos and vocabulary images listed in the inventory have `status: "existing-needs-provenance-audit"`. Keeping them in the current application does not imply that rights were verified here.

## External library research — references only, NOT imported

- Open Doodles: https://www.opendoodles.com/about — CC0, author Pablo Stanley; useful art-direction reference.
- Open Peeps: https://www.openpeeps.com/ — CC0, author Pablo Stanley; use as modular pose-system reference, **not** as new E-Learning mascot.
- Storyset: https://storyset.com/ — free illustrations commonly require credit under Freepik terms; verify **the specific asset license** before use.
- Absurd Design: https://absurd.design/freelicense — free license restricts commercial usage; **do not import free assets** without confirming permissions.
- Good Stuff No Nonsense, DrawKit, Icons8 Ouch, Blush, LottieFiles, unDraw, Haikei and ManyPixels: verify the exact selected pack/export/tier license, attribution, redistribution and derivative rights **at acquisition time**.

No third-party assets are bundled in this Phase 3 change. Do not ship attribution-required images until attribution placement is decided, and never expose a bulk-download gallery intended to redistribute paid/third-party packs.

## Required record for every future asset

| Field | Requirement |
|---|---|
| `id` | Stable semantic ID, never page-local array index |
| `path` | Repo path, single source of truth |
| `creator/sourceUrl` | Verified creator and official source link, or `in-repo-original` |
| `license/licenseUrl` | Exact license/tier and verification date (for external assets) |
| `attributionRequired` | Boolean plus display location if true |
| `modified` | Whether altered, and a brief note |
| `usage` | Page roles that benefit learners |
| `status` | proposed / approved / deprecated / existing-needs-provenance-audit |

**External asset approval checklist:** check usage rights for website, commercial demo, edits, embedding, sublicensing/redistribution and attribution; store license evidence; check visual consistency and alt/reduced-motion; approve in code review before importing.

## 2026-11-21 — additional original assets for Knowledge and Student headers

All of these SVG paths were authored specifically for this repository without third-party art, fonts or assets. They use the existing Indie Illustrated Scrapbook palette and are marked `source: in-repo-original` and `license: project-original` in the Student visual registry:

| Registry ID | File | Usage | Attribution |
|---|---|---|---|
| `illustration.topic-notes` | `client-e-learning/public/assets/student/illustrations/learning/topic-notes.svg` | Topic Quick Summary | Not required |
| `illustration.unit-journey` | `client-e-learning/public/assets/student/illustrations/learning/unit-journey.svg` | Units Index and Learning Hub header | Not required |
| `illustration.leaderboard-podium` | `client-e-learning/public/assets/student/illustrations/achievements/leaderboard-podium.svg` | Leaderboard header | Not required |

These SVGs are decorative: `StudentIllustration decorative` emits empty alt and aria-hidden. No SVG animation; their intrinsic viewBox/size is stable. The original Pipo character remains in the codebase for non-header contextual feedback. Existing character provenance caveat above remains in force.
