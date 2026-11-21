/**
 * Only first-party approved decorative illustrations live here.
 * Educational media and server-supplied unit cover URLs remain feature-owned.
 * Provenance and license review: .agent/ui/STUDENT_ASSET_LICENSES.md.
 */
export type StudentVisualRole = "scene" | "state" | "learning" | "achievement" | "doodle";
export type StudentVisualAsset = {
  src: string;
  role: StudentVisualRole;
  width: number;
  height: number;
  source: "in-repo-original";
  license: "project-original";
  status: "approved";
};

export const studentVisualRegistry = {
  "illustration.topic-notes": { src: "/assets/student/illustrations/learning/topic-notes.svg", role: "learning", width: 180, height: 150, source: "in-repo-original", license: "project-original", status: "approved" },
  "scene.knowledge-shelf": { src: "/assets/student/scenes/knowledge-shelf.svg", role: "scene", width: 520, height: 340, source: "in-repo-original", license: "project-original", status: "approved" },
  "doodle.reading-trail": { src: "/assets/student/doodles/annotations/reading-trail.svg", role: "doodle", width: 220, height: 96, source: "in-repo-original", license: "project-original", status: "approved" },
  "doodle.bookmark-note": { src: "/assets/student/doodles/stickers/bookmark-note.svg", role: "doodle", width: 132, height: 156, source: "in-repo-original", license: "project-original", status: "approved" },
  "scene.study-desk": { src: "/assets/student/scenes/study-desk.svg", role: "scene", width: 480, height: 320, source: "in-repo-original", license: "project-original", status: "approved" },
  "scene.open-notebook": { src: "/assets/student/scenes/open-notebook.svg", role: "scene", width: 440, height: 310, source: "in-repo-original", license: "project-original", status: "approved" },
  "illustration.no-results": { src: "/assets/student/illustrations/states/no-results.svg", role: "state", width: 360, height: 300, source: "in-repo-original", license: "project-original", status: "approved" },
  "illustration.no-lessons": { src: "/assets/student/illustrations/states/no-lessons.svg", role: "state", width: 360, height: 300, source: "in-repo-original", license: "project-original", status: "approved" },
  "illustration.word-collection": { src: "/assets/student/illustrations/learning/word-collection.svg", role: "learning", width: 380, height: 310, source: "in-repo-original", license: "project-original", status: "approved" },
  "illustration.achievement-stamp": { src: "/assets/student/illustrations/achievements/achievement-stamp.svg", role: "achievement", width: 340, height: 300, source: "in-repo-original", license: "project-original", status: "approved" },
  "doodle.arrow": { src: "/assets/student/doodles/annotations/arrow.svg", role: "doodle", width: 200, height: 100, source: "in-repo-original", license: "project-original", status: "approved" },
  "doodle.underline": { src: "/assets/student/doodles/annotations/underline.svg", role: "doodle", width: 240, height: 56, source: "in-repo-original", license: "project-original", status: "approved" },
  "doodle.star-sticker": { src: "/assets/student/doodles/stickers/star-sticker.svg", role: "doodle", width: 120, height: 120, source: "in-repo-original", license: "project-original", status: "approved" },
} as const satisfies Record<string, StudentVisualAsset>;

export type StudentVisualId = keyof typeof studentVisualRegistry;
export const STUDENT_VISUAL_IDS = Object.keys(studentVisualRegistry) as StudentVisualId[];
