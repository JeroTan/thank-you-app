# Feature Roadmap: 00006_zoom_interaction

## I. Architectural Alignment
- **Architecture Pillar (`tangram/design/architecture.md`)**: State management (zoom level) is centralized in `src/store/mapStore.ts`. Math is separated into `src/utils/map/scale.ts`.
- **UI Pillar (`tangram/design/ui.md`)**: Zoom controls will be basic overlay buttons consistent with map UI standards.

## II. Data Model & Schema Changes
- `mapZoomStore`: A new Nano Store atom storing a number (default `1.0`, min `0.25`, max `4.0`).
- The `MapScaleSnapshot` type will be updated to include the `userZoom` multiplier and expose an `effectiveScale` (scale * userZoom) that rendering and panning logic will consume.

## III. Atomic Task List

### State & Core Math
- [x] **Task 1: Add Zoom State and Math Helpers**
  > **Detailed Summary:** In `src/store/mapStore.ts`, add `mapZoomStore`. In `src/utils/map/scale.ts`, update `createMapScaleSnapshot` to accept a zoom level, and calculate `effectiveScale = scale * userZoom`. Update `resolveWorldOffsetFromPixelDelta` and other scale-dependent math to use `effectiveScale` so that panning speed matches the zoomed level.

### Interaction Logic
- [x] **Task 2: Integrate Wheel, Keyboard, and Pinch Zoom**
  > **Detailed Summary:** Update `src/features/map/hooks/usePanInteraction.ts` (or create a new `useZoomInteraction.ts` hook) to handle three inputs: 1) mouse wheel events (with `ctrlKey` for zoom), 2) keyboard `+`/`-` keys, and 3) multi-touch pinch gestures (calculating the distance delta between `e.touches[0]` and `e.touches[1]`). These inputs should adjust the `mapZoomStore` smoothly. Add a `zoomTo` helper function that clamps zoom bounds (e.g., 0.25x to 4x) and respects an optional zoom-to-pointer-center logic.

### UI Layer
- [x] **Task 3: Build Zoom UI Controls**
  > **Detailed Summary:** Create `src/features/map/components/ZoomControls.tsx`. A simple floating island component in the bottom-right corner with `+` and `-` buttons that trigger zoom changes. Mount this component inside `GrassCanvas.tsx` or `pages/index.astro` as a sibling overlay to the canvas.

## IV. Critical Path & Dependencies
- **Sequence**: Task 1 (State & Math) must be completed first because the canvas scaling and panning rely on `effectiveScale`. Task 2 (Interaction) and Task 3 (UI Controls) depend on Task 1.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-ZOOM-1 | Manual | Clicking `+` and `-` UI buttons increases and decreases the map size visibly. |
| Req-ZOOM-2 | Manual | Panning speed remains aligned with the mouse cursor, even when zoomed in or out. |
| Req-ZOOM-3 | Manual | Pinch-to-zoom on a touch screen or trackpad smoothly scales the map without causing erratic jumps. |
| Req-ZOOM-4 | Integration | `effectiveScale` calculation tests pass with expected multiplier bounds. |