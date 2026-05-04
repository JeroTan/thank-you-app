import { useEffect, type RefObject } from "react";

import {
  mapMarkerDragSessionStore,
  mapScaleStore,
  setMapPanInteractionState,
  updateMapWorldOffset
} from "@/store/mapStore";

import { PanInteractionBuilder } from "../utils/panInteractionBuilder";

function isMapOverlayControlTarget(event: PointerEvent): boolean {
  const target = event.target;

  return target instanceof HTMLElement && target.closest("[data-map-overlay-control]") !== null;
}

export function usePanInteraction(surfaceRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const surfaceElement = surfaceRef.current;

    if (!surfaceElement) {
      return;
    }

    const interactionController = new PanInteractionBuilder()
      .attachElement(surfaceElement)
      .withScaleSource(() => mapScaleStore.get())
      .withWorldOffsetDelta((delta) => {
        updateMapWorldOffset(delta);
      })
      .withInteractionState((state) => {
        setMapPanInteractionState(state);
      })
      .withShouldStartPan(
        (event) => mapMarkerDragSessionStore.get() === null && !isMapOverlayControlTarget(event)
      )
      .withKeyboardStep(48)
      .withPreventDefaults(true)
      .build();

    interactionController.attach();

    return () => {
      interactionController.detach();
    };
  }, [surfaceRef]);
}
