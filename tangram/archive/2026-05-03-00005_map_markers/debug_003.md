# Debug Session 003: Image Loading CORS Failure

## Issue Summary
The user correctly observed that the images are not appearing when rendered. While the application *does* attempt to load the images first (via `loadCanvasImageAsset` before drawing), the load is silently failing in the background.

## Root Causes Identified
- **CORS Restriction in Asset Loader**: `src/features/map/utils/assetLoader.ts` explicitly sets `image.crossOrigin = "anonymous"`. The mock image service (`i.pravatar.cc`) does not provide the required `Access-Control-Allow-Origin` HTTP headers. When the browser sees the missing header, it blocks the image load for security reasons, triggering the `onerror` fallback to initials.
- **Reverted Aspect Ratio Code**: Because the previous fix was reverted, the canvas avatar rendering currently lacks background filling and aspect-ratio (`slice`) preservation, meaning transparent avatars would bleed into the grass and non-square images would distort.

## Fixing Checklist

- [x] task 1 - Bypass CORS restriction for mock images
  > **Summary:** Modify `src/features/map/utils/assetLoader.ts` to remove `image.crossOrigin = "anonymous";`. This will taint the canvas (preventing data exports), but it allows the mock avatar images from pravatar to successfully load and render on the screen.

- [x] task 2 - Re-apply canvas avatar rendering aspect ratio
  > **Summary:** Modify `src/features/map/utils/markerSceneBuilder.ts` inside `drawMarkerAvatar` to fill the background color before drawing the image. Update the `drawImage` call to calculate proper aspect-ratio dimensions to simulate `object-fit: cover` (`slice`).