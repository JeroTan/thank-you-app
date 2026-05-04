import type { MapScaleSnapshot, MapTileOrigin } from "@/utils/map/scale";

export type WorldMapThemeMode = "atlas" | "dusk";

export type WorldMapThemeTokens = {
  backgroundTop: string;
  backgroundBottom: string;
  oceanWash: string;
  landFill: string;
  landStroke: string;
  gridStroke: string;
  routeStroke: string;
  labelStroke: string;
};

export type WorldMapPoint = {
  x: number;
  y: number;
};

export type WorldMapTileCopy = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const WORLD_MAP_REFERENCE_SIZE = Object.freeze({
  width: 2000,
  height: 1400
});

const WORLD_MAP_THEMES: Record<WorldMapThemeMode, WorldMapThemeTokens> = {
  atlas: {
    backgroundTop: "#17443d",
    backgroundBottom: "#2f5f4c",
    oceanWash: "rgba(240, 248, 232, 0.035)",
    landFill: "rgba(219, 232, 200, 0.13)",
    landStroke: "rgba(245, 247, 229, 0.26)",
    gridStroke: "rgba(245, 247, 229, 0.12)",
    routeStroke: "rgba(214, 168, 79, 0.24)",
    labelStroke: "rgba(245, 247, 229, 0.18)"
  },
  dusk: {
    backgroundTop: "#193a4a",
    backgroundBottom: "#315342",
    oceanWash: "rgba(211, 230, 219, 0.04)",
    landFill: "rgba(196, 221, 190, 0.12)",
    landStroke: "rgba(238, 242, 218, 0.24)",
    gridStroke: "rgba(238, 242, 218, 0.11)",
    routeStroke: "rgba(218, 174, 92, 0.23)",
    labelStroke: "rgba(238, 242, 218, 0.16)"
  }
};

function sanitizePositiveNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function resolveWorldMapThemeTokens(mode: WorldMapThemeMode): WorldMapThemeTokens {
  return WORLD_MAP_THEMES[mode] ?? WORLD_MAP_THEMES.atlas;
}

export function resolveWorldMapTileSize(
  scaleSnapshot: Pick<MapScaleSnapshot, "effectiveScale">,
  worldSize = WORLD_MAP_REFERENCE_SIZE
): { width: number; height: number } {
  const safeScale = sanitizePositiveNumber(scaleSnapshot.effectiveScale, 1);

  return {
    width: Math.max(1, Math.round(worldSize.width * safeScale)),
    height: Math.max(1, Math.round(worldSize.height * safeScale))
  };
}

export function resolveWorldMapTileCopies(
  viewport: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">,
  tileOrigin: MapTileOrigin,
  worldSize = WORLD_MAP_REFERENCE_SIZE
): WorldMapTileCopy[] {
  const tileSize = resolveWorldMapTileSize(viewport, worldSize);
  const startX =
    tileOrigin.x - Math.ceil((tileOrigin.x + tileSize.width) / tileSize.width) * tileSize.width;
  const startY =
    tileOrigin.y - Math.ceil((tileOrigin.y + tileSize.height) / tileSize.height) * tileSize.height;
  const copies: WorldMapTileCopy[] = [];

  for (let y = startY; y < viewport.height + tileSize.height; y += tileSize.height) {
    for (let x = startX; x < viewport.width + tileSize.width; x += tileSize.width) {
      copies.push({
        x,
        y,
        width: tileSize.width,
        height: tileSize.height
      });
    }
  }

  return copies;
}

export function projectWorldMapPoint(
  normalizedPoint: WorldMapPoint,
  tile: WorldMapTileCopy
): WorldMapPoint {
  return {
    x: tile.x + normalizedPoint.x * tile.width,
    y: tile.y + normalizedPoint.y * tile.height
  };
}

export function createRouteArcPoints(
  start: WorldMapPoint,
  end: WorldMapPoint,
  bend = 0.18,
  segmentCount = 16
): WorldMapPoint[] {
  const safeSegments = Math.max(2, Math.round(segmentCount));
  const midPoint = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const controlPoint = {
    x: midPoint.x - (dy / Math.max(distance, 1)) * distance * bend,
    y: midPoint.y + (dx / Math.max(distance, 1)) * distance * bend
  };
  const points: WorldMapPoint[] = [];

  for (let index = 0; index <= safeSegments; index += 1) {
    const t = index / safeSegments;
    const inverseT = 1 - t;

    points.push({
      x: inverseT * inverseT * start.x + 2 * inverseT * t * controlPoint.x + t * t * end.x,
      y: inverseT * inverseT * start.y + 2 * inverseT * t * controlPoint.y + t * t * end.y
    });
  }

  return points;
}
