# US-09 · Education · Sprint 2

## Predicting what code does

**As a student learning to read code**, I want to answer what a function does before or after typing it, so that I practice understanding code instead of only copying characters.

---

## Acceptance criteria

- [ ] A code-purpose question can appear before a boss fight, after a wave, or in practice mode
- [ ] The question shows 2-4 possible descriptions of the function behavior
- [ ] The correct answer matches the actual snippet used in the wave
- [ ] The feedback explains why the correct description is correct in beginner-friendly language

---

## Notes

Typing speed is valuable, but students also need to read code and predict behavior. This feature turns a completed function into a comprehension check. Example: after typing a function that filters long words, the game asks which description matches what the function returns.

## Dependencies

- Snippet library must include a plain-language purpose description for each function
- Concept check UI can be reused for multiple-choice answers
- Boss or wave-end flow must support optional learning questions

## Definition of done

The player can answer a multiple-choice question about what the typed function does and receive feedback that connects the explanation to the actual code.
