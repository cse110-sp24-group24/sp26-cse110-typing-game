# US-05 · Education · Sprint 2

## Closing the loop from fingers to meaning

**As a new CS student**, I want a single plain-language sentence after each wave that explains what the function I typed does so that I can practice repitition with understanding.  

---

## Acceptance criteria

- [ ] After wave completion (post-boss, pre-upgrade or in that transition), a non-blocking panel shows one sentence describing behavior at a beginner level
- [ ] The explanation matches the assembled function; if multiple interpretations exist, pick the teaching intent of the snippet author
- [ ] The player can dismiss instantly; no forced wait longer than a brief default 
- [ ] Explanations are localized/styled consistently with the UT

---

## Notes

Might be best to implement this as an optional feature that you can turn on, as it's targetted towards students that really want to focus on learning. 

## Dependencies

- Authoring path for one short explanation per snippet 
- Game can detect wave end or boss clear to show the explanation at the right transition

## Definition of done

Test snippets each have an approved explanation reviewed for accuracy; playtesters report they understand what they typed for, not only that they typed it.
