import { useEffect } from "react";

import { setMapViewport } from "@/store/mapStore";

function readViewportDimensions() {
  const visualViewport = window.visualViewport;

  return {
    width: Math.round(visualViewport?.width ?? window.innerWidth),
    height: Math.round(visualViewport?.height ?? window.innerHeight),
    devicePixelRatio: window.devicePixelRatio || 1
  };
}

export function useCanvasResize(): void {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let animationFrameId = 0;
    const visualViewport = window.visualViewport;

    const syncViewport = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        setMapViewport(readViewportDimensions());
      });
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    visualViewport?.addEventListener("resize", syncViewport);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", syncViewport);
      visualViewport?.removeEventListener("resize", syncViewport);
    };
  }, []);
}
