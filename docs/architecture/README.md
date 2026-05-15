# Architecture Overview — Phantom Type

## What This Document Is

This document describes the software architecture for **Phantom Type**, a browser-based roguelite typing game targeting beginner-to-intermediate CS students. It was produced after synthesizing the MVP specification and all team user stories. Every significant structural decision is recorded in a companion ADR (Architecture Decision Record) under `decisions/`.

---

## System Summary

Phantom Type is a **single-page web application** with no backend. It runs entirely in the browser, requires no install or login, and is deployable as static files (e.g., GitHub Pages). The target platform is desktop browsers (Chrome, Firefox, Safari) on standard laptop keyboards.

---

## Screens and Game Flow

The game moves through five distinct screens in a fixed order. Each screen is a `<div>` rendered or hidden via CSS classes; there is no routing library.

```
Main Menu
    │
    ▼
Language Selection  ◄──────────────────────────────┐
    │                                               │
    ▼                                               │
Wave Intro Card                                     │
    │                                               │
    ▼                                               │
Game Screen  ──►  [Enemy Wave Loop]                 │
    │                ▼                              │
    │            Boss Intro Sequence                │
    │                ▼                              │
    │            Boss Fight                         │
    │                ▼                              │
    │            Wave Feedback Screen               │
    │                ▼                              │
    │            Upgrade Selection                  │
    │                ▼                              │
    │            (next wave or run-end)             │
    │                                               │
    ▼                                               │
End-of-Run Stats Screen  ──► "Play Again" ──────────┘
```

**Pause** is an overlay that can interrupt the Game Screen at any time, freezing all state until resumed or until the player quits to the Stats Screen.

---

## Module Map

The game is organized as ES modules. Each module owns a single responsibility and communicates through a shared `RunState` object and direct function calls. No event bus or global variables outside of `RunState`.

```
src/
├── main.js              # Entry point; wires modules, handles screen transitions
├── state.js             # RunState object definition and factory
├── snippets/
│   ├── index.js         # Exports getSnippet(), getSnippetsForLanguage()
│   ├── javascript.js    # JS snippet library
│   └── python.js        # Python snippet library
├── engine/
│   ├── waveManager.js   # Wave lifecycle: spawn → clear → boss signal
│   ├── enemySystem.js   # Enemy movement, deadline detection, fall speed
│   ├── bossSystem.js    # Boss intro sequence, boss typing loop
│   ├── typingEngine.js  # Input comparison, typo highlighting, WPM/accuracy
│   └── upgradeSystem.js # Upgrade pool, random selection, effect application
├── ui/
│   ├── screenManager.js # Show/hide screens
│   ├── hudManager.js    # Score, lives, wave number, active upgrades panel
│   ├── codePanel.js     # Function assembly display with syntax highlighting
│   ├── statsScreen.js   # End-of-run stats rendering
│   └── waveIntroCard.js # Wave intro card display and dismiss logic
├── audio/
│   └── audioManager.js  # Audio element pool, play/pause/volume
├── data/
│   └── upgrades.js      # Upgrade definitions (id, name, icon, description, effect)
└── utils/
    ├── statTracker.js   # Per-keystroke and per-wave stat accumulation
    └── storage.js       # localStorage read/write for user preferences
```

---

## Build Order (Sprint Sequence)

The order below is designed so each sprint produces a testable, playable slice. No sprint should leave the game in an unplayable state.

### Sprint 1 — Playable Core

**Goal:** A player can select a language, type through a wave of enemies with live typo feedback, lose lives when enemies pass the deadline, and reach a wave-end state.

| # | Component | Depends On |
|---|-----------|------------|
| 1 | `snippets/` — JS + Python libraries | — |
| 2 | `state.js` — RunState factory | — |
| 3 | `screenManager.js` — show/hide screens | — |
| 4 | Main Menu screen + Language Selection screen | screenManager |
| 5 | `typingEngine.js` — input comparison, real-time typo highlight | snippets |
| 6 | `enemySystem.js` — DOM enemy elements, CSS fall animation, deadline detection | typingEngine, state |
| 7 | `waveManager.js` — spawn sequence, wave-clear signal | enemySystem, snippets |
| 8 | Lives display + life-loss on deadline breach | enemySystem, state |

**Deliverable:** Start a run, type enemies in one language, lose lives on misses, wave ends.

---

### Sprint 2 — Boss, Upgrades, and Theme

**Goal:** A complete wave loop: wave → boss → upgrade → next wave. Haunted visuals and audio in place.

| # | Component | Depends On |
|---|-----------|------------|
| 9  | `codePanel.js` — assembly panel with Prism.js highlighting | waveManager, snippets |
| 10 | `waveIntroCard.js` — intro card shown before each wave | snippets, screenManager |
| 11 | `bossSystem.js` — boss intro sequence, boss typing loop | codePanel, typingEngine |
| 12 | `upgradeSystem.js` + upgrade data | state, bossSystem |
| 13 | Upgrade selection screen | upgradeSystem, screenManager |
| 14 | Ghost SVG sprites + haunted background CSS | enemySystem |
| 15 | `audioManager.js` — ambient, defeat, boss sting, error sounds | enemy/boss events |
| 16 | Enemy defeat animation (CSS keyframe on correct submission) | typingEngine, enemySystem |

**Deliverable:** Full wave loop with boss, upgrades, visual theme, and sound.

---

### Sprint 3 — Stats, HUD, and Polish

**Goal:** Full HUD, accurate stat tracking end-to-end, pause menu, and end-of-run summary.

| # | Component | Depends On |
|---|-----------|------------|
| 17 | `statTracker.js` — per-keystroke WPM + accuracy accumulation | typingEngine |
| 18 | `hudManager.js` — score counter (animated), lives, wave, active upgrades panel | statTracker, upgradeSystem |
| 19 | Per-wave stats feedback screen | statTracker, screenManager |
| 20 | `statsScreen.js` — end-of-run summary with score formula | statTracker |
| 21 | Pause overlay (Escape key → freeze state → resume/quit) | enemySystem, state |
| 22 | `storage.js` — localStorage for language + audio preferences | — |
| 23 | Audio controls (volume sliders, mute) | audioManager, storage |

**Deliverable:** Complete, shippable MVP.

---

## Shared Data Contract: RunState

All modules read and write a single `RunState` object created fresh at the start of each run. It is the authoritative source of truth for everything that changes during a run. Preferences (language, audio) are **not** stored in RunState — they live in localStorage.

```js
// state.js
export function createRunState(language) {
  return {
    language,               // 'javascript' | 'python'
    lives: 3,
    score: 0,
    wave: 1,
    upgrades: [],           // array of upgrade ids collected this run
    fallSpeedMultiplier: 1.0,
    scoreMultiplier: 1.0,
    bossScoreMultiplier: 1.0,
    waveFreezeMs: 0,
    shieldPerWave: false,
    lifePerWave: false,
    revealNext: false,
    speedBonusActive: false,
    stats: {                // populated by statTracker
      totalKeystrokes: 0,
      totalErrors: 0,
      waveData: []          // per-wave { wpm, accuracy, mistakes[] }
    }
  };
}
```

---

## Architecture Decision Records

Every significant structural decision is documented in a separate ADR under `decisions/`. They are listed here in dependency order — earlier ADRs constrain later ones.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](decisions/ADR-001-tech-stack.md) | Frontend Technology Stack | Accepted |
| [ADR-002](decisions/ADR-002-game-architecture.md) | Game Architecture Pattern | Accepted |
| [ADR-003](decisions/ADR-003-module-organization.md) | Module Organization | Accepted |
| [ADR-004](decisions/ADR-004-snippet-library.md) | Snippet Library Format | Accepted |
| [ADR-005](decisions/ADR-005-enemy-rendering.md) | Enemy Rendering and Movement | Accepted |
| [ADR-006](decisions/ADR-006-typing-input.md) | Typing Input System | Accepted |
| [ADR-007](decisions/ADR-007-syntax-highlighting.md) | Syntax Highlighting | Accepted |
| [ADR-008](decisions/ADR-008-audio.md) | Audio System | Accepted |
| [ADR-009](decisions/ADR-009-persistence.md) | Data Persistence Strategy | Accepted |
| [ADR-010](decisions/ADR-010-run-state.md) | Run State Management | Accepted |

---

## User Story Coverage Map

The table below maps each MVP feature to the architectural components that satisfy it, and to the sprint in which it is built.

| MVP Feature | Components | Sprint |
|-------------|-----------|--------|
| Wave-based gameplay | waveManager, enemySystem, typingEngine | 1 |
| Enemy fall + deadline | enemySystem, hudManager (lives) | 1 |
| Real-time typo feedback | typingEngine | 1 |
| Language selection | snippets/, screenManager, storage | 1 |
| Code assembly panel | codePanel (Prism.js) | 2 |
| Wave intro card | waveIntroCard | 2 |
| Boss encounter | bossSystem, codePanel | 2 |
| Boss intro sequence | bossSystem, audioManager | 2 |
| Upgrade selection | upgradeSystem, upgrades.js | 2 |
| Active upgrades HUD | hudManager, upgradeSystem | 3 |
| Ghost sprites + haunted theme | enemySystem (SVG), CSS | 2 |
| Enemy defeat animation | enemySystem (CSS keyframe) | 2 |
| Audio (ambient + SFX) | audioManager | 2 |
| Live score counter | hudManager, statTracker | 3 |
| Per-wave stats feedback | statTracker, screenManager | 3 |
| End-of-run stats screen | statsScreen, statTracker | 3 |
| Pause + quit mid-run | state, enemySystem, screenManager | 3 |
| User preference persistence | storage (localStorage) | 3 |

---

## Post-MVP Considerations

The architecture is designed to accommodate the following post-MVP features without major refactors:

- **Structured learning path / campaign mode** — `waveManager` can be extended to load an ordered snippet sequence rather than a randomized one.
- **Difficulty / session length options** — `RunState` accepts a config object at creation; wave count cap and speed curve are already tunable constants.
- **Leaderboard** — `statsScreen` currently writes nothing to a backend; adding a POST call requires touching only `statsScreen.js` and `storage.js`.
- **Jump scares / advanced horror effects** — isolated to `audioManager` and CSS; no game logic changes needed.
- **Conceptual question obstacles** — `waveManager` can insert a question event between enemies; `typingEngine` already handles arbitrary target strings.
