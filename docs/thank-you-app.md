# Product Requirements Document: Thank You App Visualization MVP

**Version**: 1.0
**Date**: 2026-05-02
**Author**: Sarah (Product Owner)
**Quality Score**: 95/100

---

## Executive Summary

The Thank You App MVP is a highly interactive, visual map representing gratitude networks between individuals. Deployed on Cloudflare Workers, the core experience centers around an infinite, pannable canvas where users are represented as dynamic pins (markers) connected by physics-based "strings". The primary goal of this phase is delivering a flawless, zero-error technical implementation of the visualization logic based on predefined mock data. *Note: Core business logic and broader objectives remain trade secrets.*

---

## Problem Statement

**Current Situation**: Need a way to visualize the network of "thank yous" between users in a compelling, interactive manner.
**Proposed Solution**: An animated, zoomable, and pannable map built with Astro, React, Tailwind CSS, and Anime.js. It will render a mocked dataset of users and their connections, calculating node sizes dynamically and simulating physics on the connections.
**Business Impact**: Trade secret. Evaluated strictly on technical execution and visual fidelity.

---

## Success Metrics

**Primary KPIs:**
- **Zero Errors**: The application must run locally and be deployable to Cloudflare Workers without console or build errors.
- **Visual Fidelity**: All UI and interaction requirements (swinging physics, gradients, panning, responsive scaling) must perform as described.
- **Performance**: Smooth rendering and panning across the infinite canvas.

---

## User Personas

### Primary: Viewer / Interactor
- **Goals**: Explore the "Thank You" network by panning, zooming, dragging pins, and clicking markers.
- **Technical Level**: Any.

---

## User Stories & Acceptance Criteria

### Story 1: Infinite Canvas & Background
**As a** user
**I want to** pan and zoom around a map with a repeating green sprite background
**So that** I can explore the network without hitting hard edges.

**Acceptance Criteria:**
- [ ] Map takes up full viewport width and height.
- [ ] Background is a repeating green sprite.
- [ ] Panning is infinite (e.g., panning right loops back to the left).
- [ ] Global zoom adjusts automatically to match mobile and desktop views.

### Story 2: Marker Rendering & Sizing
**As a** user
**I want to** see markers for each person that scale based on the number of "thank yous" they've received
**So that** I can easily identify highly thanked individuals.

**Acceptance Criteria:**
- [ ] Markers are SVG components (circle + triangle pin).
- [ ] Circle displays user picture (via `env.APP_URL`) or first letter of name if no picture.
- [ ] Pin is colored using `frame_color`.
- [ ] Name is displayed below, truncated with `...` if overflowing the marker width.
- [ ] Markers are placed randomly but not overlapping/too close.
- [ ] Marker size scales proportionally based on `thank_you_id_from` count.

### Story 3: Connection "Strings" with Physics
**As a** user
**I want to** see connections between people who thanked each other, which swing when I move a pin
**So that** the map feels alive and interactive.

**Acceptance Criteria:**
- [ ] A single polyline ("string") connects two related markers, regardless of multiple thanks between the same pair.
- [ ] String color matches the sender's `frame_color`.
- [ ] If full duplex (mutual thanks), the string uses a two-color gradient.
- [ ] When a marker is dragged, connected strings exhibit oscillating/swinging physics.

### Story 4: Marker Interaction (Click)
**As a** user
**I want to** click a marker to highlight it
**So that** I can focus on a specific person's connections.

**Acceptance Criteria:**
- [ ] Clicking a marker highlights it and its connected strings with an edge glow.
- [ ] Unrelated markers and strings are grayed out/dimmed.

---

## Functional Requirements

### Data Source
- A `.ts` file representing API response mock data.
- Fields: `id`, `full_name`, `thank_you_id_from` (array of IDs), `picture` (string/null), `frame_color`.

### Core Logic: Spacing & Sizing
- Viewport handles 50% padding equal to total viewport size * predefined area space.
- Free map (infinite wrap) enabled.

---

## Technical Constraints

### Technology Stack
- **Framework**: Astro JS (latest)
- **UI Library**: React JS (latest)
- **Styling**: Tailwind CSS (latest)
- **Animations**: Anime.js
- **Deployment**: Cloudflare Workers

### Integrations
- `env.APP_URL` from `cloudflare:workers` for image asset resolution.

---

## MVP Scope & Phasing

### Phase 1: MVP (Current)
- Mock `.ts` data integration.
- Infinite panning canvas with repeating background.
- SVG markers with dynamic sizing and placement.
- Physics-based strings (gradients for duplex).
- Dragging and click-to-highlight interactions.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Performance drop with many SVGs | Med | High | Optimize React re-renders, consider Canvas API if SVG becomes too slow, though SVG is required for MVP. |
| Complex math for infinite panning bounds | High | Med | Careful implementation of coordinate wrapping logic. |
| Anime.js physics performance on drag | Med | Med | Debounce drag events or use requestAnimationFrame. |

---

*This PRD focuses strictly on technical implementation and interaction design, respecting the confidential nature of the overarching business goals.*