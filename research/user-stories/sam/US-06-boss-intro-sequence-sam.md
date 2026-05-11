# US-06 · Boss · Sprint 2

## The moment of dread — boss introduction sequence

**As a player**, I want a short dramatic sequence to play when the boss spawns, so that I'm mentally prepared for the harder challenge ahead and the transition feels climactic rather than abrupt.

---

## Acceptance criteria

- [ ] After all wave enemies are cleared, a 1–2 second pause occurs before the boss appears
- [ ] Boss sprite enters with a distinct entrance animation (e.g., rising from below the screen, screen shake, fog roll)
- [ ] A unique audio sting plays on boss spawn — clearly different from ambient wave music and enemy defeat sounds
- [ ] Player input is disabled during the intro sequence; the input field is unresponsive

---

## Notes

The gap between "last enemy typed" and "boss appears" is a dramatic beat — don't skip it. A sudden boss spawn would feel jarring. The pause lets the player exhale from the wave and brace for the boss. The entrance animation and audio sting are what make the boss feel like an event rather than just the next thing to type. Input should be locked during the sequence to prevent accidental characters entering the field before the function is displayed, which would cause an immediate mismatch.

## Dependencies

- Wave enemy system must signal wave-clear to initiate the sequence (see US-01 in Nishant's stories)
- Boss encounter must be in place for the sequence to transition into (see US-03 in Nishant's stories)
- Haunted visual/audio theme must define what "distinct boss audio sting" means (see US-07 in Nishant's stories)

## Definition of done

After the last wave enemy is defeated, a 1–2 second pause occurs, followed by the boss sprite entering with a visible entrance animation and a unique audio sting. Player input is locked throughout. The transition into the boss typing challenge is seamless immediately after the sequence ends.
