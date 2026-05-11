# US-10 · UX · Sprint 3

## Stepping away cleanly — pause and quit mid-run

**As a player**, I want to pause the game at any point and choose to resume or end the run, so that I can step away without losing my progress and can intentionally quit without force-closing the browser.

---

## Acceptance criteria

- [ ] Pressing Escape during a wave or boss fight pauses the game
- [ ] A pause overlay appears with at least two options: Resume and Quit Run
- [ ] While paused, enemies stop moving, timers freeze, and the input field is disabled
- [ ] Choosing Quit Run navigates to the end-of-run stats screen using all stats accumulated so far
- [ ] Choosing Resume restores the exact game state that existed before pausing

---

## Notes

Pause is a basic expectation for any game — its absence feels like a bug. For a browser game targeting students, the most common use case is "professor just called on me" or "I need to switch tabs for a second." The pause overlay should be minimal (dark backdrop, two buttons) and keyboard-navigable. Quit Run routing to the stats screen (rather than just resetting) is important: it gives the player closure and their performance data even if they didn't finish. Make sure timers and fall positions are truly frozen — a paused enemy should resume from exactly the same position, not snap back or jump forward.

## Dependencies

- Enemy fall system must expose a pause/resume API (see US-02 in Sam's stories)
- Input field focus system must disable while paused (see US-03 in Sam's stories)
- Stats accumulator must be readable at any mid-run point for the Quit Run flow (see US-08 in Nishant's stories)

## Definition of done

Pressing Escape at any point during a wave or boss fight pauses the game, freezing all movement and timers. The overlay shows Resume and Quit Run options. Resume restores state exactly. Quit Run routes to the stats screen with all accumulated data. The Escape key has no effect on the pause overlay itself (a separate "close" interaction or the Resume button is used to dismiss).
