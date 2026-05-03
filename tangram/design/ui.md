# UI & Design System

*Guided by the internal UI/UX Pro Max system and PRD requirements.*

- **Visuals**: A repeating green sprite background.
- **Tokens & Spacing**: Strict 4px/8px base spacing scale for any HTML overlays (like the names container).
- **Markers (Atoms)**: SVG circle + triangle pins. Colored dynamically using `frame_color`. Text truncates with `...` to prevent overlap.
- **Connections (Strings)**: SVG polylines. Mutual connections use a two-color SVG gradient.
- **Interactions & Motion**:
  - **Hover/Click**: Clicking a marker highlights it with an edge glow, while graying out/dimming unrelated markers and strings.
  - **Physics**: Anime.js powers the swinging/oscillating motion of the strings when a marker is dragged.