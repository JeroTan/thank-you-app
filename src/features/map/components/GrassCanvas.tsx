import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";

import grassSquareTile from "@/assets/sprite/grass_square_tile.png";
import {
  mapAssetStatusStore,
  mapScaleStore,
  mapTileOriginStore,
  setMapAssetStatus
} from "@/store/mapStore";

import { useCanvasResize } from "../hooks/useCanvasResize";
import { loadCanvasImageAssets } from "../utils/assetLoader";
import { GrassSceneBuilder } from "../utils/grassSceneBuilder";

export function GrassCanvas() {
  useCanvasResize();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tileImage, setTileImage] = useState<HTMLImageElement | null>(null);
  const assetStatus = useStore(mapAssetStatusStore);
  const scaleSnapshot = useStore(mapScaleStore);
  const tileOrigin = useStore(mapTileOriginStore);
  const isReady = assetStatus === "ready";

  useEffect(() => {
    let isActive = true;

    setMapAssetStatus("loading");

    loadCanvasImageAssets([{ key: "grassTile", src: grassSquareTile.src }])
      .then((assets) => {
        if (!isActive) {
          return;
        }

        setTileImage(assets.grassTile);
        setMapAssetStatus("ready");
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
      .withGlobalScale(scaleSnapshot.scale)
      .withTileImage(tileImage)
      .withTileOrigin(tileOrigin)
      .withFallbackColor("#315723")
      .build()
      .draw();
  }, [assetStatus, scaleSnapshot, tileImage, tileOrigin]);

  const statusTitle = assetStatus === "error" ? "Map background unavailable" : "Loading map assets";
  const statusCopy =
    assetStatus === "error"
      ? "The grass tile could not be prepared, so the viewport remains on its fallback surface."
      : "Preparing the grass tile and viewport scale before the map surface becomes visible.";

  return (
    <section
      aria-busy={!isReady}
      aria-label="Thank You map canvas"
      className="relative h-dvh min-h-dvh w-full overflow-hidden bg-[#315723]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`block h-full w-full transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
      />

      {!isReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#315723]">
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
