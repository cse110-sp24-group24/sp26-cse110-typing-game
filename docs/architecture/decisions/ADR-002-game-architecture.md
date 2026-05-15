# ADR-002: Game Architecture Pattern

## Status

Accepted

## Context

Phantom Type has two distinct computational characters running simultaneously during a wave:

1. **Event-driven typing** — The player's keystrokes fire discrete DOM events. Typo highlighting, WPM tracking, and enemy defeat are all triggered by keypress events, not by a recurring timer.

2. **Continuous enemy movement** — Ghost enemies must fall smoothly toward the deadline line. Smooth animation requires a render loop that runs at display refresh rate (~60fps).

A naive implementation that puts everything in a single `requestAnimationFrame` (rAF) loop works for pure game engines but is a poor fit here: the typing logic doesn't benefit from running 60 times per second, and it would make the typing response feel poll-based rather than instantaneous.

Three architectural patterns were evaluated:

1. **Pure rAF game loop** (everything runs on every frame)
2. **Pure event-driven** (no rAF; CSS handles movement)
3. **Hybrid: CSS animations for movement + DOM events for typing**

## Decision

Use **CSS animations for enemy fall movement** combined with **DOM `input` event listeners for typing logic**. The rAF loop is used only for the live score counter's tick-up animation and for reading enemy positions to detect deadline crossings.

## Considered Options

### Option 1: Pure rAF Game Loop

A central `gameLoop(timestamp)` function runs on every frame. It updates enemy Y positions, checks deadline crossings, and re-renders the UI.

**Pros:**
- Single place to reason about timing
- Familiar pattern from game development

**Cons:**
- Typing response latency: a keypress must wait for the next frame before the UI updates, adding up to 16ms of visible lag at 60fps. For a typing game, this is perceptible
- All UI updates happen in the loop even when nothing has changed (wasted work on idle frames)
- Complex to pause/resume correctly

### Option 2: Pure Event-Driven (CSS Animations Only)

CSS `animation` handles enemy movement (keyframes from top to deadline). JS listens to `animationend` or uses `IntersectionObserver` for deadline detection. Typing is handled by DOM events only.

**Pros:**
- Zero JS frame cost for movement — the browser handles it on the GPU compositor thread
- Instant typing response (no frame wait)
- Pause is trivially implemented by toggling `animation-play-state: paused` on all enemies

**Cons:**
- Difficulty detecting the exact frame an enemy crosses the deadline without polling
- CSS animations cannot be easily modified mid-flight (e.g., when a "Slow Fall" upgrade is applied mid-wave — you cannot change `animation-duration` on a running animation without restarting it)

### Option 3: Hybrid — CSS for Movement, Events for Typing, rAF for Deadline Polling

CSS animations drive the visual fall. DOM events drive the typing engine. A lightweight rAF loop reads `getBoundingClientRect()` on each enemy once per frame to detect deadline crossing.

**Pros:**
- Typing response is instant (DOM event → synchronous handler)
- Enemy movement is buttery-smooth (CSS compositor thread)
- Deadline detection is accurate to within one frame (~16ms)
- Pausing enemies requires one CSS property toggle
- The "Slow Fall" upgrade can be applied by restarting the CSS animation with a new duration, which is an acceptable UX because the visual jank is hidden by the upgrade selection screen transition

**Cons:**
- Slightly more complex: two execution paths (rAF + events) instead of one
- `getBoundingClientRect()` in rAF forces a layout recalculation per frame; acceptable for the small number of enemies on screen (~5–8) but must not be called outside of rAF

## Decision Outcome

**Option 3 (Hybrid)** was chosen. The enemy movement system uses CSS `animation` with `animation-fill-mode: forwards` and `animation-timing-function: linear`. A single shared rAF loop — owned by `enemySystem.js` — reads enemy positions and fires a `deadlineBreached` callback when any enemy crosses the threshold. Typing logic lives entirely in `typingEngine.js`, which attaches to the `<input>` element's `input` event.

The pause mechanic applies `animation-play-state: paused` to all `.enemy` elements and cancels the rAF loop until resumed.

### Positive Consequences
- Instant, imperceptible typing feedback — no frame-wait latency
- Smooth 60fps enemy movement driven by the browser's compositor
- Clean separation: `typingEngine` never touches rAF; `enemySystem` never touches the input field
- Pause is a single CSS property change

### Negative Consequences
- The "Slow Fall" upgrade requires restarting CSS animations on live enemies with a new duration. This is visually seamless only when applied between waves (during upgrade selection), not mid-wave.
- `getBoundingClientRect()` must be gated to the rAF callback; calling it elsewhere triggers synchronous layout and hurts performance.

## Implementation Notes

- The rAF loop in `enemySystem.js` runs only while a wave or boss fight is active. It is cancelled when the wave ends, during the upgrade screen, and while paused.
- The deadline position is computed once per wave start from the DOM, not on every frame, to avoid repeated layout queries.
- Enemy count during a wave is bounded to the number of lines in a function (4–8), so rAF position-checking cost is negligible.
