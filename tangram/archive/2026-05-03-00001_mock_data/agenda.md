# Agenda: 00001_mock_data

## 1. Completeness
- [ ] ✅ Are all properties from `raw-query.txt` included in the `ThankYouDataType` (`id`, `full_name`, `thank_you_id_from`, `picture`, `frame_color`)?
- [ ] ✅ Does the dataset contain exactly 10 mock items as requested?
- [ ] ✅ Does the `thankYouDataMockFetching()` function return a Promise that resolves with the mock data?

## 2. Clarity
- [ ] ✅ Is the `picture` field defined to use `https://i.pravatar.cc/` for mock images or `null` for text fallbacks?
- [ ] ✅ Is the delay mechanism clearly defined to simulate a 1-second network call?

## 3. Edge Cases
- [ ] ✅ Is the type definition robust enough to handle empty arrays for `thank_you_id_from`?
- [ ] ✅ Is the `picture` field strictly typed to handle both valid strings and explicit `null` values?

## 4. Non-Functional
- [ ] ✅ Are the types explicitly exported so they can be consumed by other components across the application?