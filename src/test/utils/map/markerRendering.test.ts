import { describe, expect, it } from "vitest";

import { thankYouData } from "../../../components/mockdata/thankYouData";
import {
  hitTestMarker,
  resolveMarkerWorldPositionFromPointerDelta
} from "../../../features/map/utils/markerHitTesting";
import { createMarkerRenderSpecs } from "../../../features/map/utils/markerRenderSpec";
import {
  createVariableMarkerWorldLayout,
  createStableMarkerWorldPositions,
  resolveMarkerViewportPosition
} from "../../../features/map/utils/markerPositioning";
import {
  resolveMarkerBaseWidth,
  resolveMarkerBaseWidthAtReference,
  resolveMarkerCanvasSize,
  resolveMarkerSizeMultiplier,
  resolveMarkerWidthAtScaleOne,
  resolveThankYouCount
} from "../../../features/map/utils/markerSize";

describe("Marker Rendering Utilities", () => {
  describe("resolveMarkerBaseWidth", () => {
    it("should resolve a base width of 50 for the 1000x1000 reference viewport (Happy Path)", () => {
      expect(resolveMarkerBaseWidthAtReference()).toBe(50);
      expect(resolveMarkerBaseWidth({ width: 1000, height: 1000, effectiveScale: 1 } as any)).toBe(
        50
      );
    });

    it("should use the smaller viewport dimension for the base width rule (Happy Path)", () => {
      expect(resolveMarkerBaseWidth({ width: 1200, height: 800, effectiveScale: 1 } as any)).toBe(
        40
      );
    });

    it("should scale the base width when effectiveScale is not 1 (Happy Path)", () => {
      expect(resolveMarkerBaseWidth({ width: 1000, height: 1000, effectiveScale: 2 } as any)).toBe(
        100
      );
      expect(
        resolveMarkerBaseWidth({ width: 1000, height: 1000, effectiveScale: 0.5 } as any)
      ).toBe(25);
    });

    it("should derive marker canvas size from the viewport rule and scale (Happy Path)", () => {
      const markerSize = resolveMarkerCanvasSize({
        width: 1000,
        height: 1000,
        effectiveScale: 1
      } as any);

      expect(markerSize.width).toBe(50);
      expect(markerSize.height).toBe(63);
      expect(markerSize.totalHeight).toBeGreaterThan(markerSize.height);

      const scaledSize = resolveMarkerCanvasSize({
        width: 1000,
        height: 1000,
        effectiveScale: 2
      } as any);
      expect(scaledSize.width).toBe(100);
    });
  });

  describe("count-based marker sizing", () => {
    it("should count repeated thank-you IDs as multiple received thanks (Happy Path)", () => {
      expect(resolveThankYouCount([1, 1, 1])).toBe(3);
      expect(resolveThankYouCount([])).toBe(0);
      expect(resolveThankYouCount(null)).toBe(0);
    });

    it("should keep zero-count markers at the base multiplier (Edge Case)", () => {
      expect(resolveMarkerSizeMultiplier(0, 10)).toBe(1);
      expect(resolveMarkerWidthAtScaleOne(50, resolveMarkerSizeMultiplier(0, 10))).toBe(50);
    });

    it("should cap the highest-count marker while growing visibly (Happy Path)", () => {
      const highCountMultiplier = resolveMarkerSizeMultiplier(10, 10);
      const midCountMultiplier = resolveMarkerSizeMultiplier(3, 10);

      expect(highCountMultiplier).toBe(2.2);
      expect(midCountMultiplier).toBeGreaterThan(1);
      expect(midCountMultiplier).toBeLessThan(highCountMultiplier);
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

  describe("createVariableMarkerWorldLayout", () => {
    it("should expand the world and keep variable-sized markers separated (Happy Path)", () => {
      const layout = createVariableMarkerWorldLayout(
        [
          { widthAtScaleOne: 110 },
          { widthAtScaleOne: 90 },
          { widthAtScaleOne: 50 },
          { widthAtScaleOne: 70 }
        ],
        { seed: 4242, markerBaseWidth: 50 }
      );

      expect(layout.positions).toHaveLength(4);
      expect(layout.worldSize.width).toBeGreaterThanOrEqual(2000);
      expect(layout.worldSize.height).toBeGreaterThanOrEqual(2000);

      const minGap = 60;
      const tolerance = 1;

      for (let index = 0; index < layout.positions.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < layout.positions.length; nextIndex += 1) {
          const distance = Math.hypot(
            layout.positions[index].x - layout.positions[nextIndex].x,
            layout.positions[index].y - layout.positions[nextIndex].y
          );
          const requiredDistance =
            layout.markerRadii[index] + layout.markerRadii[nextIndex] + minGap;

          expect(distance).toBeGreaterThanOrEqual(requiredDistance - tolerance);
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
        baseWidthAtScaleOne: 50,
        thankYouCount: 3
      });
      expect(markerRenderSpecs.specs[0].widthAtScaleOne).toBeGreaterThan(50);
      expect(markerRenderSpecs.specs[10]).toMatchObject({
        id: 11,
        thankYouCount: 10,
        sizeMultiplier: 2.2,
        widthAtScaleOne: 110
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

  describe("marker hit testing", () => {
    it("should resolve a marker from viewport coordinates (Happy Path)", () => {
      const markerRenderSpecs = createMarkerRenderSpecs(thankYouData, {
        seed: 42,
        sizeDistribution: { minMultiplier: 1, maxMultiplier: 1 }
      });
      const markerSpec = {
        ...markerRenderSpecs.specs[0],
        worldPosition: { x: 0, y: 0 },
        widthAtScaleOne: 50
      };

      const hitbox = hitTestMarker(
        { x: 500, y: 500 },
        [markerSpec],
        { width: 1000, height: 1000, effectiveScale: 1 } as any,
        { x: 0, y: 0 },
        { width: 2000, height: 2000 }
      );

      expect(hitbox?.markerId).toBe(markerSpec.id);
    });

    it("should hit test against the wrapped marker copy (Edge Case)", () => {
      const markerRenderSpecs = createMarkerRenderSpecs(thankYouData, {
        seed: 42,
        sizeDistribution: { minMultiplier: 1, maxMultiplier: 1 }
      });
      const markerSpec = {
        ...markerRenderSpecs.specs[0],
        worldPosition: { x: 1100, y: 0 },
        widthAtScaleOne: 50
      };

      const hitbox = hitTestMarker(
        { x: 900, y: 500 },
        [markerSpec],
        { width: 1000, height: 1000, effectiveScale: 1 } as any,
        { x: -700, y: 0 },
        { width: 2000, height: 2000 }
      );

      expect(hitbox?.markerId).toBe(markerSpec.id);
    });

    it("should convert pointer pixel delta into zoom-aware marker world movement (Happy Path)", () => {
      expect(
        resolveMarkerWorldPositionFromPointerDelta(
          { x: 10, y: -20 },
          { x: 12, y: -8 },
          { effectiveScale: 0.5 }
        )
      ).toEqual({ x: 34, y: -36 });
    });
  });
});
