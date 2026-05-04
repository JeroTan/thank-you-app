import { useEffect, type RefObject } from "react";

import {
  clearMapMarkerDragSession,
  mapMarkerDragSessionStore,
  mapMarkerRenderSpecStore,
  mapMarkerWorldSizeStore,
  mapScaleStore,
  mapTileOriginStore,
  setActiveMapMarker,
  setHoveredMapMarker,
  setMapMarkerPanel,
  setMapMarkerDragSession,
  setMapPanInteractionState,
  updateMapMarkerDragSession,
  updateMapMarkerWorldPosition
} from "@/store/mapStore";
import type { MapPanInputMode, MapWorldOffset } from "@/utils/map/scale";

import {
  hitTestMarker,
  resolveMarkerWorldPositionFromPointerDelta
} from "../utils/markerHitTesting";

const CLICK_DRAG_THRESHOLD = 6;

type QueuedMarkerPosition = {
  markerId: number;
  worldPosition: MapWorldOffset;
};

function resolvePointerInputMode(pointerType: string): Extract<MapPanInputMode, "mouse" | "touch"> {
  return pointerType === "mouse" ? "mouse" : "touch";
}

function releaseCapturedPointer(element: HTMLElement, pointerId: number): void {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    return;
  }
}

export function useMarkerInteraction(markerCanvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const markerCanvas = markerCanvasRef.current;

    if (!markerCanvas) {
      return;
    }

    let animationFrameId = 0;
    let queuedMarkerPosition: QueuedMarkerPosition | null = null;

    const flushQueuedMarkerPosition = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }

      if (!queuedMarkerPosition) {
        return;
      }

      updateMapMarkerWorldPosition(
        queuedMarkerPosition.markerId,
        queuedMarkerPosition.worldPosition
      );
      queuedMarkerPosition = null;
    };

    const queueMarkerPosition = (nextPosition: QueuedMarkerPosition) => {
      queuedMarkerPosition = nextPosition;

      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        flushQueuedMarkerPosition();
      });
    };

    const resolveCanvasPoint = (event: PointerEvent) => {
      const rect = markerCanvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const markerSpecs = mapMarkerRenderSpecStore.get();
      const hitbox = hitTestMarker(
        resolveCanvasPoint(event),
        markerSpecs,
        mapScaleStore.get(),
        mapTileOriginStore.get(),
        mapMarkerWorldSizeStore.get()
      );

      if (!hitbox) {
        setHoveredMapMarker(null);
        return;
      }

      const markerSpec = markerSpecs.find((spec) => spec.id === hitbox.markerId);

      if (!markerSpec) {
        return;
      }

      setHoveredMapMarker(markerSpec.id);
      event.preventDefault();
      event.stopPropagation();

      try {
        markerCanvas.setPointerCapture(event.pointerId);
      } catch {
        return;
      }

      setMapMarkerDragSession({
        markerId: markerSpec.id,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
        originWorldPosition: markerSpec.worldPosition,
        hasExceededClickThreshold: false
      });
      setMapPanInteractionState({
        isActive: true,
        inputMode: resolvePointerInputMode(event.pointerType),
        cursor: "grabbing"
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const dragSession = mapMarkerDragSessionStore.get();

      if (!dragSession) {
        const hitbox = hitTestMarker(
          resolveCanvasPoint(event),
          mapMarkerRenderSpecStore.get(),
          mapScaleStore.get(),
          mapTileOriginStore.get(),
          mapMarkerWorldSizeStore.get()
        );

        setHoveredMapMarker(hitbox?.markerId ?? null);
        return;
      }

      if (dragSession.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const deltaX = event.clientX - dragSession.startClientX;
      const deltaY = event.clientY - dragSession.startClientY;
      const hasExceededClickThreshold =
        dragSession.hasExceededClickThreshold || Math.hypot(deltaX, deltaY) >= CLICK_DRAG_THRESHOLD;

      if (hasExceededClickThreshold) {
        queueMarkerPosition({
          markerId: dragSession.markerId,
          worldPosition: resolveMarkerWorldPositionFromPointerDelta(
            dragSession.originWorldPosition,
            { x: deltaX, y: deltaY },
            mapScaleStore.get()
          )
        });
      }

      updateMapMarkerDragSession({
        lastClientX: event.clientX,
        lastClientY: event.clientY,
        hasExceededClickThreshold
      });
    };

    const finishPointerSession = (event: PointerEvent, shouldAllowClick: boolean) => {
      const dragSession = mapMarkerDragSessionStore.get();

      if (!dragSession || dragSession.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const deltaX = event.clientX - dragSession.startClientX;
      const deltaY = event.clientY - dragSession.startClientY;
      const didDrag =
        dragSession.hasExceededClickThreshold || Math.hypot(deltaX, deltaY) >= CLICK_DRAG_THRESHOLD;

      if (didDrag) {
        queueMarkerPosition({
          markerId: dragSession.markerId,
          worldPosition: resolveMarkerWorldPositionFromPointerDelta(
            dragSession.originWorldPosition,
            { x: deltaX, y: deltaY },
            mapScaleStore.get()
          )
        });
        flushQueuedMarkerPosition();
      } else if (shouldAllowClick) {
        setActiveMapMarker(dragSession.markerId);
        setMapMarkerPanel(dragSession.markerId);
      }

      clearMapMarkerDragSession();
      releaseCapturedPointer(markerCanvas, event.pointerId);
      setMapPanInteractionState({
        isActive: false,
        inputMode: null,
        cursor: "grab"
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      finishPointerSession(event, true);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      finishPointerSession(event, false);
    };

    const handlePointerLeave = () => {
      if (mapMarkerDragSessionStore.get()) {
        return;
      }

      setHoveredMapMarker(null);
    };

    markerCanvas.addEventListener("pointerdown", handlePointerDown);
    markerCanvas.addEventListener("pointermove", handlePointerMove);
    markerCanvas.addEventListener("pointerup", handlePointerUp);
    markerCanvas.addEventListener("pointercancel", handlePointerCancel);
    markerCanvas.addEventListener("pointerleave", handlePointerLeave);
    markerCanvas.addEventListener("lostpointercapture", handlePointerCancel);

    return () => {
      flushQueuedMarkerPosition();
      markerCanvas.removeEventListener("pointerdown", handlePointerDown);
      markerCanvas.removeEventListener("pointermove", handlePointerMove);
      markerCanvas.removeEventListener("pointerup", handlePointerUp);
      markerCanvas.removeEventListener("pointercancel", handlePointerCancel);
      markerCanvas.removeEventListener("pointerleave", handlePointerLeave);
      markerCanvas.removeEventListener("lostpointercapture", handlePointerCancel);
    };
  }, [markerCanvasRef]);
}
