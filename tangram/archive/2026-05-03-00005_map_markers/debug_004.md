# Debug Session 004: Infinite Panning Wrap for Markers

## Issue Summary
The user noted that panning should behave as an infinite world ("free map"). While the grass background wraps seamlessly, the markers simply slide off the viewport. We need the markers to wrap around when we pan beyond the world boundaries.

## Root Causes Identified
- **Missing World Bounds Wrapping**: Marker positions are computed once in world space but their viewport projection does not account for a "wrapped" coordinate system. 
- **Incomplete Builder Integration**: To wrap markers seamlessly, we must define the `worldSize` (marker bounding box + 50% viewport padding as originally planned), pass it through the React layer to `MarkerSceneBuilder`, and use a modulo offset in `resolveMarkerViewportPosition` so the marker always renders in the nearest wrapped copy of the world.

## Fixing Checklist

- [x] task 1 - Compute `worldSize` in marker spec builder
  > **Summary:** `src/features/map/utils/markerRenderSpec.ts` calculates a `worldSize` derived from the markers' maximum extent plus `MAP_REFERENCE_VIEWPORT` padding.

- [x] task 2 - Implement marker coordinate wrapping
  > **Summary:** `src/features/map/utils/markerPositioning.ts` updates `resolveMarkerViewportPosition` to accept `worldSize` and wrap the X and Y coordinates so the marker stays within `-worldSize.width / 2` to `worldSize.width / 2` relative to the camera.

- [x] task 3 - Pass `worldSize` from Canvas to Builder
  > **Summary:** `src/features/map/components/GrassCanvas.tsx` and `src/features/map/utils/markerSceneBuilder.ts` will support passing `worldSize` into the canvas drawing pipeline.