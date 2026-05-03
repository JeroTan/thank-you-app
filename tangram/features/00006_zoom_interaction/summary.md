# Feature Summary: 00006_zoom_interaction

## Intent
Enable basic zoom in and zoom out capabilities to allow users to navigate the map canvas more freely, viewing markers up close or seeing the wider world context.

## Scope
Introduces a user-controlled zoom multiplier that affects the global `scaleSnapshot`. It includes the backend math for zooming around the center of the viewport, the state management in Nano Stores, and a basic UI overlay (Zoom In / Zoom Out buttons) for interacting with the zoom level.

## Execution Changelog
- **Task 1**: Added `userZoom` and `effectiveScale` properties to `MapScaleSnapshot` in `scale.ts`. Split the `mapScaleStore` atom into `mapViewportStore` and `mapZoomStore`, and made `mapScaleStore` a computed derived state. Updated all references of `scaleSnapshot.scale` to `scaleSnapshot.effectiveScale`.
- **Task 2**: Created `useZoomInteraction.ts` with handlers for trackpad/ctrl-wheel zoom (`wheel`), keyboard zoom (`+`/`-`), and two-finger multi-touch pinch-to-zoom (`touchstart`/`touchmove`). All events directly dispatch to `mapZoomStore` through the bounded `zoomTo()` helper.
- **Task 3**: Built a new `ZoomControls` floating panel with styled "+/-" buttons that dispatch `zoomTo()` calls and added it inside the main map UI structure in `GrassCanvas.tsx`.

## Debug Fixes
- **Debug 001**: Fixed a regression where the map grass tile disappeared after zooming. The `resolveGrassTileDrawSize` function in `src/utils/map/scale.ts` was updated to require `effectiveScale`, but `GrassSceneBuilder` was still passing `{ scale: globalScale }`. Updated `GrassSceneBuilder` to pass `{ effectiveScale: globalScale }` to correctly compute the tile size.
