import { MAP_REFERENCE_VIEWPORT, type MapScaleSnapshot } from "@/utils/map/scale";

export const MARKER_VIEWBOX = Object.freeze({
  width: 387,
  height: 486
});

export const MARKER_BASE_VIEWPORT_RATIO = 0.05;

export type MarkerCanvasSize = {
  width: number;
  height: number;
  labelGap: number;
  labelFontSize: number;
  labelMaxWidth: number;
  totalHeight: number;
};

export function resolveMarkerBaseWidth(
  viewport: Pick<MapScaleSnapshot, "width" | "height">
): number {
  return Math.max(
    1,
    Math.round(Math.min(viewport.width, viewport.height) * MARKER_BASE_VIEWPORT_RATIO)
  );
}

export function resolveMarkerBaseWidthAtReference(): number {
  return resolveMarkerBaseWidth(MAP_REFERENCE_VIEWPORT);
}

export function resolveMarkerCanvasSize(
  viewport: Pick<MapScaleSnapshot, "width" | "height">
): MarkerCanvasSize {
  const width = resolveMarkerBaseWidth(viewport);
  const height = Math.round((width * MARKER_VIEWBOX.height) / MARKER_VIEWBOX.width);
  const labelGap = Math.max(4, Math.round(width * 0.16));
  const labelFontSize = Math.max(10, Math.round(width * 0.26));

  return {
    width,
    height,
    labelGap,
    labelFontSize,
    labelMaxWidth: width,
    totalHeight: height + labelGap + labelFontSize + 4
  };
}
