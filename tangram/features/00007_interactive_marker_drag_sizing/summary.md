# Feature Summary: 00007_interactive_marker_drag_sizing

## Intent
Make the existing gratitude map markers feel directly interactive and visually meaningful by allowing users to drag markers and by scaling each marker according to the number of received thank-yous.

## Scope
This slice covers count-based marker sizing, variable-size layout spacing, map-world expansion for larger markers, marker hit testing, marker drag, and click-vs-drag classification. It keeps the current canvas-first marker rendering path and does not introduce connection strings, string physics, API changes, or database persistence.

## Strategic Fit
The feature completes the marker interaction and dynamic sizing requirements from `tangram/studies/business-requirements.md` while preserving the canvas, world-offset, and zoom foundations shipped in `2026-05-03-00004_pan_interaction`, `2026-05-03-00005_map_markers`, and `2026-05-03-00006_zoom_interaction`.

## Execution Log
- 2026-05-04: Added count-based marker sizing from `thank_you_id_from.length`, including duplicate IDs, with a softened square-root distribution and a high-count cap.
- 2026-05-04: Extended marker render specs with `thankYouCount`, `sizeMultiplier`, and `widthAtScaleOne`, then rebuilt marker layout to preserve pairwise spacing and expand `worldSize` for larger markers.
- 2026-05-04: Added centralized marker stores for render specs, world size, active marker ID, and drag sessions.
- 2026-05-04: Added marker hit testing, zoom-aware pointer-delta conversion, and a marker interaction hook that makes marker drag take priority over map pan.
- 2026-05-04: Updated the canvas marker renderer to draw variable-size markers, dim non-active markers, and add active marker glow feedback on click.
- 2026-05-04: Wired `GrassCanvas` to initialize marker state once, subscribe to marker interaction state, attach marker dragging, and redraw markers independently from the grass layer.
- 2026-05-04: Added unit coverage for duplicate thank-you counts, size distribution, expanded variable layout, hit testing, wrapped hit testing, and zoom-aware drag conversion.

## Verification
- `npm run test -- --run src/test/utils/map/markerRendering.test.ts`: Passed, 15 tests.
- `npm run test -- --run`: Passed, 37 tests across 3 files.
- `npm run check`: Passed with 0 errors; remaining diagnostics are pre-existing hints/warnings in worker/test utility files outside this feature.
- `npm run build`: Passed; Astro check, Vitest, and Cloudflare-targeted Astro build completed successfully.

## Final Execution Log

### What was Built
Interactive gratitude map markers now scale from each person's received thank-you count, including duplicate `thank_you_id_from` entries, and can be clicked or dragged directly on the canvas. The implementation added variable-size marker layout with expanded world bounds, centralized marker interaction state, wrapped and zoom-aware hit testing, drag-over-pan priority, active marker highlighting, and redraw wiring in `GrassCanvas`.

### Challenges & Fixes
No `debug_*.md` sessions were created for this feature. The main integration risks were resolved in the planned implementation path: marker hit testing accounts for wrapped world copies, pointer deltas are converted through `effectiveScale` so zoomed drags remain accurate, and the pan controller now defers when marker interaction owns the pointer session.

### Design Adherence
The feature followed the approved Tangram design pillars: world-space marker data and interaction state remain separated from canvas drawing, map-specific hooks and utilities stay under `src/features/map/**`, the existing marker visual language is preserved, no new runtime dependency or persistence surface was introduced, and the Cloudflare-compatible check/build flow passed.
