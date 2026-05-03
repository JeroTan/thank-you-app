# Project Constitution

**Version:** 1.0
**Last Updated:** 2026-05-02

## Changelog
- **v1.0:** Initial establishment of architectural and documentation standards adapted for the Thank You App visualization MVP, including rules for atomic components and centralized state.

## Core Principles

### 1. Feature-Centric (Bulletproof) Architecture
> **Rationale:** Organizing by technical type leads to "spaghetti" logic as the project grows. Organizing by feature ensures scalability and easy deletion/modification.
**Enforcement Rule:** All UI and associated logic MUST be stored in `src/features/[feature-name]/`. Shared components, hooks, or assets MUST live in `src/components/`, `src/hooks/`, etc. Features MUST only expose their public API via an `index.ts` barrel file.

### 2. Standardized Global Utilities
> **Rationale:** Prevents "utility bloat" and ensures that third-party logic is isolated.
**Enforcement Rule:** Atomic, independent helper functions MUST live in `src/utils/**`. All logic involving 3rd-party libraries (e.g., Anime.js wrappers) MUST be localized in `src/lib/**`.

### 3. Incremental Documentation Updates
> **Rationale:** Documentation represents the project's cumulative memory and technical laws. Overwriting entire files risks losing critical historical context and specific user-mandated rules.
**Enforcement Rule:** When updating documentation (Design Pillars, Knowledge, or Memory), the AI MUST prioritize surgical edits and additions over wholesale replacement. Content SHOULD be appended or incrementally modified to preserve existing mandates.

### 4. Atomic Component Design
> **Rationale:** Breaking down the UI into atomic, single-responsibility components ensures that complex visual logic (like physics and markers) is highly traceable and maintainable.
**Enforcement Rule:** All UI elements MUST be built as atomic components. Complex views MUST be composed of smaller, predictable pieces.

### 5. Centralized State Management
> **Rationale:** Keeping state isolated from presentation logic is crucial for tracking data flow during complex interactions (like dragging and panning).
**Enforcement Rule:** All global or shared application state MUST be managed and strictly stored within the `src/store/**` directory.