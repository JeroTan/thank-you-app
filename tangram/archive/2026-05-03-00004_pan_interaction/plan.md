# Feature Roadmap: 00004_pan_interaction

## I. Architectural Alignment
- **Architecture Pillar (`tangram/design/architecture.md`)**: Pan coordinates must live in shared store state, while pan math remains in pure utilities and the interaction stays inside the React island boundary.
- **Structure Pillar (`tangram/design/structure.md`)**: Feature-locked hooks and interaction builders stay inside `src/features/map/**`; shared state remains in `src/store/**`; reusable math remains in `src/utils/**`.
- **UI Pillar (`tangram/design/ui.md`)**: The interaction must feel deliberate, with grab and grabbing feedback and a clean base for later marker and string interactions.
- **Constitution (`tangram/constitution.md`)**: Multi-step interaction setup should use a fluent builder pattern instead of scattered listener wiring, and shared interaction state must remain modular and traceable.
- **Historical Pattern (`tangram/archive/2026-05-03-00002_grass_canvas/plan.md`)**: This roadmap extends the existing map foundation instead of replacing it, and follows the same atomic-task and verification format used by the archived features.

## II. Data Model & Schema Changes
- **Shared World Offset Contract**: Introduce a generic `MapWorldOffset` model representing the pan position of the map in world space instead of only a tile-specific origin.
- **Pan Interaction State**: Introduce a lightweight interaction contract describing whether panning is active, which input mode currently owns the gesture, and what cursor state the surface should show.
- **Pan Delta Helpers**: Add pure helpers that translate mouse, touch, trackpad, and keyboard input into world-offset deltas while preserving the minimum `1000x1000` world reference.
- **Derived Tile Origin**: Keep the existing grass tile offset as a derived rendering concern so future markers and strings can depend on world offset rather than tile-specific coordinates.
- **No API or Database Changes**: This feature does not change backend contracts, mock data, or persistence layers.

## III. Atomic Task List

### Shared State & Pan Math
- [x] **Task 1: Promote Tile Origin to Shared World Offset State**
  > **Detailed Summary:** Update `src/store/mapStore.ts` so the map position is represented as a generic shared world-offset contract rather than only a tile-origin value. Add the minimal interaction state needed for active input ownership and cursor feedback, while preserving compatibility with the existing grass renderer through derived tile-origin calculations.

- [x] **Task 2: Add Pure Pan Math and Bounds Helpers**
  > **Detailed Summary:** Extend `src/utils/map/scale.ts` or add a neighboring pan utility under `src/utils/map/**` to normalize drag deltas, wheel-style trackpad deltas, and keyboard step sizes against the existing scale contract. The helpers should preserve the `1000x1000` minimum world reference, keep the current seamless grass wrapping, and expose a future seam for content-driven bounds without hardcoding marker extents now.

- [x] **Task 3: Create a Fluent Pan Interaction Builder**
  > **Detailed Summary:** Add a feature-local builder under `src/features/map/utils/**` that encapsulates pan event binding, listener cleanup, prevent-default strategy, keyboard step configuration, and delta callbacks. The builder should use chained configuration methods so the interaction wiring stays readable and consistent with the fluent builder style already established by the grass-canvas feature.

### Input Handling
- [x] **Task 4: Implement Unified Mouse and Touch Drag Panning**
  > **Detailed Summary:** Add a hook under `src/features/map/hooks/**` to handle mouse drag and grab plus single-touch drag, update shared world offsets during active movement, toggle grab and grabbing feedback, and prevent accidental text or image selection while dragging. The hook should coordinate ownership of the active interaction so mouse and touch paths cannot conflict.

- [x] **Task 5: Extend the Panning Layer for Trackpad and Keyboard**
  > **Detailed Summary:** Expand the same interaction layer to support trackpad panning through wheel-style delta input and keyboard panning through Arrow-key movement. The implementation should translate those inputs into the same shared world-offset updates, prevent page scrolling when the interactive surface is the intended target, and avoid interference with an already active drag session.

### Canvas Integration & Safety
- [x] **Task 6: Integrate Shared Panning into the Grass Canvas**
  > **Detailed Summary:** Update `src/features/map/components/GrassCanvas.tsx` so it attaches the pan interaction layer, reads the shared world offset, derives the wrapped tile origin for rendering, and keeps the map where the user leaves it after release with no momentum. The integration must keep the renderer modular so later markers, strings, and zoom can subscribe to the same world offset without reworking the canvas foundation.

- [x] **Task 7: Add Pan Verification Coverage**
  > **Detailed Summary:** Add targeted verification for the new pan math and handler coordination using the project’s current test pattern where practical, then define the manual checks needed for mouse, touch, trackpad, keyboard, resize persistence, and selection prevention. This task should make the panning slice verifiable without depending on future marker or zoom features.

## IV. Critical Path & Dependencies
- **Primary Sequence**: Task 1 must land first because shared world offset is the contract the rest of the feature depends on. Task 2 depends on Task 1. Task 3 can begin alongside Task 2, but Tasks 4 and 5 should depend on it if the builder becomes the central setup path. Tasks 4 and 5 must complete before Task 6 because the canvas should attach one coherent interaction layer instead of partial handlers. Task 7 should follow the core state and interaction work so verification matches the actual final input model.
- **Blockers**: No external service blockers are expected. The main architectural blocker is avoiding state drift between tile-origin rendering details and the new shared world-offset contract.
- **Risk Focus**: Trackpad prevention logic must not leave the page scrolling when the map is the target, keyboard input must not conflict with active drag sessions, and pan updates must remain smooth enough for the current canvas redraw path.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-PAN-1 | Manual | Mouse drag moves the map, grab and grabbing feedback are correct, and no text or image selection occurs while dragging. |
| Req-PAN-2 | Manual | Single-touch drag pans the map on touch hardware or device emulation without conflicting with the active drag model. |
| Req-PAN-3 | Manual | Trackpad two-finger movement pans the map surface and does not leave the page scrolling when the map is the interaction target. |
| Req-PAN-4 | Manual | Arrow-key input pans the map in predictable steps and the position persists after the key interaction ends. |
| Req-PAN-5 | Integration | The map remains at its released position across redraws and viewport resize, while the grass background still covers the viewport correctly. |
| Req-PAN-6 | Unit | Pure pan helpers return correct offset, wrapping, and keyboard-step results for representative edge cases. |
| Req-PAN-7 | Build/Typecheck | The relevant checks pass without introducing panning-related type or runtime errors. |