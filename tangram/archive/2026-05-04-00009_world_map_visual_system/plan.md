# Feature Roadmap: 00009_world_map_visual_system

## I. Architectural Alignment
- **User Prompt**: Read `docs/design_guidelines.md`, identify what is still missing, preserve the app's own brand, and replace the current weak background with a professional world-map themed background.
- **External Reference (`docs/design_guidelines.md`)**: Useful inspiration includes hero canvas, header overlay, legend, detail panel, responsive fallback, reduced motion, keyboard access, and polished hover/selection states. The cyber-neon palette, electric particle density, or exact D3-force architecture should not be copied directly.
- **Architecture Pillar (`tangram/design/architecture.md`)**: Background, overlays, and accessibility state must stay separated from marker/string drawing. Shared UI preferences such as theme and reduced motion belong in `src/store/**`.
- **Structure Pillar (`tangram/design/structure.md`)**: Map-specific background scene builders, overlay components, hooks, and visual utilities stay under `src/features/map/**`; reusable atomic controls can move to `src/components/**` only if they become cross-feature.
- **UI Pillar (`tangram/design/ui.md`)**: Preserve marker pins, frame colors, string behavior, hover/click glow, and 4px/8px spacing. Replace the grass sprite with a calm professional world-map visual system.
- **Stack Pillar (`tangram/design/stack.md`)**: Continue with Astro React islands, canvas rendering, Tailwind overlays, Nano Stores, and existing dependencies. Avoid adding Three.js, PixiJS, D3, GSAP, or Framer Motion unless later data scale proves the need.
- **Security Pillar (`tangram/design/security.md`)**: Keep mocked `.ts` data and safe React text binding; no new user-generated content, authentication, API, or persistence surface in this slice.
- **Deployment Pillar (`tangram/design/deployment.md`)**: Preserve Cloudflare Worker compatibility and pass `npm run check` and `npm run build`.
- **Constitution (`tangram/constitution.md`)**: Keep state centralized, feature code feature-centric, builder-style scene setup for complex canvas drawing, and documentation updates incremental.
- **Historical Pattern (`tangram/archive/2026-05-03-00004_pan_interaction/summary.md`)**: Reuse `MapWorldOffset`, tile origin, pointer-interaction boundaries, and `effectiveScale`.
- **Historical Pattern (`tangram/archive/2026-05-03-00005_map_markers/summary.md`)**: Keep canvas-first rendering and infinite wrapping behavior.
- **Historical Pattern (`tangram/archive/2026-05-04-00007_interactive_marker_drag_sizing/summary.md`)**: Preserve marker layout, count sizing, active marker state, and drag priority.
- **Historical Pattern (`tangram/archive/2026-05-04-00008_swinging_marker_strings/summary.md`)**: Preserve strings behind markers, hover glow, pin panel behavior, and bottom-tip string anchors.

## II. Data Model & Schema Changes
- **Visual System Options**: Add a map visual configuration type for background mode, reduced-motion preference, and optional theme mode. Store shared preferences in `src/store/mapStore.ts` or a feature-local store module under `src/store/**`.
- **World Map Background Model**: Replace sprite-only background inputs with procedural or asset-backed world map layers: ocean/base fill, subtle latitude/longitude grid, simplified continent silhouettes or atlas lines, and optional low-opacity route arcs.
- **Overlay State**: Add UI state for detail-panel visibility, reduced-motion setting, search/filter input, and selected marker detail if not already represented by active marker state.
- **Accessibility Model**: Add derived marker accessibility data for hidden list navigation: marker ID, name, thank-you count, connection count, selected state, and focus behavior.
- **No Backend Schema Change**: Person details can continue using mocked data. Future profile fields may be derived from existing `ThankYouDataType` until a real API is planned.

## III. Atomic Task List

### Missing Feature Audit and Brand Direction
- [x] **Task 1: Document the Implemented-vs-Missing Feature Audit**
  > **Detailed Summary:** Update `tangram/features/00009_world_map_visual_system/summary.md` and, if appropriate, append to `tangram/studies/feature-backlog.md` with a concise audit comparing `docs/design_guidelines.md` against the current app. Mark already-built capabilities such as pan, zoom, marker sizing, dragging, soft strings, mutual relationships, and hover glow. Separate immediate work from later backlog items such as real-time updates, export/share, clustering, and advanced particles.

- [x] **Task 2: Define the Thank You World Map Visual Direction**
  > **Detailed Summary:** Add a short brand section to `tangram/features/00009_world_map_visual_system/summary.md` or incrementally update `tangram/design/ui.md`. Define the professional visual target: calm global map, readable marker pins, subtle atlas lines, quiet motion, warm gratitude accents, and no direct copy of the friend's cyber-neon style. The palette should balance deep green/teal, soft off-white map lines, and restrained warm accent colors.

### Professional World Map Background
- [x] **Task 3: Replace the Grass Background Builder with a World Map Background Builder**
  > **Detailed Summary:** Add `src/features/map/utils/worldMapSceneBuilder.ts` or evolve `grassSceneBuilder.ts` into a background scene builder that draws a professional world-map themed canvas. It should render a stable base fill, subtle ocean/atlas texture, latitude/longitude lines, simplified continent silhouettes or linework, and optional low-opacity route arcs. Keep the fluent builder pattern and respect viewport size, pixel ratio, `tileOrigin`, and `effectiveScale`.

- [x] **Task 4: Preserve Infinite Pan and Zoom Behavior for the New Background**
  > **Detailed Summary:** Ensure the world-map background remains seamless while panning and legible while zooming. If using procedural linework, draw repeated world copies or wrap coordinates consistently with existing `worldSize` and tile-origin conventions. The background must not drift independently from markers and strings.

- [x] **Task 5: Integrate the New Background into GrassCanvas**
  > **Detailed Summary:** Update `src/features/map/components/GrassCanvas.tsx` to use the world-map background layer instead of `grassSquareTile`. Remove image preload requirements if the new background is fully procedural, or keep asset loading only if a real world map asset is introduced. Preserve the existing canvas stacking order: background, strings, markers, overlays.

- [x] **Task 6: Add Background Visual Tests**
  > **Detailed Summary:** Add focused tests for pure helper functions used by the world-map background, such as wrap calculations, route arc point generation, projected map line positions, and theme token resolution. Keep tests deterministic and independent from browser canvas APIs where possible.

### Product Overlays and Missing UX Features
- [x] **Task 7: Add a Minimal Header Overlay**
  > **Detailed Summary:** Add a feature-local header overlay component under `src/features/map/components/**` with brand label, search/filter entry point, theme toggle placeholder if feasible, and reduced-motion toggle. It should sit above the canvas, use compact professional styling, avoid marketing copy, and not interfere with marker drag or map pan outside its controls.

- [x] **Task 8: Add a Marker and String Legend**
  > **Detailed Summary:** Add a bottom-left legend explaining marker size, thank-you counts, normal strings, mutual strings, and pinned markers. Keep it compact and scannable, using swatches and symbols rather than long instructional prose.

- [x] **Task 9: Upgrade the Marker Detail Experience**
  > **Detailed Summary:** Replace or complement the tiny pin panel with a richer detail panel that opens on marker selection. It should show the person's name, received thank-you count, connected marker count, avatar/initial, pin/unpin control, and relationship summary. On mobile, it should become a bottom sheet. Preserve the current pin panel behavior only if it remains useful as a quick action.

- [x] **Task 10: Add Reduced-Motion Support**
  > **Detailed Summary:** Add a reduced-motion state source that respects `prefers-reduced-motion` and a user toggle. When enabled, disable or soften string physics, background animation, hover glow intensity, and any future route/particle motion. The app should remain fully usable with static strings and readable states.

### Accessibility, Responsiveness, and Follow-On Readiness
- [x] **Task 11: Add Keyboard and Screen Reader Scaffolding**
  > **Detailed Summary:** Add a hidden accessible marker list or focusable overlay controls so keyboard users can navigate markers, select a marker, close the detail panel with Escape, and understand marker counts/connections. Use safe React text binding and avoid putting canvas-only content out of reach.

- [x] **Task 12: Define and Implement a Small-Screen Fallback Strategy**
  > **Detailed Summary:** Add responsive behavior for narrow viewports where dense marker dragging is difficult. At minimum, add a compact bottom sheet/detail layout and ensure overlays do not cover the whole map. If canvas interaction becomes unusable under a threshold, plan a static card/list fallback using the same mock data.

- [x] **Task 13: Prepare Search/Filter as a Follow-On Path**
  > **Detailed Summary:** Add lightweight structure for search/filter without overbuilding it: identify where search state should live, how results map to marker IDs, and how auto-pan would use existing world-position data. If implemented in this slice, keep it to a simple marker-name filter and selected-marker jump.

- [x] **Task 14: Validate and Update Tangram Records**
  > **Detailed Summary:** Run focused unit tests, `npm run check`, and `npm run build`. Manually verify the world-map background on desktop and mobile widths, pan/zoom alignment, marker/string readability, overlay click behavior, reduced-motion behavior, and detail-panel usability. Update `summary.md` with execution notes and any debug logs created.

## IV. Critical Path & Dependencies
- **Primary Sequence**: Tasks 1-2 lock the visual direction and missing-feature audit. Tasks 3-6 replace and verify the background. Tasks 7-10 add the visible product shell and motion preferences. Tasks 11-13 improve accessibility/responsiveness and prepare the next feature path. Task 14 validates the slice.
- **Blockers**: No backend or dependency blockers. The main choice is whether the world map is procedural canvas linework or an asset-backed atlas. The conservative path is procedural canvas linework to avoid licensing, loading, and Cloudflare asset concerns.
- **Risk Focus**: The world-map background can compete with strings if it is too busy; overlays can block drag/pan if not isolated; reduced-motion can drift from physics behavior if it is not centralized; a too-large scope can delay the immediate background improvement.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-WMVS-1 | Documentation | Missing-feature audit clearly lists built, immediate, and future capabilities from `docs/design_guidelines.md`. |
| Req-WMVS-2 | Manual | Grass sprite is replaced by a professional world-map themed background. |
| Req-WMVS-3 | Manual | Background aligns with pan and zoom and does not drift away from markers or strings. |
| Req-WMVS-4 | Manual | Markers and strings remain readable over the new background. |
| Req-WMVS-5 | Unit | New world-map helper math is deterministic and passes focused tests. |
| Req-WMVS-6 | Manual | Header overlay controls do not block map pan or marker drag outside the controls. |
| Req-WMVS-7 | Manual | Legend communicates marker size and string meaning without long explanatory copy. |
| Req-WMVS-8 | Manual | Marker detail panel opens, closes, and adapts on mobile widths. |
| Req-WMVS-9 | Manual/Unit | Reduced-motion mode disables or softens background and string motion while preserving functionality. |
| Req-WMVS-10 | Accessibility | Keyboard and screen-reader fallback exposes marker names, counts, and selection. |
| Req-WMVS-11 | Responsive | Mobile layout avoids text overlap and keeps primary map/detail interactions reachable. |
| Req-WMVS-12 | Build/Typecheck | Focused tests, `npm run check`, and `npm run build` pass. |
