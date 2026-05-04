import { useStore } from "@nanostores/react";

import {
  mapMarkerConnectionSpecStore,
  mapMarkerRenderSpecStore,
  setActiveMapMarker,
  setMapMarkerPanel,
  setMapWorldOffset
} from "@/store/mapStore";
import type { MapMarkerRenderSpec } from "../utils/markerRenderSpec";

function selectMarker(marker: MapMarkerRenderSpec): void {
  setActiveMapMarker(marker.id);
  setMapMarkerPanel(marker.id);
  setMapWorldOffset({
    x: -marker.worldPosition.x,
    y: -marker.worldPosition.y
  });
}

export function AccessibleMarkerList() {
  const markerSpecs = useStore(mapMarkerRenderSpecStore);
  const markerConnectionSpecs = useStore(mapMarkerConnectionSpecStore);

  return (
    <nav className="sr-only" aria-label="Map markers">
      <ul>
        {markerSpecs.map((marker) => {
          const connectionCount = markerConnectionSpecs.filter(
            (connection) => connection.markerAId === marker.id || connection.markerBId === marker.id
          ).length;

          return (
            <li key={marker.id}>
              <button
                type="button"
                onClick={() => {
                  selectMarker(marker);
                }}
              >
                {marker.label}, {marker.thankYouCount} received thanks, {connectionCount} visible
                connections
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
