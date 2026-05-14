# US-03 - Accessibility - Sprint 1

## Reducing stress with a slow-start mode

**As a new CS student**, I want the first 10 seconds of each wave to run at reduced enemy speed, so that I can settle in before full intensity begins.

---

## Acceptance criteria

- [ ] Each wave starts with a 10-second reduced-speed phase
- [ ] A visible "slow start" indicator shows remaining time
- [ ] Speed ramps smoothly to normal pace after the phase
- [ ] Option can be toggled off by experienced players

---

## Notes

Beginners often need a moment to orient to the current snippet and keyboard position. A predictable slow-start window lowers anxiety without removing challenge.

## Dependencies

- Enemy movement system must support temporary speed modifiers
- HUD must display timed state indicators

## Definition of done

At wave start, enemy speed is slower for 10 seconds with a clear UI indicator, then transitions to normal speed automatically.
