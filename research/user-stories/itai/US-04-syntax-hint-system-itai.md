# US-04 · Education · Sprint 2

## Getting a hint when stuck on syntax

**As a student who forgets which command to use**, I want an optional hint when I am stuck or repeatedly mistyping, so that I can keep learning without feeling blocked.

---

## Acceptance criteria

- [ ] A hint button is available during typing challenges
- [ ] The game can also suggest a hint after repeated errors on the same target
- [ ] Hints explain the purpose of the current syntax without fully typing the answer for the player
- [ ] Using a hint may be tracked separately from accuracy or score

---

## Notes

Hints should feel like support, not cheating. In theme, the hint could appear as a "ghost whisper" that nudges the player toward the concept: "This line is selecting an element by its class name." The player should still complete the typing themselves.

## Dependencies

- Current target line must expose metadata for concept or command explanation
- Input system must track repeated errors or inactivity
- Score/stat system should decide whether hint usage affects final results

## Definition of done

When a player is stuck, they can request or accept a themed hint that explains the current line's purpose. The player remains in control and must still type the code correctly to continue.
