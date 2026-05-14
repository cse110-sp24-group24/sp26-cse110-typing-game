# US-06 · Game Mechanics · Sprint 2

## Enemy Movement and Fail State

**As a player**, I want the enemies to slowly move down the screen and cost me a life if they reach the bottom, so that there is a sense of urgency and an actual win/lose condition to the game.

---

## Acceptance criteria

- [ ] Enemies spawn at the top of the screen and move downward at a consistent, adjustable speed.
- [ ] The player starts the wave with a set number of lives displayed on the UI.
- [ ] If an enemy's text box touches the bottom boundary of the screen before being completely typed, the enemy despawns, and the player loses 1 life.
- [ ] If the life counter reaches 0, the current wave immediately ends and transitions to a "Game Over" screen.

---

## Notes

This feature transitions the project from a static typing test into an actual game. Since the target audience is CSE110 beginners, the downward movement speed needs to be slow enough to allow them to read and comprehend the code snippet, but fast enough to encourage typing improvement. The speed variable should be easily adjustable for future difficulty tuning.

## Dependencies

- Requires the core typing loop and enemy rendering to be functional.
- Requires the basic start/end game state logic to handle the new "Game Over" transition (see US-03).

## Definition of done

During an active wave, enemies visually travel downwards. Letting an enemy hit the bottom boundary reduces the player's visible life counter, and reaching 0 lives successfully interrupts the wave to display a Game Over screen.