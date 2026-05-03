# File Structure

*Strictly adhering to the constitution's Feature-Centric rules.*

```text
src/
├── components/       # Generic shared UI (if any)
├── features/
│   └── map/          # The core visualization feature
│       ├── components/ # Atomic SVG components (Marker, String)
│       ├── hooks/      # React hooks for drag/pan/zoom
│       └── index.ts    # Public barrel file
├── lib/
│   └── anime.ts      # Wrappers and configuration for Anime.js
├── store/
│   └── mapStore.ts   # Centralized state (pan, zoom, active marker)
├── utils/
│   └── physics.ts    # Mathematical calculations for spacing and wrapping
└── pages/
    └── index.astro   # Main entry point mounting the React Island
```