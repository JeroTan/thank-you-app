# Feature Agenda: 00007_interactive_marker_drag_sizing

## Feature Intent
Make the existing map markers interactive and count-aware: markers can be clicked or dragged, marker size reflects the number of received thank-yous, and the map layout expands when larger markers need more breathing room.

## Clarified Decisions
- Duplicate IDs in `thank_you_id_from` count as multiple received thank-yous.
- Marker drag takes priority over map pan when the pointer starts on a marker.
- A pointer interaction only counts as a click/highlight when movement stays below a small drag threshold.
- When count-based marker sizes increase, the world/layout should expand first to preserve spacing.
- Marker size caps may still be used as a final clutter guard, but not as the first response to crowding.

## Completeness
- [x] Are the size-scaling inputs explicitly defined as each marker's `thank_you_id_from.length`, including repeated IDs?
- [x] Are the two interaction modes defined: drag for meaningful pointer movement and click/highlight for below-threshold movement?
- [x] Is marker-drag priority over map-pan explicitly defined for pointer starts inside a marker hitbox?
- [x] Is the layout response to larger markers defined as world expansion before size compression?
- [x] Is the infinite/wrapped map behavior preserved after drag and layout expansion?

## Clarity
- [x] Does "interactive marker" mean direct pointer/touch hit detection against the marker hitbox rather than dragging the whole canvas?
- [x] Does "thank you count" mean received thank-yous from the mock data array, not unique sender count?
- [x] Does "avoid cluttering" mean preserve minimum spacing between marker hitboxes whenever possible?
- [x] Does "distance of each marker should be still as long as there are still space" mean spacing grows with marker size and available world area?

## Edge Cases
- [x] Marker with zero received thank-yous should render at the minimum/base size.
- [x] Marker with the highest count should remain capped enough to avoid swallowing labels or nearby markers.
- [x] Dragging a marker across the wrapped world boundary should keep it interactable and visible in the repeated map.
- [x] Dragging should update marker world position without permanently breaking stable positions for untouched markers.
- [x] Pointer release after a drag should not also trigger click/highlight.
- [x] Touch interaction should avoid accidental page scrolling or map pan while dragging a marker.

## Non-Functional
- [x] Rendering should stay smooth by using requestAnimationFrame-style batching for drag updates.
- [x] Marker hit testing and size calculations should be pure/testable where possible.
- [x] Shared interaction state should stay centralized in `src/store/**` according to the project constitution.
- [x] The canvas-first rendering path should remain compatible with the existing marker sprite/image pipeline.
- [x] Tests should cover count-based sizing, spacing/world expansion, drag-vs-click classification, and viewport/world coordinate conversion.
