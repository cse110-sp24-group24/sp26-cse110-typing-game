# US-10 · Accessibility · Sprint 2

## Adjusting haunted effects for comfort

**As a player who enjoys the haunted theme but can be sensitive to intense effects**, I want settings for scare intensity, flashing, and audio volume, so that I can play comfortably without losing the game's atmosphere.

---

## Acceptance criteria

- [ ] Settings include controls for scare intensity, flashing effects, ambient volume, and sound effect volume
- [ ] Reduced-intensity mode removes sudden intense jump scares and minimizes flashing
- [ ] Audio settings affect gameplay sounds immediately
- [ ] Settings persist between sessions on the same device

---

## Notes

The haunted theme should be exciting, but players need control over sensory intensity. Accessibility settings make the game usable for more students and help prevent the theme from becoming a barrier to learning. Reduced intensity should preserve atmosphere through visuals, music, and gentle suspense rather than removing the theme entirely.

## Dependencies

- Haunted visual and audio systems must expose intensity or volume controls
- Settings must be saved locally
- Suspense events must check the player's selected intensity level

## Definition of done

A player can open settings, reduce scare and flashing intensity, adjust audio levels, and continue playing with those preferences applied immediately and remembered on return.
