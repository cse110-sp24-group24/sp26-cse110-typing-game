# US-03 · Wave · Sprint 1

## Typing without interruption — input field auto-behavior

**As a player**, I want the typing input field to auto-focus at wave start and auto-clear after each enemy is defeated, so that I can type continuously without ever clicking or manually resetting.

---

## Acceptance criteria

- [ ] Input field receives keyboard focus automatically when a wave begins
- [ ] On correct enemy defeat, the field clears instantly and stays focused
- [ ] Pasting is disabled so players are required to type manually
- [ ] The input field does not lose focus mid-wave unless the game is paused
- [ ] On an incorrect character, the field does not clear — the player corrects in place

---

## Notes

This story is about the lowest-level feel of the game. If the input field ever loses focus, or if a player has to click to re-engage after a defeat, the flow is broken. Auto-focus and auto-clear should be imperceptible — they happen fast enough that the player just feels like they're typing one continuous stream. Disabling paste is an educational integrity decision: the whole point is to build muscle memory, not to copy-paste code.

## Dependencies

- Wave enemy system must signal "enemy defeated" for the clear trigger (see US-01 in Nishant's stories)
- Typo highlighting (red characters) must operate on the same input field (see US-01 in Nishant's stories)
- Pause system must be able to blur/disable the field (see US-10 in Sam's stories)

## Definition of done

A player starts a wave without clicking anything and types from first enemy to last without the input field ever losing focus or requiring a manual clear. Paste attempts produce no input. Mistakes are corrected in place without a field reset.
