# Feature Summary: 00004_pan_interaction

## Intent
Add the first movement layer on top of the archived grass-canvas foundation so the map can be repositioned through direct user input instead of remaining static.

## Scope
This slice adds panning only. It covers mouse drag and grab, single-touch drag, trackpad pan, and keyboard pan, plus shared world-offset state, grab and grabbing feedback, and selection prevention. It explicitly excludes zoom, inertia, markers, strings, and final content-derived bounds logic.

## Strategic Fit
The feature directly advances the pannable-map requirement in `tangram/studies/business-requirements.md` while preserving the rendering and state foundations established by `2026-05-03-00002_grass_canvas`. It also prepares a shared world-offset contract that future zoom, marker, and string features can reuse without replacing the current canvas architecture.

## Execution Log
- 2026-05-03: Promoted the map position model from tile-only origin state to a shared world-offset contract in `src/store/mapStore.ts`, with tile origin derived from world offset and the active scale snapshot.
- 2026-05-03: Extended `src/utils/map/scale.ts` with reusable panning helpers for drag, wheel-style trackpad movement, keyboard steps, future bounds seams, and tile-origin derivation.
- 2026-05-03: Added a fluent `PanInteractionBuilder` and `usePanInteraction` hook to coordinate mouse, touch, trackpad, and keyboard input without handler conflicts.
- 2026-05-03: Wired the interaction layer into `src/features/map/components/GrassCanvas.tsx` with grab and grabbing cursor feedback, focusable keyboard input, and selection prevention on the interactive surface.
- 2026-05-03: Added pure-helper coverage in `src/test/utils/map/scale.test.ts` and validated the finished slice with targeted Vitest, `npm run check`, browser interaction checks for mouse, touch, keyboard, and wheel-style pan, plus `npm run build`.

## Final Execution Log
### What Was Built
- Shipped shared world-offset state for the map and replaced tile-only movement with a reusable panning contract that future zoom, marker, and string layers can consume.
- Shipped a fluent pan interaction layer that supports mouse drag, touch drag, wheel-style trackpad pan, and Arrow-key keyboard pan on the existing grass canvas.
- Shipped the canvas integration, cursor feedback, selection prevention, and verification coverage needed for the first fully pannable map surface.

### Challenges & Fixes
- Resolved the state-model transition by deriving tile origin from shared world offset instead of storing renderer-specific position as the primary interaction state.
- Resolved touch-path stability by guarding pointer-capture calls so environments without active capture support do not throw during pan startup.
- No `debug_*.md` sessions were created for this feature; issues were resolved inline during implementation and verification.

### Design Adherence
- Followed the architecture and structure pillars by keeping pan state in `src/store/**`, pan math in `src/utils/**`, and feature-local interaction wiring in `src/features/map/**`.
- Followed the UI pillar by delivering deliberate grab and grabbing feedback while preserving a clean base for later interactions.
- Followed the constitution by keeping the interaction modular and using a fluent builder for the multi-step pan setup path.