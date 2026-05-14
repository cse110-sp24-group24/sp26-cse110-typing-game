# US-08 · Progression · Sprint 3

## Dynamic Difficulty Scaling

**As a player**, I want the wave difficulty to adapt based on my recent performance, so that the game remains engaging and challenging as my typing speed and accuracy improve.

---

## Acceptance criteria

- [ ] The game calculates a simple "Skill Rating" based on the player's accuracy and average CPM from the previously completed wave.
- [ ] If the skill rating exceeds a defined threshold (ex: >95% accuracy and >200 CPM), the next wave's enemy spawn rate increases by a set multiplier.
- [ ] If the player fails a wave or has very low accuracy/CPM, the next wave's fall speed and spawn rate decrease slightly.
- [ ] The difficulty scaling caps at predefined minimum and maximum limits so the game never breaks or becomes impossible.

---

## Notes

Fixed difficulty curves often leave fast typists bored and slow typists stuck. Dynamic scaling ensures that every CSE110 student, regardless of their prior keyboard experience, finds their "flow state" where the challenge perfectly matches their ability.

## Dependencies

- Requires end-of-wave performance metrics to be fully implemented and stored in variables (see US-05).
- Requires adjustable enemy movement/spawn variables (see US-06).

## Definition of done

The game reads the player's performance data between waves and demonstrably alters the spawn rate or speed of enemies in the following wave based on those metrics.