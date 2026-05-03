# Debug Session 001: Marker Visual, Pan Alignment, and Picture Rendering

## Issue Summary
The marker feature was declared complete but has three critical failures in runtime:
1. **Visual design mismatch**: Canvas drawing uses oversimplified shapes instead of reproducing the exact SVG teardrop from `MapMarkerPin.tsx`
2. **Markers frozen during pan**: Effect missing dependency on `mapWorldOffsetStore`; markers render at initial pan offset
3. **Pictures not showing**: Avatar images referenced but not preloaded; only fallback initials visible

## Root Causes Identified
- **Pan misalignment**: `GrassCanvas.tsx` marker effect depends on `[assetStatus, scaleSnapshot]` only; missing `mapWorldOffsetStore` and `tileOrigin` dependencies
- **Visual mismatch**: `markerSceneBuilder.ts` hand-codes canvas teardrop instead of capturing rendered `MapMarkerPin` component (SVG reproduced partially, no shadow filter, no exact curves)
- **Missing pictures**: Avatar image URLs in spec but no preload step; `drawImage()` called on unprepared images

## Fixing Checklist

- [x] task 1 - Fix pan dependency in marker effect
  > **Summary:** Updated `GrassCanvas.tsx` so the marker effect re-runs when `tileOrigin` changes. This ensures `MarkerSceneBuilder` receives the current world offset and markers move correctly with pan.

- [x] task 2 - Implement exact pin rendering with avatar support
  > **Summary:** Refactored `markerSceneBuilder.ts` to render the exact `MapMarkerPin` vector outline using the same SVG path and label styling, with preloaded avatar image support inside the circular head area. The renderer now uses `tileOrigin` and correct marker dimensions rather than a simplified circle/triangle fallback.

- [x] task 3 - Add avatar image preloading
  > **Summary:** Extended `assetLoader.ts` and `GrassCanvas.tsx` to preload avatar image URLs from `thankYouData` alongside the grass tile. Avatar images are cached in `markerImageRegistry`, and missing images gracefully fallback to initials.

- [x] task 4 - Build verification
  > **Summary:** Verified the updated marker layer with `npx vitest run` and a full `npm run build`, confirming the map marker renderer compiles cleanly and the existing test suite passes.

---

## Architectural Alignment
These fixes maintain design pillars from `tangram/design/`:
- **Architecture**: Marker positioning remains world-space data layer; DOM capture happens inside React island (no change)
- **Structure**: Component capture logic stays in `markerSceneBuilder.ts`; world math unchanged in `markerPositioning.ts`
- **UI**: Maintains `MapMarkerPin` fidelity by rendering component itself (not re-implementing visuals)
- **Constitution**: Fluent builder pattern preserved; capture layer added before shape drawing layer

---

## Historical Context
Similar issues fixed in `tangram/archive/2026-05-03-00002_grass_canvas/` (asset preloading) and `tangram/archive/2026-05-03-00004_pan_interaction/` (pan offset tracking via store dependency). This debug applies same patterns to marker layer.

