# US-06 · Feedback · Sprint 3

## Reviewing repeated mistake patterns

**As a student trying to improve**, I want the game to show my repeated mistake patterns after a run, so that I know exactly what syntax habits to work on next.

---

## Acceptance criteria

- [ ] End-of-run feedback identifies repeated errors such as missed braces, missing semicolons, wrong capitalization, or confused symbols
- [ ] The review groups similar mistakes instead of listing every single typo separately
- [ ] Each mistake group includes a short suggestion for improvement
- [ ] The review connects mistakes to relevant concepts when metadata is available

---

## Notes

Basic accuracy is useful, but it does not tell a student what to fix. A player who keeps typing `Document` instead of `document` needs different feedback than a player who mistypes random letters. Grouped mistake feedback turns the run into a useful study report.

## Dependencies

- Input system must store incorrect typed characters and their expected characters
- Stats system must persist mistakes through the full run
- Snippet metadata should identify syntax concepts when possible

## Definition of done

At the end of a run, the player sees grouped mistake patterns with clear suggestions, allowing them to identify at least one specific skill to practice next.
