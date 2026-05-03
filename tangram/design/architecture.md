# Architecture

**Pattern**: Feature-Centric Island Architecture

- **Framework integration**: Astro acts as the lightweight shell and routing layer, while React powers the highly interactive "Islands" (the canvas and SVGs).
- **State Management**: As mandated by the project constitution, all global state (pan coordinates, zoom level, marker positions, active selection) is centralized in `src/store/**`. We will use Nano Stores (or Zustand) for seamless Astro/React state sharing.
- **Core Logic Separation**: Math for the infinite panning map, coordinate wrapping, and hit-box calculations are extracted into pure functions within `src/utils/math.ts` to keep React components atomic and clean.