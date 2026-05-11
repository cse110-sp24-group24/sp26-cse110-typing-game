# US-03 · Boss · Sprint 2

## Facing a boss that tests the full function

**As a player**, I want the wave boss to require typing the complete function I just assembled, so that the boss fight feels like a natural payoff rather than an unrelated challenge.

---

## Acceptance criteria

- [ ] Boss appears after all wave enemies are cleared
- [ ] Boss challenge presents the full multi-line function to type
- [ ] A per-line progress indicator shows how far through the function the player is
- [ ] Completing the function defeats the boss and ends the wave

---

## Notes

The boss should feel climactic — consider a distinct visual treatment (larger sprite, screen shake on appearance, ominous audio sting). The function typed during the boss is the same one built line by line during the wave, so no new content is introduced; the challenge is recall and sustained accuracy under pressure.

## Dependencies

- Code panel must be complete and visible before boss spawn (see US-02)
- Wave enemy system must signal wave-clear to trigger boss (see US-01)

## Definition of done

After clearing a wave, the boss spawns and presents the full function. The player types it line by line with a visible progress indicator. Completing it defeats the boss and transitions to the upgrade screen.
