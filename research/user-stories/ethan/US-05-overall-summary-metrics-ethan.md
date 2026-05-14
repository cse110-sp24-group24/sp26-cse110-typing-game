# US-05 · Metrics & Feedback · Sprint 2

## End-of-Wave Performance Summary

**As a player**, I want to see a summary of my performance metrics (accuracy and final CPM) when I finish a wave, so that I understand where I need to improve my typing fundamentals.

---

## Acceptance criteria

- [ ] The game tracks total keystrokes and total *incorrect* keystrokes during the wave.
- [ ] Accuracy is calculated as a percentage `((Total - Incorrect) / Total) * 100`.
- [ ] The "Wave Complete" screen is updated to display the final accuracy percentage and the average CPM for that wave.
- [ ] The internal trackers reset to zero when a new wave is initiated.

---

## Notes

While real-time CPM (US-03) is good for immediate feedback, coding requires high precision. A single missed semicolon breaks a build. Highlighting accuracy at the end of the wave reinforces the educational goal that typing correctly is just as important as typing fast.

## Dependencies

- Requires the basic Start/End screens to be implemented (see US-03).
- Requires real-time CPM and keystroke tracking (see US-02).

## Definition of done

Upon completing a wave, the end screen displays the player's overall accuracy percentage and average CPM for that specific wave, calculated correctly based on their keystrokes.