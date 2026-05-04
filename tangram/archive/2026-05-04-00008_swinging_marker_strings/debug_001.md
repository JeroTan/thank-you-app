# Debug 001: Pin Panel Controls and Bottom-Tip String Anchors

## Issue
The marker pin panel displays `Close` and `Pin`, but the controls do not reliably respond. Strings also attach visually from marker centers instead of the bottom tip of the marker pin graphic.

## Fixing Checklist
- [x] task 9 - Marker pin panel buttons are intercepted by map pointer handling
  > **Summary:** Harden `src/features/map/components/MarkerPinPanel.tsx` as a real map overlay control by stopping pointer/click events during capture and tagging the panel with a data attribute. Update `src/features/map/hooks/usePanInteraction.ts` so pan startup ignores overlay-control targets. Root cause: map pointer listeners are native listeners, so React bubble-phase event stops can happen too late to prevent the pan layer from seeing panel button pointerdowns.

- [x] task 6 - String endpoints start from marker centers instead of pin tips
  > **Summary:** Add bottom-tip anchor resolution for string rendering so the first and last rope points are offset to the visual bottom of each marker pin. Touch `src/features/map/components/GrassCanvas.tsx` and use marker size metadata to translate each endpoint from marker center world position to the pin tip world position while keeping the existing rope simulation and marker rendering contracts intact.

- [x] task 10 - Pin feedback is not visible enough after toggling
  > **Summary:** Make the panel reflect pinned state clearly after the click by retaining the panel, changing the primary button label/state, and adding a compact status line. This keeps pinning session-local while making the control's result observable.
