# US-05 · UX · Sprint 2

## The satisfying vanish — enemy defeat animation

**As a player**, I want a ghost enemy to play a dissolve animation when I correctly type its line, so that each defeat feels rewarding and unambiguously confirms my input was accepted.

---

## Acceptance criteria

- [ ] On correct line submission, the enemy sprite plays a dissolve or fade-out animation
- [ ] A distinct audio cue (ghost shriek, pop, or crackle) plays on each defeat
- [ ] The next enemy does not spawn at the exact moment of defeat — there is a brief overlap or ≤ 200ms delay so animations don't collide
- [ ] Defeat animation duration is ≤ 500ms so it does not slow game pace

---

## Notes

The defeat animation is the main feedback loop reward. Without it, correct typing just makes text disappear — with it, the player *killed a ghost*. That emotional beat is what makes the theme land. The animation should feel supernatural: dissolve into particles, melt upward, flicker out. The 500ms cap is important — if it runs longer the game starts to feel sluggish, especially in later waves with more enemies. The audio cue must be distinct from the background ambience so it reads clearly even without looking at the screen.

## Dependencies

- Enemy sprite system must support animation states beyond idle (see US-07 in Nishant's stories)
- Enemy typing system must signal "correct submission" to trigger the animation (see US-01 in Nishant's stories)

## Definition of done

When a player correctly types an enemy's line, the ghost sprite plays a ≤ 500ms dissolve animation with a matching audio cue before disappearing. The next enemy appears no earlier than when the animation is half-complete. A tester can confirm the defeat animation without reading the code by watching a wave play through.
