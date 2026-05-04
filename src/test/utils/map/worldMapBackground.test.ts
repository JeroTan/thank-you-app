import { describe, expect, it } from "vitest";

import {
  createRouteArcPoints,
  projectWorldMapPoint,
  resolveWorldMapThemeTokens,
  resolveWorldMapTileCopies,
  resolveWorldMapTileSize
} from "../../../features/map/utils/worldMapGeometry";

describe("world map background helpers", () => {
  it("should scale the world-map tile with effective scale (Happy Path)", () => {
    expect(resolveWorldMapTileSize({ effectiveScale: 0.5 })).toEqual({
      width: 1000,
      height: 700
    });
    expect(resolveWorldMapTileSize({ effectiveScale: 2 })).toEqual({
      width: 4000,
      height: 2800
    });
  });

  it("should resolve enough wrapped tile copies to cover the viewport (Happy Path)", () => {
    const copies = resolveWorldMapTileCopies(
      { width: 1200, height: 900, effectiveScale: 1 },
      { x: -450, y: 280 }
    );

    expect(copies.length).toBeGreaterThan(1);
    expect(Math.min(...copies.map((copy) => copy.x))).toBeLessThanOrEqual(0);
    expect(Math.max(...copies.map((copy) => copy.x + copy.width))).toBeGreaterThanOrEqual(1200);
    expect(Math.min(...copies.map((copy) => copy.y))).toBeLessThanOrEqual(0);
    expect(Math.max(...copies.map((copy) => copy.y + copy.height))).toBeGreaterThanOrEqual(900);
  });

  it("should project normalized points inside a tile (Happy Path)", () => {
    expect(
      projectWorldMapPoint({ x: 0.25, y: 0.75 }, { x: 100, y: 50, width: 800, height: 400 })
    ).toEqual({ x: 300, y: 350 });
  });

  it("should create deterministic route arc points (Happy Path)", () => {
    const points = createRouteArcPoints({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.2, 4);

    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[4]).toEqual({ x: 100, y: 0 });
    expect(points[2]?.y).toBeGreaterThan(0);
  });

  it("should return stable theme tokens (Happy Path)", () => {
    expect(resolveWorldMapThemeTokens("atlas").backgroundTop).toBe("#17443d");
    expect(resolveWorldMapThemeTokens("dusk").routeStroke).toContain("rgba");
  });
});
