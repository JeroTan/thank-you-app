import { describe, expect, it } from "vitest";

import { thankYouData } from "../../../components/mockdata/thankYouData";
import { createMarkerRenderSpecs } from "../../../features/map/utils/markerRenderSpec";
import {
  createStableMarkerWorldPositions,
  resolveMarkerViewportPosition
} from "../../../features/map/utils/markerPositioning";
import {
  resolveMarkerBaseWidth,
  resolveMarkerBaseWidthAtReference,
  resolveMarkerCanvasSize
} from "../../../features/map/utils/markerSize";

describe("Marker Rendering Utilities", () => {
  describe("resolveMarkerBaseWidth", () => {
    it("should resolve a base width of 50 for the 1000x1000 reference viewport (Happy Path)", () => {
      expect(resolveMarkerBaseWidthAtReference()).toBe(50);
      expect(resolveMarkerBaseWidth({ width: 1000, height: 1000, effectiveScale: 1 } as any)).toBe(50);
    });

    it("should use the smaller viewport dimension for the base width rule (Happy Path)", () => {
      expect(resolveMarkerBaseWidth({ width: 1200, height: 800, effectiveScale: 1 } as any)).toBe(40);
    });

    it("should scale the base width when effectiveScale is not 1 (Happy Path)", () => {
      expect(resolveMarkerBaseWidth({ width: 1000, height: 1000, effectiveScale: 2 } as any)).toBe(100);
      expect(resolveMarkerBaseWidth({ width: 1000, height: 1000, effectiveScale: 0.5 } as any)).toBe(25);
    });

    it("should derive marker canvas size from the viewport rule and scale (Happy Path)", () => {
      const markerSize = resolveMarkerCanvasSize({ width: 1000, height: 1000, effectiveScale: 1 } as any);

      expect(markerSize.width).toBe(50);
      expect(markerSize.height).toBe(63);
      expect(markerSize.totalHeight).toBeGreaterThan(markerSize.height);

      const scaledSize = resolveMarkerCanvasSize({ width: 1000, height: 1000, effectiveScale: 2 } as any);
      expect(scaledSize.width).toBe(100);
    });
  });

  describe("createStableMarkerWorldPositions", () => {
    it("should return a stable layout for the same seed (Happy Path)", () => {
      const firstLayout = createStableMarkerWorldPositions(10, { seed: 1234, markerBaseWidth: 50 });
      const secondLayout = createStableMarkerWorldPositions(10, {
        seed: 1234,
        markerBaseWidth: 50
      });

      expect(firstLayout).toEqual(secondLayout);
    });

    it("should keep markers separated beyond the requested minimum distance (Happy Path)", () => {
      const minDistance = 118;
      const layout = createStableMarkerWorldPositions(10, {
        seed: 999,
        markerBaseWidth: 50,
        minDistance
      });

      // Allow 1 pixel tolerance for rounding and trigonometric precision
      const tolerance = 1;

      for (let index = 0; index < layout.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < layout.length; nextIndex += 1) {
          const xDistance = layout[index].x - layout[nextIndex].x;
          const yDistance = layout[index].y - layout[nextIndex].y;
          const distance = Math.hypot(xDistance, yDistance);

          expect(distance).toBeGreaterThanOrEqual(minDistance - tolerance);
        }
      }
    });
  });

  describe("createMarkerRenderSpecs", () => {
    it("should convert mock data into marker render specs (Happy Path)", () => {
      const markerRenderSpecs = createMarkerRenderSpecs(thankYouData, { seed: 42 });

      expect(markerRenderSpecs.specs).toHaveLength(thankYouData.length);
      expect(markerRenderSpecs.specs[0]).toMatchObject({
        id: 1,
        frameColor: 0x554433,
        label: "Jonathan",
        fallbackInitial: "J",
        baseWidthAtScaleOne: 50
      });
    });
  });

  describe("resolveMarkerViewportPosition", () => {
    it("should translate a world position into the current viewport (Happy Path)", () => {
      expect(
        resolveMarkerViewportPosition(
          { x: 100, y: -50 },
          { width: 1000, height: 1000, effectiveScale: 0.5 } as any,
          { x: 20, y: -10 }
        )
      ).toEqual({ x: 570, y: 465 });
    });
  });
});
;
