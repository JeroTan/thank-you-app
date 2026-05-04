# Feature Summary: 00008_swinging_marker_strings

## Intent
Make the gratitude map relationships feel tangible by drawing soft rope-like strings between related markers, letting those strings swing while markers move, and making hovered relationships visually legible.

## Scope
This slice covers connection derivation from `thank_you_id_from`, duplicate and reciprocal relationship collapse, mutual-relationship metadata, rope-style canvas rendering, string swing simulation during marker drag, hover highlighting for the marker and its strings, and a small click panel for pinning a marker steady. It does not add rope cutting, relationship editing, backend persistence, real API changes, or permanent marker pin state.

## Strategic Fit
The feature completes the next visible relationship layer from `tangram/studies/business-requirements.md`: polylines/strings between related markers, oscillating string physics during drag, mutual connection styling, and marker connection highlighting. It builds on the existing map foundation for panning, zooming, marker wrapping, count-based marker sizing, and direct marker dragging.

## Execution Log
- 2026-05-04: Agenda validated for one visible string per unique marker pair, including duplicate sender collapse and reciprocal A-B/B-A collapse into one visible string.
- 2026-05-04: Technical roadmap initialized from the active agenda, current marker interaction code, Tangram design pillars, and archived pan/marker/zoom patterns.
- 2026-05-04: Added normalized marker connection specs that collapse duplicate sender IDs and reciprocal relationships while preserving mutual metadata.
- 2026-05-04: Added pure rope physics helpers, centralized string/hover/pin state, and a requestAnimationFrame string physics hook that wakes connected ropes during marker drag and nudges unpinned connected markers.
- 2026-05-04: Added a canvas string layer behind markers with soft curves, mutual two-color gradients, dimming, and hover glow for the hovered marker's strings.
- 2026-05-04: Updated marker interaction to track hover, open a click panel, and support pin/unpin controls for steady markers.
- 2026-05-04: Wired `GrassCanvas` to initialize connections, run string physics, draw strings between grass and markers, pass hover state into marker rendering, and show the marker pin panel.
- 2026-05-04: Added unit coverage for duplicate collapse, reciprocal collapse, missing/self-link handling, rope initialization, rope swing, marker nudging, and pinned marker stability.
- 2026-05-04: Applied `debug_001.md` to make the marker pin panel controls reliably clickable above map pointer handling, add visible pinned-state feedback, and shift string render anchors to the bottom tip of each marker pin.

## Verification
- `npm run test -- --run src/test/utils/map/markerConnections.test.ts`: Passed, 3 tests.
- `npm run test -- --run src/test/utils/map/stringPhysics.test.ts`: Passed, 4 tests.
- `npm run test -- --run src/test/utils/map/markerConnections.test.ts src/test/utils/map/stringPhysics.test.ts`: Passed, 7 tests.
- `npm run check`: Passed with 0 errors; remaining diagnostics are pre-existing hints in `src/cloudflare/worker.ts` and `src/test/utils/visual/color.test.ts`.
- `npm run test -- --run`: Passed, 44 tests across 5 files.
- `npm run build`: Passed; Astro check, Vitest, and Cloudflare-targeted Astro build completed successfully.
- Local dev server: Started at `http://127.0.0.1:4321/` and returned HTTP 200.
- `debug_001.md`: `npm run test -- --run src/test/utils/map/markerConnections.test.ts src/test/utils/map/stringPhysics.test.ts src/test/utils/map/markerRendering.test.ts` passed, 22 tests.
- `debug_001.md`: `npm run check` passed with 0 errors; remaining diagnostics are pre-existing hints in `src/cloudflare/worker.ts` and `src/test/utils/visual/color.test.ts`.
- `debug_001.md`: `npm run build` passed; Astro check, Vitest, and Cloudflare-targeted Astro build completed successfully.

## Final Execution Log

### What was Built
- **Normalized Connections**: Derived visible undirected string specs from `thank_you_id_from`, collapsing duplicate and reciprocal relationships while preserving `isMutual` metadata.
- **Rope Simulation**: Implemented a soft-physics simulation for strings that wakes and swings during marker drag, nudging connected unpinned markers before settling.
- **Visuals & Feedback**: Added a canvas string layer with curved segments, two-color mutual gradients, and marker/string glow on hover.
- **Pinning Mechanism**: Introduced a marker pin panel for session-local pinning, allowing markers to resist physics-driven movement.

### Challenges & Fixes
- **Pointer Capture**: Encountered an issue where map pan listeners intercepted marker panel clicks; resolved in `debug_001.md` by hardening pointer stop propagation and target checks.
- **Anchor Offsets**: Corrected string render anchors from marker centers to pin tips by applying size-based offsets in the rendering path (documented in `debug_001.md`).

### Design Adherence
- **Architecture**: Separated string state from drawing logic; used Nano Stores for shared interaction state.
- **Structure**: Kept map connection logic and physics helpers under `src/features/map/**`.
- **UI**: Maintained visual hierarchy with strings behind markers and consistent hover/glow states.
- **Stack**: Remained within the Astro React island using Vanilla CSS and existing dependencies.
- **Security**: Bound data safely and introduced no new API surface or persistent state.
- **Deployment**: Verified the build path through `npm run build` targeting Cloudflare.
- **Constitution**: Shared state remains centralized and map feature code remains feature-centric.

