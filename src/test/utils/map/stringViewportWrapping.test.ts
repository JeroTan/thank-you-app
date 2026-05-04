import { describe, expect, it } from "vitest";

import { resolveConsistentStringViewportPoints } from "../../../features/map/utils/stringSceneBuilder";

describe("string viewport wrapping", () => {
  it("keeps every rope point on one shared wrapped copy (Happy Path)", () => {
    const resolved = resolveConsistentStringViewportPoints(
      [
        { x: 990, y: 0 },
        { x: 1000, y: 0 },
        { x: 1010, y: 0 }
      ],
      { width: 1900, height: 1000, effectiveScale: 1 },
      { x: 0, y: 0 },
      { width: 2000, height: 2000 }
    );

    expect(resolved).not.toBeNull();
    expect(Math.abs(Math.round((resolved?.[2]?.x ?? 0) - (resolved?.[0]?.x ?? 0)))).toBe(20);
    expect(Math.abs(Math.round((resolved?.[1]?.x ?? 0) - (resolved?.[0]?.x ?? 0)))).toBe(10);
  });

  it("does not draw a string only because its middle crosses the viewport (Edge Case)", () => {
    const resolved = resolveConsistentStringViewportPoints(
      [
        { x: -900, y: 0 },
        { x: 0, y: 0 },
        { x: 900, y: 0 }
      ],
      { width: 1000, height: 1000, effectiveScale: 1 },
      { x: 0, y: 0 },
      { width: 4000, height: 4000 }
    );

    expect(resolved).toBeNull();
  });

  it("anchors the visible copy from an endpoint marker position (Happy Path)", () => {
    const resolved = resolveConsistentStringViewportPoints(
      [
        { x: 2500, y: 0 },
        { x: 2600, y: 0 }
      ],
      { width: 1000, height: 1000, effectiveScale: 1 },
      { x: 0, y: 0 },
      { width: 3000, height: 3000 }
    );

    expect(resolved).not.toBeNull();
    expect(Math.round(resolved?.[0]?.x ?? Number.NaN)).toBe(0);
    expect(Math.round(resolved?.[1]?.x ?? Number.NaN)).toBe(100);
  });
});
