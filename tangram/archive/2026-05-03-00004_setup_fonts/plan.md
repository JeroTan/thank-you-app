# Feature Roadmap: 00004_setup_fonts

## I. Architectural Alignment
- **Stack Pillar (`tangram/design/stack.md`)**: Specifies the use of Tailwind CSS (Latest).
- **UI Pillar (`tangram/design/ui.md`)**: Guided by the internal UI/UX Pro Max system, requiring scalable design tokens (fonts).
- **Constitution (`tangram/constitution.md`)**: Principle 1 (Feature-Centric) and Principle 2 (Global Utilities/Assets). Styles are global in this case.

## II. Data Model & Schema Changes
- **No new schemas**: This feature only modifies CSS and configuration.

## III. Atomic Task List

### Styles & Configuration
- [x] **Task 1: Create `_fonts.css` with `@font-face` Declarations**
  > **Detailed Summary:** Create `src/styles/_fonts.css`. Define `@font-face` for 'Toyota Type' mapping:
  > - Bold: 700
  > - Semibold: 600
  > - Regular: 400
  > - Light: 300
  > - Italic: 400, italic
  > - SemiboldIt: 600, italic
  > Use `/fonts/toyota-type/` path as fonts are in the `public/` directory.

- [x] **Task 2: Integrate Fonts into `global.css` and Tailwind v4**
  > **Detailed Summary:** Modify `src/styles/global.css`. 
  > 1. Add `@import "./_fonts.css";` at the top.
  > 2. Add a `@theme` block to configure Tailwind v4.
  > 3. Define `--font-toyota: "Toyota Type", ui-sans-serif, system-ui, sans-serif;`.
  > 4. Override `--font-sans: var(--font-toyota);` to set it as default.

## IV. Critical Path & Dependencies
- **Blockers**: None.
- **Sequence**: Task 1 must be completed before Task 2 so the font file exists for import.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-1 | Browser Inspect | Verify 'Toyota Type' is the active font-family for `body`. |
| Req-2 | Network Tab | Verify that font files are correctly loaded from `/fonts/toyota-type/` without 404s. |
| Req-3 | Tailwind Utility | Verify that using `font-sans` or `font-[toyota]` works in components. |