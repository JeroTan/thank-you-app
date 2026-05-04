import { useStore } from "@nanostores/react";
import { useEffect, useMemo, useRef, useState } from "react";

import grassSquareTile from "@/assets/sprite/grass_square_tile.png";
import { thankYouData } from "@/components/mockdata/thankYouData";
import {
  initializeMapMarkerConnections,
  initializeMapMarkers,
  mapActiveMarkerIdStore,
  mapAssetStatusStore,
  mapHoveredMarkerIdStore,
  mapMarkerConnectionSpecStore,
  mapMarkerRenderSpecStore,
  mapStringPhysicsSnapshotStore,
  mapMarkerWorldSizeStore,
  mapPanInteractionStore,
  mapScaleStore,
  mapTileOriginStore,
  setMapAssetStatus
} from "@/store/mapStore";
import type { MapWorldOffset } from "@/utils/map/scale";

import { useCanvasResize } from "../hooks/useCanvasResize";
import { useMarkerInteraction } from "../hooks/useMarkerInteraction";
import { usePanInteraction } from "../hooks/usePanInteraction";
import { useStringPhysics } from "../hooks/useStringPhysics";
import { useZoomInteraction } from "../hooks/useZoomInteraction";
import { loadCanvasImageAsset, loadCanvasImageAssets } from "../utils/assetLoader";
import { GrassSceneBuilder } from "../utils/grassSceneBuilder";
import { MarkerPinPanel } from "./MarkerPinPanel";
import { createMarkerConnectionSpecs } from "../utils/markerConnectionSpec";
import { MarkerSceneBuilder } from "../utils/markerSceneBuilder";
import type { MapMarkerRenderSpec } from "../utils/markerRenderSpec";
import { createMarkerRenderSpecs } from "../utils/markerRenderSpec";
import { resolveMarkerCanvasSizeForWidth } from "../utils/markerSize";
import { createStringPhysicsSnapshot } from "../utils/stringPhysics";
import { StringSceneBuilder } from "../utils/stringSceneBuilder";
import { ZoomControls } from "./ZoomControls";

const MARKER_STRING_ANCHOR_Y_RATIO = 0.85;

function resolveMarkerPinTipOffset(
  markerSpec: Pick<MapMarkerRenderSpec, "widthAtScaleOne">
): number {
  return (
    resolveMarkerCanvasSizeForWidth(markerSpec.widthAtScaleOne).height *
    MARKER_STRING_ANCHOR_Y_RATIO
  );
}

function resolveStringCanvasPoints(
  points: MapWorldOffset[],
  markerA: Pick<MapMarkerRenderSpec, "widthAtScaleOne">,
  markerB: Pick<MapMarkerRenderSpec, "widthAtScaleOne">
): MapWorldOffset[] {
  if (points.length <= 1) {
    return points;
  }

  const markerAOffset = resolveMarkerPinTipOffset(markerA);
  const markerBOffset = resolveMarkerPinTipOffset(markerB);
  const lastIndex = points.length - 1;

  return points.map((point, index) => {
    const t = index / lastIndex;

    return {
      x: point.x,
      y: point.y + markerAOffset * (1 - t) + markerBOffset * t
    };
  });
}

export function GrassCanvas() {
  useCanvasResize();
  const surfaceRef = useRef<HTMLElement | null>(null);
  usePanInteraction(surfaceRef);
  useZoomInteraction(surfaceRef);
  useStringPhysics();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stringCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const markerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useMarkerInteraction(markerCanvasRef);

  const initialMarkerFeatureData = useMemo(
    () => createMarkerRenderSpecs(thankYouData, { seed: 42 }),
    []
  );
  const initialMarkerConnectionSpecs = useMemo(
    () => createMarkerConnectionSpecs(thankYouData, initialMarkerFeatureData.specs),
    [initialMarkerFeatureData]
  );
  const [tileImage, setTileImage] = useState<HTMLImageElement | null>(null);
  const [markerImageRegistry, setMarkerImageRegistry] = useState<Record<string, HTMLImageElement>>(
    {}
  );
  const activeMarkerId = useStore(mapActiveMarkerIdStore);
  const assetStatus = useStore(mapAssetStatusStore);
  const hoveredMarkerId = useStore(mapHoveredMarkerIdStore);
  const markerConnectionSpecs = useStore(mapMarkerConnectionSpecStore);
  const markerRenderSpecs = useStore(mapMarkerRenderSpecStore);
  const stringPhysicsSnapshots = useStore(mapStringPhysicsSnapshotStore);
  const markerWorldSize = useStore(mapMarkerWorldSizeStore);
  const panInteraction = useStore(mapPanInteractionStore);
  const scaleSnapshot = useStore(mapScaleStore);
  const tileOrigin = useStore(mapTileOriginStore);
  const isReady = assetStatus === "ready";

  useEffect(() => {
    initializeMapMarkers(initialMarkerFeatureData);
    initializeMapMarkerConnections(initialMarkerConnectionSpecs);
  }, [initialMarkerConnectionSpecs, initialMarkerFeatureData]);

  useEffect(() => {
    let isActive = true;

    setMapAssetStatus("loading");

    const avatarUrls = Array.from(
      new Set(
        thankYouData
          .map((item) => item.picture)
          .filter((picture): picture is string => Boolean(picture))
      )
    );

    const markerImagePromises = avatarUrls.map(async (src) => {
      try {
        return [src, await loadCanvasImageAsset(src)] as const;
      } catch (error) {
        console.warn(`Failed to preload avatar image: ${src}`, error);
        return null;
      }
    });

    Promise.all(markerImagePromises)
      .then((results) => {
        if (!isActive) {
          return;
        }

        const loadedMarkerImages = Object.fromEntries(
          results.filter((entry): entry is readonly [string, HTMLImageElement] => entry !== null)
        );

        return loadCanvasImageAssets([{ key: "grassTile", src: grassSquareTile.src }]).then(
          (assets) => {
            if (!isActive) {
              return;
            }

            setTileImage(assets.grassTile);
            setMarkerImageRegistry(loadedMarkerImages);
            setMapAssetStatus("ready");
          }
        );
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        console.error("Failed to load map canvas assets.", error);
        setMapAssetStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !tileImage || assetStatus !== "ready") {
      return;
    }

    new GrassSceneBuilder()
      .attachCanvas(canvasRef.current)
      .withViewport(scaleSnapshot.width, scaleSnapshot.height)
      .withPixelRatio(scaleSnapshot.devicePixelRatio)
      .withGlobalScale(scaleSnapshot.effectiveScale)
      .withTileImage(tileImage)
      .withTileOrigin(tileOrigin)
      .withFallbackColor("#315723")
      .build()
      .draw();
  }, [assetStatus, scaleSnapshot, tileImage, tileOrigin]);

  useEffect(() => {
    if (!stringCanvasRef.current || assetStatus !== "ready") {
      return;
    }

    const markerSpecsById = new Map(markerRenderSpecs.map((spec) => [spec.id, spec]));
    const hasFocusedMarker = hoveredMarkerId !== null || activeMarkerId !== null;
    const focusedMarkerId = hoveredMarkerId ?? activeMarkerId;
    const specsForCanvas = markerConnectionSpecs.flatMap((connection) => {
      const markerA = markerSpecsById.get(connection.markerAId);
      const markerB = markerSpecsById.get(connection.markerBId);

      if (!markerA || !markerB) {
        return [];
      }

      const snapshot =
        stringPhysicsSnapshots[connection.key] ??
        createStringPhysicsSnapshot(
          connection,
          {
            start: markerA.worldPosition,
            end: markerB.worldPosition
          },
          { segmentCount: 8 }
        );
      const isFocusedConnection =
        focusedMarkerId === connection.markerAId || focusedMarkerId === connection.markerBId;

      return [
        {
          key: connection.key,
          markerAFrameColor: connection.markerAFrameColor,
          markerBFrameColor: connection.markerBFrameColor,
          isMutual: connection.isMutual,
          isHighlighted: isFocusedConnection,
          isDimmed: hasFocusedMarker && !isFocusedConnection,
          points: resolveStringCanvasPoints(snapshot.points, markerA, markerB)
        }
      ];
    });

    new StringSceneBuilder()
      .attachCanvas(stringCanvasRef.current)
      .withScaleSnapshot(scaleSnapshot)
      .withPixelRatio(scaleSnapshot.devicePixelRatio)
      .withTileOrigin(tileOrigin)
      .withWorldSize(markerWorldSize)
      .withStringSpecs(specsForCanvas)
      .build()
      .draw();
  }, [
    activeMarkerId,
    assetStatus,
    hoveredMarkerId,
    markerConnectionSpecs,
    markerRenderSpecs,
    markerWorldSize,
    scaleSnapshot,
    stringPhysicsSnapshots,
    tileOrigin
  ]);

  // Marker rendering effect
  useEffect(() => {
    if (!markerCanvasRef.current || assetStatus !== "ready") {
      return;
    }

    const specsForCanvas = markerRenderSpecs.map((spec) => ({
      id: spec.id,
      frameColor: spec.frameColor,
      label: spec.label,
      fallbackInitial: spec.fallbackInitial,
      picture: spec.pictureSource,
      worldX: spec.worldPosition.x,
      worldY: spec.worldPosition.y,
      widthAtScaleOne: spec.widthAtScaleOne,
      thankYouCount: spec.thankYouCount,
      sizeMultiplier: spec.sizeMultiplier
    }));

    new MarkerSceneBuilder()
      .attachCanvas(markerCanvasRef.current)
      .withScaleSnapshot(scaleSnapshot)
      .withPixelRatio(scaleSnapshot.devicePixelRatio)
      .withTileOrigin(tileOrigin)
      .withWorldSize(markerWorldSize)
      .withMarkerImageRegistry(markerImageRegistry)
      .withActiveMarkerId(activeMarkerId)
      .withHoveredMarkerId(hoveredMarkerId)
      .withMarkerSpecs(specsForCanvas)
      .build()
      .draw();
  }, [
    activeMarkerId,
    assetStatus,
    hoveredMarkerId,
    markerImageRegistry,
    markerRenderSpecs,
    markerWorldSize,
    scaleSnapshot,
    tileOrigin
  ]);

  const statusTitle = assetStatus === "error" ? "Map background unavailable" : "Loading map assets";
  const statusCopy =
    assetStatus === "error"
      ? "The grass tile could not be prepared, so the viewport remains on its fallback surface."
      : "Preparing the grass tile and viewport scale before the map surface becomes visible.";

  return (
    <section
      ref={surfaceRef}
      aria-busy={!isReady}
      aria-label="Thank You map canvas"
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
      tabIndex={0}
      className="relative h-dvh min-h-dvh w-full touch-none overflow-hidden bg-[#315723] outline-none select-none"
      style={{ cursor: panInteraction.cursor }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`block h-full w-full transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
      />

      <canvas
        ref={stringCanvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 block h-full w-full transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
      />

      <canvas
        ref={markerCanvasRef}
        aria-hidden="true"
        className={`absolute inset-0 block h-full w-full transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
      />

      {isReady && <ZoomControls />}
      {isReady && <MarkerPinPanel />}

      {!isReady ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#315723]">
          <div className="flex min-w-48 flex-col items-center gap-4 rounded-2xl border border-white/20 bg-black/20 px-6 py-5 text-center text-white backdrop-blur-sm">
            <span className="h-3 w-3 animate-pulse rounded-full bg-[#cde78b]" />
            <p className="text-sm font-semibold tracking-[0.24em] uppercase">{statusTitle}</p>
            <p className="max-w-56 text-xs leading-5 text-white/70">{statusCopy}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
