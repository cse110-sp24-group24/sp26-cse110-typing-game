# US-06 · Education · Sprint 3

## Getting post-wave feedback on accuracy

**As a student**, I want to see my accuracy and typing speed after each wave, so that I know which syntax patterns I'm struggling with and can improve over time.

---

## Acceptance criteria

- [ ] A brief interstitial screen after each wave shows WPM and accuracy %
- [ ] Mistakes are highlighted with the correct character shown alongside
- [ ] The screen appears before the upgrade selection, not replacing it
- [ ] Results are also tallied for the final end-of-run stats screen

---

## Notes

This is one of the most educationally valuable screens in the game. Showing *which* characters were mistyped (e.g., missing a semicolon, confusing `==` with `===`) helps students connect in-game mistakes to real syntax habits. Keep the screen brief — it should inform, not interrupt. A 3–5 second auto-advance with the option to linger is a good pattern.

## Dependencies

- Stat tracking logic shared with end-of-run stats screen (see US-08) — build together
- Must slot into the wave-end flow before upgrade selection (see US-04)

## Definition of done

After each wave (including the boss), a feedback screen displays WPM, accuracy %, and a character-level breakdown of mistakes. It dismisses to the upgrade selection screen and contributes data to the final stats screen.
