# US-09 · Wave · Sprint 3

## Watching your score climb — real-time score counter

**As a player**, I want a live score counter in the HUD that increments with each enemy defeat and boss completion, so that I can feel the momentum of a good run and have a concrete number to chase.

---

## Acceptance criteria

- [ ] A score counter is visible in the HUD throughout waves and the boss fight
- [ ] Defeating a wave enemy awards a fixed base score; defeating the boss awards a larger bonus
- [ ] The counter animates (ticks up over ~300ms) on point gain rather than jumping instantly
- [ ] Score accumulates across all waves and matches the value shown on the end-of-run stats screen exactly

---

## Notes

A live score counter transforms isolated typing events into a run-wide narrative: "I'm at 4,200 — can I hit 6,000?" The tick-up animation (briefly rolling through intermediate values) is a classic arcade trick that makes each score gain feel weighty. Keep the scoring formula simple for MVP — base points per enemy, boss multiplier — so that the score is predictable and players can internalize it quickly. The end-of-run stats screen already shows a final score (per Nishant's US-08); this story ensures that score is earned live, not calculated only at the end.

## Dependencies

- Enemy defeat and boss completion events must emit score signals to the counter (see US-01, US-03 in Nishant's stories)
- HUD layout must accommodate the counter without overlapping other elements (see US-07 in Sam's stories)
- End-of-run stats screen must read from the same score accumulator (see US-08 in Nishant's stories)

## Definition of done

During any wave or boss fight, a score counter is visible in the HUD. It increments with a brief animation on each enemy defeat and boss completion. The final counter value on the last wave matches the score displayed on the end-of-run stats screen.
