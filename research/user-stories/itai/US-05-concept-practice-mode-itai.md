# US-05 · Practice · Sprint 3

## Choosing a concept to practice

**As a student preparing for class or homework**, I want to choose a specific concept to practice, so that I can focus on the commands and syntax I am currently struggling with.

---

## Acceptance criteria

- [ ] Practice mode lets the player choose from concept categories such as CSS, DOM, loops, conditionals, or functions
- [ ] Snippets in practice mode match the selected concept category
- [ ] Practice mode can run without full roguelite progression if the player only wants targeted repetition
- [ ] The selected concept is visible during the session

---

## Notes

Random waves are good for general practice, but students often know what they are weak at. A focused practice mode helps the game become useful as a study tool, not just an arcade experience. For MVP, this could be a simple menu that filters existing snippets by tag.

## Dependencies

- Snippet library must include concept tags
- Pre-run menu must support selecting game mode or practice focus
- Stats screen should distinguish practice sessions from standard runs

## Definition of done

A player can start a practice session for one selected concept and only receive snippets related to that topic. The session clearly shows what concept is being practiced.
