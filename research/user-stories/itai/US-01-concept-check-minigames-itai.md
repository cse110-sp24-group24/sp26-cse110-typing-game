# US-01 · Education · Sprint 2

## Answering concept questions between typing challenges

**As a student learning front-end development**, I want short multiple-choice concept questions between typing challenges, so that I can remember which command or syntax pattern to use for a specific purpose.

---

## Acceptance criteria

- [ ] A concept check can appear after a wave, before an upgrade screen, or inside a dedicated learning break
- [ ] Each question has one correct answer and 2-3 plausible incorrect answers
- [ ] Questions ask either what a command does or which command should be used for a described task
- [ ] Correct and incorrect answers both show a brief explanation before gameplay continues

---

## Notes

Typing code builds muscle memory, but beginners also need to know why a command exists and when to reach for it. These questions should stay quick and lightweight so they reinforce the learning loop without turning the game into a quiz app. Example: "Which CSS property changes the color of text?" with choices like `color`, `background-color`, and `font-style`.

## Dependencies

- Snippet or question library must include concept metadata for each supported topic
- Wave-end flow must allow an optional learning interstitial before upgrades or the next wave

## Definition of done

A player can complete a wave, answer a multiple-choice concept question related to the code they practiced, receive immediate explanation feedback, and continue the run without losing game progress.
