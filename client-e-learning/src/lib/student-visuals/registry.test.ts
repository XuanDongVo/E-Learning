import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { STUDENT_VISUAL_IDS, studentVisualRegistry } from "./registry";

describe("approved Student visual registry", () => {
  it("contains unique local assets with explicit size and provenance", () => {
    // Phase 03, Knowledge Notes and editorial headers extend this additive registry.
    expect(STUDENT_VISUAL_IDS.length).toBeGreaterThanOrEqual(9);
    const sources = STUDENT_VISUAL_IDS.map((id) => studentVisualRegistry[id].src);
    expect(new Set(sources).size).toBe(sources.length);
    for (const id of STUDENT_VISUAL_IDS) {
      const visual = studentVisualRegistry[id];
      expect(visual.src).toMatch(/^\/assets\/student\/.*\.svg$/);
      expect(visual.width).toBeGreaterThan(0);
      expect(visual.height).toBeGreaterThan(0);
      expect(visual.source).toBe("in-repo-original");
      expect(visual.status).toBe("approved");
    }
  });

  it("hides decorative assets from assistive tech", () => {
    const html = renderToStaticMarkup(
      createElement(StudentIllustration, { id: "doodle.star-sticker", decorative: true }),
    );
    expect(html).toContain('alt=""');
    expect(html).toContain('aria-hidden="true"');
  });

  it("requires a translated accessible description for meaningful art", () => {
    const html = renderToStaticMarkup(
      createElement(StudentIllustration, { id: "illustration.no-results", alt: "Không tìm thấy kết quả" }),
    );
    expect(html).toContain('alt="Không tìm thấy kết quả"');
  });
});
