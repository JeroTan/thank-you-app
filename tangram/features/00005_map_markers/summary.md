# Feature Summary: 00005_map_markers

## Intent
Add the first marker layer to the current canvas map so mock people can appear as positioned pins instead of the map remaining background-only.

## Scope
This slice renders markers only. It covers a shared marker render spec, stable per-session marker positioning, and canvas-first rendering of the full pin visual using the existing `MapMarkerPin` design as the visual reference. It explicitly excludes strings, click or drag interaction, thank-you-count scaling, and marker-size changes beyond the base viewport-relative rule.

## Strategic Fit
The feature advances the visualization MVP from a pannable background into an actual gratitude map while preserving the canvas and world-offset foundations established by `2026-05-03-00002_grass_canvas` and `2026-05-03-00004_pan_interaction`. It also creates the renderer seam needed to evaluate an early canvas marker path before heavier production counts arrive.

## Debug Fixes
- Applied `debug_001.md` to resolve marker pan alignment, marker pin rendering fidelity, and avatar image preload behavior.