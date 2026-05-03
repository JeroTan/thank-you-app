import { type MapScaleSnapshot, type MapTileOrigin, type MapWorldOffset } from "@/utils/map/scale";

import { resolveMarkerBaseWidthAtReference, type MarkerCanvasSize } from "./markerSize";

const FULL_CIRCLE_RADIANS = Math.PI * 2;

type MarkerLayoutOptions = {
  seed?: number;
  minDistance?: number;
  markerBaseWidth?: number;
};

type MarkerViewportPosition = {
  x: number;
  y: number;
};

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);

    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStableMarkerWorldPositions(
  count: number,
  options: MarkerLayoutOptions = {}
): MapWorldOffset[] {
  if (count <= 0) {
    return [];
  }

  const markerBaseWidth = options.markerBaseWidth ?? resolveMarkerBaseWidthAtReference();
  const minDistance = options.minDistance ?? Math.max(96, Math.round(markerBaseWidth * 2.35));
  const seededRandom = createSeededRandom(options.seed ?? 1);
  const angleOffset = seededRandom() * FULL_CIRCLE_RADIANS;
  const worldPositions: MapWorldOffset[] = [{ x: 0, y: 0 }];
  let ring = 1;

  while (worldPositions.length < count) {
    const radius = ring * minDistance;
    const slots = Math.max(6, Math.floor((FULL_CIRCLE_RADIANS * radius) / minDistance));

    for (let slot = 0; slot < slots && worldPositions.length < count; slot += 1) {
      const angle = angleOffset + (slot / slots) * FULL_CIRCLE_RADIANS;

      worldPositions.push({
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius)
      });
    }

    ring += 1;
  }

  return worldPositions;
}

export function resolveMarkerViewportPosition(
  worldPosition: MapWorldOffset,
  scaleSnapshot: Pick<MapScaleSnapshot, "width" | "height" | "scale">,
  tileOrigin: MapTileOrigin
): MarkerViewportPosition {
  return {
    x: scaleSnapshot.width / 2 + worldPosition.x * scaleSnapshot.scale + tileOrigin.x,
    y: scaleSnapshot.height / 2 + worldPosition.y * scaleSnapshot.scale + tileOrigin.y
  };
}

export function isMarkerVisibleInViewport(
  markerCenter: MarkerViewportPosition,
  markerSize: MarkerCanvasSize,
  viewport: Pick<MapScaleSnapshot, "width" | "height">
): boolean {
  const horizontalPadding = markerSize.width / 2;
  const verticalPadding = markerSize.totalHeight / 2;

  return !(
    markerCenter.x + horizontalPadding < 0 ||
    markerCenter.x - horizontalPadding > viewport.width ||
    markerCenter.y + verticalPadding < 0 ||
    markerCenter.y - verticalPadding > viewport.height
  );
}
