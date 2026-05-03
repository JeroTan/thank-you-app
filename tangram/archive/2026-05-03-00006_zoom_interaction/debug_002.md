# Debug Session 002: Markers Not Scaling on Zoom

## Issue Summary
The user reported that while the map panned and zoomed correctly, the markers remained at a constant size relative to the viewport. They should scale up and down alongside the background.

## Root Causes Identified
- **Static Marker Size Resolution**: In `src/features/map/utils/markerSize.ts`, the `resolveMarkerBaseWidth` function only considers the raw `viewport.width` and `viewport.height`. It calculates a size that is always a fixed percentage of the screen dimensions, completely ignoring the `effectiveScale` (which includes the user zoom level).
- **Missing Multiplier**: The math in the size resolver lacks the `effectiveScale` multiplier needed to enlarge or shrink markers as the user interacts with the zoom controls or pinch gestures.

## Fixing Checklist

- [x] task 1 - Update `resolveMarkerBaseWidth` to support scaling
  > **Summary:** Modify `src/features/map/utils/markerSize.ts` to accept `effectiveScale` in its input type. Update the calculation to multiply the base ratio result by the `effectiveScale` so markers grow/shrink with the map.

- [x] task 2 - Sync call sites in `markerSize.ts` and `markerSceneBuilder.ts`
  > **Summary:** Ensure `resolveMarkerCanvasSize` and any other internal helpers pass the `effectiveScale` from the `scaleSnapshot`.

- [x] task 3 - Update Unit Tests
  > **Summary:** Update `src/test/utils/map/markerRendering.test.ts` to verify that changing `effectiveScale` results in a corresponding change in marker dimensions.
