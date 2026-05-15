# ADR-003: Module Organization

## Status

Accepted

## Context

With 10 team members contributing to the same codebase, code organization directly impacts how often people step on each other. Without clear module boundaries, two developers could edit the same file for unrelated features, causing merge conflicts and making it hard to assign ownership.

The game has well-separated concerns:
- Snippet data (content)
- Game logic (wave, boss, enemy, typing)
- UI management (screens, HUD, panels)
- Audio
- Persistence

Three organizational strategies were considered:

1. **Single-file** — All game logic in one `game.js`
2. **File-per-feature** (flat, no directories)
3. **Directory-per-layer** (engine / ui / audio / data / utils)

## Decision

Use **ES modules organized into directories by layer**: `engine/`, `ui/`, `audio/`, `snippets/`, `data/`, `utils/`. Each module exports a narrow public API. Modules may only import from their own layer or from layers below them.

## Considered Options

### Option 1: Single File

All game logic, UI, and data in one `game.js`.

**Pros:**
- Simple to get started; no import overhead to set up
- The MVP prototype started this way

**Cons:**
- The MVP prototype's `game.js` is already ~600 lines for a partial implementation. A complete implementation will be 2000+ lines — unmaintainable
- No natural parallel work tracks: every developer edits the same file
- Impossible to unit-test individual behaviors in isolation

### Option 2: File-Per-Feature (Flat)

One file per feature: `typing.js`, `enemies.js`, `boss.js`, `upgrades.js`, `audio.js`, etc., all in `src/`.

**Pros:**
- Slightly easier than a single file; some separation

**Cons:**
- No enforced dependency direction — `boss.js` might import from `audio.js` which imports from `typing.js` which imports from `boss.js`
- Flat directories become hard to navigate above ~15 files
- No signal to new contributors about what layer they're editing

### Option 3: Directory-Per-Layer

Files grouped into `engine/`, `ui/`, `audio/`, `snippets/`, `data/`, `utils/`. Each directory has a clear responsibility. Dependency direction is: `ui/` → `engine/`, `engine/` → `data/`, `engine/` → `utils/`, nothing imports from `ui/`.

**Pros:**
- Clear ownership: UI developers work in `ui/`; game logic developers work in `engine/`
- Dependency direction prevents circular imports
- Scales to the full feature set without becoming unwieldy
- `snippets/` is purely static data — content contributors don't need to understand game logic

**Cons:**
- Slightly more setup than a flat structure
- Team must agree on which layer a new file belongs in

## Decision Outcome

**Option 3 (Directory-Per-Layer)** was chosen. The full structure is documented in the Architecture Overview (`docs/architecture/README.md`).

### Dependency Rules

| Layer | May Import From | May NOT Import From |
|-------|-----------------|---------------------|
| `ui/` | `engine/`, `data/`, `utils/`, `state.js` | (nothing imports ui/) |
| `engine/` | `data/`, `utils/`, `state.js`, `snippets/` | `ui/`, `audio/` |
| `audio/` | `utils/` | `engine/`, `ui/` |
| `snippets/` | — | Everything |
| `data/` | — | Everything |
| `utils/` | — | Everything |
| `main.js` | Everything | — |

`main.js` is the only file that wires all layers together. Engine modules fire callbacks rather than importing UI directly — `main.js` registers those callbacks and delegates to the appropriate UI module.

### Ownership Assignments (Suggested)

| Module | Owner |
|--------|-------|
| `snippets/javascript.js` | Content contributors (any) |
| `snippets/python.js` | Content contributors (any) |
| `engine/typingEngine.js` | Core gameplay pair |
| `engine/enemySystem.js` | Core gameplay pair |
| `engine/waveManager.js` | Core gameplay pair |
| `engine/bossSystem.js` | Boss feature pair |
| `engine/upgradeSystem.js` | Roguelite feature pair |
| `ui/codePanel.js` | Education/UI pair |
| `ui/hudManager.js` | HUD pair |
| `ui/statsScreen.js` | Stats pair |
| `audio/audioManager.js` | Audio owner |

### Positive Consequences
- Merge conflicts are reduced: distinct features live in distinct files
- New contributors can find the relevant file by reading directory names
- Content contributors (snippet authors) work only in `snippets/` with no game logic exposure

### Negative Consequences
- Team must consistently enforce the dependency direction rule — there is no automated enforcement at runtime without a bundler's tree analysis
- Some features (e.g., "pause" touches engine, UI, and audio) require coordinating across layers via `main.js`
