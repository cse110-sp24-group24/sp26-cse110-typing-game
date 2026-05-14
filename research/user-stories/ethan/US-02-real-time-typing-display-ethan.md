# US-02 · Metrics · Sprint 1

## Real-Time Typing Speed Display

**As a player**, I want to see my current typing speed displayed on the screen while I play, so that I can see my performance and try to improve my speed.

---

## Acceptance criteria

- [ ] A small UI text element is visible on the screen displaying a number representing typing speed
- [ ] The speed is calculated in Characters Per Minute (CPM) rather than Words Per Minute (WPM)
- [ ] The metric updates in real-time (at least once per second) while the wave is active
- [ ] The timer/calculation stops as soon as the final enemy is defeated

---

## Notes

For coding, Characters Per Minute (CPM) is a much more accurate and rewarding than Words Per Minute (WPM) because code involves frequent use of symbols, brackets, and non-standard word lengths. Implementing this early gives players immediate baseline feedback on their mechanical skill.

## Dependencies

- Relies on the core typing input system to register valid keystrokes

## Definition of done

A player can look at the screen during a wave and see a live-updating CPM counter that accurately reflects their speed, which finalizes and stops updating when the wave ends.