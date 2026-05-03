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

export type MapTileOrigin = {
  x: number;
  y: number;
};

const MIN_POSITIVE_SIZE = 1;
const DEFAULT_TILE_SIZE = 128;

function sanitizePositiveNumber(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
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
