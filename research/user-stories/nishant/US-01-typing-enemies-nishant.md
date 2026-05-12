# US-01 · Wave · Sprint 1

## Typing enemies to progress through a wave

**As a player**, I want to defeat ghost enemies by correctly typing a line of code, so that I can advance through each wave and feel my typing skills directly impact the game.

---

## Acceptance criteria

- [ ] Each enemy displays one line of code as its "health bar"
- [ ] Correct typing removes the enemy and reveals the next line
- [ ] Typos are visually flagged in red without clearing the input
- [ ] The wave ends after all enemies (lines) are defeated

---

## Notes

This is the core input loop — everything else in the game depends on this feeling responsive and accurate. Typo feedback should be immediate (on keypress), not deferred to submission.

## Dependencies

- Snippet library must exist for at least one language (see US-10)
- Language selection must be resolved before a wave starts (see US-05)

## Definition of done

A player can launch a wave, type each enemy's code line correctly, see typos highlighted in real time, and reach the end of the wave with all enemies cleared.
