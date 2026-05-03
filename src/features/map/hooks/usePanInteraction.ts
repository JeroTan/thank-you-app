import { useEffect, type RefObject } from "react";

import { mapScaleStore, setMapPanInteractionState, updateMapWorldOffset } from "@/store/mapStore";

import { PanInteractionBuilder } from "../utils/panInteractionBuilder";

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
      .withKeyboardStep(48)
      .withPreventDefaults(true)
      .build();

    interactionController.attach();

    return () => {
      interactionController.detach();
    };
  }, [surfaceRef]);
}
