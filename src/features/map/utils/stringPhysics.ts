import type { MapWorldOffset } from "@/utils/map/scale";

import type { MapMarkerConnectionSpec } from "./markerConnectionSpec";
import type { MapMarkerRenderSpec } from "./markerRenderSpec";

export type StringPhysicsPoint = MapWorldOffset & {
  vx: number;
  vy: number;
};

export type StringPhysicsSnapshot = {
  connectionKey: string;
  markerAId: number;
  markerBId: number;
  restLength: number;
  points: StringPhysicsPoint[];
  previousStart: MapWorldOffset;
  previousEnd: MapWorldOffset;
  isSettling: boolean;
};

export type StringPhysicsSnapshotMap = Record<string, StringPhysicsSnapshot>;

type StringAnchorPair = {
  start: MapWorldOffset;
  end: MapWorldOffset;
};

type StringPhysicsOptions = {
  segmentCount?: number;
  stiffness?: number;
  damping?: number;
  impulse?: number;
  sagRatio?: number;
  active?: boolean;
};

type RopeNudgeOptions = {
  draggedMarkerId: number | null;
  pinnedMarkerIds: number[];
  maxStep?: number;
  stiffness?: number;
};

const DEFAULT_SEGMENT_COUNT = 8;
const DEFAULT_STIFFNESS = 0.12;
const DEFAULT_DAMPING = 0.82;
const DEFAULT_IMPULSE = 0.18;
const DEFAULT_SAG_RATIO = 0.055;
const SETTLE_DISTANCE = 0.45;
const SETTLE_VELOCITY = 0.045;

function resolveDistance(first: MapWorldOffset, second: MapWorldOffset): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function resolveInterpolatedPoint(
  anchors: StringAnchorPair,
  t: number,
  sagRatio: number
): MapWorldOffset {
  const distance = resolveDistance(anchors.start, anchors.end);
  const sag = Math.min(72, distance * sagRatio) * Math.sin(Math.PI * t);

  return {
    x: anchors.start.x + (anchors.end.x - anchors.start.x) * t,
    y: anchors.start.y + (anchors.end.y - anchors.start.y) * t + sag
  };
}

function createPoint(point: MapWorldOffset): StringPhysicsPoint {
  return {
    x: point.x,
    y: point.y,
    vx: 0,
    vy: 0
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function createStringPhysicsSnapshot(
  connection: Pick<MapMarkerConnectionSpec, "key" | "markerAId" | "markerBId">,
  anchors: StringAnchorPair,
  options: Pick<StringPhysicsOptions, "segmentCount" | "sagRatio"> = {}
): StringPhysicsSnapshot {
  const segmentCount = Math.max(2, Math.round(options.segmentCount ?? DEFAULT_SEGMENT_COUNT));
  const sagRatio = options.sagRatio ?? DEFAULT_SAG_RATIO;
  const points: StringPhysicsPoint[] = [];

  for (let index = 0; index <= segmentCount; index += 1) {
    points.push(createPoint(resolveInterpolatedPoint(anchors, index / segmentCount, sagRatio)));
  }

  points[0] = createPoint(anchors.start);
  points[points.length - 1] = createPoint(anchors.end);

  return {
    connectionKey: connection.key,
    markerAId: connection.markerAId,
    markerBId: connection.markerBId,
    restLength: Math.max(1, resolveDistance(anchors.start, anchors.end)),
    points,
    previousStart: anchors.start,
    previousEnd: anchors.end,
    isSettling: false
  };
}

export function stepStringPhysicsSnapshot(
  snapshot: StringPhysicsSnapshot,
  anchors: StringAnchorPair,
  options: StringPhysicsOptions = {}
): StringPhysicsSnapshot {
  const stiffness = options.stiffness ?? DEFAULT_STIFFNESS;
  const damping = options.damping ?? DEFAULT_DAMPING;
  const impulse = options.impulse ?? DEFAULT_IMPULSE;
  const sagRatio = options.sagRatio ?? DEFAULT_SAG_RATIO;
  const lastIndex = snapshot.points.length - 1;
  const startDelta = {
    x: anchors.start.x - snapshot.previousStart.x,
    y: anchors.start.y - snapshot.previousStart.y
  };
  const endDelta = {
    x: anchors.end.x - snapshot.previousEnd.x,
    y: anchors.end.y - snapshot.previousEnd.y
  };
  let isSettling = Boolean(options.active);

  const points = snapshot.points.map((point, index) => {
    if (index === 0) {
      return createPoint(anchors.start);
    }

    if (index === lastIndex) {
      return createPoint(anchors.end);
    }

    const t = index / lastIndex;
    const target = resolveInterpolatedPoint(anchors, t, sagRatio);
    const anchorImpulse = {
      x: startDelta.x * (1 - t) + endDelta.x * t,
      y: startDelta.y * (1 - t) + endDelta.y * t
    };
    const vx = (point.vx + (target.x - point.x) * stiffness + anchorImpulse.x * impulse) * damping;
    const vy = (point.vy + (target.y - point.y) * stiffness + anchorImpulse.y * impulse) * damping;
    const nextPoint = {
      x: point.x + vx,
      y: point.y + vy,
      vx,
      vy
    };

    if (
      Math.abs(vx) > SETTLE_VELOCITY ||
      Math.abs(vy) > SETTLE_VELOCITY ||
      resolveDistance(nextPoint, target) > SETTLE_DISTANCE
    ) {
      isSettling = true;
    }

    return nextPoint;
  });

  return {
    ...snapshot,
    points,
    previousStart: anchors.start,
    previousEnd: anchors.end,
    isSettling
  };
}

export function resolveConnectionAnchors(
  connection: Pick<MapMarkerConnectionSpec, "markerAId" | "markerBId">,
  markerSpecs: Pick<MapMarkerRenderSpec, "id" | "worldPosition">[]
): StringAnchorPair | null {
  const markerA = markerSpecs.find((marker) => marker.id === connection.markerAId);
  const markerB = markerSpecs.find((marker) => marker.id === connection.markerBId);

  if (!markerA || !markerB) {
    return null;
  }

  return {
    start: markerA.worldPosition,
    end: markerB.worldPosition
  };
}

export function resolveRopeDrivenMarkerNudge(
  connection: Pick<MapMarkerConnectionSpec, "markerAId" | "markerBId">,
  anchors: StringAnchorPair,
  restLength: number,
  options: RopeNudgeOptions
): { markerId: number; delta: MapWorldOffset } | null {
  const { draggedMarkerId } = options;

  if (
    draggedMarkerId === null ||
    (draggedMarkerId !== connection.markerAId && draggedMarkerId !== connection.markerBId)
  ) {
    return null;
  }

  const otherMarkerId =
    draggedMarkerId === connection.markerAId ? connection.markerBId : connection.markerAId;

  if (options.pinnedMarkerIds.includes(otherMarkerId)) {
    return null;
  }

  const draggedPosition = draggedMarkerId === connection.markerAId ? anchors.start : anchors.end;
  const otherPosition = draggedMarkerId === connection.markerAId ? anchors.end : anchors.start;
  const distance = resolveDistance(otherPosition, draggedPosition);

  if (distance <= 0) {
    return null;
  }

  const stretch = distance - restLength;
  const deadZone = Math.max(12, restLength * 0.06);

  if (Math.abs(stretch) <= deadZone) {
    return null;
  }

  const maxStep = options.maxStep ?? 7;
  const stiffness = options.stiffness ?? 0.055;
  const step = clamp(stretch * stiffness, -maxStep, maxStep);

  return {
    markerId: otherMarkerId,
    delta: {
      x: ((draggedPosition.x - otherPosition.x) / distance) * step,
      y: ((draggedPosition.y - otherPosition.y) / distance) * step
    }
  };
}
