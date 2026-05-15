# ADR-010: Run State Management

## Status

Accepted

## Context

During a run, multiple independent modules need to read and write shared mutable state:
- `waveManager` reads and increments the wave number
- `enemySystem` reads `fallSpeedMultiplier`
- `upgradeSystem` writes to `upgrades[]` and modifies multipliers
- `statTracker` writes to `stats`
- `hudManager` reads score, lives, wave, and upgrades for display
- `bossSystem` reads the function assembled during the current wave

This shared state must be:
- Consistent: all modules see the same values at all times
- Extensible: new upgrades and features should be addable without refactoring every module that touches state
- Debuggable: the full state of a run should be inspectable at any point
- Scoped to a single run: starting a new run creates a completely fresh state

Four patterns were evaluated:

1. **Global variables** (individual `let score = 0; let lives = 3;` etc.)
2. **Single RunState object** passed to modules on initialization
3. **Redux-style unidirectional store** (action → reducer → state)
4. **Event bus / pub-sub** (modules emit and subscribe to events)

## Decision

Use a **single mutable `RunState` object** created by `state.js` at the start of each run and passed by reference to all modules that need it. Modules read and write it directly. There is no action/reducer layer.

## Considered Options

### Option 1: Global Variables

Each piece of state is a top-level `let` in a shared `globals.js` file or in `main.js`.

**Pros:**
- Immediately familiar; no pattern to learn
- Zero boilerplate

**Cons:**
- No clear boundary between "what is run state" and "what is persistent preference"
- Starting a new run requires manually resetting every global — easy to miss one, causing subtle bugs (e.g., leftover `fallSpeedMultiplier` from the previous run)
- Global variables are invisible across module boundaries without explicit imports — a module that needs `score` must import it, making the dependency graph implicit and fragile
- Impossible to snapshot the full game state for debugging without enumerating every global

### Option 2: Single RunState Object (Chosen)

A `createRunState(language)` factory in `state.js` returns a plain JS object. Modules receive this object at initialization and reference it throughout the run. When a new run starts, `main.js` calls `createRunState()` again and re-initializes all modules with the new object — the old one is garbage-collected.

**Pros:**
- Starting a new run is a single `createRunState()` call; no manual reset of individual variables
- The full state of any run is inspectable by logging one object: `console.log(runState)`
- Modules declare their state dependency explicitly by accepting `state` as an argument — the dependency graph is visible in function signatures
- No framework or pattern to learn beyond "pass objects"
- Consistent with how the MVP prototype already manages state

**Cons:**
- Any module can write any field — there is no enforced access control. A bug in `audioManager` could accidentally zero out `runState.lives`. Mitigation: the access rules are documented in this ADR and enforced via code review
- No change detection: `hudManager` cannot know that `score` changed without being explicitly called after a score update. Mitigation: game events (enemy defeated, life lost) trigger explicit `hudManager.update()` calls in `main.js`

### Option 3: Redux-Style Unidirectional Store

A central `store.js` holds state. Modules dispatch named actions (`ENEMY_DEFEATED`, `UPGRADE_APPLIED`, etc.) which reducers apply to produce a new state object. `hudManager` subscribes to state changes.

**Pros:**
- Strict unidirectional flow makes bugs easier to trace
- Time-travel debugging is possible (store action history)
- No accidental mutation from unexpected modules

**Cons:**
- Significant boilerplate for a team that may not know Redux
- The game is not a reactive UI — it is a series of discrete events with synchronous handlers. Redux's render-cycle model is mismatched
- Adding a new upgrade requires adding an action type, a reducer case, and updating all subscribers — 4× the code change of just setting `state.fallSpeedMultiplier *= 0.7`
- Overkill for a project where the full state object has ~15 fields

### Option 4: Event Bus / Pub-Sub

Modules emit events (`bus.emit('life-lost')`) and subscribe to them (`bus.on('life-lost', updateHUD)`). State is implicit across the system.

**Pros:**
- Loose coupling between modules — `enemySystem` doesn't need to know `hudManager` exists
- Easy to add new subscribers without changing the emitter

**Cons:**
- State is invisible: to know the current score, you must trace the chain of `score-changed` events and all subscribers that modify it
- Debugging is hard: an incorrect state value requires tracing every emission that could have caused it
- Ordering of subscriber execution is implicit and can cause subtle ordering bugs (e.g., HUD updates before `statTracker` records the event)
- The game's control flow is already clear and linear (wave → boss → upgrade → next wave); the decoupling of an event bus adds complexity without a corresponding clarity win

## Decision Outcome

**Option 2 (Single RunState Object)** was chosen. It is the simplest pattern that correctly solves the problem and is directly continuous with the MVP prototype's existing approach.

### RunState Object Shape

```js
// state.js
export function createRunState(language) {
  return {
    // Identity
    language,                     // 'javascript' | 'python'

    // Wave progression
    wave: 1,
    currentSnippetId: null,       // set by waveManager at wave start

    // Survival
    lives: 3,

    // Scoring
    score: 0,
    scoreMultiplier: 1.0,
    bossScoreMultiplier: 1.0,
    speedBonusActive: false,

    // Roguelite modifiers (written by upgradeSystem)
    upgrades: [],                 // array of upgrade ids, in selection order
    fallSpeedMultiplier: 1.0,
    waveFreezeMs: 0,
    shieldPerWave: false,         // blocks 1 life loss per wave
    lifePerWave: false,           // +1 life on each new wave start
    revealNext: false,            // next enemy line is previewed

    // Statistics (written exclusively by statTracker)
    stats: {
      totalKeystrokes: 0,
      totalErrors: 0,
      startTime: null,            // set at run start
      waveData: []                // { wpm, accuracy, errorCount, snippetId }
    }
  };
}
```

### Access Rules (Enforced by Code Review)

| Module | May Read | May Write |
|--------|----------|-----------|
| `waveManager` | `wave`, `language`, `waveFreezeMs`, `lifePerWave`, `currentSnippetId` | `wave`, `currentSnippetId` |
| `enemySystem` | `fallSpeedMultiplier`, `waveFreezeMs`, `shieldPerWave` | — |
| `bossSystem` | `bossScoreMultiplier`, `speedBonusActive` | — |
| `upgradeSystem` | All modifiers | All modifiers, `upgrades[]` |
| `statTracker` | `stats` | `stats` |
| `hudManager` | All fields | — |
| `main.js` | All fields | `lives`, `score` (via event callbacks) |

`main.js` is the only module that writes `lives` and `score` directly, triggered by callbacks from `enemySystem` and `typingEngine`. This keeps scoring logic centralized.

### Starting a New Run

```js
// main.js
function startRun(language) {
  const state = createRunState(language);
  waveManager.init(state);
  enemySystem.init(state);
  bossSystem.init(state);
  upgradeSystem.init(state);
  statTracker.init(state);
  hudManager.init(state);
  waveManager.startWave();
}
```

All modules hold a reference to the same `state` object. When the run ends, `main.js` calls `showStatsScreen(state.stats)` and discards the reference. GC handles cleanup.

### Positive Consequences
- New runs start clean with a single factory call — no reset logic to maintain
- The full run state is loggable as a single object for debugging
- New upgrades require editing only `upgradeSystem.js` and `data/upgrades.js` — `RunState` gains a new field and the upgrade's `effect` function sets it

### Negative Consequences
- No enforced write protection — all modules can technically write any field. The access rule table above is documentation, not enforcement
- Modules must be explicitly notified of state changes via function calls; they cannot subscribe to reactive updates
