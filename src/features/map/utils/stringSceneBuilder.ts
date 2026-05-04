import {
  resolveCanvasBackingStore,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapWorldOffset
} from "@/utils/map/scale";
import { toHexColorString } from "@/utils/visual/color";

export type CanvasStringSpec = {
  key: string;
  markerAFrameColor: number;
  markerBFrameColor: number;
  isMutual: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  points: MapWorldOffset[];
};

type StringSceneState = {
  context: CanvasRenderingContext2D;
  stringSpecs: CanvasStringSpec[];
  scaleSnapshot: MapScaleSnapshot;
  pixelRatio: number;
  tileOrigin: MapTileOrigin;
  worldSize?: { width: number; height: number };
  reducedMotion: boolean;
};

export type ViewportPoint = {
  x: number;
  y: number;
};

type ViewportBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const STRING_VIEWPORT_PADDING = 96;

function resolveRawStringViewportPoints(
  points: MapWorldOffset[],
  scaleSnapshot: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">,
  tileOrigin: MapTileOrigin
): ViewportPoint[] {
  return points.map((point) => ({
    x: scaleSnapshot.width / 2 + point.x * scaleSnapshot.effectiveScale + tileOrigin.x,
    y: scaleSnapshot.height / 2 + point.y * scaleSnapshot.effectiveScale + tileOrigin.y
  }));
}

function resolveViewportBounds(points: ViewportPoint[]): ViewportBounds {
  return {
    left: Math.min(...points.map((point) => point.x)),
    right: Math.max(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    bottom: Math.max(...points.map((point) => point.y))
  };
}

function isPointNearViewport(
  point: ViewportPoint,
  viewport: Pick<MapScaleSnapshot, "width" | "height">,
  padding: number
): boolean {
  return (
    point.x >= -padding &&
    point.x <= viewport.width + padding &&
    point.y >= -padding &&
    point.y <= viewport.height + padding
  );
}

function areBoundsNearViewport(
  bounds: ViewportBounds,
  viewport: Pick<MapScaleSnapshot, "width" | "height">,
  padding: number
): boolean {
  return !(
    bounds.right < -padding ||
    bounds.left > viewport.width + padding ||
    bounds.bottom < -padding ||
    bounds.top > viewport.height + padding
  );
}

function resolveMidpoint(points: ViewportPoint[]): ViewportPoint {
  const midpointIndex = Math.floor(points.length / 2);

  return points[midpointIndex] ?? points[0] ?? { x: 0, y: 0 };
}

function shiftViewportPoints(
  points: ViewportPoint[],
  shiftX: number,
  shiftY: number
): ViewportPoint[] {
  return points.map((point) => ({
    x: point.x + shiftX,
    y: point.y + shiftY
  }));
}

function scoreViewportPoints(
  points: ViewportPoint[],
  viewport: Pick<MapScaleSnapshot, "width" | "height">
): number {
  const midpoint = resolveMidpoint(points);
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  return Math.hypot(midpoint.x - centerX, midpoint.y - centerY);
}

function wrapOffset(offset: number, wrapSize: number): number {
  const halfSize = wrapSize / 2;

  return ((((offset + halfSize) % wrapSize) + wrapSize) % wrapSize) - halfSize;
}

function resolveAnchorShift(
  anchorPoint: ViewportPoint,
  viewport: Pick<MapScaleSnapshot, "width" | "height">,
  wrapWidth: number,
  wrapHeight: number
): { x: number; y: number } {
  const rawOffsetX = anchorPoint.x - viewport.width / 2;
  const rawOffsetY = anchorPoint.y - viewport.height / 2;

  return {
    x: wrapOffset(rawOffsetX, wrapWidth) - rawOffsetX,
    y: wrapOffset(rawOffsetY, wrapHeight) - rawOffsetY
  };
}

export function resolveConsistentStringViewportPoints(
  points: MapWorldOffset[],
  scaleSnapshot: Pick<MapScaleSnapshot, "width" | "height" | "effectiveScale">,
  tileOrigin: MapTileOrigin,
  worldSize?: { width: number; height: number },
  padding = STRING_VIEWPORT_PADDING
): ViewportPoint[] | null {
  if (points.length < 2) {
    return null;
  }

  const rawViewportPoints = resolveRawStringViewportPoints(points, scaleSnapshot, tileOrigin);
  const firstRawPoint = rawViewportPoints[0];
  const lastRawPoint = rawViewportPoints[rawViewportPoints.length - 1];

  if (!firstRawPoint || !lastRawPoint) {
    return null;
  }

  if (!worldSize) {
    return rawViewportPoints;
  }

  const wrapWidth = worldSize.width * scaleSnapshot.effectiveScale;
  const wrapHeight = worldSize.height * scaleSnapshot.effectiveScale;

  if (
    !Number.isFinite(wrapWidth) ||
    !Number.isFinite(wrapHeight) ||
    wrapWidth <= 0 ||
    wrapHeight <= 0
  ) {
    return rawViewportPoints;
  }

  const anchorShifts = [
    resolveAnchorShift(firstRawPoint, scaleSnapshot, wrapWidth, wrapHeight),
    resolveAnchorShift(lastRawPoint, scaleSnapshot, wrapWidth, wrapHeight)
  ];
  const seenShifts = new Set<string>();
  const candidates: ViewportPoint[][] = anchorShifts.flatMap((shift) => {
    const key = `${shift.x}:${shift.y}`;

    if (seenShifts.has(key)) {
      return [];
    }

    seenShifts.add(key);

    return [shiftViewportPoints(rawViewportPoints, shift.x, shift.y)];
  });

  const visibleCandidates = candidates.filter((candidate) => {
    const firstPoint = candidate[0];
    const lastPoint = candidate[candidate.length - 1];

    if (!firstPoint || !lastPoint) {
      return false;
    }

    return (
      areBoundsNearViewport(resolveViewportBounds(candidate), scaleSnapshot, padding) &&
      (isPointNearViewport(firstPoint, scaleSnapshot, padding) ||
        isPointNearViewport(lastPoint, scaleSnapshot, padding))
    );
  });

  if (visibleCandidates.length === 0) {
    return null;
  }

  return (
    visibleCandidates.sort(
      (firstCandidate, secondCandidate) =>
        scoreViewportPoints(firstCandidate, scaleSnapshot) -
        scoreViewportPoints(secondCandidate, scaleSnapshot)
    )[0] ?? null
  );
}

class StringCanvasScene {
  public constructor(private readonly state: StringSceneState) {}

  public draw(): void {
    const { context, scaleSnapshot, pixelRatio, stringSpecs } = this.state;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const spec of stringSpecs) {
      this.drawString(context, spec, scaleSnapshot);
    }
  }

  private drawString(
    context: CanvasRenderingContext2D,
    spec: CanvasStringSpec,
    scaleSnapshot: MapScaleSnapshot
  ): void {
    if (spec.points.length < 2) {
      return;
    }

    const viewportPoints = resolveConsistentStringViewportPoints(
      spec.points,
      scaleSnapshot,
      this.state.tileOrigin,
      this.state.worldSize
    );

    if (!viewportPoints) {
      return;
    }

    context.save();
    context.globalAlpha = spec.isDimmed ? 0.18 : spec.isHighlighted ? 0.98 : 0.62;

    if (spec.isHighlighted && !this.state.reducedMotion) {
      context.shadowColor = "rgba(248, 247, 242, 0.78)";
      context.shadowBlur = 18;
      context.lineWidth = 8;
      context.strokeStyle = "rgba(248, 247, 242, 0.42)";
      this.strokeCurve(context, viewportPoints);
    }

    context.shadowColor =
      spec.isHighlighted && !this.state.reducedMotion ? "rgba(248, 247, 242, 0.62)" : "transparent";
    context.shadowBlur = spec.isHighlighted && !this.state.reducedMotion ? 10 : 0;
    context.lineWidth = spec.isHighlighted ? (this.state.reducedMotion ? 3 : 3.8) : 2.4;
    context.strokeStyle = this.resolveStrokeStyle(context, spec, viewportPoints);
    this.strokeCurve(context, viewportPoints);
    context.restore();
  }

  private resolveStrokeStyle(
    context: CanvasRenderingContext2D,
    spec: CanvasStringSpec,
    viewportPoints: ViewportPoint[]
  ): string | CanvasGradient {
    const firstPoint = viewportPoints[0];
    const lastPoint = viewportPoints[viewportPoints.length - 1];
    const firstColor = toHexColorString(spec.markerAFrameColor);
    const secondColor = toHexColorString(spec.markerBFrameColor);

    if (!spec.isMutual || !firstPoint || !lastPoint) {
      return spec.isHighlighted ? firstColor : "rgba(248, 247, 242, 0.74)";
    }

    const gradient = context.createLinearGradient(
      firstPoint.x,
      firstPoint.y,
      lastPoint.x,
      lastPoint.y
    );

    gradient.addColorStop(0, firstColor);
    gradient.addColorStop(0.5, "rgba(248, 247, 242, 0.82)");
    gradient.addColorStop(1, secondColor);

    return gradient;
  }

  private strokeCurve(context: CanvasRenderingContext2D, viewportPoints: ViewportPoint[]): void {
    const firstPoint = viewportPoints[0];

    if (!firstPoint) {
      return;
    }

    context.beginPath();
    context.moveTo(firstPoint.x, firstPoint.y);

    for (let index = 1; index < viewportPoints.length - 1; index += 1) {
      const currentPoint = viewportPoints[index];
      const nextPoint = viewportPoints[index + 1];

      context.quadraticCurveTo(
        currentPoint.x,
        currentPoint.y,
        (currentPoint.x + nextPoint.x) / 2,
        (currentPoint.y + nextPoint.y) / 2
      );
    }

    const lastPoint = viewportPoints[viewportPoints.length - 1];

    context.lineTo(lastPoint.x, lastPoint.y);
    context.stroke();
  }
}

export class StringSceneBuilder {
  private canvas: HTMLCanvasElement | null = null;
  private stringSpecs: CanvasStringSpec[] = [];
  private scaleSnapshot: MapScaleSnapshot | null = null;
  private pixelRatio = 1;
  private tileOrigin: MapTileOrigin = { x: 0, y: 0 };
  private worldSize?: { width: number; height: number };
  private reducedMotion = false;

  public attachCanvas(canvas: HTMLCanvasElement): this {
    this.canvas = canvas;

    return this;
  }

  public withStringSpecs(specs: CanvasStringSpec[]): this {
    this.stringSpecs = specs;

    return this;
  }

  public withScaleSnapshot(scaleSnapshot: MapScaleSnapshot): this {
    this.scaleSnapshot = scaleSnapshot;

    return this;
  }

  public withPixelRatio(pixelRatio: number): this {
    if (Number.isFinite(pixelRatio) && pixelRatio > 0) {
      this.pixelRatio = pixelRatio;
    }

    return this;
  }

  public withTileOrigin(tileOrigin: MapTileOrigin): this {
    this.tileOrigin = tileOrigin;

    return this;
  }

  public withWorldSize(worldSize: { width: number; height: number }): this {
    this.worldSize = worldSize;

    return this;
  }

  public withReducedMotion(reducedMotion: boolean): this {
    this.reducedMotion = reducedMotion;

    return this;
  }

  public build(): StringCanvasScene {
    if (!this.canvas) {
      throw new Error("StringSceneBuilder requires a canvas before build().");
    }

    if (!this.scaleSnapshot) {
      throw new Error("StringSceneBuilder requires a scale snapshot before build().");
    }

    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("StringSceneBuilder could not acquire a 2D context.");
    }

    const backingStore = resolveCanvasBackingStore({
      width: this.scaleSnapshot.width,
      height: this.scaleSnapshot.height,
      devicePixelRatio: this.pixelRatio
    });

    if (this.canvas.width !== backingStore.width) {
      this.canvas.width = backingStore.width;
    }

    if (this.canvas.height !== backingStore.height) {
      this.canvas.height = backingStore.height;
    }

    return new StringCanvasScene({
      context,
      stringSpecs: this.stringSpecs,
      scaleSnapshot: this.scaleSnapshot,
      pixelRatio: this.pixelRatio,
      tileOrigin: this.tileOrigin,
      worldSize: this.worldSize,
      reducedMotion: this.reducedMotion
    });
  }
}
