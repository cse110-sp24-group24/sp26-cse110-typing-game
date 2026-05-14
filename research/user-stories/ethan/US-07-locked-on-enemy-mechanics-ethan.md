# US-07 · Mechanics · Sprint 3

## Target Locking System for Multiple Enemies

**As a player**, I want the game to automatically lock my typing inputs onto a specific enemy when I type its first letter, so that my keystrokes aren't confused when multiple enemies are on screen at the same time.

---

## Acceptance criteria

- [ ] Typing a character that matches the first letter of an enemy's code line "locks" the player onto that enemy, visually highlighting it.
- [ ] While locked, all subsequent keystrokes apply *only* to the locked enemy, ignoring others.
- [ ] If multiple enemies start with the exact same character, the game prioritizes and locks onto the enemy closest to the bottom of the screen.
- [ ] Pressing `Esc`, or pressing `Backspace` when no characters are currently typed on the locked enemy, releases the target lock.

---

## Notes

As we scale up the difficulty to include multiple lines of code falling at once, target locking is essential to prevent frustration. The logic needs to be solid so the player feels in complete control of which line of code they are writing.

## Dependencies

- Requires the enemy movement and multi-spawning system to be active (see US-07).

## Definition of done

When multiple enemies are on screen, the player can type the first letter of an enemy to lock onto it, successfully type out the rest of the line without accidentally affecting other enemies, and can cancel the lock if they change their mind.