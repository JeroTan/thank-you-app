import {
  resolveCanvasBackingStore,
  type MapScaleSnapshot,
  type MapTileOrigin
} from "@/utils/map/scale";

import {
  createRouteArcPoints,
  projectWorldMapPoint,
  resolveWorldMapThemeTokens,
  resolveWorldMapTileCopies,
  type WorldMapPoint,
  type WorldMapThemeMode,
  type WorldMapTileCopy
} from "./worldMapGeometry";

type WorldMapSceneState = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  scaleSnapshot: MapScaleSnapshot;
  pixelRatio: number;
  tileOrigin: MapTileOrigin;
  themeMode: WorldMapThemeMode;
  reducedMotion: boolean;
};

const CONTINENT_PATHS: WorldMapPoint[][] = [
  [
    { x: 0.08, y: 0.24 },
    { x: 0.12, y: 0.2 },
    { x: 0.18, y: 0.18 },
    { x: 0.24, y: 0.2 },
    { x: 0.29, y: 0.23 },
    { x: 0.32, y: 0.29 },
    { x: 0.3, y: 0.36 },
    { x: 0.26, y: 0.4 },
    { x: 0.23, y: 0.45 },
    { x: 0.2, y: 0.5 },
    { x: 0.16, y: 0.48 },
    { x: 0.14, y: 0.43 },
    { x: 0.1, y: 0.39 },
    { x: 0.07, y: 0.32 }
  ],
  [
    { x: 0.28, y: 0.51 },
    { x: 0.34, y: 0.55 },
    { x: 0.36, y: 0.62 },
    { x: 0.35, y: 0.7 },
    { x: 0.33, y: 0.79 },
    { x: 0.3, y: 0.86 },
    { x: 0.27, y: 0.78 },
    { x: 0.25, y: 0.69 },
    { x: 0.23, y: 0.61 },
    { x: 0.24, y: 0.55 }
  ],
  [
    { x: 0.39, y: 0.25 },
    { x: 0.44, y: 0.2 },
    { x: 0.51, y: 0.19 },
    { x: 0.58, y: 0.21 },
    { x: 0.65, y: 0.25 },
    { x: 0.7, y: 0.31 },
    { x: 0.68, y: 0.37 },
    { x: 0.61, y: 0.39 },
    { x: 0.55, y: 0.37 },
    { x: 0.48, y: 0.39 },
    { x: 0.42, y: 0.36 },
    { x: 0.38, y: 0.31 }
  ],
  [
    { x: 0.5, y: 0.39 },
    { x: 0.58, y: 0.41 },
    { x: 0.63, y: 0.47 },
    { x: 0.65, y: 0.56 },
    { x: 0.62, y: 0.65 },
    { x: 0.58, y: 0.75 },
    { x: 0.53, y: 0.69 },
    { x: 0.49, y: 0.6 },
    { x: 0.46, y: 0.51 },
    { x: 0.47, y: 0.44 }
  ],
  [
    { x: 0.61, y: 0.29 },
    { x: 0.68, y: 0.24 },
    { x: 0.78, y: 0.2 },
    { x: 0.88, y: 0.23 },
    { x: 0.94, y: 0.31 },
    { x: 0.91, y: 0.4 },
    { x: 0.86, y: 0.48 },
    { x: 0.79, y: 0.53 },
    { x: 0.71, y: 0.5 },
    { x: 0.66, y: 0.45 },
    { x: 0.6, y: 0.4 }
  ],
  [
    { x: 0.74, y: 0.63 },
    { x: 0.82, y: 0.61 },
    { x: 0.9, y: 0.66 },
    { x: 0.92, y: 0.75 },
    { x: 0.85, y: 0.82 },
    { x: 0.76, y: 0.78 },
    { x: 0.71, y: 0.7 }
  ],
  [
    { x: 0.16, y: 0.12 },
    { x: 0.23, y: 0.11 },
    { x: 0.28, y: 0.14 },
    { x: 0.24, y: 0.18 },
    { x: 0.17, y: 0.17 }
  ],
  [
    { x: 0.04, y: 0.88 },
    { x: 0.22, y: 0.9 },
    { x: 0.44, y: 0.88 },
    { x: 0.64, y: 0.91 },
    { x: 0.86, y: 0.89 },
    { x: 0.96, y: 0.92 },
    { x: 0.94, y: 0.96 },
    { x: 0.08, y: 0.96 }
  ]
];

const ISLAND_POINTS: WorldMapPoint[] = [
  { x: 0.36, y: 0.33 },
  { x: 0.41, y: 0.42 },
  { x: 0.69, y: 0.56 },
  { x: 0.89, y: 0.55 },
  { x: 0.93, y: 0.6 },
  { x: 0.12, y: 0.55 }
];

const OCEAN_CURRENT_PATHS: WorldMapPoint[][] = [
  [
    { x: 0.05, y: 0.57 },
    { x: 0.2, y: 0.54 },
    { x: 0.34, y: 0.6 },
    { x: 0.47, y: 0.56 }
  ],
  [
    { x: 0.54, y: 0.62 },
    { x: 0.68, y: 0.58 },
    { x: 0.81, y: 0.62 },
    { x: 0.96, y: 0.58 }
  ],
  [
    { x: 0.1, y: 0.72 },
    { x: 0.28, y: 0.76 },
    { x: 0.45, y: 0.73 },
    { x: 0.62, y: 0.78 }
  ],
  [
    { x: 0.62, y: 0.18 },
    { x: 0.76, y: 0.16 },
    { x: 0.9, y: 0.2 }
  ]
];

const ROUTE_ARCS: Array<[WorldMapPoint, WorldMapPoint]> = [
  [
    { x: 0.18, y: 0.35 },
    { x: 0.52, y: 0.33 }
  ],
  [
    { x: 0.52, y: 0.33 },
    { x: 0.78, y: 0.39 }
  ],
  [
    { x: 0.31, y: 0.59 },
    { x: 0.58, y: 0.53 }
  ],
  [
    { x: 0.58, y: 0.53 },
    { x: 0.82, y: 0.68 }
  ]
];

class WorldMapCanvasScene {
  public constructor(private readonly state: WorldMapSceneState) {}

  public draw(): void {
    const { canvas, context, pixelRatio, scaleSnapshot } = this.state;
    const backingStore = resolveCanvasBackingStore({
      width: scaleSnapshot.width,
      height: scaleSnapshot.height,
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

    this.drawBase(context);

    const copies = resolveWorldMapTileCopies(scaleSnapshot, this.state.tileOrigin);

    for (const copy of copies) {
      this.drawTile(context, copy);
    }

    this.drawVignette(context);
  }

  private drawBase(context: CanvasRenderingContext2D): void {
    const { scaleSnapshot, themeMode } = this.state;
    const tokens = resolveWorldMapThemeTokens(themeMode);
    const gradient = context.createLinearGradient(0, 0, 0, scaleSnapshot.height);

    gradient.addColorStop(0, tokens.backgroundTop);
    gradient.addColorStop(1, tokens.backgroundBottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, scaleSnapshot.width, scaleSnapshot.height);

    context.fillStyle = tokens.oceanWash;
    for (let index = 0; index < 9; index += 1) {
      const x = ((index * 311) % Math.max(scaleSnapshot.width, 1)) - 90;
      const y = ((index * 197) % Math.max(scaleSnapshot.height, 1)) - 70;

      context.beginPath();
      context.ellipse(x, y, 240, 110, index * 0.33, 0, Math.PI * 2);
      context.fill();
    }
  }

  private drawTile(context: CanvasRenderingContext2D, tile: WorldMapTileCopy): void {
    this.drawGrid(context, tile);
    this.drawOceanCurrents(context, tile);
    this.drawContinents(context, tile);
    this.drawIslands(context, tile);
    this.drawRoutes(context, tile);
  }

  private drawGrid(context: CanvasRenderingContext2D, tile: WorldMapTileCopy): void {
    const tokens = resolveWorldMapThemeTokens(this.state.themeMode);

    context.save();
    context.strokeStyle = tokens.gridStroke;
    context.lineWidth = 1;

    for (let index = 1; index < 8; index += 1) {
      const x = tile.x + (tile.width * index) / 8;
      const bow = ((index - 4) / 4) * tile.width * 0.025;
      context.beginPath();
      context.moveTo(x, tile.y);
      context.bezierCurveTo(
        x + bow,
        tile.y + tile.height * 0.28,
        x - bow,
        tile.y + tile.height * 0.72,
        x,
        tile.y + tile.height
      );
      context.stroke();
    }

    for (let index = 1; index < 6; index += 1) {
      const y = tile.y + (tile.height * index) / 6;
      const bow = ((index - 3) / 3) * tile.height * 0.018;
      context.beginPath();
      context.moveTo(tile.x, y);
      context.bezierCurveTo(
        tile.x + tile.width * 0.25,
        y - bow,
        tile.x + tile.width * 0.75,
        y + bow,
        tile.x + tile.width,
        y
      );
      context.stroke();
    }

    context.restore();
  }

  private drawOceanCurrents(context: CanvasRenderingContext2D, tile: WorldMapTileCopy): void {
    const tokens = resolveWorldMapThemeTokens(this.state.themeMode);

    context.save();
    context.strokeStyle = tokens.labelStroke;
    context.lineWidth = 1.1;
    context.setLineDash([2, 18]);

    for (const currentPath of OCEAN_CURRENT_PATHS) {
      this.strokeSmoothOpenPath(
        context,
        currentPath.map((point) => projectWorldMapPoint(point, tile))
      );
    }

    context.restore();
  }

  private drawContinents(context: CanvasRenderingContext2D, tile: WorldMapTileCopy): void {
    const tokens = resolveWorldMapThemeTokens(this.state.themeMode);

    context.save();

    for (const continent of CONTINENT_PATHS) {
      const projectedPoints = continent.map((point) => projectWorldMapPoint(point, tile));

      context.save();
      context.strokeStyle = "rgba(245, 247, 229, 0.07)";
      context.lineWidth = 9;
      this.traceSmoothClosedPath(context, projectedPoints);
      context.stroke();
      context.restore();

      context.fillStyle = tokens.landFill;
      context.strokeStyle = tokens.landStroke;
      context.lineWidth = 1.35;
      this.traceSmoothClosedPath(context, projectedPoints);
      context.fill();
      context.stroke();

      context.strokeStyle = "rgba(245, 247, 229, 0.08)";
      context.lineWidth = 0.8;
      this.drawInteriorRelief(context, projectedPoints);
    }

    context.restore();
  }

  private drawIslands(context: CanvasRenderingContext2D, tile: WorldMapTileCopy): void {
    const tokens = resolveWorldMapThemeTokens(this.state.themeMode);

    context.save();
    context.fillStyle = tokens.landFill;
    context.strokeStyle = tokens.landStroke;
    context.lineWidth = 0.9;

    for (const island of ISLAND_POINTS) {
      const point = projectWorldMapPoint(island, tile);
      const radius = Math.max(2.5, Math.min(tile.width, tile.height) * 0.006);

      context.beginPath();
      context.ellipse(point.x, point.y, radius * 1.8, radius, island.x * Math.PI, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }

    context.restore();
  }

  private drawRoutes(context: CanvasRenderingContext2D, tile: WorldMapTileCopy): void {
    const tokens = resolveWorldMapThemeTokens(this.state.themeMode);

    context.save();
    context.strokeStyle = tokens.routeStroke;
    context.lineWidth = this.state.reducedMotion ? 1.1 : 1.6;
    context.setLineDash(this.state.reducedMotion ? [] : [7, 16]);

    for (const [start, end] of ROUTE_ARCS) {
      const points = createRouteArcPoints(
        projectWorldMapPoint(start, tile),
        projectWorldMapPoint(end, tile),
        0.14,
        22
      );

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (const point of points.slice(1)) {
        context.lineTo(point.x, point.y);
      }

      context.stroke();
    }

    context.restore();
  }

  private drawVignette(context: CanvasRenderingContext2D): void {
    const { scaleSnapshot } = this.state;
    const radius = Math.max(scaleSnapshot.width, scaleSnapshot.height) * 0.72;
    const gradient = context.createRadialGradient(
      scaleSnapshot.width / 2,
      scaleSnapshot.height / 2,
      radius * 0.2,
      scaleSnapshot.width / 2,
      scaleSnapshot.height / 2,
      radius
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(5, 17, 14, 0.28)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, scaleSnapshot.width, scaleSnapshot.height);
  }

  private traceSmoothClosedPath(context: CanvasRenderingContext2D, points: WorldMapPoint[]): void {
    const firstPoint = points[0];

    if (!firstPoint || points.length < 3) {
      return;
    }

    const lastPoint = points[points.length - 1];
    const startPoint = {
      x: (lastPoint.x + firstPoint.x) / 2,
      y: (lastPoint.y + firstPoint.y) / 2
    };

    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);

    for (let index = 0; index < points.length; index += 1) {
      const currentPoint = points[index];
      const nextPoint = points[(index + 1) % points.length];
      const midPoint = {
        x: (currentPoint.x + nextPoint.x) / 2,
        y: (currentPoint.y + nextPoint.y) / 2
      };

      context.quadraticCurveTo(currentPoint.x, currentPoint.y, midPoint.x, midPoint.y);
    }

    context.closePath();
  }

  private strokeSmoothOpenPath(context: CanvasRenderingContext2D, points: WorldMapPoint[]): void {
    const firstPoint = points[0];

    if (!firstPoint || points.length < 2) {
      return;
    }

    context.beginPath();
    context.moveTo(firstPoint.x, firstPoint.y);

    for (let index = 1; index < points.length - 1; index += 1) {
      const currentPoint = points[index];
      const nextPoint = points[index + 1];

      context.quadraticCurveTo(
        currentPoint.x,
        currentPoint.y,
        (currentPoint.x + nextPoint.x) / 2,
        (currentPoint.y + nextPoint.y) / 2
      );
    }

    const lastPoint = points[points.length - 1];
    context.lineTo(lastPoint.x, lastPoint.y);
    context.stroke();
  }

  private drawInteriorRelief(context: CanvasRenderingContext2D, points: WorldMapPoint[]): void {
    if (points.length < 5) {
      return;
    }

    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const width = maxX - minX;
    const height = maxY - minY;

    if (width < 40 || height < 30) {
      return;
    }

    context.save();
    context.beginPath();
    context.ellipse(
      minX + width * 0.52,
      minY + height * 0.52,
      width * 0.24,
      height * 0.12,
      0.2,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.restore();
  }
}

export class WorldMapSceneBuilder {
  private canvas: HTMLCanvasElement | null = null;
  private scaleSnapshot: MapScaleSnapshot | null = null;
  private pixelRatio = 1;
  private reducedMotion = false;
  private themeMode: WorldMapThemeMode = "atlas";
  private tileOrigin: MapTileOrigin = { x: 0, y: 0 };

  public attachCanvas(canvas: HTMLCanvasElement): this {
    this.canvas = canvas;

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

  public withThemeMode(themeMode: WorldMapThemeMode): this {
    this.themeMode = themeMode;

    return this;
  }

  public withReducedMotion(reducedMotion: boolean): this {
    this.reducedMotion = reducedMotion;

    return this;
  }

  public build(): WorldMapCanvasScene {
    if (!this.canvas) {
      throw new Error("WorldMapSceneBuilder requires a canvas before build().");
    }

    if (!this.scaleSnapshot) {
      throw new Error("WorldMapSceneBuilder requires a scale snapshot before build().");
    }

    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("WorldMapSceneBuilder could not acquire a 2D context.");
    }

    return new WorldMapCanvasScene({
      canvas: this.canvas,
      context,
      scaleSnapshot: this.scaleSnapshot,
      pixelRatio: this.pixelRatio,
      tileOrigin: this.tileOrigin,
      themeMode: this.themeMode,
      reducedMotion: this.reducedMotion
    });
  }
}
