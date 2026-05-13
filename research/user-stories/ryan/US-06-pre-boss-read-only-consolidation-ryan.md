# US-06 · Boss · Sprint 2

## A moment before boss-fight to collect thoughts

**As a new CS student**, I want a short read-only loading screen before the boss where I can scan the fully assembled function with no typing pressure, so that I can mentally prepare for the challenge ahead

---

## Acceptance criteria

- [ ] After the last regular enemy and before boss input accepts keys, the assembled function is shown complete for a fixed short window  or until the player presses “Ready”. 
- [ ] Input is disabled during this window; no health loss from idle
- [ ] The view is identical in layout to what the boss will require 
- [ ] Skipping is allowed after a minimum dwell time (e.g., 1s) to prevent instant misclicks for learners who need the time

---

## Notes

We'll probably need to decide how lenient to make this window.  Window could also be customizable with some overhead

## Dependencies

- Assembled function is complete and stable before boss typing starts
- Boss flow supports a gated pause between “wave cleared” and accepting boss keystrokes, plus any boss intro presentation the product already uses

## Definition of done

Playtest shows fewer boss failures without increasing average boss completion time unrealistically.
