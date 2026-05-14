# US-06 - Clarity - Sprint 2

## Seeing where mistakes cluster on the keyboard

**As a new CS student**, I want an end-of-run keyboard heatmap of my error keys, so that I know exactly which keys I should practice.

---

## Acceptance criteria

- [ ] End-of-run summary shows a keyboard layout with error frequency per key
- [ ] Most problematic 3-5 keys are listed explicitly
- [ ] Heatmap can filter by letters, numbers, and symbols
- [ ] Data reflects only the current run unless user opens history view

---

## Notes

Generic "accuracy" percentages are useful but vague. A key-level breakdown gives concrete next steps for beginners improving muscle memory.

## Dependencies

- Input logger must store keypress errors with key identity
- Post-run summary UI must support visual keyboard rendering

## Definition of done

After a run, players can identify their highest-error keys from a keyboard heatmap and targeted list.
