# Agenda: 00005_map_markers

## 1. Completeness
- [x] Does the feature render markers on the map from `src/components/mockdata/thankYouData.ts`?
- [x] Does the feature introduce a shared marker render spec that maps mock data into canvas-ready marker data?
- [x] Does the feature render the full marker in canvas for this slice: pin body, avatar or fallback initial, and name label?
- [x] Are marker positions calculated before first visible render?
- [x] Does the base marker size follow the rule of about `5%` of the smaller viewport dimension at scale `1.0`?

## 2. Clarity
- [x] Is this slice render-only, with no strings, click selection, dragging, or thank-you-count scaling yet?
- [x] Does the roadmap treat `src/components/visual/MapMarkerPin.tsx` as the visual model instead of the runtime renderer?
- [x] Do marker positions remain stable for a single session after they are computed?
- [x] Does the roadmap keep a shared marker render spec as the seam for future renderer choices?

## 3. Edge Cases
- [x] Do the position rules keep markers from visibly overlapping at the base size?
- [x] Do picture and no-picture markers both render correctly in canvas?
- [x] Do long names truncate or clip consistently within the marker label width?
- [x] Do markers remain aligned with the current pannable world offset?

## 4. Non-Functional
- [x] Is marker position calculation kept separate from marker drawing?
- [x] Is marker drawing modular inside the map feature so strings and interactions can be layered later?
- [x] Does the roadmap preserve the current canvas background and panning system rather than replacing them?
- [x] Does the renderer path stay scalable enough to evaluate the early canvas approach for larger future marker counts?