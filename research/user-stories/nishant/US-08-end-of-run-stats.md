# US-08 · End Screen · Sprint 3

## Reviewing performance at the end of a run

**As a player**, I want a clear stats screen when my run ends, so that I have a sense of accomplishment and can set a personal goal for my next attempt.

---

## Acceptance criteria

- [ ] Screen displays: total accuracy %, average WPM, waves survived, and final score
- [ ] Score formula is visible or explained (e.g., WPM × accuracy × wave multiplier)
- [ ] A "play again" button returns to the language selection screen
- [ ] Stats are shown whether the run ended by defeat or run completion

---

## Notes

The stats screen closes the run loop and is a key retention driver — players who understand their score are more likely to want to beat it. Make the score formula transparent so players know exactly what to improve. "Play again" should return to language selection, not skip it, so players can switch languages between runs. This screen is also the natural hook for the post-MVP leaderboard feature.

## Dependencies

- Stat tracking must accumulate data across all waves (see US-06)
- Lives system must be able to trigger run-end state (see US-09)

## Definition of done

When a run ends (by death or completion), the stats screen appears showing accuracy, WPM, waves survived, and score with its formula. A "play again" button routes back to the language selection screen.
