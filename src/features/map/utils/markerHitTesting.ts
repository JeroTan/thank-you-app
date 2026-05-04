import type { MapMarkerRenderSpec } from "./markerRenderSpec";
import { resolveMarkerCanvasSizeForReferenceWidth, type MarkerCanvasSize } from "./markerSize";
import { resolveMarkerViewportPosition } from "./markerPositioning";

import {
  resolveWorldOffsetDeltaFromPixels,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapWorldOffset
} from "@/utils/map/scale";

export type MarkerViewportPoint = {
  x: number;
  y: number;
};

export type MarkerViewportHitbox = {
  markerId: number;
  centerX: number;
  centerY: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  markerSize: MarkerCanvasSize;
};

export function resolveMarkerViewportHitbox(
  spec: Pick<MapMarkerRenderSpec, "id" | "worldPosition" | "widthAtScaleOne">,
  scaleSnapshot: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">,
  tileOrigin: MapTileOrigin,
  worldSize?: { width: number; height: number }
): MarkerViewportHitbox {
  const viewportPosition = resolveMarkerViewportPosition(
    spec.worldPosition,
    scaleSnapshot,
    tileOrigin,
    worldSize
  );
  const markerSize = resolveMarkerCanvasSizeForReferenceWidth(spec.widthAtScaleOne, scaleSnapshot);
  const top = viewportPosition.y - markerSize.height * 0.15;

  return {
    markerId: spec.id,
    centerX: viewportPosition.x,
    centerY: viewportPosition.y,
    left: viewportPosition.x - markerSize.width / 2,
    top,
    right: viewportPosition.x + markerSize.width / 2,
    bottom: top + markerSize.totalHeight,
    markerSize
  };
}

export function hitTestMarker(
  point: MarkerViewportPoint,
  specs: MapMarkerRenderSpec[],
  scaleSnapshot: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">,
  tileOrigin: MapTileOrigin,
  worldSize?: { width: number; height: number }
): MarkerViewportHitbox | null {
  for (let index = specs.length - 1; index >= 0; index -= 1) {
    const hitbox = resolveMarkerViewportHitbox(specs[index], scaleSnapshot, tileOrigin, worldSize);

    if (
      point.x >= hitbox.left &&
      point.x <= hitbox.right &&
      point.y >= hitbox.top &&
      point.y <= hitbox.bottom
    ) {
      return hitbox;
    }
  }

  return null;
}

export function resolveMarkerWorldPositionFromPointerDelta(
  originWorldPosition: MapWorldOffset,
  pointerDelta: Partial<MapWorldOffset>,
  scaleSnapshot: Pick<MapScaleSnapshot, "effectiveScale">
): MapWorldOffset {
  const worldDelta = resolveWorldOffsetDeltaFromPixels(pointerDelta, scaleSnapshot);

  return {
    x: originWorldPosition.x + worldDelta.x,
    y: originWorldPosition.y + worldDelta.y
  };
}
