# Feature Roadmap: 00007_interactive_marker_drag_sizing

## I. Architectural Alignment
- **Architecture Pillar (`tangram/design/architecture.md`)**: Marker positions, marker hitboxes, and drag state must remain world-space data separated from canvas drawing. Shared interaction state belongs in `src/store/**`.
- **Structure Pillar (`tangram/design/structure.md`)**: Map-specific interaction hooks, builders, sizing utilities, and renderer changes stay under `src/features/map/**`; reusable coordinate math remains in `src/utils/map/**`.
- **UI Pillar (`tangram/design/ui.md`)**: Markers must preserve the circle-plus-triangle pin visual, avatar-or-initial rendering, frame-color styling, truncated labels, and click/highlight behavior.
- **Stack Pillar (`tangram/design/stack.md`)**: The implementation stays in the Astro React island, uses the current canvas renderer, and avoids new runtime dependencies unless later string physics requires Anime.js integration.
- **Security Pillar (`tangram/design/security.md`)**: The feature continues using the mocked `.ts` data and canvas-safe text/image handling; no new user input or remote persistence is introduced.
- **Deployment Pillar (`tangram/design/deployment.md`)**: The implementation must keep Cloudflare Worker build compatibility and pass the existing check/build flow.
- **Constitution (`tangram/constitution.md`)**: Shared state must stay centralized, feature code must remain feature-centric, and multi-step interaction or scene setup should use fluent builders.
- **Agenda (`tangram/features/00007_interactive_marker_drag_sizing/agenda.md`)**: Duplicate IDs in `thank_you_id_from` count as multiple received thank-yous, marker drag takes priority over map pan, click is only below a movement threshold, and the world expands before marker sizes are compressed.
- **Historical Pattern (`tangram/archive/2026-05-03-00004_pan_interaction/summary.md`)**: Reuse `MapWorldOffset`, `effectiveScale`, pointer capture safeguards, and requestAnimationFrame-style batching.
- **Historical Pattern (`tangram/archive/2026-05-03-00005_map_markers/summary.md`)**: Extend the existing canvas marker spec, wrapping model, and `MarkerSceneBuilder` instead of replacing the renderer.
- **Historical Pattern (`tangram/archive/2026-05-03-00006_zoom_interaction/summary.md`)**: Marker drag and hit testing must respect `effectiveScale` so zoomed maps remain accurate.

## II. Data Model & Schema Changes
- **Mock Data Contract**: No change to `ThankYouDataType`; received count is derived from `thank_you_id_from.length`, including duplicate IDs.
- **Marker Render Spec Extension**: Extend `MapMarkerRenderSpec` with `thankYouCount`, `sizeMultiplier`, and `baseWidthAtScaleOne` or `widthAtScaleOne` so each marker can render and hit-test with its own size.
- **Variable Marker Layout Model**: Extend the layout output to include marker radius or hitbox dimensions, expanded `worldSize`, and stable world positions calculated from variable marker sizes.
- **Interactive Marker State**: Add centralized Nano Store state for marker world positions, active/selected marker ID, and drag session metadata such as pointer ID, origin point, dragged marker ID, and whether movement passed the click threshold.
- **Canvas Marker Scene Input**: Extend `CanvasMarkerSpec` with the resolved marker width/height or size multiplier, plus active/dimmed metadata for click feedback.
- **No API, Database, or Persistence Changes**: Dragged marker positions are session-local MVP state and do not persist across reloads.

## III. Atomic Task List

### Data, Sizing, and Layout
- [x] **Task 1: Derive Count-Based Marker Size Helpers**
  > **Detailed Summary:** Update `src/features/map/utils/markerSize.ts` to compute marker width from each person's received thank-you count using `thank_you_id_from.length`, counting repeated IDs. Add pure helpers such as `resolveThankYouCount`, `resolveMarkerSizeMultiplier`, and `resolveMarkerCanvasSizeForWidth`. The sizing rule should keep zero-count markers at the base size, grow higher-count markers with a softened distribution such as square-root or logarithmic scaling, and enforce sensible min/max caps only after the world expansion strategy has protected spacing.

- [x] **Task 2: Extend Marker Render Specs with Size Metadata**
  > **Detailed Summary:** Update `src/features/map/utils/markerRenderSpec.ts` so each `MapMarkerRenderSpec` includes `thankYouCount`, `sizeMultiplier`, and the marker's reference width. Keep the existing label, picture, frame color, fallback initial, and world-position fields intact. Ensure the spec builder remains pure and accepts options for seed, base width, and sizing limits so tests can verify deterministic output.

- [x] **Task 3: Rebuild Layout for Variable Marker Sizes and Expanded World Bounds**
  > **Detailed Summary:** Update `src/features/map/utils/markerPositioning.ts` so `createStableMarkerWorldPositions` or a new layout helper accepts per-marker sizes instead of a single base width. The layout must keep marker hitboxes separated using pair-aware distance checks, expand ring spacing or world bounds as markers get larger, and calculate `worldSize` from the final extents plus viewport-sized padding. This preserves distance while there is still map space and only relies on size caps as the final clutter guard.

### State and Interaction
- [x] **Task 4: Add Centralized Marker Interaction State**
  > **Detailed Summary:** Extend `src/store/mapStore.ts` with marker layout and interaction atoms/actions. Store initialized marker render specs, current marker world-position overrides, active marker ID, and drag session state. Add actions such as `initializeMapMarkers`, `setActiveMapMarker`, `updateMapMarkerWorldPosition`, and `clearMapMarkerDragSession` so React components and hooks do not mutate layout data ad hoc.

- [x] **Task 5: Add Marker Hit Testing and Coordinate Conversion Utilities**
  > **Detailed Summary:** Add feature-local utilities under `src/features/map/utils/**` to resolve marker viewport hitboxes from world positions, variable marker sizes, `tileOrigin`, `worldSize`, and `effectiveScale`. Include inverse conversion from pointer pixel delta to world delta so dragging respects zoom. Hit testing should choose the topmost or nearest matching marker and handle wrapped marker copies at world boundaries.

- [x] **Task 6: Build a Marker Interaction Hook or Fluent Builder**
  > **Detailed Summary:** Add `src/features/map/hooks/useMarkerInteraction.ts` and, if the setup becomes multi-step, a fluent `markerInteractionBuilder.ts`. Attach pointer listeners to the marker canvas or map surface, perform hit testing on pointer down, and make marker drag take priority over map pan. Use a small movement threshold to classify click versus drag, capture/release pointers safely, batch drag updates with requestAnimationFrame, and prevent a drag release from also firing click/highlight.

- [x] **Task 7: Coordinate Marker Drag with Existing Map Pan**
  > **Detailed Summary:** Update `src/features/map/hooks/usePanInteraction.ts` or `src/features/map/utils/panInteractionBuilder.ts` to respect marker interaction state or an explicit `shouldStartPan` guard. When pointer down starts inside a marker hitbox, map pan must not start; when it starts outside markers, existing mouse, touch, trackpad, and keyboard pan behavior should remain unchanged.

### Canvas Rendering and UI Feedback
- [x] **Task 8: Render Variable-Size Markers on Canvas**
  > **Detailed Summary:** Update `src/features/map/utils/markerSceneBuilder.ts` so `CanvasMarkerSpec` carries per-marker size metadata and `drawMarker` uses that size instead of one shared `resolveMarkerCanvasSize(scaleSnapshot)` result. Preserve the existing frame path, avatar clipping, fallback initial, and label drawing while making label max width and font size derive from each marker's own width.

- [x] **Task 9: Add Active Marker Visual Feedback**
  > **Detailed Summary:** Extend `MarkerSceneBuilder` and `GrassCanvas.tsx` to pass the active marker ID into the draw pipeline. The active marker should receive a clear glow or edge highlight, while non-active markers can be subtly dimmed only when a marker is selected. Since connection strings are not part of this slice, string highlighting remains a future integration point.

- [x] **Task 10: Wire Marker Initialization and Redraw Flow in GrassCanvas**
  > **Detailed Summary:** Update `src/features/map/components/GrassCanvas.tsx` to initialize marker specs/layout once per data or sizing option change, subscribe to marker layout and interaction stores, attach `useMarkerInteraction`, and redraw the marker canvas when marker positions, active selection, zoom, pan, assets, or viewport size change. Keep grass rendering independent so background performance is not coupled to marker drag.

### Verification and Documentation
- [x] **Task 11: Add Focused Unit Coverage for Sizing, Layout, and Hit Testing**
  > **Detailed Summary:** Extend `src/test/utils/map/markerRendering.test.ts` or add adjacent tests for count-based size distribution, duplicate thank-you counting, zero-count minimum sizing, expanded world-size calculations, pairwise marker separation, hitbox selection, wrapped hit testing, and pixel-delta-to-world-delta conversion under zoom.

- [x] **Task 12: Validate Interaction Behavior and Update Tangram Records**
  > **Detailed Summary:** Run targeted Vitest, `npm run check`, and `npm run build`. Manually verify mouse and touch marker dragging, click-vs-drag threshold behavior, map pan still working outside markers, zoomed drag accuracy, and wrapped-boundary dragging. After implementation, update this feature summary with execution notes and any debug records created during the build.

## IV. Critical Path & Dependencies
- **Primary Sequence**: Tasks 1-3 establish the data and layout contract and must land before rendering or hit testing changes. Task 4 centralizes state and should land before Tasks 6-10. Task 5 depends on Tasks 1-4 because hitboxes require variable sizes and current marker positions. Task 6 depends on Task 5, and Task 7 must coordinate with Task 6 so marker drag and map pan do not compete. Tasks 8-10 complete the visible behavior after the interaction contract is stable. Tasks 11-12 verify the finished slice.
- **Blockers**: No backend, API, or dependency blockers are expected. The main implementation blocker is resolving pointer-event priority between the existing pan controller and the new marker drag controller without causing duplicate pointer sessions.
- **Risk Focus**: Variable marker sizes can accidentally crowd labels, wrapped hit testing can select the wrong repeated copy, and drag math can drift when zoomed unless all pointer deltas use `effectiveScale`.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-IMS-1 | Unit | `thank_you_id_from.length` is used for count-based sizing, including duplicate sender IDs. |
| Req-IMS-2 | Unit | Marker size helpers keep zero-count markers at the minimum/base size and cap high-count markers within the approved visual range. |
| Req-IMS-3 | Unit | Variable-size layout preserves pairwise marker separation and expands `worldSize` when larger markers need more room. |
| Req-IMS-4 | Unit | Hit testing resolves the expected marker from viewport coordinates, including wrapped world-boundary cases. |
| Req-IMS-5 | Integration/Manual | Pointer down on a marker starts marker interaction and does not start map pan. |
| Req-IMS-6 | Integration/Manual | Pointer down outside markers still supports existing mouse, touch, trackpad, and keyboard map pan behavior. |
| Req-IMS-7 | Manual | Dragging a marker updates its world position smoothly and keeps the marker visible/interactable while panning and zooming. |
| Req-IMS-8 | Manual | A below-threshold pointer release selects/highlights the marker, while a real drag does not trigger click selection on release. |
| Req-IMS-9 | Manual | Larger thank-you-count markers remain readable, do not visually clutter the initial map, and the map world expands before sizes are compressed. |
| Req-IMS-10 | Build/Typecheck | Targeted Vitest, `npm run check`, and `npm run build` complete without marker-related regressions. |
