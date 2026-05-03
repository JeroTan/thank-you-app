import { atom, computed } from "nanostores";

import type { MapMarkerRenderSpec } from "@/features/map/utils/markerRenderSpec";
import {
  createMapScaleSnapshot,
  clampWorldOffset,
  resolveTileOriginFromWorldOffset,
  resolveWorldOffsetFromPixelDelta,
  MAP_REFERENCE_VIEWPORT,
  type MapPanInteractionState,
  type MapScaleSnapshot,
  type MapTileOrigin,
  type MapViewport,
  type MapWorldOffset
} from "@/utils/map/scale";

export type MapAssetStatus = "idle" | "loading" | "ready" | "error";

export const mapViewportStore = atom<MapViewport>({
  width: MAP_REFERENCE_VIEWPORT.width,
  height: MAP_REFERENCE_VIEWPORT.height,
  devicePixelRatio: 1,
  userZoom: 1.0
});

export const mapZoomStore = atom<number>(1.0);

export const mapScaleStore = computed(
  [mapViewportStore, mapZoomStore],
  (viewport, userZoom) => createMapScaleSnapshot({ ...viewport, userZoom })
);

export const mapAssetStatusStore = atom<MapAssetStatus>("idle");
export const mapWorldOffsetStore = atom<MapWorldOffset>({ x: 0, y: 0 });
export const mapMarkerRenderSpecStore = atom<MapMarkerRenderSpec[]>([]);
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
  const currentViewport = mapViewportStore.get();

  mapViewportStore.set({
    ...currentViewport,
    ...viewport
  });
}

export function setMapAssetStatus(status: MapAssetStatus): void {
  mapAssetStatusStore.set(status);
}

export function setMapMarkerRenderSpecs(markerRenderSpecs: MapMarkerRenderSpec[]): void {
  mapMarkerRenderSpecStore.set(markerRenderSpecs);
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
