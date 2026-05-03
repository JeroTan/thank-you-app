# Agenda: 00002_grass_canvas

## 1. Completeness
- [x] Does the first slice render a full-screen map surface using repeated `src/assets/sprite/grass_square_tile.png`?
- [x] Does the feature preload the grass tile asset before the scene becomes visible?
- [x] Does the feature introduce a reusable global scale baseline where `1.0` equals `1000x1000`?

## 2. Clarity
- [x] Is the scope limited to the grass canvas surface, global scale plumbing, and asset loading only?
- [x] Is the tile pattern anchored to the future map layer so later pan and zoom work can build on it cleanly?
- [x] Does the roadmap explicitly avoid PixiJS and target native HTML canvas as the rendering surface?

## 3. Edge Cases
- [x] Does the canvas cover the visible viewport on desktop and mobile?
- [x] Does the global scale recalculate on viewport resize?
- [x] Does rendering wait until the required grass asset is ready?

## 4. Non-Functional
- [x] Is the scale state reusable for later assets and interactions?
- [x] Does the implementation stay modular inside the feature-centric map structure?
- [x] Do complex configuration paths follow the fluent interface rule from the constitution?