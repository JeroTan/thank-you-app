# Feature Roadmap: 00008_swinging_marker_strings

## I. Architectural Alignment
- **Architecture Pillar (`tangram/design/architecture.md`)**: String endpoints, rope state, hover state, and pinned marker state must remain world-space data separated from canvas drawing. Shared interaction state belongs in `src/store/**` through Nano Stores.
- **Structure Pillar (`tangram/design/structure.md`)**: Map-specific connection derivation, rope simulation, hit/highlight helpers, hooks, and scene builders stay under `src/features/map/**`. Any Anime.js adapter introduced for motion orchestration belongs in `src/lib/**`.
- **UI Pillar (`tangram/design/ui.md`)**: Strings render as visual connection lines, mutual relationships use two-color gradients, and hover/click states must highlight the marker plus its connected strings without disrupting the existing marker pin visual.
- **Stack Pillar (`tangram/design/stack.md`)**: The implementation stays in the Astro React island, keeps the current canvas renderer, uses the installed Anime.js dependency for string swing/settle motion where useful, and avoids new runtime dependencies.
- **Security Pillar (`tangram/design/security.md`)**: The feature uses mocked `.ts` data only, binds text safely in React overlays, and introduces no new user input, remote persistence, or API surface.
- **Deployment Pillar (`tangram/design/deployment.md`)**: The finished slice must keep the Cloudflare Worker build path passing through `npm run check` and `npm run build`.
- **Constitution (`tangram/constitution.md`)**: Shared state remains centralized, map feature code remains feature-centric, complex simulation/render setup should use fluent builders, and documentation updates must be incremental.
- **Agenda (`tangram/features/00008_swinging_marker_strings/agenda.md`)**: Draw one visible rope per unique marker pair, collapse duplicate and reciprocal relationships, preserve mutual metadata, make ropes soft and fixed-rest-length, add hover glow for marker plus connected strings, and support a click panel for pinning a marker steady.
- **Historical Pattern (`tangram/archive/2026-05-03-00004_pan_interaction/summary.md`)**: Reuse world-offset state, `effectiveScale`, pointer-capture safeguards, and requestAnimationFrame batching.
- **Historical Pattern (`tangram/archive/2026-05-03-00005_map_markers/summary.md`)**: Preserve canvas marker rendering, marker wrapping, image preloading behavior, and builder-style scene setup.
- **Historical Pattern (`tangram/archive/2026-05-03-00006_zoom_interaction/summary.md`)**: All string endpoints, hit/highlight behavior, and drag physics must respect `effectiveScale` and remain stable while zoomed.

## II. Data Model & Schema Changes
- **Connection Spec**: Add a feature-local `MapMarkerConnectionSpec` describing a visible undirected marker pair: stable key, marker A ID, marker B ID, original directed thank-you entries, sender/recipient IDs, `isMutual`, and the frame colors needed for gradient rendering.
- **Connection Normalization**: Derive specs from `thank_you_id_from`; collapse duplicate sender IDs per recipient, collapse reciprocal A-B/B-A relationships into one visible string, skip missing marker IDs, and ignore self-links unless later requested.
- **Rope Simulation State**: Add world-space rope point data, rest length, velocity, damping/settle metadata, and dirty/active flags for strings connected to dragged markers.
- **Hover and Pin State**: Extend map state with hovered marker ID, hovered/active connection IDs as derived state or explicit atoms, pinned marker IDs, and a small marker panel state for pin/unpin controls.
- **Canvas Scene Input**: Add connection canvas specs containing resolved endpoint positions, rope control points, colors, highlighted status, mutual-gradient metadata, and dimming status.
- **No Backend Changes**: No API, database, authentication, or persistence changes. String physics, hover, and pinned markers are session-local UI state.

## III. Atomic Task List

### Connection Data and Relationship Rules
- [x] **Task 1: Derive Unique Marker Connection Specs**
  > **Detailed Summary:** Add `src/features/map/utils/markerConnectionSpec.ts` to transform `ThankYouDataType[]` and `MapMarkerRenderSpec[]` into normalized visible connection specs. The helper must collapse duplicate sender IDs for the same recipient, merge reciprocal A-B/B-A entries into one undirected visible string, preserve mutual metadata, skip missing IDs and self-links, and expose stable connection keys that remain deterministic for tests and rendering.

- [x] **Task 2: Add Connection Normalization Unit Coverage**
  > **Detailed Summary:** Extend `src/test/utils/map/markerRendering.test.ts` or add `src/test/utils/map/markerConnections.test.ts` to verify duplicate sender collapse, reciprocal A-B/B-A collapse, missing marker skipping, self-link ignoring, stable key generation, and `isMutual` metadata. Tests should prove marker size counting remains separate from visible string counting.

### Rope Physics and State
- [x] **Task 3: Build Rope Simulation Helpers**
  > **Detailed Summary:** Add `src/features/map/utils/stringPhysics.ts` with pure helpers for initializing rope segments between two world-space marker anchors, resolving rest length, applying drag impulses, integrating velocity with damping, enforcing fixed-rest-length constraints, and settling the rope. The model should keep the dragged marker anchored to pointer-controlled state while connected unpinned markers and intermediate rope points can swing softly.

- [x] **Task 4: Add Centralized String Interaction State**
  > **Detailed Summary:** Extend `src/store/mapStore.ts` with atoms and actions for marker connection specs, rope simulation snapshots, hovered marker ID, pinned marker IDs, and marker panel state. Add actions such as `initializeMapMarkerConnections`, `setHoveredMapMarker`, `togglePinnedMapMarker`, `setMapMarkerPanel`, and `updateMapStringPhysicsSnapshot` so React components and hooks do not mutate string state ad hoc.

- [x] **Task 5: Create a Fluent String Physics Controller**
  > **Detailed Summary:** Add `src/features/map/hooks/useStringPhysics.ts` and, if setup becomes multi-step, `src/features/map/utils/stringPhysicsBuilder.ts`. The controller should run requestAnimationFrame only while strings are active or settling, wake connected strings when a marker is dragged, respect pinned markers as immovable anchors, update connected unpinned marker world positions only through store actions, and remain stable across pan, zoom, and world wrapping. If Anime.js is needed for easing impulses or settle timing, introduce a small wrapper in `src/lib/anime.ts`.

### Canvas Rendering and Visual Feedback
- [x] **Task 6: Render Strings Behind Markers**
  > **Detailed Summary:** Add a connection rendering path, either through a new `StringSceneBuilder` under `src/features/map/utils/stringSceneBuilder.ts` or a clearly separated string phase in `MarkerSceneBuilder`. Draw strings before markers so pins remain visually dominant. Convert world endpoints and rope points through the existing marker positioning/wrapping math, use `effectiveScale`, and support smooth curves instead of rigid straight segments.

- [x] **Task 7: Style Mutual, Hovered, and Dimmed Strings**
  > **Detailed Summary:** Extend connection rendering so normal strings are soft readable lines, mutual strings can render a two-color gradient from the connected markers' frame colors, hovered-marker strings glow, and unrelated strings can dim when a marker is hovered or selected. The hovered marker itself should receive a visible glow distinct from the existing click/active state without changing the marker pin shape.

- [x] **Task 8: Wire Hover Detection for Marker and String Highlighting**
  > **Detailed Summary:** Update `src/features/map/hooks/useMarkerInteraction.ts` and `src/features/map/utils/markerHitTesting.ts` as needed to set hovered marker state on pointer move when no drag is active, clear hover on leave/cancel, and prevent hover flicker during drag. The highlight rule is marker-only plus its connected strings; linked marker pins should not glow unless separately hovered or selected.

### Pin Panel and Interaction Coordination
- [x] **Task 9: Add Marker Pin Panel Controls**
  > **Detailed Summary:** Add a compact feature-local React overlay component such as `src/features/map/components/MarkerPinPanel.tsx`. Clicking a marker should open or update the panel near the marker using viewport coordinates derived from world position, with a clear pin/unpin control. The panel must use the 4px/8px spacing system, stay within the viewport, avoid nested cards, and safely reflect pinned state without persisting it.

- [x] **Task 10: Coordinate Drag, Pinning, and Rope Motion**
  > **Detailed Summary:** Update marker drag flow so dragging a marker wakes connected rope physics, pinned markers resist physics-driven movement, directly dragged markers still follow the pointer, and releasing a drag allows strings to swing and settle. Ensure map pan still works outside markers, click-vs-drag behavior still works, zoomed drag remains accurate, and wrapped-boundary dragging does not snap strings across the map.

### Integration, Documentation, and Verification
- [x] **Task 11: Wire Initialization and Redraw Flow in GrassCanvas**
  > **Detailed Summary:** Update `src/features/map/components/GrassCanvas.tsx` to initialize connection specs after marker specs exist, attach the string physics hook, add or reuse a canvas layer for string rendering, pass hover/active/pinned state into marker and string rendering, and redraw strings when marker positions, rope snapshots, hover state, zoom, pan, or world size changes. Keep grass rendering independent from string animation.

- [x] **Task 12: Validate and Update Tangram Records**
  > **Detailed Summary:** Run focused unit tests for connection derivation and physics helpers, then run the marker/map test suite, `npm run check`, and `npm run build`. Manually verify marker hover glow, connected string glow, duplicate/reciprocal collapse, marker drag swing, pinned marker steadiness, map pan outside markers, zoomed interactions, and world-boundary wrapping. Update `summary.md` with execution notes and any debug records created.

## IV. Critical Path & Dependencies
- **Primary Sequence**: Tasks 1-2 establish the connection contract. Tasks 3-5 establish physics and shared state. Tasks 6-8 make strings visible and highlightable. Tasks 9-11 wire the user-facing interaction and redraw flow. Task 12 verifies the slice.
- **Blockers**: There is no backend or dependency blocker; Anime.js is already installed. The main implementation risk is balancing direct marker drag against rope physics so dragging feels responsive while connected strings still swing.
- **Risk Focus**: Reciprocal relationship collapse can accidentally lose mutual metadata, dense connections can become visually noisy, wrapped endpoints can choose the wrong world copy, and physics can become expensive if every string animates continuously instead of waking only affected strings.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-SMS-1 | Unit | `thank_you_id_from` derives one visible string per unique marker pair. |
| Req-SMS-2 | Unit | Duplicate sender IDs collapse to one visible string while count-based marker sizing remains unchanged. |
| Req-SMS-3 | Unit | Reciprocal A-B/B-A relationships collapse to one visible string with `isMutual` metadata preserved. |
| Req-SMS-4 | Unit | Missing sender IDs and self-links do not create visible strings or runtime errors. |
| Req-SMS-5 | Unit | Rope helpers preserve a fixed-rest-length feel, damp velocity, and settle without producing invalid coordinates. |
| Req-SMS-6 | Integration/Manual | Dragging a marker makes connected strings swing softly while the dragged marker follows the pointer. |
| Req-SMS-7 | Integration/Manual | Pinned markers stay steady against physics-driven movement while connected unpinned markers may respond. |
| Req-SMS-8 | Manual | Hovering a marker highlights that marker and its connected strings only. |
| Req-SMS-9 | Manual | Mutual strings render as a single readable connection with two-color styling. |
| Req-SMS-10 | Manual | Map pan, marker drag, click selection, hover, and pin panel controls do not conflict. |
| Req-SMS-11 | Manual | Strings remain stable under zoom and wrapped-world panning. |
| Req-SMS-12 | Build/Typecheck | Focused Vitest, `npm run check`, and `npm run build` pass without map-related regressions. |
