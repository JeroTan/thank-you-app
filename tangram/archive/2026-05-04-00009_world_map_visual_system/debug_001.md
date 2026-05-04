# Debug 001: Organic World Map Background

## Issue
The world-map background feels like simple polygon shapes instead of a professional sea-and-land map. The landmasses need curved coastlines, more recognizable continental silhouettes, and subtle ocean/map detail.

## Fixing Checklist
- [x] task 3 - World map landmasses are too angular and sparse
  > **Summary:** Replace the simple low-point continent polygons in `src/features/map/utils/worldMapSceneBuilder.ts` with richer normalized coastline point sets and draw them using smooth quadratic curves instead of straight `lineTo` edges. Root cause: the initial procedural atlas used a small number of points and closed polygon strokes, making continents read as generic angular shapes.

- [x] task 4 - Background lacks sea/land depth cues
  > **Summary:** Add subtle coastline halos, ocean current/contour curves, and curved meridian/parallel grid lines so the background reads as a professional atlas surface with sea and land layers. Keep the background quiet enough that marker pins and strings remain the primary content.

- [x] task 14 - Verify the refined background still builds cleanly
  > **Summary:** Run focused world-map tests, full tests or typecheck as appropriate, and `npm run build`. Update the feature summary with the debug repair and verification outcome.
