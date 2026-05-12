# US-09 · Roguelite · Sprint 3

## Surviving waves with limited lives

**As a player**, I want a lives or health system, so that mistakes feel meaningful and losing a run motivates me to improve my typing accuracy.

---

## Acceptance criteria

- [ ] Player starts with a set number of lives (e.g., 3)
- [ ] A life is lost when an enemy "falls" past the deadline without being typed
- [ ] Visual and audio feedback plays on life loss
- [ ] Run ends when all lives are depleted, triggering the stats screen

---

## Notes

Lives are the primary risk/reward mechanic. The "fall deadline" — the point at which an enemy is considered to have escaped — needs to be clearly communicated visually so players never feel a life loss was unfair. Consider a screen-edge flash or brief slow-motion effect on life loss to make it feel impactful without being punishing. The starting life count (3) should be a tunable constant to make balancing easier during playtesting.

## Dependencies

- Enemy fall/movement system must define a deadline position (see US-01)
- Life-granting upgrades depend on this system (see US-04)
- Run-end state feeds into stats screen (see US-08)

## Definition of done

The player has a visible life counter starting at 3. Enemies that reach the deadline subtract a life with visual and audio feedback. Reaching 0 lives ends the run and shows the stats screen.
