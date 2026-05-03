# Feature Roadmap: 00003_utils_unit_tests

## I. Architectural Alignment
- **Constitution (`tangram/constitution.md`)**: Reinforces the "Feature-Centric (Bulletproof) Architecture" by keeping tests isolated from generic utilities but co-located in a mirrored `src/test/` directory structure to prevent spaghetti code. 
- **Goal (`tangram/studies/goal.md`)**: Direct contribution to the "zero-error" goal by mathematically proving out edge cases.

## II. Data Model & Schema Changes
- **No new schemas**: This feature only tests existing utility functions. No application data models are modified.

## III. Atomic Task List

### Testing
- [x] **Task 1: Unit Test `color.ts`**
  > **Detailed Summary:** Create `src/test/utils/visual/color.test.ts`. Use Vitest (`describe`, `it`, `expect`) to test `invertColor` and `toHexColorString`. 
  > - **Happy Path**: Verify standard hex colors (e.g., `0xeb0a1e`, `0x000000`, `0xffffff`) resolve and invert correctly.
  > - **Bad Path**: Verify that `assertHexColor` correctly intercepts and throws a `RangeError` for out-of-bounds values (e.g., negative numbers, `0x1000000`), floats, and invalid types.

- [x] **Task 2: Unit Test `scale.ts`**
  > **Detailed Summary:** Create `src/test/utils/map/scale.test.ts`. Use Vitest to test `createMapScaleSnapshot`, `resolveCanvasBackingStore`, `resolveGrassTileDrawSize`, and `resolveWrappedTileStart`.
  > - **Happy Path**: Test standard inputs derived from standard viewport sizes.
  > - **Bad Path / Edge Cases**: Verify fallback logic for `undefined`, zero, and negative values. Check boundary conditions (like exactly `0` scales ensuring they fall back to `MIN_POSITIVE_SIZE` behavior) and ensure the safe internal functions handle erratic pixel ratios properly.

## IV. Critical Path & Dependencies
- **Blockers**: None. The utilities already exist in the codebase.
- **Sequence**: Tests can be created and run in any order.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-1 | Integration/CLI | Running `npm run test` executes both test files successfully. |
| Req-2 | Unit Test | All "happy path" assertions in `color.test.ts` and `scale.test.ts` pass. |
| Req-3 | Unit Test | All "bad path" assertions correctly catch errors (e.g., `toThrowError(RangeError)`) without crashing the test runner. |