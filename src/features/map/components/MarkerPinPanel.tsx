import { useStore } from "@nanostores/react";
import type { PointerEvent as ReactPointerEvent } from "react";

import {
  mapMarkerPanelStore,
  mapMarkerRenderSpecStore,
  mapMarkerWorldSizeStore,
  mapPinnedMarkerIdsStore,
  mapScaleStore,
  mapTileOriginStore,
  setMapMarkerPanel,
  togglePinnedMapMarker
} from "@/store/mapStore";

import { resolveMarkerViewportPosition } from "../utils/markerPositioning";
import { resolveMarkerCanvasSizeForReferenceWidth } from "../utils/markerSize";

const PANEL_WIDTH = 152;
const PANEL_HEIGHT = 96;
const VIEWPORT_MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function stopOverlayPointerEvent(event: ReactPointerEvent<HTMLElement>): void {
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
}

export function MarkerPinPanel() {
  const markerPanel = useStore(mapMarkerPanelStore);
  const markerSpecs = useStore(mapMarkerRenderSpecStore);
  const markerWorldSize = useStore(mapMarkerWorldSizeStore);
  const pinnedMarkerIds = useStore(mapPinnedMarkerIdsStore);
  const scaleSnapshot = useStore(mapScaleStore);
  const tileOrigin = useStore(mapTileOriginStore);
  const markerSpec = markerSpecs.find((spec) => spec.id === markerPanel.markerId);

  if (!markerSpec) {
    return null;
  }

  const viewportPosition = resolveMarkerViewportPosition(
    markerSpec.worldPosition,
    scaleSnapshot,
    tileOrigin,
    markerWorldSize
  );
  const markerSize = resolveMarkerCanvasSizeForReferenceWidth(
    markerSpec.widthAtScaleOne,
    scaleSnapshot
  );
  const panelLeft = clamp(
    viewportPosition.x + markerSize.width * 0.42,
    VIEWPORT_MARGIN,
    scaleSnapshot.width - PANEL_WIDTH - VIEWPORT_MARGIN
  );
  const panelTop = clamp(
    viewportPosition.y - markerSize.totalHeight * 0.35,
    VIEWPORT_MARGIN,
    scaleSnapshot.height - PANEL_HEIGHT - VIEWPORT_MARGIN
  );
  const isPinned = pinnedMarkerIds.includes(markerSpec.id);

  return (
    <div
      data-map-overlay-control="true"
      className="pointer-events-auto absolute z-20 flex w-[152px] flex-col gap-2 rounded-lg border border-white/25 bg-[#1f2b1d]/90 p-2 text-white shadow-lg backdrop-blur-md"
      style={{
        left: `${panelLeft}px`,
        top: `${panelTop}px`
      }}
      onPointerDownCapture={stopOverlayPointerEvent}
      onPointerMoveCapture={stopOverlayPointerEvent}
      onPointerUpCapture={stopOverlayPointerEvent}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold">{markerSpec.label}</p>
        <button
          type="button"
          className="rounded-md px-1.5 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={() => {
            setMapMarkerPanel(null);
          }}
        >
          Close
        </button>
      </div>
      <button
        type="button"
        aria-pressed={isPinned}
        className={`rounded-md border px-2 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          isPinned
            ? "border-[#cde78b]/70 bg-[#cde78b]/20 text-[#f8ffe6] hover:bg-[#cde78b]/28"
            : "border-white/20 bg-white/10 hover:bg-white/20"
        }`}
        onClick={() => {
          togglePinnedMapMarker(markerSpec.id);
        }}
      >
        {isPinned ? "Unpin" : "Pin"}
      </button>
      <p className="text-[11px] leading-4 text-white/65">
        {isPinned ? "Steady against string pull" : "Can move with strings"}
      </p>
    </div>
  );
}
