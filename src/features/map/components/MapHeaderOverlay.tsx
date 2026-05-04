import { useStore } from "@nanostores/react";

import {
  mapMarkerRenderSpecStore,
  mapVisualPreferencesStore,
  setActiveMapMarker,
  setMapMarkerPanel,
  setMapReducedMotion,
  setMapSearchQuery,
  setMapWorldOffset,
  toggleMapThemeMode
} from "@/store/mapStore";
import type { MapMarkerRenderSpec } from "../utils/markerRenderSpec";

function selectMarker(marker: MapMarkerRenderSpec): void {
  setActiveMapMarker(marker.id);
  setMapMarkerPanel(marker.id);
  setMapWorldOffset({
    x: -marker.worldPosition.x,
    y: -marker.worldPosition.y
  });
  setMapSearchQuery(marker.label);
}

export function MapHeaderOverlay() {
  const markerSpecs = useStore(mapMarkerRenderSpecStore);
  const visualPreferences = useStore(mapVisualPreferencesStore);
  const query = visualPreferences.searchQuery.trim().toLowerCase();
  const results =
    query.length === 0
      ? []
      : markerSpecs.filter((marker) => marker.label.toLowerCase().includes(query)).slice(0, 5);

  return (
    <header
      data-map-overlay-control="true"
      className="pointer-events-auto absolute top-3 right-3 left-3 z-30 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/18 bg-[#173832]/88 px-3 py-2 text-white shadow-lg backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#d6a84f]/18 text-sm font-black text-[#f8f7e8]">
          TY
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Thank You World</p>
          <p className="truncate text-[11px] text-white/62">Global gratitude map</p>
        </div>
      </div>

      <div className="relative flex flex-col gap-2 rounded-lg border border-white/18 bg-[#173832]/88 p-2 text-white shadow-lg backdrop-blur-md md:w-[460px]">
        <div className="flex flex-wrap items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search people</span>
            <input
              value={visualPreferences.searchQuery}
              onChange={(event) => {
                setMapSearchQuery(event.target.value);
              }}
              placeholder="Search people"
              className="h-9 w-full rounded-md border border-white/16 bg-white/10 px-3 text-sm text-white transition outline-none placeholder:text-white/45 focus:border-[#d6a84f]/70"
            />
          </label>

          <button
            type="button"
            className="h-9 rounded-md border border-white/16 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={toggleMapThemeMode}
          >
            {visualPreferences.themeMode === "atlas" ? "Atlas" : "Dusk"}
          </button>

          <button
            type="button"
            aria-pressed={visualPreferences.reducedMotion}
            className={`h-9 rounded-md border px-3 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              visualPreferences.reducedMotion
                ? "border-[#d6a84f]/70 bg-[#d6a84f]/20 text-[#fff8dd]"
                : "border-white/16 bg-white/10 text-white hover:bg-white/18"
            }`}
            onClick={() => {
              setMapReducedMotion(!visualPreferences.reducedMotion);
            }}
          >
            Motion
          </button>
        </div>

        {results.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-white/14 bg-[#102b27]/96">
            {results.map((marker) => (
              <button
                key={marker.id}
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
                onClick={() => {
                  selectMarker(marker);
                }}
              >
                <span className="truncate">{marker.label}</span>
                <span className="shrink-0 text-xs text-white/58">{marker.thankYouCount}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
