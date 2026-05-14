# US-05 · Progression · Sprint 2

## Staying engaged — between-wave upgrade choices

**As a new CS student**, I want to choose a small upgrade after surviving a wave, so that each run feels rewarding and slightly different without taking attention away from typing.

---

## Acceptance criteria

- [ ] The player is offered at least one upgrade choice between waves
- [ ] Upgrades affect gameplay only after successful typing actions, not instead of them
- [ ] Upgrades do not allow enemies to be defeated without full token completion
- [ ] Upgrade descriptions are brief and understandable
- [ ] The chosen upgrade applies to the current run immediately

---

## Notes

Upgrades should support the typing loop rather than replace it. Good examples include splash on completion, streak bonuses, or defensive recovery after accurate typing.

## Dependencies

- Wave progression system
- Upgrade selection UI
- Run-state persistence for active upgrades

## Definition of done

After clearing a wave, the player can choose an upgrade that changes the run in a noticeable but typing-centered way.