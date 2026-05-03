# Feature Roadmap: 00002_grass_canvas

## I. Architectural Alignment
- **Architecture Pillar (`tangram/design/architecture.md`)**: The canvas foundation remains inside the interactive island model, with rendering logic isolated from page scaffolding and shared state prepared for future pan and zoom behaviors.
- **Stack Pillar (`tangram/design/stack.md`)**: This roadmap applies a user-approved delta to the current stack direction by using native HTML canvas for the rendering surface while explicitly excluding PixiJS for this feature.
- **UI Pillar (`tangram/design/ui.md`)**: The repeating green sprite background remains a first-class requirement, now implemented as a canvas-driven tile field instead of a CSS-only surface.
- **Structure Pillar (`tangram/design/structure.md`)**: Feature-locked canvas components, hooks, and builders stay inside `src/features/map/**` or a dedicated feature-local canvas sublayer, while reusable scale and visual helpers remain in `src/store/**` and `src/utils/**`.
- **Security Pillar (`tangram/design/security.md`)**: Asset loading stays local and deterministic, avoiding ad-hoc remote sprite resolution for the background layer.
- **Deployment Pillar (`tangram/design/deployment.md`)**: The implementation stays compatible with Astro on Cloudflare Workers because the canvas behavior is client-side and does not alter deployment shape.
- **Constitution (`tangram/constitution.md`)**: The feature must remain modular, preserve centralized shared state, and apply the Fluent Interface rule to any complex canvas configuration or scene-building helpers.
- **Historical Pattern (`tangram/archive/2026-05-03-00001_mock_data/plan.md`)**: The roadmap follows the same atomic task structure, explicit dependencies, and verification format used by the prior archived feature.

## II. Data Model & Schema Changes
- **Global Scale Model**: Introduce a shared viewport scale contract where `scale = 1.0` maps to a `1000x1000` design reference, with derived values recalculated from live viewport dimensions.
- **Asset Readiness State**: Introduce a lightweight loading contract that tracks whether required canvas assets have been decoded and are safe to render.
- **Canvas Scene Configuration**: Define a modular scene configuration object for tile size, repeat cadence, pixel ratio handling, and fallback behavior, expressed through a fluent builder when configuration logic becomes multi-step.
- **No API or Database Changes**: This feature does not change external contracts, mock data, or persistence layers.

## III. Atomic Task List

### Canvas Foundation
- [x] **Task 1: Add a Viewport-Filling Canvas Surface**
  > **Detailed Summary:** Create the feature-local canvas entry surface inside the map visualization flow so the app can render a native HTML canvas that covers the visible viewport on desktop and mobile. Touch the feature component entry points under `src/features/map/components/` and the page mounting path in `src/pages/index.astro` only as needed to slot in the new background layer without introducing markers or string logic yet.

- [x] **Task 2: Implement Repeating Grass Tile Rendering**
  > **Detailed Summary:** Wire `src/assets/sprite/grass_square_tile.png` into the canvas rendering layer and draw it as a repeated tile pattern that fills the entire surface. The implementation should keep the pattern anchored to the future map coordinate system so later pan and zoom work can adjust the draw origin instead of replacing the background approach.

- [x] **Task 3: Introduce an Asset Preload Gate**
  > **Detailed Summary:** Add a focused asset-loading module that preloads and decodes the grass tile before first visible render, then gates scene activation on readiness. The loader should remain reusable for later sprite assets and avoid partial paint states by keeping the scene in a loading state until required assets are ready.

### Shared State & Fluent Configuration
- [x] **Task 4: Create the Global Scale Contract**
  > **Detailed Summary:** Add shared scale state under `src/store/**` that defines the viewport scale against a `1000x1000` reference frame and recalculates on resize. The public contract should be small and stable so future markers, strings, and interaction systems can consume the same normalized scale values without feature-specific duplication.

- [x] **Task 5: Add a Fluent Canvas Scene Builder**
  > **Detailed Summary:** Create a modular canvas scene or configuration builder under the map feature and related utilities so canvas setup reads as a chained sequence instead of scattered imperative steps. The builder should encapsulate concerns like sizing, device-pixel-ratio handling, tile pattern registration, and readiness hooks while returning `this` or the chained object to satisfy the constitution’s fluent interface requirement.

### Integration Safety
- [x] **Task 6: Prepare a Loader-First Render Flow**
  > **Detailed Summary:** Ensure the mounted visualization surface renders a predictable loading experience before the grass scene appears, then hands off cleanly to the canvas background once assets are ready. This task should define the empty/loading state behavior now so later marker and string layers can plug into the same startup contract instead of inventing separate loaders.

- [x] **Task 7: Preserve Modularity for Future Interaction Layers**
  > **Detailed Summary:** Keep the canvas background isolated from future marker and connection rendering by using clear component boundaries, exported public APIs, and pure helpers for resize math and tile origin calculations. Document the boundaries through filenames and module placement so future execution can extend the feature without coupling canvas setup to interaction logic.

## IV. Critical Path & Dependencies
- **Primary Sequence**: Task 1 must land before any rendering work because the canvas surface establishes the owning component boundary. Task 2 depends on Task 1. Task 3 can begin alongside Task 2 but must complete before Task 6. Task 4 should complete before Task 5 so the scene builder can consume a stable scale contract. Task 6 depends on Tasks 2 and 3. Task 7 is enforced throughout but should be validated after the core surface, loader, and scale pieces exist.
- **Blockers**: No external service blockers are expected. The only architectural blocker is avoiding drift back into SVG- or PixiJS-specific assumptions while this slice is defined as native canvas only.
- **Risk Focus**: Resize math, device-pixel-ratio handling, and tile anchoring must be resolved early so later panning and zooming do not require a rewrite of the background layer.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-1 | Manual viewport check | The grass canvas fills the visible viewport on desktop and mobile without exposed empty gaps. |
| Req-2 | Manual asset-load check | The scene remains in a loading state until `grass_square_tile.png` is decoded and then renders without flashing partial tiles. |
| Req-3 | Manual resize test | Resizing the viewport recalculates the shared scale contract and keeps the canvas coverage correct. |
| Req-4 | Code review | Canvas-specific logic stays modular, with feature-local components and reusable utilities/state placed in the constitution-approved directories. |
| Req-5 | Code review | Any multi-step canvas configuration path uses a fluent builder or equivalent chained interface rather than scattered setup mutations. |
| Req-6 | Build validation | The Astro build completes without introducing canvas-related runtime or type errors. |