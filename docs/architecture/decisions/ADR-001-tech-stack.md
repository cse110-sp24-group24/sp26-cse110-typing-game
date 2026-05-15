# ADR-001: Frontend Technology Stack

## Status

Accepted

## Context

Phantom Type is a browser-based game that must run without a server, be deployable as static files, and be accessible to all team members regardless of their familiarity with JavaScript frameworks or build tools. The team is a mix of 10 CS students in varying stages of JavaScript familiarity. The game must work on desktop browsers (Chrome, Firefox, Safari) and requires:

- A game loop for enemy movement
- Real-time DOM updates on every keypress
- CSS animations for ghost sprites
- A code panel with syntax highlighting
- Audio playback
- No login or backend

Three options were evaluated:

1. **Vanilla HTML + CSS + JavaScript (ES modules, no bundler)**
2. **React + Vite**
3. **Phaser.js (game framework)**

## Decision

Use **vanilla HTML, CSS, and JavaScript with ES modules**. No build step. No framework. No bundler.

## Considered Options

### Option 1: Vanilla HTML/CSS/JS (ES Modules)

The game runs from an `index.html` that imports JS modules via `<script type="module">`. All DOM manipulation is done with native browser APIs. CSS handles animations and layout.

**Pros:**
- Zero setup — any team member can open `index.html` in a browser and have a working game
- No build artifacts to configure or maintain
- The MVP prototype already works this way; switching frameworks would require rewriting working code
- ES modules provide the same separation of concerns as a framework without the overhead
- Deployable to GitHub Pages with no CI pipeline

**Cons:**
- No component model; team must maintain their own DOM structure discipline
- No hot module replacement during development (full page reload on change)
- Tree-shaking not available; all imported modules load

### Option 2: React + Vite

React's component model would organize the UI well. Vite provides fast HMR.

**Pros:**
- Strong component abstraction for screens and UI elements
- React state management is familiar to some team members
- Vite's HMR speeds up iteration

**Cons:**
- Requires Node.js + npm install before any team member can work
- Game loop (rAF) and React's render cycle are philosophically at odds; mixing them requires careful discipline to avoid performance issues
- Henry's individual prototype used React/Vite and was notably more complex to set up than the vanilla prototypes
- Increases CI complexity (need to run `npm build` before deploying)
- Beginner team members face a steeper onboarding cliff

### Option 3: Phaser.js

Phaser is a purpose-built 2D game framework with a built-in physics engine, asset loader, input manager, and scene graph.

**Pros:**
- Built-in game loop, camera, sprite management, audio, and input handling
- Large community and extensive documentation

**Cons:**
- Phaser is designed for canvas-based games; Phantom Type's UI (code panel, HUD overlays, typing input) is inherently HTML — mixing Phaser canvas with HTML DOM elements is awkward and a known pain point
- Bundle size (~1MB minified) is significant for a small game
- Steep learning curve for the whole team; none of the existing prototypes use it
- Most of what Phaser provides (physics, sprites, cameras) is not needed for a typing game

## Decision Outcome

**Vanilla HTML/CSS/JS with ES modules** was chosen because:

1. The MVP prototype is already built this way and demonstrates the approach works
2. Zero setup friction means all 10 team members can contribute immediately
3. The game's rendering needs are modest (DOM + CSS animations), and do not require a game framework
4. GitHub Pages deployment requires no build step

### Positive Consequences
- Any team member can open the project with no install
- The full game is readable as plain source files
- Changing one module does not risk breaking framework-specific behavior elsewhere

### Negative Consequences
- The team must enforce their own module boundary discipline without a framework's help
- No HMR; development iteration uses full page reloads
- Third-party libraries (Prism.js, audio files) are loaded via CDN or placed in a `lib/` directory manually

## Compliance

All new code files must be `.js` ES modules or `.html`/`.css` files. No TypeScript, JSX, or bundler configuration files should be added to the main source tree without a new ADR superseding this one.
