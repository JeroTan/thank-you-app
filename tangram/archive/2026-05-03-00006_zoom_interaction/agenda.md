# Feature Agenda: 00006_zoom_interaction

## The "Why"
The map visualization must allow users to zoom in and out to explore markers at different levels of detail, providing a standard interactive map experience.

## Feature Scope
- Implement a user-controlled zoom level state (`mapZoomStore`).
- Combine user zoom with the existing viewport scale (`effectiveScale`).
- Add on-screen Zoom UI Controls (e.g., `+` and `-` buttons).
- Support basic mouse wheel and keyboard (+/-) zoom interactions.
- Support multi-touch pinch gestures for zooming on touch devices.

## Out of Scope
- Semantic zooming (showing/hiding different data based on zoom level).

## Key Deliverables
- `mapZoomStore` tracking a float (e.g., 0.5x to 2.0x).
- `ZoomControls` UI component overlaying the canvas.
- Math updates in `scale.ts` to multiply the viewport scale by the user zoom level.
- Hook updates in `usePanInteraction.ts` to handle wheel, keyboard, and pinch-to-zoom gestures.
