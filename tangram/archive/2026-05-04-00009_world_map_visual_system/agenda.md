# Feature Agenda: 00009_world_map_visual_system

## Requirement Interpretation
- Use `docs/design_guidelines.md` as external inspiration, not as a strict rebrand.
- Preserve the Thank You App identity: gratitude, warm human connection, marker pins, thank-you strings, and the current canvas-first map interaction model.
- Replace the current grass background with a professional world-map themed background that feels like a polished global gratitude map.
- Avoid copying the friend's cyber-neon node-network look exactly; the app should feel calmer, more professional, and more brand-owned.
- Identify which friend-guideline features are still missing from the current implementation and separate immediate feature work from later backlog ideas.
- Keep the implementation compatible with Astro, React islands, Nano Stores, Cloudflare Workers, and the existing pan/zoom/marker/string architecture.

## Missing Feature Audit
### Already Implemented
- [x] Full-screen interactive canvas map.
- [x] Pannable and zoomable world surface.
- [x] Marker pins with avatar or fallback initial.
- [x] Count-based marker sizing.
- [x] Direct marker dragging.
- [x] Relationship strings between markers.
- [x] Duplicate and reciprocal string collapse.
- [x] Soft string swing during marker drag.
- [x] Hover glow for marker and connected strings.
- [x] Basic click panel for pin/unpin.

### Still Missing or Underdeveloped
- [ ] Professional world-map background replacing the grass sprite.
- [ ] Minimal header overlay with brand, search/filter entry point, theme control, and reduced-motion control.
- [ ] Legend explaining marker sizing and string meaning.
- [ ] Rich profile/detail panel showing selected person details and thank-you relationships.
- [ ] Proper keyboard navigation and screen-reader-accessible marker list.
- [ ] Reduced-motion mode that disables or softens string physics, glow, and background motion.
- [ ] Mobile/tablet fallback layout for screens where dense canvas interaction is hard to use.
- [ ] Search/filter and auto-pan to a selected person.
- [ ] Export/share snapshot workflow.
- [ ] Real-time data updates or API-backed data source.
- [ ] Performance controls for dense datasets.

## Completeness
- [ ] Does the new background requirement define a clear professional world-map direction without copying the friend's visual brand?
- [ ] Does the feature identify which missing elements are immediate scope and which remain future backlog?
- [ ] Does the requirement preserve existing marker pins, strings, pan, zoom, drag, and pinning behavior?
- [ ] Does the requirement include reduced-motion and accessibility expectations before adding extra visual motion?
- [ ] Does the requirement define responsive behavior for mobile and small tablets?

## Clarity
- [ ] Is "professional world map" described in visible terms: map outlines, meridians/parallels, subtle terrain/ocean texture, and calm brand colors?
- [ ] Is it clear that the background should not be the current repeating grass tile?
- [ ] Is it clear that the friend guideline's electric particles/orbs are optional inspiration, not required visual identity?
- [ ] Is it clear that the app should remain a gratitude map rather than a generic social graph?
- [ ] Is it clear how overlays should layer above the canvas without blocking marker drag/pan behavior?

## Edge Cases
- [ ] Does the world-map background tile or procedural scene remain seamless during infinite pan?
- [ ] Does it stay legible behind markers and strings at different zoom levels?
- [ ] Does reduced-motion prevent background animation and string motion from becoming distracting?
- [ ] Does the mobile fallback avoid unreadable marker/string clutter?
- [ ] Do overlay controls avoid intercepting drag/pan except when intentionally interacted with?

## Non-Functional
- [ ] Does the feature avoid new runtime dependencies unless a clear performance need is proven?
- [ ] Does the background render efficiently on canvas without hurting marker drag responsiveness?
- [ ] Does the design keep text readable and avoid decorative excess?
- [ ] Does the feature preserve Cloudflare Worker build compatibility?
- [ ] Does the plan update Tangram records with the chosen visual system and missing-feature audit?
