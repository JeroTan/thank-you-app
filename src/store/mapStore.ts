import { atom } from "nanostores";

import {
  createMapScaleSnapshot,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapViewport
} from "@/utils/map/scale";

export type MapAssetStatus = "idle" | "loading" | "ready" | "error";

export const mapScaleStore = atom<MapScaleSnapshot>(createMapScaleSnapshot());
export const mapAssetStatusStore = atom<MapAssetStatus>("idle");
export const mapTileOriginStore = atom<MapTileOrigin>({ x: 0, y: 0 });

export function setMapViewport(viewport: Partial<MapViewport>): void {
  const currentViewport = mapScaleStore.get();

  mapScaleStore.set(
    createMapScaleSnapshot({
      width: viewport.width ?? currentViewport.width,
      height: viewport.height ?? currentViewport.height,
      devicePixelRatio: viewport.devicePixelRatio ?? currentViewport.devicePixelRatio
    })
  );
}

export function setMapAssetStatus(status: MapAssetStatus): void {
  mapAssetStatusStore.set(status);
}

export function setMapTileOrigin(tileOrigin: MapTileOrigin): void {
  mapTileOriginStore.set(tileOrigin);
}
