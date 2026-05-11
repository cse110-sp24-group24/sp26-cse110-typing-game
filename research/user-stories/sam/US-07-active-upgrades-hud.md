# US-07 · Roguelite · Sprint 2

## Knowing your loadout — active upgrades HUD

**As a player**, I want a small HUD panel showing all upgrades I've collected this run, so that I can remember what abilities I have and make informed decisions during waves.

---

## Acceptance criteria

- [ ] A HUD panel displays the icon and abbreviated name of each collected upgrade
- [ ] Panel updates immediately when a new upgrade is selected after a boss fight
- [ ] Panel is visible during waves, the boss fight, and the wave intro card
- [ ] Panel does not overlap or obscure the code panel, enemy area, or input field
- [ ] If no upgrades have been collected yet, the panel is hidden or shows an empty state

---

## Notes

After two or three waves the player has a small build going — but it's easy to forget which upgrades were picked several waves ago. The HUD panel is a low-profile memory aid, not a focal point. Icons should be small (24–32px), arranged horizontally along a screen edge. Abbreviated names (e.g., "Slow Fall", "+1 Life") provide a quick reminder without cluttering the play area. This panel is also a quiet reward — seeing it grow across waves reinforces the roguelite progression loop.

## Dependencies

- Upgrade selection system must expose the run-state upgrade list to the HUD (see US-04 in Nishant's stories)
- Layout must be resolved alongside code panel and enemy area positioning (see US-02 in Nishant's stories)

## Definition of done

After selecting an upgrade, it immediately appears as an icon + label in the HUD panel. The panel persists across waves and boss fights. It does not overlap any primary game element. An empty state (no upgrades yet) is handled gracefully.
