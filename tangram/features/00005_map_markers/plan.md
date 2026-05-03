# Feature Roadmap: 00005_map_markers

## I. Architectural Alignment
- **Architecture Pillar (`tangram/design/architecture.md`)**: Marker positions must be world-space data derived separately from rendering, while canvas drawing remains inside the React island and shared state continues to live in `src/store/**`.
- **Structure Pillar (`tangram/design/structure.md`)**: Marker-specific builders, layout logic, and renderer utilities stay in `src/features/map/**`, while reusable map math remains in `src/utils/**` and shared map state remains in `src/store/**`.
- **UI Pillar (`tangram/design/ui.md`)**: The marker visual must remain faithful to the pin design system, including the colored frame, avatar or fallback initial, and truncated label treatment.
- **Constitution (`tangram/constitution.md`)**: Complex scene or sprite setup must remain modular and use fluent builder patterns where configuration becomes multi-step.
- **Historical Pattern (`tangram/archive/2026-05-03-00001_mock_data/plan.md`)**: The roadmap continues to use the mock data contract as the source of truth for marker payloads and keeps planning atomic and verification-driven.
- **Historical Pattern (`tangram/archive/2026-05-03-00002_grass_canvas/plan.md`)**: The roadmap extends the current canvas-first rendering base rather than replacing it.
- **Historical Pattern (`tangram/archive/2026-05-03-00004_pan_interaction/plan.md`)**: The roadmap treats `MapWorldOffset` and the current panning contract as the positioning foundation for marker rendering.
- **Legacy Product Note (`docs/raw-query.txt`)**: The original product note defines markers as a pin with picture-or-initial content and a truncated name label, which this slice now realizes on the map without yet introducing connections or marker-size weighting.

## II. Data Model & Schema Changes
- **Shared Marker Render Spec**: Introduce a canvas-friendly marker render spec that maps each `ThankYouDataType` item into a stable marker payload containing id, world position, viewport-relative base size, frame color, picture source, fallback initial, and truncated label content.
- **Marker Layout Model**: Introduce a world-space position contract that is computed before first visible render and remains stable for the session unless the feature is explicitly reset.
- **Marker Canvas Scene Inputs**: Introduce a scene input model for marker sprite caching, label measurement, and world-to-viewport conversion so the renderer can draw markers in canvas without depending on React DOM components.
- **Derived Marker Size Rule**: Base marker width is derived from the smaller viewport dimension at scale `1.0`, targeting approximately `5%` of that dimension, which yields about `50` in the `1000x1000` reference viewport.
- **No API or Database Changes**: This feature does not change backend contracts, mock data schemas, or persistence layers.

## III. Atomic Task List

### Marker Spec & Layout
- [ ] **Task 1: Define the Shared Marker Render Spec**
  > **Detailed Summary:** Add a feature-local marker render spec that converts entries from `src/components/mockdata/thankYouData.ts` into canvas-ready marker data. The spec should include the data needed to draw the pin body, avatar or fallback initial, and label text, while remaining independent from a specific renderer so future fallback or alternate renderers can consume the same payload.

- [ ] **Task 2: Build Stable Marker Positioning Logic**
  > **Detailed Summary:** Add pure layout utilities under `src/features/map/utils/**` or `src/utils/map/**` that compute world-space marker positions before the visible scene appears and keep them stable for the session. The layout should respect the current `1000x1000` reference scale, apply spacing rules to avoid visible overlap at the base marker size, and leave a future seam for content-aware distribution without implementing thank-you-based scaling yet.

- [ ] **Task 3: Derive the Base Marker Size Contract**
  > **Detailed Summary:** Add reusable size helpers that resolve base marker width from the smaller viewport dimension at scale `1.0`, targeting approximately `5%` of that dimension. The contract should preserve the current viewport-scaling model so markers remain visually consistent across desktop and mobile without introducing count-based or thank-you-based resizing yet.

### Canvas Rendering
- [ ] **Task 4: Create a Marker Canvas Scene Builder**
  > **Detailed Summary:** Add a fluent marker scene or sprite builder under `src/features/map/utils/**` that encapsulates marker sprite setup, avatar preparation, fallback-initial drawing, and label measurement or truncation rules. The builder should treat `src/components/visual/MapMarkerPin.tsx` as the visual reference while producing canvas-drawing inputs instead of mounting the React component directly.

- [ ] **Task 5: Add a Marker Canvas Layer to the Map Surface**
  > **Detailed Summary:** Extend the current map surface with a dedicated marker canvas layer or equivalent modular canvas rendering path above the grass background. The marker layer must consume the shared world offset, translate world-space marker positions into viewport-space draw positions, and render the full marker visual in canvas without breaking the existing background or panning behavior.

- [ ] **Task 6: Render Mock Data Markers with Correct Visual Variants**
  > **Detailed Summary:** Use the shared marker render spec and the current mock data to render all markers with the correct `frame_color`, avatar-or-initial behavior, and label content. This task must verify that picture and no-picture markers render correctly and that labels are truncated or clipped consistently when they exceed the intended width.

### Safety & Verification
- [ ] **Task 7: Preserve Modularity and Add Marker Verification Coverage**
  > **Detailed Summary:** Add targeted verification for the marker size helpers, position-generation logic, and world-to-viewport conversion using the current test pattern where practical, then define the manual checks needed for render correctness, non-overlap, viewport-relative sizing, and pan alignment. This task should keep the marker layer modular so strings and marker interactions can be added later without replacing the marker renderer.

## IV. Critical Path & Dependencies
- **Primary Sequence**: Task 1 must land first because the shared marker render spec is the contract the rest of the feature depends on. Task 2 depends on Task 1 because the layout should produce stable world-space positions for the render spec. Task 3 can proceed alongside Task 2 but should complete before Task 4 so the marker scene builder targets the right base size contract. Task 4 must complete before Tasks 5 and 6 because the canvas layer depends on a stable marker drawing pipeline. Task 6 depends on Tasks 1 through 5. Task 7 follows once the renderer path is in place so verification matches the actual marker implementation.
- **Blockers**: No external service blockers are expected. The primary architectural blocker is keeping the marker render spec and world-space layout independent from the renderer so the early canvas experiment does not hard-wire future choices.
- **Risk Focus**: Marker position overlap, label truncation in canvas, and keeping marker coordinates aligned with the shared world offset during pan are the main early risks.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-MARK-1 | Manual | All mock-data markers render on the map surface with the expected count and remain visible after the scene loads. |
| Req-MARK-2 | Manual | Markers with pictures render avatars correctly, and markers without pictures render the fallback initial correctly. |
| Req-MARK-3 | Manual | Marker labels render in the intended location and truncate or clip correctly when names exceed the available width. |
| Req-MARK-4 | Manual | The base marker size tracks approximately `5%` of the smaller viewport dimension at scale `1.0`, yielding about `50` width in a `1000x1000` viewport. |
| Req-MARK-5 | Integration | Marker positions remain aligned with the current pannable world offset and move correctly as the map pans. |
| Req-MARK-6 | Unit | Marker size and layout helpers return stable, non-overlapping, and world-space-consistent results for representative edge cases. |
| Req-MARK-7 | Build/Typecheck | The relevant checks pass without introducing marker-related type or runtime errors. |