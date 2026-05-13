# US-08 · Difficulty · Sprint 3

## Matching challenge to typing performance

**As a beginner who is still building confidence**, I want the game difficulty to adjust based on my accuracy and speed, so that the game stays challenging without becoming frustrating.

---

## Acceptance criteria

- [ ] The game tracks recent accuracy, WPM, and missed enemies during a run
- [ ] Difficulty can adjust enemy speed, snippet length, or time pressure between waves
- [ ] Adjustments are gradual and avoid sudden spikes
- [ ] The player can still choose a fixed difficulty if they do not want adaptive changes

---

## Notes

Beginners can feel discouraged if the game becomes too hard too fast, while stronger typists can get bored if it stays slow. Adaptive difficulty keeps the experience in a productive zone. The system should be transparent enough that players understand why the next wave feels easier or harder.

## Dependencies

- Stat tracking must be available during the run
- Wave manager must support tunable speed and snippet complexity
- Snippet library needs difficulty labels or line-length metadata

## Definition of done

Between waves, the game adjusts difficulty using recent player performance and keeps changes gradual. A player struggling with accuracy gets a more manageable next wave, while a player performing well gets a stronger challenge.
