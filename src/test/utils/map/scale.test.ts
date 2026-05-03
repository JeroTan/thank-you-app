import { describe, it, expect } from "vitest";
import {
  clampWorldOffset,
  createMapScaleSnapshot,
  resolveKeyboardPanDelta,
  resolveNextWorldOffset,
  resolveCanvasBackingStore,
  resolveGrassTileDrawSize,
  resolveTileOriginFromWorldOffset,
  resolveWorldOffsetDeltaFromPixels,
  resolveWorldOffsetDeltaFromWheel,
  resolveWorldOffsetFromPixelDelta,
  resolveWrappedTileStart,
  MAP_REFERENCE_VIEWPORT
} from "../../../utils/map/scale";

describe("Map Scale Utility", () => {
  describe("createMapScaleSnapshot", () => {
    it("should return standard values for exact reference viewport (Happy Path)", () => {
      const snapshot = createMapScaleSnapshot({
        width: 1000,
        height: 1000,
        devicePixelRatio: 1
      });
      expect(snapshot).toEqual({
        width: 1000,
        height: 1000,
        devicePixelRatio: 1,
        scale: 1,
        normalizedWidth: 1,
        normalizedHeight: 1
      });
    });

    it("should calculate correctly for larger viewports (Happy Path)", () => {
      const snapshot = createMapScaleSnapshot({
        width: 2000,
        height: 500,
        devicePixelRatio: 2
      });
      expect(snapshot).toEqual({
        width: 2000,
        height: 500,
        devicePixelRatio: 2,
        scale: 0.5, // min(2, 0.5)
        normalizedWidth: 2,
        normalizedHeight: 0.5
      });
    });

    it("should handle undefined and missing values gracefully (Bad Path / Edge Case)", () => {
      const snapshot = createMapScaleSnapshot({});
      expect(snapshot).toEqual({
        width: MAP_REFERENCE_VIEWPORT.width,
        height: MAP_REFERENCE_VIEWPORT.height,
        devicePixelRatio: 1,
        scale: 1,
        normalizedWidth: 1,
        normalizedHeight: 1
      });
    });

    it("should fallback for zero or negative values (Bad Path / Edge Case)", () => {
      const snapshot = createMapScaleSnapshot({
        width: 0,
        height: -500,
        devicePixelRatio: -2
      });
      expect(snapshot.width).toBe(MAP_REFERENCE_VIEWPORT.width);
      expect(snapshot.height).toBe(MAP_REFERENCE_VIEWPORT.height);
      expect(snapshot.devicePixelRatio).toBe(1);
      expect(snapshot.scale).toBe(1);
    });
  });

  describe("resolveCanvasBackingStore", () => {
    it("should calculate backing store correctly (Happy Path)", () => {
      const store = resolveCanvasBackingStore({ width: 1000, height: 500, devicePixelRatio: 2 });
      expect(store).toEqual({ width: 2000, height: 1000 });
    });

    it("should fall back to MIN_POSITIVE_SIZE for negative inputs (Bad Path / Edge Case)", () => {
      const store = resolveCanvasBackingStore({ width: -100, height: 0, devicePixelRatio: 2 });
      expect(store.width).toBe(1); // max(1, Math.round(-200))
      expect(store.height).toBe(1); // max(1, Math.round(0))
    });
  });

  describe("resolveGrassTileDrawSize", () => {
    it("should calculate grass tile draw size based on scale (Happy Path)", () => {
      const size = resolveGrassTileDrawSize({ scale: 1 } as any, 128);
      expect(size).toBe(128);
    });

    it("should enforce a minimum tile size of 96 (Bad Path / Edge Case)", () => {
      const size = resolveGrassTileDrawSize({ scale: 0.1 } as any, 128); // 128 * 0.5 = 64, max(96, 64) = 96
      expect(size).toBe(96);
    });

    it("should fallback to DEFAULT_TILE_SIZE for invalid imageWidth (Bad Path / Edge Case)", () => {
      const size = resolveGrassTileDrawSize({ scale: 1 } as any, -50); // falls back to 128 internally
      expect(size).toBe(128);
    });
  });

  describe("resolveWrappedTileStart", () => {
    it("should calculate correctly for positive offset (Happy Path)", () => {
      expect(resolveWrappedTileStart(10, 128)).toBe(-118);
    });

    it("should calculate correctly for negative offset (Happy Path)", () => {
      expect(resolveWrappedTileStart(-10, 128)).toBe(-10);
    });

    it("should enforce MIN_POSITIVE_SIZE for tileSize (Bad Path / Edge Case)", () => {
      expect(resolveWrappedTileStart(5, 0)).toBe(-1);
    });
  });

  describe("panning helpers", () => {
    it("should convert pixel drag delta into world offset delta using scale (Happy Path)", () => {
      expect(resolveWorldOffsetFromPixelDelta(10, { scale: 0.5 })).toBe(20);
      expect(resolveWorldOffsetDeltaFromPixels({ x: 12, y: -8 }, { scale: 0.5 })).toEqual({
        x: 24,
        y: -16
      });
    });

    it("should invert wheel deltas for trackpad pan behavior (Happy Path)", () => {
      expect(resolveWorldOffsetDeltaFromWheel({ x: 12, y: -8 }, { scale: 1 })).toEqual({
        x: -12,
        y: 8
      });
    });

    it("should return scaled keyboard deltas for arrow pan (Happy Path)", () => {
      expect(resolveKeyboardPanDelta("right", { scale: 0.5 })).toEqual({ x: 96, y: 0 });
      expect(resolveKeyboardPanDelta("up", { scale: 1 })).toEqual({ x: 0, y: -48 });
    });

    it("should clamp world offsets when bounds exist (Edge Case)", () => {
      expect(
        clampWorldOffset({ x: 200, y: -200 }, { minX: -100, maxX: 100, minY: -50, maxY: 50 })
      ).toEqual({
        x: 100,
        y: -50
      });
    });

    it("should resolve the next world offset with additive deltas (Happy Path)", () => {
      expect(resolveNextWorldOffset({ x: 20, y: -10 }, { x: 15, y: 5 })).toEqual({ x: 35, y: -5 });
    });

    it("should derive tile origin from the normalized world offset (Happy Path)", () => {
      expect(resolveTileOriginFromWorldOffset({ x: 20, y: -10 }, { scale: 0.5 })).toEqual({
        x: 10,
        y: -5
      });
    });
  });
});
