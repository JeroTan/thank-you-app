# Project Overview: Thank You App Visualization MVP

## Core Vision
A highly interactive, visual map representing gratitude networks between individuals. The MVP focuses on a flawless, zero-error technical implementation of an infinite, pannable canvas where users are represented as dynamic pins (markers) connected by physics-based "strings".

## Key Features
- **Infinite Canvas**: Pannable and zoomable map with a repeating green sprite background.
- **Dynamic Markers**: SVG-based pins representing users. Size scales proportionally based on the number of "thank yous" received. Displays user picture or first letter of name, colored by a specific frame color.
- **Physics-Based Connections**: Polylines ("strings") connecting related markers that exhibit oscillating/swinging physics when a marker is dragged. Gradients for mutual (duplex) thanks.
- **Interactivity**: Dragging markers applies physics to strings. Clicking a marker highlights it and its connections while dimming unrelated elements.

## Target Audience
- **Primary Persona**: Viewer / Interactor
- **Goal**: Explore the "Thank You" network by panning, zooming, dragging pins, and clicking markers.

## Technical Foundation
- **Stack**: Astro JS, React JS, Tailwind CSS, Anime.js
- **Deployment**: Cloudflare Workers
- **Data Source**: Mocked `.ts` dataset representing the API response.

## Definition of Done (MVP)
- The application runs locally and deploys to Cloudflare Workers with zero console or build errors.
- Visual fidelity matches all specified requirements (swinging physics, gradients, infinite panning, dynamic scaling).
- Smooth rendering and performance across the infinite canvas.