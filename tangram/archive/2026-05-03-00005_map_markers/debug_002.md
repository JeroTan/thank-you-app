# Debug Session 002: Image Rendering and SVG Clip Path Fix

## Issue Summary
The user reported that the image within the map markers is "not rendering well." Although the image successfully loads, it fails to display perfectly inside the circular avatar frame.

## Root Causes Identified
- **Invalid SVG Clip Path ID**: In `MapMarkerPin.tsx`, the `useId()` hook from React generates IDs containing colons (e.g., `:r0:`). When used in an SVG `url(#...)` reference, the colon is interpreted as a CSS pseudo-class delimiter by the browser. This causes the `clipPath` to fail, resulting in the image rendering as a large, unclipped square that bleeds over the marker pin.
- **Canvas Image Scaling (Precaution)**: In `markerSceneBuilder.ts`, the image is drawn using a direct bounding box. This can distort non-square images and lacks a background fill, causing transparent avatars to show the grass underneath.

## Fixing Checklist

- [x] task 1 - Fix invalid SVG clip path ID in MapMarkerPin
  > **Summary:** Modify `src/components/visual/MapMarkerPin.tsx` to strip colons from the `useId()` string (e.g., `clip-${useId().replace(/:/g, "")}`). This ensures the `clipPath` reference is a valid CSS selector and properly masks the image into a circle.

- [x] task 2 - Improve canvas avatar rendering aspect ratio
  > **Summary:** Modify `src/features/map/utils/markerSceneBuilder.ts` inside `drawMarkerAvatar` to fill the background color before drawing the image (preventing transparent image bleeding). Update the `drawImage` call to calculate proper aspect-ratio dimensions to simulate `object-fit: cover` (`slice`), ensuring non-square avatars don't squeeze or stretch.
