# US-04 · Roguelite · Sprint 2

## Choosing an upgrade between waves

**As a player**, I want to pick from randomized upgrades after each wave, so that every run feels different and I can build a strategy that suits my playstyle.

---

## Acceptance criteria

- [ ] After the boss is defeated, 3 random upgrade cards are presented
- [ ] Each card shows the upgrade name, icon, and a short description
- [ ] Player selects one; the other two are discarded
- [ ] Chosen upgrade is persisted in the player's run state for all subsequent waves

---

## Notes

The upgrade pool is a major driver of replayability. For MVP, aim for at least 8–10 distinct upgrades so that back-to-back runs don't feel identical. Example upgrades: slow enemy fall speed, extra life, shorter snippet length, time freeze on boss. The run state object should be designed with extensibility in mind so post-MVP upgrades can be added without refactoring.

## Dependencies

- Boss encounter must complete and signal wave-end (see US-03)
- Lives/health system needed for life-granting upgrades (see US-09)

## Definition of done

After every boss defeat, 3 non-duplicate upgrade cards are shown. The player picks one, it is stored in the run state, and its effect is active for the remainder of the run.
