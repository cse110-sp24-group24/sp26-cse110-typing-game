# ADR-005: Enemy Rendering and Movement

## Status

Accepted

## Context

Ghost enemies are the visual centrepiece of each wave. Each enemy:
- Displays a single line of code as its "target text"
- Falls downward at a configurable speed
- Has a themed ghost sprite
- Plays a dissolve/vanish animation when defeated
- Freezes in place when the game is paused

Additionally, there can be multiple enemies on screen simultaneously (one per line, up to 4–8 per wave), though only one is "locked on" for input at a time.

Three rendering approaches were evaluated:

1. **Canvas 2D rendering** — enemies drawn on a `<canvas>` each frame
2. **DOM elements with CSS animations** — each enemy is a `<div>` with an SVG sprite, moved via CSS `animation`
3. **SVG scene graph** — entire game area is one `<svg>` element; enemies are `<g>` children

## Decision

Use **DOM `<div>` elements with inline SVG sprites, positioned absolutely and animated with CSS `animation`**. Each enemy is created dynamically from a template, appended to the game container, and removed from the DOM after its defeat animation completes.

## Considered Options

### Option 1: Canvas 2D

Enemies and their code text are drawn on a `<canvas>` element inside a `requestAnimationFrame` loop.

**Pros:**
- Maximum control over rendering; pixel-perfect positioning
- No DOM layout cost for enemy positions
- Easy to draw arbitrary shapes and effects

**Cons:**
- Text rendering on Canvas is primitive compared to HTML — no syntax highlighting, no CSS fonts, poor subpixel rendering
- The code panel, HUD, input field, and overlays are all HTML elements; mixing canvas enemies with HTML UI creates two parallel rendering systems that are difficult to keep synchronized
- Accessibility: Canvas content is invisible to screen readers; `role="img"` workarounds are inadequate for code text
- The MVP prototype's ghost SVG sprites already exist and work beautifully in DOM; porting them to Canvas drawing commands would be a regression

### Option 2: DOM `<div>` + CSS Animation (Chosen)

Each enemy is a `<div class="enemy">` containing an SVG sprite and a code text span. Downward movement is handled by a CSS `@keyframes` animation from `top: -10%` to `top: 100%`. The animation duration is derived from the current `fallSpeedMultiplier` in `RunState`.

**Pros:**
- CSS compositor thread handles movement with no JS frame cost
- Ghost SVG sprites from the MVP prototype work directly, no conversion needed
- Text in DOM supports proper subpixel rendering, font features, and eventually syntax highlighting overlay
- Pause is a single property: `enemy.style.animationPlayState = 'paused'`
- Defeat animation is a CSS `@keyframes` (`dissolve`) triggered by adding a class
- The deadline detection uses one `getBoundingClientRect()` call per enemy per frame — cheap and accurate (see ADR-002)

**Cons:**
- Changing animation speed mid-flight (mid-wave slow-fall upgrade) requires restarting the animation, which causes a brief visual stutter. This is acceptable because slow-fall is applied only between waves (during upgrade selection)
- Absolute positioning of 4–8 enemies must be managed carefully to avoid overlap. Enemies spawn at different horizontal positions (randomized within a safe range) to prevent visual collisions

### Option 3: SVG Scene Graph

The play area is a single `<svg>` element. Enemy groups (`<g>`) are translated with SVG `animateTransform` or CSS transforms.

**Pros:**
- All rendering is in one coordinate system
- SVG `text` elements preserve code text in the accessibility tree

**Cons:**
- SVG `text` has weaker CSS support than HTML `span` — no `line-height`, limited `white-space` handling, which matters for the code text display
- Mixing SVG with the HTML-based HUD and input field still requires two coordinate systems
- Browser support for SVG animations via CSS is inconsistent across older targets
- The MVP prototype renders SVG sprites as inline HTML, not as native SVG scene graph children

## Decision Outcome

**Option 2 (DOM + CSS)** was chosen. It directly builds on the MVP prototype's proven SVG sprite collection and provides the cleanest pause behavior.

### Enemy Lifecycle

```
spawnEnemy(snippet, lineIndex)
    → createElement('div.enemy')
    → inject SVG sprite + code text span
    → set animation-duration from RunState.fallSpeedMultiplier
    → append to #play-area
    → rAF loop begins checking getBoundingClientRect()

correctSubmission()
    → enemy.classList.add('dissolving')       // triggers CSS keyframe
    → after 500ms: enemy.remove()
    → next enemy spawns (or wave-clear fires)

deadlineBreached()
    → enemy.remove() immediately
    → lossLife() callback fires
```

### Sprite Variety

The MVP prototype includes 5 distinct SVG ghost designs. `enemySystem.js` selects a sprite using `lineIndex % ENEMY_SHAPES.length` to ensure variety within a wave without randomness causing the same sprite twice in a row.

### Positive Consequences
- Instant pause/resume with no game loop changes
- Defeat animation is pure CSS — no JS timing coordination required
- Ghost sprites are reused directly from the MVP prototype

### Negative Consequences
- Mid-wave "slow fall" upgrade creates a visual restart of the CSS animation if applied during active gameplay. Mitigation: the upgrade selection screen only appears between waves, so this scenario cannot occur in normal gameplay.
