# Feature Roadmap: 00001_mock_data

## I. Architectural Alignment
- **Stack Pillar (`tangram/design/stack.md`)**: Specifies the use of a mocked `.ts` file serving as the initial API response structure.
- **Structure Pillar (`tangram/design/structure.md`)**: Data files will be placed logically within `src/components/mockdata/` (as implied by the active editor path) and `src/utils/mock/`. 
- **Constitution (`tangram/constitution.md`)**: Follows standardized global utilities, keeping the fetching logic atomic and isolated in `src/utils/**`.

## II. Data Model & Schema Changes
- **Entity Introduction**: `ThankYouDataType` interface containing:
  - `id`: number
  - `full_name`: string
  - `thank_you_id_from`: number[]
  - `picture`: string | null
  - `frame_color`: HexColor (imported from `src/utils/visual/color.ts`)

## III. Atomic Task List

### Data & Logic
- [x] **Task 1: Define Types and Mock Data Array**
  > **Detailed Summary:** Create `src/components/mockdata/thankYouData.ts`. Import `HexColor` from `src/utils/visual/color.ts`. Define and export the `ThankYouDataType` interface. Create and export a `const thankYouData: ThankYouDataType[]` containing exactly 10 mock entries. For the `picture` field, utilize `https://i.pravatar.cc/` URLs or explicit `null` values. Ensure a diverse distribution of `thank_you_id_from` arrays to test connection physics.

- [x] **Task 2: Implement Mock Fetching Function**
  > **Detailed Summary:** Create `src/utils/mock/thankYouDataMockFetching.ts`. Import the `thankYouData` and `ThankYouDataType`. Export an `async function thankYouDataMockFetching(): Promise<ThankYouDataType[]>` that wraps the data return in a `setTimeout` of 1000ms to simulate network latency.

## IV. Critical Path & Dependencies
- **Blockers**: None. This is a foundational data feature.
- **Sequence**: Task 1 must be completed before Task 2, as the fetching utility depends on the exported type and data payload.

## V. Verification & Testing Mechanism

| Requirement | Verification Method | Pass Criteria |
| :--- | :--- | :--- |
| Req-1 | TypeScript Compiler | `tsc` completes without errors; `ThankYouDataType` correctly maps to the object structures. |
| Req-2 | Manual/Code Review | Array `thankYouData` has exactly 10 items; pravatar links work correctly. |
| Req-3 | Integration Test | Calling `thankYouDataMockFetching()` takes approximately 1 second before resolving with the data array. |