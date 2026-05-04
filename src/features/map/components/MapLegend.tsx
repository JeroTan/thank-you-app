export function MapLegend() {
  return (
    <aside
      data-map-overlay-control="true"
      className="pointer-events-auto absolute bottom-3 left-3 z-20 hidden w-[224px] rounded-lg border border-white/18 bg-[#173832]/86 p-3 text-white shadow-lg backdrop-blur-md sm:block"
      aria-label="Map legend"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/78 uppercase">Legend</p>
        <span className="h-px flex-1 bg-white/14" />
      </div>

      <div className="space-y-3 text-xs text-white/72">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border border-white/30 bg-[#d6a84f]/45 shadow-[0_0_12px_rgba(214,168,79,0.35)]" />
          <span>Marker size follows received thanks</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-0.5 w-8 rounded-full bg-white/58" />
          <span>Single gratitude string</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-0.5 w-8 rounded-full bg-gradient-to-r from-[#d6a84f] via-white/70 to-[#7fc8b4]" />
          <span>Mutual thank-you pair</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#d6a84f]/55 bg-[#d6a84f]/15 text-[10px] font-bold">
            P
          </span>
          <span>Pinned marker stays steady</span>
        </div>
      </div>
    </aside>
  );
}
