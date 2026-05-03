# Agenda: 00004_pan_interaction

## 1. Completeness
- [x] Does the slice add panning only, with zoom still deferred?
- [x] Does the slice support mouse drag and grab panning?
- [x] Does the slice support touch drag panning?
- [x] Does the slice support trackpad panning?
- [x] Does the slice support keyboard-driven panning?
- [x] Does the map stay where the user leaves it after release?

## 2. Clarity
- [x] Does the feature build on the archived grass-canvas foundation instead of replacing it?
- [x] Does the roadmap treat panning as shared world-offset state that future markers and strings can reuse?
- [x] Does the roadmap preserve the minimum world reference of `1000x1000` while allowing future content to expand map bounds?
- [x] Does the interaction stop immediately on release without momentum or inertia?

## 3. Edge Cases
- [x] Does dragging prevent accidental text and image selection?
- [x] Does the UI provide grab and grabbing cursor feedback?
- [x] Does the roadmap prevent mouse, touch, trackpad, and keyboard handlers from conflicting?
- [x] Does panning remain correct after viewport resize and scale recalculation?

## 4. Non-Functional
- [x] Is pan state centralized in shared store as required by the architecture pillar?
- [x] Is input handling modular inside the feature structure defined by the project structure pillar?
- [x] Is the panning API reusable by future marker, string, and zoom features?