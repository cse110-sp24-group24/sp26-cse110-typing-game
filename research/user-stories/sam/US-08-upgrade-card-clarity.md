# US-08 · Roguelite · Sprint 2

## No vague upgrades — precise mechanical descriptions on cards

**As a player**, I want each upgrade card to state its exact numerical effect (e.g., "Enemies fall 30% slower for the rest of this run"), so that I can make a real strategic decision rather than guessing at vague wording.

---

## Acceptance criteria

- [ ] Each card shows: upgrade name, icon, and a one-sentence mechanical description
- [ ] Descriptions include specific values wherever applicable (percentages, time, counts)
- [ ] Descriptions use present-tense effect language, not flavor text (e.g., "Reduces fall speed by 30%" not "The fog slows time")
- [ ] All descriptive text fits on the card at standard viewport sizes without overflow or truncation

---

## Notes

Upgrade cards with vague descriptions ("Eerie Mist — the ghosts seem slower…") are frustrating in roguelites because players can't plan around them. A card that says "Reduces enemy fall speed by 30% for this run" is immediately actionable. Flavor text and precise mechanics can coexist — put the precise effect first, then a short atmospheric subtitle if desired. The values (30%, +1, etc.) should be defined as constants in the upgrade data so that changing a value updates both the gameplay and the card description automatically.

## Dependencies

- Upgrade data model must include a `description` field with effect values, not just a name (see US-04 in Nishant's stories)
- Card layout must accommodate a description line without overflow (see US-04 in Nishant's stories)

## Definition of done

Every upgrade card in the MVP upgrade pool shows a specific, numerical mechanical description. A playtester reading the cards can predict exactly what each upgrade will change before picking it. No card relies on flavor text alone to explain its effect.
