import { MAP_REFERENCE_VIEWPORT, type MapScaleSnapshot } from "@/utils/map/scale";

export const MARKER_VIEWBOX = Object.freeze({
  width: 387,
  height: 486
});

export const MARKER_BASE_VIEWPORT_RATIO = 0.05;
export const MARKER_MIN_SIZE_MULTIPLIER = 1;
export const MARKER_MAX_SIZE_MULTIPLIER = 2.2;

export type MarkerCanvasSize = {
  width: number;
  height: number;
  labelGap: number;
  labelFontSize: number;
  labelMaxWidth: number;
  totalHeight: number;
};

export type MarkerSizeDistributionOptions = {
  minMultiplier?: number;
  maxMultiplier?: number;
};

function sanitizePositiveNumber(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

function sanitizeMultiplierBounds(options: MarkerSizeDistributionOptions = {}) {
  const minMultiplier = sanitizePositiveNumber(options.minMultiplier, MARKER_MIN_SIZE_MULTIPLIER);
  const maxMultiplier = Math.max(
    minMultiplier,
    sanitizePositiveNumber(options.maxMultiplier, MARKER_MAX_SIZE_MULTIPLIER)
  );

  return { minMultiplier, maxMultiplier };
}

export function resolveThankYouCount(thankYouIdFrom: readonly number[] | null | undefined): number {
  return Array.isArray(thankYouIdFrom) ? thankYouIdFrom.length : 0;
}

export function resolveMarkerSizeMultiplier(
  thankYouCount: number,
  maxThankYouCount: number,
  options: MarkerSizeDistributionOptions = {}
): number {
  const { minMultiplier, maxMultiplier } = sanitizeMultiplierBounds(options);
  const safeCount = Math.max(0, Math.round(Number.isFinite(thankYouCount) ? thankYouCount : 0));
  const safeMaxCount = Math.max(
    0,
    Math.round(Number.isFinite(maxThankYouCount) ? maxThankYouCount : 0)
  );

  if (safeCount <= 0 || safeMaxCount <= 0) {
    return minMultiplier;
  }

  const distribution = Math.sqrt(safeCount) / Math.sqrt(safeMaxCount);
  const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * distribution;

  return Math.round(Math.min(maxMultiplier, Math.max(minMultiplier, multiplier)) * 1000) / 1000;
}

export function resolveMarkerWidthAtScaleOne(
  baseWidthAtScaleOne: number,
  sizeMultiplier: number
): number {
  const safeBaseWidth = sanitizePositiveNumber(
    baseWidthAtScaleOne,
    resolveMarkerBaseWidthAtReference()
  );
  const safeMultiplier = sanitizePositiveNumber(sizeMultiplier, MARKER_MIN_SIZE_MULTIPLIER);

  return Math.max(1, Math.round(safeBaseWidth * safeMultiplier));
}

export function resolveMarkerBaseWidth(
  viewport: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">
): number {
  return Math.max(
    1,
    Math.round(
      Math.min(viewport.width, viewport.height) *
        MARKER_BASE_VIEWPORT_RATIO *
        viewport.effectiveScale
    )
  );
}

export function resolveMarkerBaseWidthAtReference(): number {
  return resolveMarkerBaseWidth({ ...MAP_REFERENCE_VIEWPORT, effectiveScale: 1 });
}

export function resolveMarkerCanvasSizeForWidth(width: number): MarkerCanvasSize {
  const safeWidth = Math.max(1, Math.round(sanitizePositiveNumber(width, 1)));
  const height = Math.round((safeWidth * MARKER_VIEWBOX.height) / MARKER_VIEWBOX.width);
  const labelGap = Math.max(4, Math.round(safeWidth * 0.16));
  const labelFontSize = Math.max(10, Math.round(safeWidth * 0.26));

  return {
    width: safeWidth,
    height,
    labelGap,
    labelFontSize,
    labelMaxWidth: safeWidth,
    totalHeight: height + labelGap + labelFontSize + 4
  };
}

export function resolveMarkerCanvasSizeForReferenceWidth(
  widthAtScaleOne: number,
  viewport: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">
): MarkerCanvasSize {
  const referenceBaseWidth = resolveMarkerBaseWidthAtReference();
  const currentBaseWidth = resolveMarkerBaseWidth(viewport);
  const relativeWidth =
    sanitizePositiveNumber(widthAtScaleOne, referenceBaseWidth) / referenceBaseWidth;

  return resolveMarkerCanvasSizeForWidth(currentBaseWidth * relativeWidth);
}

export function resolveMarkerCanvasSize(
  viewport: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">
): MarkerCanvasSize {
  return resolveMarkerCanvasSizeForWidth(resolveMarkerBaseWidth(viewport));
}
