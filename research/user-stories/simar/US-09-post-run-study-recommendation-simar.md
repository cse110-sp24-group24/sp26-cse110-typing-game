# US-09 - Reflection - Sprint 3

## Getting a short study recommendation after each run

**As a new CS student**, I want a one-minute study recommendation generated from my mistakes, so that I can connect gameplay to concrete practice goals.

---

## Acceptance criteria

- [ ] End-of-run summary includes a "next 10 minutes" recommendation card
- [ ] Card identifies one syntax area and one typing skill to practice
- [ ] Recommendations are based on observed error patterns from the run
- [ ] Player can dismiss or save the recommendation

---

## Notes

Beginners improve faster with small, actionable feedback loops. A focused recommendation avoids overwhelming users with too many metrics.

## Dependencies

- Analytics layer must classify mistakes by syntax/typing category
- Summary screen must support recommendation card component

## Definition of done

After each run, players receive a short actionable recommendation tied to their actual mistakes, with save/dismiss controls.
