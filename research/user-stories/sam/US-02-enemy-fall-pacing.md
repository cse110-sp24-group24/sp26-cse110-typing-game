# US-02 · Wave · Sprint 1

## Enemies falling toward a visible deadline line

**As a player**, I want enemies to move steadily downward toward a visible deadline line, so that I feel urgency and always know exactly when a life is at risk.

---

## Acceptance criteria

- [ ] Each enemy has visible downward movement at a steady pace
- [ ] A clearly marked deadline line sits at the bottom of the play area
- [ ] An enemy that crosses the deadline without being typed triggers a life loss
- [ ] Fall speed is a single tunable constant, accessible to the upgrade system

---

## Notes

The deadline line is the game's core tension mechanic — it's what makes typing feel urgent rather than leisurely. It should be visually prominent (a glowing red line, a crumbling floor, something thematic) so that the danger threshold is never ambiguous. Players should never feel a life loss was invisible or unfair. Fall speed needs to be a named constant in code so that the "slow fall" upgrade can modify it cleanly without touching the movement logic.

## Dependencies

- Enemy entity system must exist to attach movement to (see US-01 in Nishant's stories)
- Lives system needs a trigger from this system when the deadline is crossed (see US-09 in Nishant's stories)
- Slow-fall upgrade must read the same speed constant this system defines (see US-04 in Nishant's stories)

## Definition of done

During a wave, enemies visibly move downward. A styled deadline line is drawn at the bottom of the play area. Any enemy that crosses it removes a life with immediate visual feedback. The fall speed constant is documented and referenced by the upgrade system.
