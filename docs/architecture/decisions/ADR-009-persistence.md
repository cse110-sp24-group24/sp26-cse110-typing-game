# ADR-009: Data Persistence Strategy

## Status

Accepted

## Context

The game has two categories of state that might need to persist across browser sessions:

**Category A — User preferences:** language selection, music volume, SFX volume, mute state. These are set once and expected to be remembered on the next visit. Multiple user stories explicitly require this (Shubhi US-10, Simar US-10, Soohwan US-01). The returning-player flow should require at most two actions to start a run.

**Category B — Run state:** lives, score, wave number, collected upgrades, active fall speed multiplier. A run typically lasts 10–20 minutes. The MVP does not require resuming an interrupted run, but quitting via the pause menu must still show the stats screen (a graceful end, not a crash).

**Category C — Historical stats and high scores:** best WPM, best accuracy, waves survived record. Shubhi US-07 requests local high score tracking. This is a post-MVP feature but the storage design should not preclude it.

No backend is available. All persistence must use browser-native storage APIs.

Four storage options were evaluated:

1. **No persistence** (everything resets on page load)
2. **`sessionStorage`** (persists within a browser tab session)
3. **`localStorage`** (persists across sessions, same origin)
4. **`IndexedDB`** (structured client-side database)

## Decision

Use **`localStorage` for Category A (user preferences) only**. Run state (Category B) is held in memory in the `RunState` object and is intentionally not persisted — a page refresh starts a new run. Category C (historical stats) is out of scope for MVP but `localStorage` is designed to accommodate it with a versioned key schema.

## Considered Options

### Option 1: No Persistence

All state lives in JavaScript variables. Refreshing the page loses everything.

**Pros:**
- Zero complexity; no storage API to debug
- No stale state bugs (old data from a previous session interfering with a new run)

**Cons:**
- Language preference is lost on every page load — a player who always plays Python must re-select it every time
- Audio settings (volume levels) reset — a player who muted music must re-mute it every session
- Multiple user stories explicitly call out preference persistence as a core requirement (Simar US-10, Shubhi US-10)

### Option 2: `sessionStorage`

`sessionStorage` persists within one browser tab session. Closing the tab clears it.

**Pros:**
- Slightly simpler lifecycle than `localStorage` — no need to worry about stale data from weeks ago
- Same API as `localStorage`

**Cons:**
- Closing the tab and reopening loses preferences — the same UX failure as no persistence
- Opening the game in a second tab creates an independent session, which is fine but may surprise users

### Option 3: `localStorage` (Chosen)

`localStorage` persists indefinitely (until the user clears browser data) within the same origin. It provides ~5MB of storage, which is more than sufficient.

**Pros:**
- Preferences survive tab close, browser restart, and system restart
- Same simple key-value API as `sessionStorage`
- No external service or account required
- Widely supported and well-understood by the team

**Cons:**
- Synchronous API: `localStorage.getItem()` and `.setItem()` are blocking. For the small amount of data involved (a few hundred bytes), this is imperceptible
- Data persists across sessions in potentially unexpected ways if the storage schema changes between deployments. Mitigation: versioned key schema (see below)
- No expiry mechanism — stale preference data could theoretically persist indefinitely. Acceptable for user preferences

### Option 4: IndexedDB

IndexedDB is an asynchronous, transaction-based client-side database that can store structured data and binary blobs.

**Pros:**
- Handles large datasets; supports indexes and cursors
- Asynchronous API does not block the main thread

**Cons:**
- Significantly more complex API than `localStorage` — requires transactions, object stores, version upgrades
- For storing 4–6 user preference values, IndexedDB is massively over-engineered
- The async API would complicate the synchronous "load preferences on startup" flow in `main.js`

## Decision Outcome

**`localStorage` (Option 3)** is used for user preferences only. `storage.js` wraps all `localStorage` access to keep the rest of the codebase unaware of the storage mechanism.

### Storage Key Schema

All keys are namespaced under `phantomtype.v1.` to enable future schema migrations without conflicting with other apps on the same origin.

| Key | Type | Description |
|-----|------|-------------|
| `phantomtype.v1.language` | `'javascript' \| 'python'` | Last selected language |
| `phantomtype.v1.musicVolume` | `number (0–1)` | Music volume |
| `phantomtype.v1.sfxVolume` | `number (0–1)` | SFX volume |
| `phantomtype.v1.muted` | `boolean` | Mute state |
| `phantomtype.v1.tutorialSeen` | `boolean` | Tutorial completion flag (for post-MVP tutorial) |

### `storage.js` Public API

```js
export function getPreferences()              // returns object with all preference keys
export function saveLanguage(language)        // 'javascript' | 'python'
export function saveAudioSettings(music, sfx, muted)
export function markTutorialSeen()
export function resetToDefaults()             // clears all phantomtype.v1.* keys
```

### Run State Is Not Persisted

`RunState` (score, lives, upgrades, wave) is deliberately held only in memory. Rationale:
- A run is 10–20 minutes; losing a run to a page refresh is acceptable and expected behavior for a browser game in this scope
- Persisting run state introduces complex edge cases: what if the upgrade pool changed between sessions? What if a snippet was removed? Replaying a partially-corrupted run state would be worse than starting fresh
- The pause menu already handles the "I need to stop mid-run" case cleanly by routing to the stats screen

### Post-MVP Extension Point

When historical stats tracking is added (Shubhi US-07), `storage.js` adds:

| Key | Type | Description |
|-----|------|-------------|
| `phantomtype.v1.bestScore` | `number` | All-time best score |
| `phantomtype.v1.bestWpm` | `number` | All-time best WPM |
| `phantomtype.v1.runsPlayed` | `number` | Total runs played |

### Positive Consequences
- Returning players see their preferred language pre-selected and audio at their preferred level
- All persistence is isolated to `storage.js` — the rest of the codebase calls named functions and never touches `localStorage` directly
- The v1 key namespace allows a clean migration if the schema ever changes

### Negative Consequences
- `localStorage` is synchronous; if a future preference set grows large, reading it on startup could cause a detectable delay. Highly unlikely for the data volumes in scope
- Browser private/incognito mode may block `localStorage` on some browsers. `storage.js` wraps all calls in a try/catch and falls back to in-memory defaults silently
