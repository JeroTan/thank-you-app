import {
  resolveCanvasBackingStore,
  resolveGrassTileDrawSize,
  resolveWrappedTileStart,
  type MapTileOrigin
} from "@/utils/map/scale";

type GrassSceneState = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  tileImage: HTMLImageElement;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  globalScale: number;
  tileOrigin: MapTileOrigin;
  fallbackColor: string;
};

type GrassSceneViewport = {
  width: number;
  height: number;
};

class GrassCanvasScene {
  public constructor(private readonly state: GrassSceneState) {}

  public draw(): void {
    const {
      canvas,
      context,
      fallbackColor,
      globalScale,
      pixelRatio,
      tileImage,
      tileOrigin,
      viewportHeight,
      viewportWidth
    } = this.state;
    const backingStore = resolveCanvasBackingStore({
      width: viewportWidth,
      height: viewportHeight,
      devicePixelRatio: pixelRatio
    });

    if (canvas.width !== backingStore.width) {
      canvas.width = backingStore.width;
    }

    if (canvas.height !== backingStore.height) {
      canvas.height = backingStore.height;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.fillStyle = fallbackColor;
    context.fillRect(0, 0, viewportWidth, viewportHeight);

    const tileDrawSize = resolveGrassTileDrawSize(
      { scale: globalScale },
      tileImage.naturalWidth || tileImage.width
    );
    const startX = resolveWrappedTileStart(tileOrigin.x, tileDrawSize);
    const startY = resolveWrappedTileStart(tileOrigin.y, tileDrawSize);

    for (let y = startY; y < viewportHeight + tileDrawSize; y += tileDrawSize) {
      for (let x = startX; x < viewportWidth + tileDrawSize; x += tileDrawSize) {
        context.drawImage(tileImage, x, y, tileDrawSize, tileDrawSize);
      }
    }
  }
}

export class GrassSceneBuilder {
  private canvas: HTMLCanvasElement | null = null;
  private fallbackColor = "#315723";
  private globalScale = 1;
  private pixelRatio = 1;
  private tileImage: HTMLImageElement | null = null;
  private tileOrigin: MapTileOrigin = { x: 0, y: 0 };
  private viewport: GrassSceneViewport = {
    width: 1000,
    height: 1000
  };

  public attachCanvas(canvas: HTMLCanvasElement): this {
    this.canvas = canvas;

    return this;
  }

  public withFallbackColor(color: string): this {
    this.fallbackColor = color;

    return this;
  }

  public withGlobalScale(globalScale: number): this {
    if (Number.isFinite(globalScale) && globalScale > 0) {
      this.globalScale = globalScale;
    }

    return this;
  }

  public withPixelRatio(pixelRatio: number): this {
    if (Number.isFinite(pixelRatio) && pixelRatio > 0) {
      this.pixelRatio = pixelRatio;
    }

    return this;
  }

  public withTileImage(tileImage: HTMLImageElement): this {
    this.tileImage = tileImage;

    return this;
  }

  public withTileOrigin(tileOrigin: MapTileOrigin): this {
    this.tileOrigin = tileOrigin;

    return this;
  }

  public withViewport(width: number, height: number): this {
    if (Number.isFinite(width) && width > 0) {
      this.viewport.width = Math.round(width);
    }

    if (Number.isFinite(height) && height > 0) {
      this.viewport.height = Math.round(height);
    }

    return this;
  }

  public build(): GrassCanvasScene {
    if (!this.canvas) {
      throw new Error("GrassSceneBuilder requires a canvas before build().");
    }

    if (!this.tileImage) {
      throw new Error("GrassSceneBuilder requires a tile image before build().");
    }

    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("GrassSceneBuilder could not acquire a 2D context.");
    }

    return new GrassCanvasScene({
      canvas: this.canvas,
      context,
      tileImage: this.tileImage,
      viewportWidth: this.viewport.width,
      viewportHeight: this.viewport.height,
      pixelRatio: this.pixelRatio,
      globalScale: this.globalScale,
      tileOrigin: this.tileOrigin,
      fallbackColor: this.fallbackColor
    });
  }
}
