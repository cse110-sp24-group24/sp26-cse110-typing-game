# US-01 · Content · Sprint 1

## Hardcoded Code Prompts

**As a beginner CS student**, I want the enemies to display simple, recognizable lines of code (like basic JS statements), so that I am practicing relevant syntax right from the start without being overwhelmed.

---

## Acceptance criteria

- [ ] The game loads a predefined, hardcoded list of 5-10 beginner-level code lines (`let count = 0;`)
- [ ] The lines are fed in order to the enemies as they spawn
- [ ] The game handles the end of the list without crashing (ends the wave)

---

## Notes

To keep Sprint 1 as easy as possible and achieve a playable build, we are bypassing external databases or complex text file parsing. Hardcoding a small list of introductory JS lines provides immediate, relevant content for testing the core input loop. This ensures we can test the mechanics before building a robust content delivery system.

## Dependencies

- Feeds directly into the enemy health bar/typing system

## Definition of done

When the wave starts, the player encounters simple lines of code attached to enemies, pulled from a list in the game's script, and the wave concludes safely when the list is finished.