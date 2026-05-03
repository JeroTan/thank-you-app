import { atom, computed } from "nanostores";

import {
  createMapScaleSnapshot,
  clampWorldOffset,
  resolveTileOriginFromWorldOffset,
  resolveWorldOffsetFromPixelDelta,
  type MapPanInteractionState,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapViewport,
  type MapWorldOffset
} from "@/utils/map/scale";

export type MapAssetStatus = "idle" | "loading" | "ready" | "error";

export const mapScaleStore = atom<MapScaleSnapshot>(createMapScaleSnapshot());
export const mapAssetStatusStore = atom<MapAssetStatus>("idle");
export const mapWorldOffsetStore = atom<MapWorldOffset>({ x: 0, y: 0 });
export const mapPanInteractionStore = atom<MapPanInteractionState>({
  isActive: false,
  inputMode: null,
  cursor: "grab"
});
export const mapTileOriginStore = computed(
  [mapWorldOffsetStore, mapScaleStore],
  (worldOffset, scaleSnapshot): MapTileOrigin =>
    resolveTileOriginFromWorldOffset(worldOffset, scaleSnapshot)
);

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

export function setMapWorldOffset(worldOffset: MapWorldOffset): void {
  mapWorldOffsetStore.set(clampWorldOffset(worldOffset));
}

export function updateMapWorldOffset(delta: Partial<MapWorldOffset>): void {
  const currentOffset = mapWorldOffsetStore.get();

  setMapWorldOffset({
    x: currentOffset.x + (delta.x ?? 0),
    y: currentOffset.y + (delta.y ?? 0)
  });
}

export function setMapPanInteractionState(state: Partial<MapPanInteractionState>): void {
  mapPanInteractionStore.set({
    ...mapPanInteractionStore.get(),
    ...state
  });
}

export function setMapTileOrigin(tileOrigin: MapTileOrigin): void {
  const scaleSnapshot = mapScaleStore.get();

  setMapWorldOffset({
    x: resolveWorldOffsetFromPixelDelta(tileOrigin.x, scaleSnapshot),
    y: resolveWorldOffsetFromPixelDelta(tileOrigin.y, scaleSnapshot)
  });
}
