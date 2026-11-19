import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PipoCharacter } from "./pipo-character";
import { Pipo } from "./pipo";

describe("Pipo character render / compat", () => {
  it("preserves the original silhouette stages and thoughtful mood", () => {
    const base = renderToStaticMarkup(<PipoCharacter mood="think" stage={1} size={80} />);
    const grown = renderToStaticMarkup(<PipoCharacter mood="celebrate" stage={4} size={80} />);
    expect(base).toContain('viewBox="0 0 180 180"');
    expect(base).toContain("M89 27C67");
    expect(grown).toContain("M64 38L72");
    expect(grown).toContain("M78 105Q90 131");
    expect(renderToStaticMarkup(<PipoCharacter mood="happy" prop="book" />)).toContain("M51 128Q70 119");
  });

  it("renders decorative Pipo outside a provider without exposing SVG as spoken content", () => {
    const html = renderToStaticMarkup(<Pipo mood="wave" size={92} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="92"');
  });
});
