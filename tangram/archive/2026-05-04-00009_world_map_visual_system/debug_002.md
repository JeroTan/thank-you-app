# Debug 002: Wrapped String Copy Selection

## Issue
When the map is panned away from visible markers, some strings stretch across the viewport like web lines. This happens because each rope point is wrapped independently into the nearest world copy, so a single string can accidentally connect mismatched repeated-world copies.

## Fixing Checklist
- [x] task 4 - Strings wrap each rope point independently
  > **Summary:** Update `src/features/map/utils/stringSceneBuilder.ts` so each string resolves one consistent wrapped viewport copy for the whole rope. Convert all rope points to raw viewport coordinates, choose a shared world-copy offset, and apply that same offset to every point instead of calling marker-style wrapping per point. Root cause: marker wrapping is safe for individual markers but unsafe for multi-point strings.

- [x] task 14 - Offscreen string copies should not render as viewport-spanning artifacts
  > **Summary:** Add visibility filtering so a string copy only draws when its consistent wrapped bounds and at least one endpoint are near the viewport. Add focused unit coverage for consistent string viewport wrapping and verify with focused tests, `npm run check`, and `npm run build`.
