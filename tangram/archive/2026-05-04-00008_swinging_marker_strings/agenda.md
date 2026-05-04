# Feature Agenda: 00008_swinging_marker_strings

## Requirement Interpretation
- Build visible soft strings between map markers using `thank_you_id_from` as the source relationship data.
- For each recipient marker, every unique sender ID in `thank_you_id_from` creates one relationship candidate; repeated sender IDs resolve to the same string rather than parallel duplicate lines.
- Reciprocal relationships collapse into one visible undirected string between the two markers: if marker A thanks marker B and marker B also thanks marker A, the map still draws one string for A-B.
- Duplicate sender IDs still remain meaningful to prior count-based marker sizing, but this feature should avoid drawing duplicate overlapping strings for the same sender-recipient pair or reciprocal marker pair.
- Strings should feel like soft ropes: they can swing, curve, stretch slightly, and settle when markers move, rather than behaving like rigid straight connector lines.
- Rope behavior should have a fixed-rest-length feel similar to a light "Cut the Rope" style constraint, while still letting the user directly drag the selected marker.
- Clicking a marker should allow a small marker panel or control where the marker can be pinned/locked steady so string physics does not pull it around; connected markers may continue to respond.
- Hovering a marker highlights the hovered marker pin and that marker's connected strings.
- Rope cutting, deleting relationships, backend persistence, and connection editing are outside this feature unless explicitly added later.

## Completeness
- [ ] Does the requirement explicitly define which data field creates strings, including the direction from sender ID to recipient marker?
- [ ] Does the requirement distinguish duplicate thank-you counts from duplicate visible strings?
- [ ] Does the requirement define whether missing sender IDs and self-links should be ignored, and whether reciprocal relationships should merge into one visible string?
- [ ] Does the requirement define both hover feedback and click/pin-panel behavior without mixing the two states?
- [ ] Does the requirement confirm that string physics is session-local and does not introduce API, database, or persistence changes?

## Clarity
- [ ] Are "soft string", "swinging", "fixed length", and "steady/pinned marker" described in observable terms a tester can recognize?
- [ ] Is it clear that the dragged marker follows the pointer while strings react around it instead of strings fighting direct drag control?
- [ ] Is it clear whether connected markers can be nudged by rope physics, and that pinned markers are excluded from physics-driven movement?
- [ ] Is it clear that hover glow applies to the hovered marker and its strings, not every linked marker unless later requested?
- [ ] Is it clear how this feature coexists with existing click selection, active marker glow, pan, zoom, and marker dragging?

## Edge Cases
- [ ] Are duplicate sender IDs collapsed to one visible string per sender-recipient pair while still preserving count behavior elsewhere?
- [ ] Are reciprocal thank-you relationships collapsed into one visible string while preserving mutual-relationship metadata for highlighting or future two-color gradient styling?
- [ ] Are strings stable when a marker is dragged across wrapped world boundaries or while the map is zoomed?
- [ ] Are dense clusters and highly connected markers handled without unreadable string clutter?
- [ ] Are hover and click states deterministic when the pointer moves from marker to string, when a marker is dragged, or when a marker is pinned?

## Non-Functional
- [ ] Does the requirement preserve the existing canvas-first map renderer and avoid new persistence or security surfaces?
- [ ] Does the motion target a smooth interactive feel without degrading lower-end mobile performance?
- [ ] Does the visual treatment respect the current marker design, green map background, and Tangram UI pillar for connection strings?
- [ ] Does the feature remain compatible with Cloudflare Worker build constraints and the existing Astro React island?
- [ ] Does the requirement leave room for a later performance toggle if string physics becomes expensive?
