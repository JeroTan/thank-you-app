# Feature Summary: 00004_setup_fonts

## Intent
The core "Why" behind this feature is to establish the project's brand identity by integrating the 'Toyota Type' custom fonts. By using Tailwind CSS v4's CSS-first approach, we ensure that the typography is consistent across the application and easily manageable via CSS variables.

## Scope
- Create `src/styles/_fonts.css` containing `@font-face` declarations for all 6 'Toyota Type' variants.
- Map variants to a single `font-family: 'Toyota Type'` using appropriate `font-weight` and `font-style` properties.
- Import `_fonts.css` into `src/styles/global.css`.
- Configure the `--font-sans` variable in the Tailwind v4 `@theme` block to use 'Toyota Type' as the primary font.
- Define a custom CSS variable `--font-toyota` for explicit usage.

## Strategic Fit
Aligns with the UI Pillar (design/ui.md) and User Requirements for a high-fidelity visual experience. Proper typography is a foundational element of the MVP's aesthetic quality.

## Execution Changelog
- **Task 1**: Created `src/styles/_fonts.css` with `@font-face` rules for Bold, Semibold, Regular, Light, Italic, and SemiboldIt variants, all under the "Toyota Type" family.
- **Task 2**: Updated `src/styles/global.css` to import the new font file and configured the Tailwind v4 `@theme` block to set "Toyota Type" as the default `font-sans`.