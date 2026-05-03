# File Structure

*Strictly adhering to the constitution's Feature-Centric rules.*

```text
src/
├── assets/           # Static assets (e.g., repeating grass sprite for the canvas)
├── components/       # Globally reusable atomic UI components (e.g., visual/MapMarkerPin)
├── features/
│   └── map/          # The core visualization feature
│       ├── components/ # Feature-locked components (e.g., SwingingPhysics)
│       ├── hooks/      # React hooks for drag/pan/zoom
│       └── index.ts    # Public barrel file
├── lib/
│   └── anime.ts      # Wrappers and configuration for Anime.js
├── store/
│   └── mapStore.ts   # Centralized state (pan, zoom, active marker)
├── utils/
│   ├── physics.ts    # Mathematical calculations for spacing and wrapping
│   └── visual/       # Visual utilities (e.g., color.ts for hex manipulation)
└── pages/
    └── index.astro   # Main entry point mounting the React Island
```kers and strings.
  - **Physics**: Anime.js powers the swinging/oscillating motion of the strings when a marker is dragged.