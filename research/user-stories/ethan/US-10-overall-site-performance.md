# US-10 · Performance · Sprint 3

## Smooth and Stable Framerates

**As a player**, I want the game to maintain a consistently smooth framerate without stuttering during intense waves, so that my typing rhythm is never interrupted by browser lag.

---

## Acceptance criteria

- [ ] The enemy spawner utilizes an "Object Pool" design pattern rather than continuously creating and destroying new memory elements (like DOM nodes or Canvas objects).
- [ ] When an enemy is defeated or hits the bottom boundary, its visual element is wiped of text, hidden, and returned to the pool.
- [ ] When a new enemy spawns, it reclaims and updates an inactive element from the pool rather than allocating new memory.
- [ ] Browser performance profiling shows a significant reduction in garbage collection spikes during continuous gameplay.

---

## Notes

In web-based games, constantly instantiating and destroying elements can cause the browser's garbage collector to suddenly pause the main thread to clean up memory, resulting in micro-stutters. For a fast-paced typing game, even a 100-millisecond stutter can cause a player to miss a keystroke and register a frustrating, unfair typo. Object pooling ensures memory allocation remains flat and stable during long play sessions.

## Dependencies

- Requires the enemy spawner and despawner (fail state/success state) logic to be implemented so it can be refactored (see US-01 and US-08).

## Definition of done

Browser developer tools and performance profilers confirm that DOM node count/memory usage plateaus rather than endlessly climbing during a wave. Enemies seamlessly recycle existing visual objects upon spawning and despawning without any visual glitches or input delay.