# US-03 · Game State · Sprint 1

## Basic Start and End Screens

**As a player**, I want the game to open to a start screen and show an end screen when I finish, so that I am not immediately thrown into the typing action before I am ready.

---

## Acceptance criteria

- [ ] The application launches into a static "Start Screen" waiting for player input
- [ ] Pressing the designated start key starts the game into the active wave state
- [ ] Once the final line of code is typed and the wave ends, the game transitions to a "Wave Complete" screen
- [ ] The end screen includes a prompt to restart the game loop or exit

---

## Notes

This establishes the foundational game loop. Since we are building an MVP in Sprint 1, the UI does not need to have graphics or polished menus. Simple text overlays are perfectly acceptable to prove the game state logic works before we start adding complex wave managers or levels.

## Dependencies

- Relies on the wave completion logic to trigger the end screen

## Definition of done

A player can launch the application, wait on a start screen, press a key to initiate the gameplay, defeat the enemies, and successfully arrive at an end screen that stops the gameplay loop.