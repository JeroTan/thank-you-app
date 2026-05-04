# UI & Design System

*Guided by the internal UI/UX Pro Max system and PRD requirements.*

- **Visuals**: A repeating green sprite background.
- **Tokens & Spacing**: Strict 4px/8px base spacing scale for any HTML overlays (like the names container).
- **Markers (Atoms)**: SVG circle + triangle pins. Colored dynamically using `frame_color`. Text truncates with `...` to prevent overlap.
- **Connections (Strings)**: SVG polylines. Mutual connections use a two-color SVG gradient.
- **Interactions & Motion**:
  - **Hover/Click**: Clicking a marker highlights it with an edge glow, while graying out/dimming unrelated markers and strings.
  - **Physics**: Anime.js powers the swinging/oscillating motion of the strings when a marker is dragged.

## World Map Visual Direction

- **Brand Positioning**: The app should feel like a professional global gratitude map, not a generic electric social graph. External node-network references can inspire interaction quality, but the visual language remains calmer, warmer, and map-oriented.
- **Background**: Replace the grass sprite with a procedural world-map canvas using subtle atlas lines, simplified continent silhouettes, route arcs, and restrained global texture.
- **Palette**: Balance deep green/teal map tones with off-white atlas linework and restrained warm gold accents. Avoid a one-note neon blue/purple identity.
- **Overlay Tone**: Header, legend, and detail panels should be compact operational controls with readable text, translucent map-safe surfaces, and strict 4px/8px spacing.
- **Motion**: Motion should clarify relationships. Reduced-motion mode must soften or disable background motion, string swing, and glow intensity while preserving functionality.
