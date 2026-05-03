import {
  resolveCanvasBackingStore,
  type MapScaleSnapshot,
  type MapTileOrigin
} from "@/utils/map/scale";
import { invertColor, toHexColorString } from "@/utils/visual/color";
import { resolveMarkerCanvasSize, MARKER_VIEWBOX } from "./markerSize";
import { resolveMarkerViewportPosition } from "./markerPositioning";

const FULL_CIRCLE_RADIANS = Math.PI * 2;

// Canvas-optimized marker spec (subset needed for rendering)
export type CanvasMarkerSpec = {
  id: number;
  frameColor: number;
  label: string;
  fallbackInitial: string;
  picture: string | null;
  worldX: number;
  worldY: number;
};

type MarkerSceneState = {
  context: CanvasRenderingContext2D;
  markerSpecs: CanvasMarkerSpec[];
  scaleSnapshot: MapScaleSnapshot;
  pixelRatio: number;
  tileOrigin: MapTileOrigin;
  worldSize?: { width: number; height: number };
  markerImageRegistry: Record<string, HTMLImageElement>;
};

class MarkerCanvasScene {
  public constructor(private readonly state: MarkerSceneState) {}

  public draw(): void {
    const { context, markerSpecs, scaleSnapshot, pixelRatio } = this.state;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    for (const spec of markerSpecs) {
      this.drawMarker(context, spec, scaleSnapshot);
    }
  }

  private drawMarker(
    context: CanvasRenderingContext2D,
    spec: CanvasMarkerSpec,
    scaleSnapshot: MapScaleSnapshot
  ): void {
    const viewportPos = resolveMarkerViewportPosition(
      { x: spec.worldX, y: spec.worldY },
      {
        width: scaleSnapshot.width,
        height: scaleSnapshot.height,
        effectiveScale: scaleSnapshot.effectiveScale
      },
      this.state.tileOrigin,
      this.state.worldSize
    );

    const markerSize = resolveMarkerCanvasSize(scaleSnapshot);
    const width = markerSize.width;
    const height = markerSize.height;

    const centerX = viewportPos.x;
    const topY = viewportPos.y - height * 0.15;

    this.drawMarkerFrame(context, centerX, topY, width, spec.frameColor);
    this.drawMarkerAvatar(
      context,
      centerX,
      topY,
      width,
      spec.picture,
      spec.fallbackInitial,
      spec.frameColor
    );
    this.drawMarkerLabel(
      context,
      centerX,
      topY + height + markerSize.labelGap,
      markerSize,
      spec.label
    );
  }

  private drawMarkerFrame(
    context: CanvasRenderingContext2D,
    centerX: number,
    topY: number,
    width: number,
    frameColor: number
  ): void {
    const scale = width / MARKER_VIEWBOX.width;
    const xOffset = centerX - (MARKER_VIEWBOX.width * scale) / 2;

    const pinPath = new Path2D(
      "M193.5 4C297.606 4 382 88.3943 382 192.5C382 272.322 332.385 340.557 262.312 368.046L202.732 474.43C201.522 476.091 199.914 477.448 198.045 478.384C196.177 479.321 194.102 479.81 191.996 479.81C189.89 479.81 187.815 479.321 185.947 478.384C184.078 477.448 182.47 476.091 181.26 474.43L124.683 368.043C54.6123 340.553 5 272.32 5 192.5C5 88.3943 89.3943 4 193.5 4Z"
    );

    context.save();
    context.shadowColor = "rgba(0, 0, 0, 0.12)";
    context.shadowBlur = 8;
    context.shadowOffsetY = 1;
    context.fillStyle = toHexColorString(frameColor);
    context.strokeStyle = "rgba(0, 0, 0, 0.18)";
    context.lineWidth = 1;
    context.translate(xOffset, topY);
    context.scale(scale, scale);
    context.fill(pinPath);
    context.stroke(pinPath);
    context.restore();
  }

  private drawMarkerAvatar(
    context: CanvasRenderingContext2D,
    centerX: number,
    topY: number,
    width: number,
    picture: string | null,
    fallbackInitial: string,
    frameColor: number
  ): void {
    const scale = width / MARKER_VIEWBOX.width;
    const avatarCenterX = centerX;
    const avatarCenterY = topY + 192.5 * scale;
    const avatarRadius = 158.5 * scale;

    context.save();
    context.beginPath();
    context.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, FULL_CIRCLE_RADIANS);
    context.clip();

    const image = picture ? this.state.markerImageRegistry[picture] : undefined;

    if (image) {
      context.fillStyle = "#D9D9D9";
      context.fillRect(
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );

      const imageAspect = image.width / image.height;
      const targetAspect = 1;
      let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;

      if (imageAspect > targetAspect) {
        sWidth = image.height * targetAspect;
        sx = (image.width - sWidth) / 2;
      } else {
        sHeight = image.width / targetAspect;
        sy = (image.height - sHeight) / 2;
      }

      context.drawImage(
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
    } else {
      context.fillStyle = toHexColorString(invertColor(frameColor));
      context.fillRect(
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      this.drawFallbackInitial(
        context,
        avatarCenterX,
        avatarCenterY,
        avatarRadius,
        fallbackInitial
      );
    }

    context.restore();
  }

  private drawFallbackInitial(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    initial: string
  ): void {
    context.fillStyle = "#f8f7f2";
    context.font = `700 ${Math.round(radius * 1.2)}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.strokeStyle = "rgba(15, 15, 15, 0.72)";
    context.lineWidth = Math.max(2, Math.round(radius * 0.08));

    context.fillText(initial, centerX, centerY);
    context.strokeText(initial, centerX, centerY);
  }

  private drawMarkerLabel(
    context: CanvasRenderingContext2D,
    centerX: number,
    y: number,
    markerSize: ReturnType<typeof resolveMarkerCanvasSize>,
    label: string
  ): void {
    const displayLabel = label.length > 18 ? `${label.substring(0, 17)}…` : label;

    context.fillStyle = "#f8f7f2";
    context.strokeStyle = "rgba(15, 15, 15, 0.72)";
    context.lineWidth = Math.max(1, Math.round(markerSize.labelFontSize * 0.12));
    context.font = `600 ${markerSize.labelFontSize}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "top";

    context.strokeText(displayLabel, centerX, y);
    context.fillText(displayLabel, centerX, y);
  }

  private hexColorToString(hexColor: number): string {
    const r = (hexColor >> 16) & 0xff;
    const g = (hexColor >> 8) & 0xff;
    const b = hexColor & 0xff;

    return `rgb(${r},${g},${b})`;
  }
}

export class MarkerSceneBuilder {
  private canvas: HTMLCanvasElement | null = null;
  private markerSpecs: CanvasMarkerSpec[] = [];
  private scaleSnapshot: MapScaleSnapshot | null = null;
  private pixelRatio = 1;
  private tileOrigin: MapTileOrigin = { x: 0, y: 0 };
  private worldSize?: { width: number; height: number };
  private markerImageRegistry: Record<string, HTMLImageElement> = {};

  public attachCanvas(canvas: HTMLCanvasElement): this {
    this.canvas = canvas;

    return this;
  }

  public withMarkerSpecs(specs: CanvasMarkerSpec[]): this {
    this.markerSpecs = specs;

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

  public withMarkerImageRegistry(markerImageRegistry: Record<string, HTMLImageElement>): this {
    this.markerImageRegistry = markerImageRegistry;

    return this;
  }

  public build(): MarkerCanvasScene {
    if (!this.canvas) {
      throw new Error("MarkerSceneBuilder requires a canvas before build().");
    }

    if (!this.scaleSnapshot) {
      throw new Error("MarkerSceneBuilder requires a scale snapshot before build().");
    }

    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("MarkerSceneBuilder could not acquire a 2D context.");
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

    return new MarkerCanvasScene({
      context,
      markerSpecs: this.markerSpecs,
      scaleSnapshot: this.scaleSnapshot,
      pixelRatio: this.pixelRatio,
      tileOrigin: this.tileOrigin,
      worldSize: this.worldSize,
      markerImageRegistry: this.markerImageRegistry
    });
  }
}
