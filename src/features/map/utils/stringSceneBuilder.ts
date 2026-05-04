import {
  resolveCanvasBackingStore,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapWorldOffset
} from "@/utils/map/scale";
import { toHexColorString } from "@/utils/visual/color";

import { resolveMarkerViewportPosition } from "./markerPositioning";

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
};

type ViewportPoint = {
  x: number;
  y: number;
};

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

    const viewportPoints = spec.points.map((point) =>
      resolveMarkerViewportPosition(
        point,
        {
          width: scaleSnapshot.width,
          height: scaleSnapshot.height,
          effectiveScale: scaleSnapshot.effectiveScale
        },
        this.state.tileOrigin,
        this.state.worldSize
      )
    );

    context.save();
    context.globalAlpha = spec.isDimmed ? 0.18 : spec.isHighlighted ? 0.98 : 0.62;

    if (spec.isHighlighted) {
      context.shadowColor = "rgba(248, 247, 242, 0.78)";
      context.shadowBlur = 18;
      context.lineWidth = 8;
      context.strokeStyle = "rgba(248, 247, 242, 0.42)";
      this.strokeCurve(context, viewportPoints);
    }

    context.shadowColor = spec.isHighlighted ? "rgba(248, 247, 242, 0.62)" : "transparent";
    context.shadowBlur = spec.isHighlighted ? 10 : 0;
    context.lineWidth = spec.isHighlighted ? 3.8 : 2.4;
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
      worldSize: this.worldSize
    });
  }
}
