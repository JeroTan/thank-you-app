# Agenda: 00004_setup_fonts

## 1. Completeness
- [ ] ✅ Are all font files in `public/fonts/toyota-type/` correctly mapped in `src/styles/_fonts.css`?
- [ ] ✅ Is `src/styles/_fonts.css` imported into `src/styles/global.css` (or `globals.css`)?
- [ ] ✅ Is the font family configured in the Tailwind v4 `@theme` block?

## 2. Clarity
- [ ] ✅ Does the `_fonts.css` use a single `font-family: 'Toyota Type'` with appropriate weights and styles?
- [ ] ✅ Are CSS variables defined for the font family (e.g., `--font-toyota: 'Toyota Type'`)?

## 3. Edge Cases
- [ ] ✅ Are the font paths in `@font-face` correctly referencing the `/fonts/` public path?
- [ ] ✅ Does the Tailwind v4 configuration correctly override or extend the default sans-serif stack?

## 4. Non-Functional
- [ ] ✅ Does the implementation follow the Tailwind v4 CSS-first configuration pattern (no `tailwind.config.js`)?
- [ ] ✅ Are the font-weight mappings accurate (Regular=400, Bold=700, Light=300, etc.)?