import { useEffect } from "react";

import { setMapReducedMotion } from "@/store/mapStore";

export function useReducedMotionPreference(): void {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setMapReducedMotion(mediaQuery.matches);

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      setMapReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handlePreferenceChange);

    return () => {
      mediaQuery.removeEventListener("change", handlePreferenceChange);
    };
  }, []);
}
