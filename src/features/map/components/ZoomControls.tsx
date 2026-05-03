import { useStore } from "@nanostores/react";
import { mapZoomStore } from "@/store/mapStore";
import { zoomTo } from "../hooks/useZoomInteraction";

export function ZoomControls() {
  const currentZoom = useStore(mapZoomStore);

  const handleZoomIn = () => {
    zoomTo(currentZoom * 1.2);
  };

  const handleZoomOut = () => {
    zoomTo(currentZoom / 1.2);
  };

  return (
    <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
      <button 
        type="button" 
        onClick={handleZoomIn}
        aria-label="Zoom In"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/30"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={handleZoomOut}
        aria-label="Zoom Out"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/30"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
