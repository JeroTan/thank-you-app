import { useStore } from "@nanostores/react";
import { useEffect } from "react";

import {
  mapActiveMarkerIdStore,
  mapMarkerConnectionSpecStore,
  mapMarkerRenderSpecStore,
  mapPinnedMarkerIdsStore,
  setActiveMapMarker,
  setMapMarkerPanel,
  togglePinnedMapMarker
} from "@/store/mapStore";
import { toHexColorString } from "@/utils/visual/color";

function closePanel(): void {
  setActiveMapMarker(null);
  setMapMarkerPanel(null);
}

export function MarkerDetailPanel() {
  const activeMarkerId = useStore(mapActiveMarkerIdStore);
  const markerSpecs = useStore(mapMarkerRenderSpecStore);
  const markerConnectionSpecs = useStore(mapMarkerConnectionSpecStore);
  const pinnedMarkerIds = useStore(mapPinnedMarkerIdsStore);
  const markerSpec = markerSpecs.find((marker) => marker.id === activeMarkerId);

  useEffect(() => {
    if (activeMarkerId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMarkerId]);

  if (!markerSpec) {
    return null;
  }

  const connectedMarkerIds = new Set<number>();

  for (const connection of markerConnectionSpecs) {
    if (connection.markerAId === markerSpec.id) {
      connectedMarkerIds.add(connection.markerBId);
    }

    if (connection.markerBId === markerSpec.id) {
      connectedMarkerIds.add(connection.markerAId);
    }
  }

  const connectedMarkers = markerSpecs
    .filter((marker) => connectedMarkerIds.has(marker.id))
    .slice(0, 5);
  const isPinned = pinnedMarkerIds.includes(markerSpec.id);

  return (
    <aside
      data-map-overlay-control="true"
      className="pointer-events-auto absolute right-3 bottom-3 left-3 z-30 rounded-t-xl border border-white/18 bg-[#173832]/94 p-4 text-white shadow-2xl backdrop-blur-md md:top-24 md:right-4 md:bottom-4 md:left-auto md:w-[332px] md:rounded-xl"
      aria-label={`${markerSpec.label} details`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {markerSpec.pictureSource ? (
            <img
              src={markerSpec.pictureSource}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full border border-white/25 object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 text-lg font-black text-white"
              style={{ backgroundColor: toHexColorString(markerSpec.frameColor) }}
            >
              {markerSpec.fallbackInitial}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{markerSpec.label}</h2>
            <p className="text-xs text-white/62">Marker #{markerSpec.id}</p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={closePanel}
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-white/12 bg-white/8 p-3">
          <p className="text-2xl font-semibold">{markerSpec.thankYouCount}</p>
          <p className="text-xs text-white/62">Received</p>
        </div>
        <div className="rounded-md border border-white/12 bg-white/8 p-3">
          <p className="text-2xl font-semibold">{connectedMarkerIds.size}</p>
          <p className="text-xs text-white/62">Connections</p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={isPinned}
        className={`mt-3 w-full rounded-md border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          isPinned
            ? "border-[#d6a84f]/70 bg-[#d6a84f]/20 text-[#fff8dd] hover:bg-[#d6a84f]/28"
            : "border-white/16 bg-white/10 hover:bg-white/18"
        }`}
        onClick={() => {
          togglePinnedMapMarker(markerSpec.id);
        }}
      >
        {isPinned ? "Unpin marker" : "Pin marker"}
      </button>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
          Linked With
        </p>
        {connectedMarkers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {connectedMarkers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                className="rounded-md border border-white/12 bg-white/8 px-2 py-1 text-xs text-white/76 transition hover:bg-white/14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => {
                  setActiveMapMarker(marker.id);
                  setMapMarkerPanel(marker.id);
                }}
              >
                {marker.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/58">No visible strings yet.</p>
        )}
      </div>
    </aside>
  );
}
