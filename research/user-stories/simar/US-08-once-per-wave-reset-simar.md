# US-08 - Resilience - Sprint 2

## Recovering after a panic mistake

**As a new CS student**, I want one "reset line" action per wave that clears my current input without penalty, so that a single panic typo does not ruin my flow.

---

## Acceptance criteria

- [ ] Player can trigger one reset action per wave with a dedicated key
- [ ] Reset clears only current input for active target line
- [ ] Reset does not damage player health or reduce score
- [ ] UI shows reset availability and used state

---

## Notes

Beginners sometimes spiral after a bad start on a line. A limited recovery tool preserves challenge while preventing frustration spikes.

## Dependencies

- Input controller must support manual clear event
- HUD needs per-wave consumable indicator support

## Definition of done

Each wave includes one optional no-penalty input reset, with clear UI state before and after use.
