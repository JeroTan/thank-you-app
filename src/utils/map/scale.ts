export const MAP_REFERENCE_VIEWPORT = Object.freeze({
  width: 1000,
  height: 1000
});

export type MapViewport = {
  width: number;
  height: number;
  devicePixelRatio: number;
};

export type MapScaleSnapshot = MapViewport & {
  scale: number;
  normalizedWidth: number;
  normalizedHeight: number;
};

export type MapWorldOffset = {
  x: number;
  y: number;
};

export type MapTileOrigin = {
  x: number;
  y: number;
};

export type MapPanInputMode = "mouse" | "touch" | "trackpad" | "keyboard" | null;

export type MapPanCursor = "grab" | "grabbing";

export type MapPanInteractionState = {
  isActive: boolean;
  inputMode: MapPanInputMode;
  cursor: MapPanCursor;
};

export type MapWorldBounds = {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
};

const MIN_POSITIVE_SIZE = 1;
const DEFAULT_TILE_SIZE = 128;
const DEFAULT_KEYBOARD_PAN_STEP = 48;

function sanitizePositiveNumber(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

function sanitizeFiniteNumber(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

function sanitizeScaleValue(scale: number): number {
  return Math.max(
    MIN_POSITIVE_SIZE / MAP_REFERENCE_VIEWPORT.width,
    sanitizePositiveNumber(scale, 1)
  );
}

function resolveAxisWithinBounds(value: number, minimum?: number, maximum?: number): number {
  const safeValue = sanitizeFiniteNumber(value);
  const safeMinimum = minimum === undefined ? undefined : sanitizeFiniteNumber(minimum);
  const safeMaximum = maximum === undefined ? undefined : sanitizeFiniteNumber(maximum);

  if (safeMinimum !== undefined && safeMaximum !== undefined && safeMinimum > safeMaximum) {
    return Math.min(Math.max(safeValue, safeMaximum), safeMinimum);
  }

  if (safeMinimum !== undefined && safeValue < safeMinimum) {
    return safeMinimum;
  }

  if (safeMaximum !== undefined && safeValue > safeMaximum) {
    return safeMaximum;
  }

  return safeValue;
}

export function createMapScaleSnapshot(viewport: Partial<MapViewport> = {}): MapScaleSnapshot {
  const width = Math.max(
    MIN_POSITIVE_SIZE,
    Math.round(
      sanitizePositiveNumber(
        viewport.width ?? MAP_REFERENCE_VIEWPORT.width,
        MAP_REFERENCE_VIEWPORT.width
      )
    )
  );
  const height = Math.max(
    MIN_POSITIVE_SIZE,
    Math.round(
      sanitizePositiveNumber(
        viewport.height ?? MAP_REFERENCE_VIEWPORT.height,
        MAP_REFERENCE_VIEWPORT.height
      )
    )
  );
  const devicePixelRatio = sanitizePositiveNumber(viewport.devicePixelRatio ?? 1, 1);
  const normalizedWidth = width / MAP_REFERENCE_VIEWPORT.width;
  const normalizedHeight = height / MAP_REFERENCE_VIEWPORT.height;
  const scale = Math.max(
    MIN_POSITIVE_SIZE / MAP_REFERENCE_VIEWPORT.width,
    Math.min(normalizedWidth, normalizedHeight)
  );

  return {
    width,
    height,
    devicePixelRatio,
    scale,
    normalizedWidth,
    normalizedHeight
  };
}

export function resolveCanvasBackingStore(
  snapshot: Pick<MapViewport, "width" | "height" | "devicePixelRatio">
) {
  return {
    width: Math.max(MIN_POSITIVE_SIZE, Math.round(snapshot.width * snapshot.devicePixelRatio)),
    height: Math.max(MIN_POSITIVE_SIZE, Math.round(snapshot.height * snapshot.devicePixelRatio))
  };
}

export function resolveGrassTileDrawSize(
  scale: Pick<MapScaleSnapshot, "scale">,
  imageWidth: number
): number {
  const safeImageWidth = sanitizePositiveNumber(imageWidth, DEFAULT_TILE_SIZE);

  return Math.max(96, Math.round(safeImageWidth * Math.max(scale.scale, 0.5)));
}

export function resolveWrappedTileStart(offset: number, tileSize: number): number {
  const safeTileSize = Math.max(MIN_POSITIVE_SIZE, Math.round(tileSize));
  const wrappedOffset = ((offset % safeTileSize) + safeTileSize) % safeTileSize;

  return wrappedOffset - safeTileSize;
}

export function clampWorldOffset(
  worldOffset: MapWorldOffset,
  bounds: MapWorldBounds = {}
): MapWorldOffset {
  return {
    x: resolveAxisWithinBounds(worldOffset.x, bounds.minX, bounds.maxX),
    y: resolveAxisWithinBounds(worldOffset.y, bounds.minY, bounds.maxY)
  };
}

export function resolveWorldOffsetFromPixelDelta(
  pixelDelta: number,
  scale: Pick<MapScaleSnapshot, "scale">
): number {
  return sanitizeFiniteNumber(pixelDelta) / sanitizeScaleValue(scale.scale);
}

export function resolveWorldOffsetDeltaFromPixels(
  delta: Partial<MapWorldOffset>,
  scale: Pick<MapScaleSnapshot, "scale">
): MapWorldOffset {
  return {
    x: resolveWorldOffsetFromPixelDelta(delta.x ?? 0, scale),
    y: resolveWorldOffsetFromPixelDelta(delta.y ?? 0, scale)
  };
}

export function resolveWorldOffsetDeltaFromWheel(
  delta: Partial<MapWorldOffset>,
  scale: Pick<MapScaleSnapshot, "scale">
): MapWorldOffset {
  const normalizedDelta = resolveWorldOffsetDeltaFromPixels(delta, scale);

  return {
    x: -normalizedDelta.x,
    y: -normalizedDelta.y
  };
}

export function resolveKeyboardPanDelta(
  direction:
    | Exclude<MapPanInputMode, "mouse" | "touch" | "trackpad" | null>
    | "left"
    | "right"
    | "up"
    | "down",
  scale: Pick<MapScaleSnapshot, "scale">,
  baseStep = DEFAULT_KEYBOARD_PAN_STEP
): MapWorldOffset {
  const worldStep = Math.round(
    sanitizePositiveNumber(baseStep, DEFAULT_KEYBOARD_PAN_STEP) / sanitizeScaleValue(scale.scale)
  );

  switch (direction) {
    case "left":
      return { x: -worldStep, y: 0 };
    case "right":
      return { x: worldStep, y: 0 };
    case "up":
      return { x: 0, y: -worldStep };
    case "down":
      return { x: 0, y: worldStep };
    default:
      return { x: 0, y: 0 };
  }
}

export function resolveNextWorldOffset(
  currentOffset: MapWorldOffset,
  delta: Partial<MapWorldOffset>,
  bounds?: MapWorldBounds
): MapWorldOffset {
  return clampWorldOffset(
    {
      x: sanitizeFiniteNumber(currentOffset.x) + sanitizeFiniteNumber(delta.x ?? 0),
      y: sanitizeFiniteNumber(currentOffset.y) + sanitizeFiniteNumber(delta.y ?? 0)
    },
    bounds
  );
}

export function resolveTileOriginFromWorldOffset(
  worldOffset: MapWorldOffset,
  scale: Pick<MapScaleSnapshot, "scale">
): MapTileOrigin {
  const safeScale = sanitizeScaleValue(scale.scale);

  return {
    x: Math.round(sanitizeFiniteNumber(worldOffset.x) * safeScale),
    y: Math.round(sanitizeFiniteNumber(worldOffset.y) * safeScale)
  };
}
