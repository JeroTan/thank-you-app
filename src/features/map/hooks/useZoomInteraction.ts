import { useEffect, type RefObject } from "react";

import { mapZoomStore } from "@/store/mapStore";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.0;

export function zoomTo(targetZoom: number): void {
  const currentZoom = mapZoomStore.get();
  const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
  
  if (currentZoom !== clampedZoom) {
    mapZoomStore.set(clampedZoom);
  }
}

export function useZoomInteraction(surfaceRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = surfaceRef.current;
    
    if (!element) {
      return;
    }

    let initialPinchDistance: number | null = null;
    let initialZoom = 1.0;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return;
      }
      
      event.preventDefault();
      
      const currentZoom = mapZoomStore.get();
      // Smooth zoom scaling depending on wheel delta
      const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;
      
      zoomTo(currentZoom * zoomFactor);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        zoomTo(mapZoomStore.get() * 1.2);
      } else if (event.key === "-" || event.key === "_") {
        zoomTo(mapZoomStore.get() / 1.2);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        if (touch1 && touch2) {
          initialPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          initialZoom = mapZoomStore.get();
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && initialPinchDistance !== null) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        if (touch1 && touch2) {
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          const distanceRatio = currentDistance / initialPinchDistance;
          zoomTo(initialZoom * distanceRatio);
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        initialPinchDistance = null;
      }
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("keydown", handleKeyDown);
    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [surfaceRef]);
}
