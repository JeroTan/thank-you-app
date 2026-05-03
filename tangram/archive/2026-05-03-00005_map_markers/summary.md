# Feature Summary: 00005_map_markers

## Intent
Add the first marker layer to the current canvas map so mock people can appear as positioned pins instead of the map remaining background-only.

## Scope
This slice renders markers only. It covers a shared marker render spec, stable per-session marker positioning, and canvas-first rendering of the full pin visual using the existing `MapMarkerPin` design as the visual reference. It explicitly excludes strings, click or drag interaction, thank-you-count scaling, and marker-size changes beyond the base viewport-relative rule.

## Execution Changelog
- **Debug 001**: Fixed missing mapWorldOffsetStore dependency, refactored markerSceneBuilder.ts to render the exact MapMarkerPin vector outline, and added image preloading to assetLoader.ts.
- **Debug 002**: Fixed invalid SVG clip path ID (colons from useId) in `MapMarkerPin.tsx` and improved canvas avatar rendering aspect ratio (`slice`/cover) in `markerSceneBuilder.ts`.
- **Debug 003**: Removed `crossOrigin="anonymous"` from `assetLoader.ts` to bypass Pravatar's missing CORS headers (allowing images to successfully load instead of falling back to initials), and re-applied the reverted canvas aspect ratio fix to `markerSceneBuilder.ts`.
- **Debug 004**: Implemented infinite wrapping ("free map") for markers. Derived `worldSize` in `markerRenderSpec.ts`, passed it through `GrassCanvas.tsx` and `MarkerSceneBuilder`, and utilized modulo wrapping in `resolveMarkerViewportPosition` so markers repeat continuously upon panning past the world bounds.

## Strategic Fit
The feature advances the visualization MVP from a pannable background into an actual gratitude map while preserving the canvas and world-offset foundations established by `2026-05-03-00002_grass_canvas` and `2026-05-03-00004_pan_interaction`. It also creates the renderer seam needed to evaluate an early canvas marker path before heavier production counts arrive.

## Debug Fixes
- Applied `debug_001.md` to resolve marker pan alignment, marker pin rendering fidelity, and avatar image preload behavior.

## Final Execution Log
- **What was Built**: A stable, viewport-relative canvas rendering layer for map markers (`MarkerSceneBuilder`). It features preloaded avatar images, high-fidelity SVG path reproduction matching `MapMarkerPin.tsx`, and infinite panning coordinate wrapping.
- **Challenges & Fixes**: Multiple debug sessions were required to perfect the canvas integration:
  - `debug_001.md`: Corrected missing dependencies so markers pan correctly, and added image preloading.
  - `debug_002.md` & `debug_003.md`: Fixed image loading by bypassing strict CORS on Pravatar, repaired SVG invalid `clipPath` IDs, and simulated `object-fit: cover` logic in canvas drawing.
  - `debug_004.md`: Solved the infinite panning requirement by deriving a `worldSize` and wrapping viewport coordinates via modulo arithmetic.
- **Design Adherence**: Maintained the "Feature-Centric Island Architecture" and separated presentation from pure math logic, fully adhering to `tangram/design/` rules.