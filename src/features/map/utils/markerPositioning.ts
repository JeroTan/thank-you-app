import {
  MAP_REFERENCE_VIEWPORT,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapWorldOffset
} from "@/utils/map/scale";

import {
  resolveMarkerBaseWidthAtReference,
  resolveMarkerCanvasSizeForWidth,
  type MarkerCanvasSize
} from "./markerSize";

const FULL_CIRCLE_RADIANS = Math.PI * 2;

type MarkerLayoutOptions = {
  seed?: number;
  minDistance?: number;
  markerBaseWidth?: number;
};

type VariableMarkerLayoutOptions = {
  seed?: number;
  markerBaseWidth?: number;
  minGap?: number;
};

export type VariableMarkerLayoutInput = {
  widthAtScaleOne: number;
};

export type VariableMarkerWorldLayout = {
  positions: MapWorldOffset[];
  markerRadii: number[];
  worldSize: { width: number; height: number };
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

function resolveLayoutRadius(widthAtScaleOne: number): number {
  const markerSize = resolveMarkerCanvasSizeForWidth(widthAtScaleOne);

  return Math.max(markerSize.width, markerSize.totalHeight) / 2;
}

function isCandidateSeparated(
  candidate: MapWorldOffset,
  candidateRadius: number,
  positions: MapWorldOffset[],
  radii: number[],
  minGap: number
): boolean {
  for (let index = 0; index < positions.length; index += 1) {
    const position = positions[index];
    const radius = radii[index] ?? 0;
    const distance = Math.hypot(candidate.x - position.x, candidate.y - position.y);

    if (distance < candidateRadius + radius + minGap) {
      return false;
    }
  }

  return true;
}

function resolveExpandedWorldSize(
  positions: MapWorldOffset[],
  radii: number[]
): { width: number; height: number } {
  if (positions.length === 0) {
    return {
      width: MAP_REFERENCE_VIEWPORT.width * 2,
      height: MAP_REFERENCE_VIEWPORT.height * 2
    };
  }

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  for (let index = 0; index < positions.length; index += 1) {
    const position = positions[index];
    const radius = radii[index] ?? 0;

    minX = Math.min(minX, position.x - radius);
    maxX = Math.max(maxX, position.x + radius);
    minY = Math.min(minY, position.y - radius);
    maxY = Math.max(maxY, position.y + radius);
  }

  return {
    width: Math.max(
      MAP_REFERENCE_VIEWPORT.width * 2,
      Math.ceil(maxX - minX + MAP_REFERENCE_VIEWPORT.width * 2)
    ),
    height: Math.max(
      MAP_REFERENCE_VIEWPORT.height * 2,
      Math.ceil(maxY - minY + MAP_REFERENCE_VIEWPORT.height * 2)
    )
  };
}

export function createVariableMarkerWorldLayout(
  markerInputs: VariableMarkerLayoutInput[],
  options: VariableMarkerLayoutOptions = {}
): VariableMarkerWorldLayout {
  if (markerInputs.length <= 0) {
    return {
      positions: [],
      markerRadii: [],
      worldSize: resolveExpandedWorldSize([], [])
    };
  }

  const markerBaseWidth = options.markerBaseWidth ?? resolveMarkerBaseWidthAtReference();
  const minGap = options.minGap ?? Math.max(48, Math.round(markerBaseWidth * 1.2));
  const markerRadii = markerInputs.map((item) => resolveLayoutRadius(item.widthAtScaleOne));
  const maxRadius = Math.max(...markerRadii);
  const ringStep = Math.max(markerBaseWidth * 2.35, maxRadius * 2 + minGap);
  const seededRandom = createSeededRandom(options.seed ?? 1);
  const angleOffset = seededRandom() * FULL_CIRCLE_RADIANS;
  const positions: MapWorldOffset[] = [];

  for (let index = 0; index < markerInputs.length; index += 1) {
    const markerRadius = markerRadii[index] ?? maxRadius;

    if (index === 0) {
      positions.push({ x: 0, y: 0 });
      continue;
    }

    let ring = 1;
    let placed = false;

    while (!placed) {
      const radius = ring * ringStep;
      const slotDistance = Math.max(markerBaseWidth * 2.35, markerRadius * 2 + minGap);
      const slots = Math.max(8, Math.ceil((FULL_CIRCLE_RADIANS * radius) / slotDistance));
      const startSlot = Math.floor(seededRandom() * slots);

      for (let attempt = 0; attempt < slots; attempt += 1) {
        const slot = (startSlot + attempt) % slots;
        const angle = angleOffset + (slot / slots) * FULL_CIRCLE_RADIANS;
        const candidate = {
          x: Math.round(Math.cos(angle) * radius),
          y: Math.round(Math.sin(angle) * radius)
        };

        if (isCandidateSeparated(candidate, markerRadius, positions, markerRadii, minGap)) {
          positions.push(candidate);
          placed = true;
          break;
        }
      }

      ring += 1;
    }
  }

  return {
    positions,
    markerRadii,
    worldSize: resolveExpandedWorldSize(positions, markerRadii)
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
  scaleSnapshot: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">,
  tileOrigin: MapTileOrigin,
  worldSize?: { width: number; height: number }
): MarkerViewportPosition {
  let offsetX = worldPosition.x * scaleSnapshot.effectiveScale + tileOrigin.x;
  let offsetY = worldPosition.y * scaleSnapshot.effectiveScale + tileOrigin.y;

  if (worldSize) {
    const wrapWidth = worldSize.width * scaleSnapshot.effectiveScale;
    const wrapHeight = worldSize.height * scaleSnapshot.effectiveScale;

    // Wrap the marker so it appears within the nearest copy of the world
    const halfWidth = wrapWidth / 2;
    offsetX = ((((offsetX + halfWidth) % wrapWidth) + wrapWidth) % wrapWidth) - halfWidth;

    const halfHeight = wrapHeight / 2;
    offsetY = ((((offsetY + halfHeight) % wrapHeight) + wrapHeight) % wrapHeight) - halfHeight;
  }

  return {
    x: scaleSnapshot.width / 2 + offsetX,
    y: scaleSnapshot.height / 2 + offsetY
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
