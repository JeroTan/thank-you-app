import { atom, computed } from "nanostores";

import type { MapMarkerRenderSpec, MarkerFeatureData } from "@/features/map/utils/markerRenderSpec";
import {
  createMapScaleSnapshot,
  clampWorldOffset,
  resolveTileOriginFromWorldOffset,
  resolveWorldOffsetFromPixelDelta,
  MAP_REFERENCE_VIEWPORT,
  type MapPanInteractionState,
  type MapTileOrigin,
  type MapViewport,
  type MapWorldOffset
} from "@/utils/map/scale";

export type MapAssetStatus = "idle" | "loading" | "ready" | "error";

export type MapMarkerDragSession = {
  markerId: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  lastClientX: number;
  lastClientY: number;
  originWorldPosition: MapWorldOffset;
  hasExceededClickThreshold: boolean;
};

export const mapViewportStore = atom<MapViewport>({
  width: MAP_REFERENCE_VIEWPORT.width,
  height: MAP_REFERENCE_VIEWPORT.height,
  devicePixelRatio: 1,
  userZoom: 1.0
});

export const mapZoomStore = atom<number>(1.0);

export const mapScaleStore = computed([mapViewportStore, mapZoomStore], (viewport, userZoom) =>
  createMapScaleSnapshot({ ...viewport, userZoom })
);

export const mapAssetStatusStore = atom<MapAssetStatus>("idle");
export const mapWorldOffsetStore = atom<MapWorldOffset>({ x: 0, y: 0 });
export const mapMarkerRenderSpecStore = atom<MapMarkerRenderSpec[]>([]);
export const mapMarkerWorldSizeStore = atom<{ width: number; height: number }>({
  width: MAP_REFERENCE_VIEWPORT.width * 2,
  height: MAP_REFERENCE_VIEWPORT.height * 2
});
export const mapActiveMarkerIdStore = atom<number | null>(null);
export const mapMarkerDragSessionStore = atom<MapMarkerDragSession | null>(null);
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

export function initializeMapMarkers(markerFeatureData: MarkerFeatureData): void {
  mapMarkerRenderSpecStore.set(markerFeatureData.specs);
  mapMarkerWorldSizeStore.set(markerFeatureData.worldSize);
  mapActiveMarkerIdStore.set(null);
  mapMarkerDragSessionStore.set(null);
}

export function setActiveMapMarker(markerId: number | null): void {
  mapActiveMarkerIdStore.set(markerId);
}

export function updateMapMarkerWorldPosition(
  markerId: number,
  worldPosition: MapWorldOffset
): void {
  mapMarkerRenderSpecStore.set(
    mapMarkerRenderSpecStore.get().map((spec) =>
      spec.id === markerId
        ? {
            ...spec,
            worldPosition
          }
        : spec
    )
  );
}

export function setMapMarkerDragSession(dragSession: MapMarkerDragSession | null): void {
  mapMarkerDragSessionStore.set(dragSession);
}

export function updateMapMarkerDragSession(
  dragSession: Partial<Omit<MapMarkerDragSession, "markerId" | "pointerId">>
): void {
  const currentSession = mapMarkerDragSessionStore.get();

  if (!currentSession) {
    return;
  }

  mapMarkerDragSessionStore.set({
    ...currentSession,
    ...dragSession
  });
}

export function clearMapMarkerDragSession(): void {
  mapMarkerDragSessionStore.set(null);
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
