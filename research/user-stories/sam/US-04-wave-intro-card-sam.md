# US-04 · Education · Sprint 1

## Knowing what you're about to type — wave intro card

**As a CS student**, I want a brief intro card at the start of each wave naming the function and explaining in plain English what it does, so that I can connect the code I'm typing to a real programming concept.

---

## Acceptance criteria

- [ ] A card is shown for 2–3 seconds before any enemies appear
- [ ] Card displays: wave number, function name (e.g., `reverseString`), and one plain-English sentence describing what the function does
- [ ] The card is dismissible early by pressing any key
- [ ] The same function name remains visible in the code panel header throughout the wave

---

## Notes

This is a lightweight but high-value educational touch. Without it, players are just typing characters; with it, they're learning that `reverseString` takes a string and returns it backwards. The sentence must be written in the snippet library alongside each function — it's content work, not just UI. Keep the card brief: it's a primer, not a tutorial. The dismiss-on-keypress option respects players who've seen the function before and want to move immediately.

## Dependencies

- Snippet library must include a plain-English description field for each function (see US-10 in Nishant's stories)
- Wave enemy system must gate enemy spawning until the card is dismissed or the timer expires (see US-01 in Nishant's stories)
- Code panel must display the function name in its header (see US-02 in Nishant's stories)

## Definition of done

At the start of each wave, a styled card appears showing the wave number, function name, and a one-sentence plain-English description. It auto-dismisses after 3 seconds or on any keypress. Enemies begin appearing only after dismissal. The function name is visible in the code panel header for the duration of the wave.
